import React from 'react'
import {
  Form,
  Select,
  Modal,
  Tooltip,
  Spin,
  Icon,
  Radio,
  Row,
  Col,
  InputNumber,
  Tag,
  Button,
  Table,
} from 'antd'
import { connect } from 'react-redux'
import Highcharts from 'highcharts'
import Drilldown from 'highcharts/modules/drilldown'
import Exporting from 'highcharts/modules/exporting'
import HighchartsReact from 'highcharts-react-official'
import { CSVLink } from 'react-csv'
import moment from 'moment'
import _ from 'lodash'
import {
  getBrandsValueByDate,
  getBrandInfluencerCut,
  getBrandInfluencers,
  getBrandInfluencersTableDetail,
  getBrandsBySource,
  getInfluencerBrandsTable,
  getInfluencerBrandsPie,
  getInfluencerLocations,
  getInfluencerMentions,
  getBrandDemographics,
  getBrandLocations,
  filterValues,
} from 'ducks/analytics'
import { getPosts } from 'ducks/posts'
import { getStories } from 'ducks/story'
import { transformIntoStory } from 'ducks/story'
import { setItem, getItem } from 'ducks/localstorage'
import { ColorCache } from 'ducks/color'
import MainFilter from 'components/Mirrorr/MainFilter'
import PostCard from 'components/Mirrorr/PostCard'
import Stories from 'components/Mirrorr/StoryCard'
import './style.scss'

const RatioTooltip = (
  <Tooltip title="Number of posts containing the Brand / Total number of posts by the selected influencer at the selected time">
    <Icon type="info-circle" />
  </Tooltip>
)
const ViewsTooltip = (
  <Tooltip title="Views in case of Video">
    <Icon type="info-circle" />
  </Tooltip>
)
const AntIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />
const Option = Select.Option
const FormItem = Form.Item
const ColorPalette = _.shuffle([
  '#153396',
  '#0490FA',
  '#101428',
  '#242D59',
  '#676672',
  '#989898',
  '#484B96',
  '#BBB9CF',
])
const DefaultFilterValues = {
  ...filterValues,
}
const BrandDemographicRanges = [
  '0-20',
  '21-24',
  '25-28',
  '29-32',
  '33-36',
  '37-40',
  '41-50',
  '51-100',
]
const BrandInfluencerColumns = [
  {
    title: 'Influencer',
    dataIndex: 'fullName',
    key: 'fullName',
  },
  {
    title: 'Brand Source',
    dataIndex: 'brandSource',
    key: 'brandSource',
  },
  {
    title: 'Frequency',
    dataIndex: 'brandPosts',
    key: 'brandPosts',
  },
  {
    title: 'Ratio',
    dataIndex: 'ratio',
    key: 'ratio',
  },
  {
    title: 'TTL Reach',
    dataIndex: 'reach',
    key: 'reach',
  },
  {
    title: 'TTL Likes',
    dataIndex: 'likes',
    key: 'likes',
  },
  {
    title: 'TTL Comments',
    dataIndex: 'comments',
    key: 'comments',
  },
  {
    title: 'TTL Views',
    dataIndex: 'views',
    key: 'views',
  },
  {
    title: 'Media Value (in USD)',
    dataIndex: 'totalMediaValue',
    key: 'totalMediaValue',
  },
]

@connect()
class Analytics extends React.Component {
  state = this.initState()
  initialized = false

  initState() {
    let searchValues = null
    let date = getItem('filterDates')

    if (date) {
      searchValues = { ...DefaultFilterValues }
      searchValues.date = date.map(d => moment(d))
    }

    return {
      defaultBrandsType: [],
      currentPage: 1,
      showLoadMoreButton: true,
      arePostsLoading: true,
      loading: true,
      selectedReportTitle: '',
      analyticsTypeSelected: 'brands',
      mainFilters: ['dates', 'brands'],
      searchValues: searchValues,
      brandsValue: { x: [], y: [] },
      brandsValueLoading: true,
      brandsBySource: [],
      brandsBySourceLoading: true,
      brandInfluencersCut: [],
      brandInfluencersCutLoading: true,
      brandInfluencers: [],
      brandInfluencersLoading: true,
      brandDemographics: [],
      brandDemographicsLoading: false,
      brandLocations: [],
      brandLocationsLoading: false,
      influencerBrandsTable: [],
      influencerBrandsTableLoading: false,
      influencerBrandsPie: [],
      influencerBrandsPieOld: [],
      influencerBrandsPieLoading: false,
      posts: [],
      influencerLocations: [],
      influencerLocationsLoading: false,
      influencerMentions: [],
      influencerMentionsLoading: false,
      influencerReportTypeSelected: 'pie',
      brandReportTypeSelected: 'pie',
      selectedReportType: '',
      postsModalVisible: false,
      filterTouched: false,
      demographicsPie: [],
      demographicsPieModalVisible: false,
      mediaTypeSelected: 'default',
    }
  }

  componentDidMount() {
    Exporting(Highcharts)
    Drilldown(Highcharts)

    let prevState = getItem('analyticsPageState')

    if (prevState) {
      prevState.searchValues.date = prevState.searchValues.date.map(d => moment(d))
      this.setState(prevState)
      this.fetchData(prevState.searchValues)
      this.initialized = true
    }
  }

  onSearch = values => {
    let brandsType = this.state.defaultBrandsType.length
      ? this.state.defaultBrandsType
      : values.brandsType

    this.setState(
      {
        searchValues: {
          ...this.state.searchValues,
          ...values,
        },
        brandsType: brandsType,
      },
      () => {
        this.fetchData(this.state.searchValues)
        this.initialized = true
      },
    )

    setItem('filterDates', values.date)
  }

  getBrandsBySourceData = values => {
    const { dispatch } = this.props

    dispatch(getBrandsBySource(values)).then(data => {
      let brandsSource = []

      _.chain(data)
        .map(item => {
          return {
            ...item,
            brand: _.capitalize(item.brand.toLowerCase()),
          }
        })
        .groupBy(item => item.brand)
        .forEach((item, key) => {
          let brands = {
            name: key,
            data: [],
            total: {
              totalCount: 0,
              reach: 0,
              value: 0,
            },
          }

          item.forEach(brand => {
            let name = brand.brandSource === 'unknown' ? 'text' : brand.brandSource
            brand.brandSource = name

            brands.data[name.toLowerCase()] = brand
          })

          // Add missing keys
          _.forEach(['tag', 'media', 'mention', 'text'], source => {
            if (!brands.data[source]) {
              brands.data[source] = {
                total: 0,
                reach: 0,
                value: 0,
              }
            }
          })

          // Calculate total
          item.forEach(b => {
            brands.total.totalCount += parseInt(b.total)
            brands.total.reach += parseInt(b.reach)
            brands.total.value += parseInt(b.value)
          })

          brandsSource.push(brands)
        })
        .value()

      this.setState({
        brandsBySource: brandsSource,
        brandsBySourceLoading: false,
        loading: false,
      })
    })
  }

  getBrandsValueData = values => {
    const { dispatch } = this.props

    dispatch(getBrandsValueByDate(values)).then(data => {
      const brandsValue = {
        x: [],
        y: [],
      }
      let colorIndex = 0

      _.chain(data)
        .map(brand => {
          return {
            ...brand,
            day: brand.date,
            brand: _.capitalize(brand.brand.toLowerCase()),
          }
        })
        .forEach(brand => brandsValue.x.push(brand.day))
        .groupBy(brand => brand.brand)
        .forEach(item => {
          let sorted = _.sortBy(item, i => moment(i.date))

          let values = {
            name: item[0].brand,
            color: ColorPalette[colorIndex++],
            data: [],
          }

          sorted.forEach(i => {
            values.data.push(parseInt(i.totalValue))
          })

          brandsValue.y.push(values)
        })
        .value()

      brandsValue.x = _.uniq(brandsValue.x)

      this.setState(
        {
          brandsValue: brandsValue,
          brandsValueLoading: false,
          loading: false,
        },
        () => {},
      )
    })
  }

  getBrandInfluencersCutData = values => {
    const { dispatch } = this.props

    dispatch(getBrandInfluencerCut(values)).then(data => {
      let brandInfluencers = []
      let allInfluencers = []

      _.chain(data)
        .map(item => {
          return {
            ...item,
            brand: _.capitalize(item.brand.toLowerCase()),
            totalMediaValue: parseInt(item.totalMediaValue),
          }
        })
        .filter(item => item.totalMediaValue)
        .groupBy(item => item.brand)
        .forEach(items => {
          let colorCache = new ColorCache(ColorPalette)
          let totalValue = 0
          let sorted = _.sortBy(items, ['totalMediaValue']).reverse()
          let all = sorted.slice(),
            others = [],
            other = {}
          let influencers = {
            data: [],
            drilldowns: [],
            brand: sorted[0].brand,
          }

          if (sorted.length > 10) {
            // starting 9 items
            all = sorted.slice(0, 9)
            others = sorted.slice(9, sorted.length)
          }

          sorted.forEach(influencer => {
            totalValue += influencer.totalMediaValue
            allInfluencers.push(influencer)
          })

          all.forEach((influencer, index) => {
            let y = parseFloat((influencer.totalMediaValue / totalValue) * 100)

            influencers.data.push({
              influencerId: influencer.influencerId,
              brand: all[0].brand,
              name: influencer.fullName,
              value: influencer.totalMediaValue,
              y: y,
              color: colorCache.getColor(y),
              drilldown: null,
            })
          })

          if (others.length) {
            let othersTotal = 0
            let dd = []

            others.forEach(influencer => {
              othersTotal += influencer.totalMediaValue
            })

            others.forEach(influencer => {
              dd.push([
                influencer.fullName,
                parseFloat((influencer.totalMediaValue / othersTotal) * 100),
              ])
            })

            let y = parseFloat((othersTotal / totalValue) * 100)

            influencers.data.push({
              influencerId: -1,
              brand: 'Others',
              name: 'Others',
              value: othersTotal,
              y: y,
              color: colorCache.getColor(y),
              drilldown: 'Others',
            })

            influencers.drilldowns.push({
              name: 'Others',
              id: 'Others',
              data: dd,
            })
          }

          brandInfluencers.push(influencers)
        })
        .value()

      this.setState(
        {
          allBrandInfluencersCut: allInfluencers,
          brandInfluencersCut: brandInfluencers,
          brandInfluencersCutLoading: false,
          loading: false,
        },
        () => {},
      )
    })
  }

  getBrandInfluencersData = values => {
    const { dispatch } = this.props

    dispatch(getBrandInfluencers(values)).then(data => {
      let influencers = []

      _.chain(data)
        .map(item => {
          return {
            ...item,
            brandSource: ' - ',
            influencerId: parseInt(item.influencerId),
            brand: _.capitalize(item.brand.toLowerCase()),
          }
        })
        .groupBy(item => item.brand)
        .forEach(items => {
          let total = {
            ratio: 0,
            brandPosts: 0,
            reach: 0,
            likes: 0,
            comments: 0,
            views: 0,
            totalMediaValue: 0,
            fullName: 'TOTAL',
            influencerId: -1,
          }

          items.forEach((i, index) => {
            ;(total.ratio += parseFloat(parseInt(i.brandPosts) / parseInt(i.totalPosts))),
              (total.brandPosts += parseInt(i.brandPosts))
            total.reach += parseInt(i.reach)
            total.likes += parseInt(i.likes)
            total.comments += parseInt(i.comments)
            total.views += parseInt(i.views)
            total.totalMediaValue += parseInt(i.totalMediaValue)

            i.ratio = parseFloat(i.brandPosts / i.totalPosts).toFixed(2)
            i.key = index
            i.children = []
          })

          total.ratio = total.ratio.toFixed(2)

          influencers.push({
            data: [...items, total],
            brand: items[0].brand,
          })
        })
        .value()

      this.setState(
        {
          brandInfluencers: influencers,
          brandInfluencersLoading: false,
          loading: false,
        },
        () => {
          dispatch(getBrandInfluencersTableDetail(values)).then(data => {
            let brandInfluencers = []
            let key = 0

            _.chain(data)
              .map(item => {
                return {
                  ...item,
                  brandSource: item.source,
                  influencerId: parseInt(item.influencerId),
                  brand: _.capitalize(item.brand.toLowerCase()),
                }
              })
              .groupBy(item => item.brand)
              .forEach(items => {
                let sorted = _.sortBy(items, i => i.postId)
                let brand = this.state.brandInfluencers.find(x => x.brand === sorted[0].brand)

                sorted.forEach(i => {
                  let influencer = brand.data.find(x => x.influencerId === i.influencerId)
                  influencer.children.push({
                    ...i,
                    ratio: parseFloat(1 / influencer.totalPosts).toFixed(4),
                    key: 100 + key++,
                  })
                })

                brandInfluencers.push(brand)
              })
              .value()

            this.setState({
              brandInfluencers: brandInfluencers,
            })
          })
        },
      )
    })
  }

  getInfluencerBrandsTableData = values => {
    const { dispatch } = this.props

    dispatch(getInfluencerBrandsTable(values)).then(data => {
      let table = []

      // Table
      _.chain(data)
        .map(item => {
          return {
            ...item,
            influencerId: parseInt(item.influencerId),
            brand: _.capitalize(item.brand.toLowerCase()),
          }
        })
        .groupBy(item => item.influencerId)
        .forEach(items => {
          let total = {
            ratio: 0,
            brandPosts: 0,
            reach: 0,
            likes: 0,
            comments: 0,
            views: 0,
            totalMediaValue: 0,
          }

          items.forEach(i => {
            total.ratio += parseFloat(
              parseFloat(parseInt(i.brandPosts) / parseInt(i.totalPosts)).toFixed(2),
            )
            total.brandPosts += parseInt(i.brandPosts)
            total.reach += parseInt(i.reach)
            total.likes += parseInt(i.likes)
            total.comments += parseInt(i.comments)
            total.views += parseInt(i.views)
            total.totalMediaValue += parseInt(i.totalMediaValue)

            i.ratio = parseFloat(i.brandPosts / i.totalPosts).toFixed(2)
          })

          table.push({
            data: items,
            influencer: items[0].fullName,
            total: total,
          })
        })
        .value()

      this.setState(
        {
          influencerBrandsTable: table,
          influencerBrandsTableLoading: false,
          loading: false,
        },
        () => {},
      )
    })
  }

  getInfluencerBrandsPieData = values => {
    const { dispatch } = this.props

    dispatch(getInfluencerBrandsPie(values)).then(data => {
      let influencers = []
      let colors = {}

      // Pie chart
      _.chain(data)
        .map(item => {
          return {
            ...item,
            postId: parseInt(item.postId),
            influencerId: parseInt(item.influencerId),
            brand: _.capitalize(item.brand.toLowerCase()),
            brandSource: _.capitalize(item.brandSource.toLowerCase()),
          }
        })
        .groupBy(item => item.influencerId)
        .forEach(items => {
          let influencer = {
            influencerId: items[0].influencerId,
            influencer: items[0].fullName,
            series: [],
            drilldowns: [],
          }

          let colorCache = new ColorCache(ColorPalette)
          let brands = _.uniq(items.map(i => i.brand))

          // Brands
          _.forEach(brands, b => {
            let _brand = {
              name: b,
              drilldown: b,
              y: 0,
            }

            let _drilldown = {
              name: b,
              id: b,
              data: [],
            }

            let filteredBrands = _.filter(items, i => i.brand === b)
            let uniquePostId = _.uniqBy(filteredBrands, 'postId')
            let uniqueSource = _.uniqBy(uniquePostId, 'brandSource')

            uniqueSource.forEach(i => {
              let val =
                parseInt(i.totalMediaValue) *
                _.filter(uniquePostId, x => x.brandSource === i.brandSource).length
              _brand.y += val
              _brand.influencerId = influencer.influencerId

              _drilldown.data.push([i.brandSource, val, i])
            })

            _brand.color = colorCache.getColor(_brand.y)

            // Converting drilldown data into percentage
            _drilldown.data = _drilldown.data.map(data => [
              data[0],
              parseFloat(((data[1] / _brand.y) * 100).toFixed(2)),
              data[2],
            ])

            influencer.series.push(_brand)
            influencer.drilldowns.push(_drilldown)
          })

          // Converting series data into percentage
          let total = 0.0
          _.forEach(influencer.series, data => {
            total += data.y
          })

          influencer.series = influencer.series.map(data => {
            return {
              ...data,
              y: parseFloat(((data.y / total) * 100).toFixed(2)),
            }
          })

          influencers.push(influencer)
        })
        .value()

      this.setState(
        {
          influencerBrandsPie: influencers,
          influencerBrandsPieLoading: false,
          loading: false,
        },
        () => {},
      )
    })
  }

  getBrandDemographicsData = values => {
    const { dispatch } = this.props

    dispatch(getBrandDemographics(values)).then(data => {
      let demographics = []

      // Pie chart
      _.chain(data)
        .filter(item => item.influencerGender)
        .uniqBy('influencerId')
        .map(item => {
          return {
            ...item,
            influencerId: parseInt(item.influencerId),
            influencerAge: parseInt(item.influencerAge),
            influencerGender: item.influencerGender.toLowerCase(),
            brand: _.capitalize(item.brand.toLowerCase()),
          }
        })
        .groupBy(item => item.brand)
        .forEach(items => {
          let brand = {
            name: items[0].brand,
            male: [],
            female: [],
          }

          BrandDemographicRanges.forEach((range, i) => {
            brand.male[i] = { key: range, value: 0, data: [], brand: items[0].brand }
            brand.female[i] = { key: range, value: 0, data: [], brand: items[0].brand }
          })

          items.forEach(item => {
            BrandDemographicRanges.forEach((range, i) => {
              let [gt, lt] = range.split('-')
              let inRange = false

              if (item.influencerAge >= gt && item.influencerAge <= lt) {
                inRange = true
              }

              if (!inRange) {
                return
              }

              if (item.influencerGender === 'male') {
                brand.male[i].value++
                brand.male[i].data.push(item)
              } else {
                brand.female[i].value++
                brand.female[i].data.push(item)
              }
            })
          })

          demographics.push(brand)
        })
        .value()

      this.setState(
        {
          brandDemographics: demographics,
          brandDemographicsLoading: false,
          loading: false,
        },
        () => {},
      )
    })
  }

  getBrandLocationsData = values => {
    const { dispatch } = this.props

    dispatch(getBrandLocations(values)).then(data => {
      let locations = []

      // Pie chart
      _.chain(data)
        .map(item => {
          return {
            ...item,
            locationName: _.capitalize(item.locationName.toLowerCase().replace('-', ' ')),
            brand: _.capitalize(item.brand.toLowerCase()),
            locationId: parseInt(item.locationId),
          }
        })
        .groupBy(item => item.brand)
        .forEach(items => {
          locations.push([...items])
        })
        .value()

      this.setState(
        {
          brandLocations: locations,
          brandLocationsLoading: false,
          loading: false,
        },
        () => {},
      )
    })
  }

  getInfluencerLocationsData = values => {
    const { dispatch } = this.props

    dispatch(getInfluencerLocations(values)).then(data => {
      let locations = []

      _.chain(data)
        .map(item => {
          return {
            ...item,
            influencerId: parseInt(item.influencerId),
          }
        })
        .groupBy(item => item.influencerId)
        .forEach(items => {
          locations.push([...items])
        })
        .value()

      this.setState({
        influencerLocations: locations,
        influencerLocationsLoading: false,
        loading: false,
      })
    })
  }

  getInfluencerMentionsData = values => {
    const { dispatch } = this.props

    dispatch(getInfluencerMentions(values)).then(data => {
      let mentions = []

      _.chain(data)
        .map(item => {
          return {
            ...item,
            influencerId: parseInt(item.influencerId),
          }
        })
        .groupBy(item => item.influencerId)
        .forEach(item => {
          mentions.push([...item])
        })
        .value()

      this.setState({
        influencerMentions: mentions,
        influencerMentionsLoading: false,
        loading: false,
      })
    })
  }

  getPostsData = (values, lazyLoaded) => {
    const { dispatch } = this.props

    const _values = {
      ...values,
      profileGender: values.profileGender.toLowerCase() === 'any' ? null : values.profileGender,
    }

    this.setState({
      arePostsLoading: true,
    })

    if (this.state.mediaTypeSelected === 'story') {
      dispatch(getStories(_values, { perPage: 10, page: this.state.currentPage })).then(data => {
        data = transformIntoStory(data)

        let stores = lazyLoaded ? this.state.posts.concat(data) : data

        this.setState({
          posts: stores,
          showLoadMoreButton: !!data.length,
          arePostsLoading: false,
          postsModalVisible: true,
        })
      })
    } else {
      dispatch(getPosts(_values, { perPage: 10, page: this.state.currentPage })).then(data => {
        let posts = lazyLoaded ? this.state.posts.concat(data) : data

        this.setState({
          posts: posts,
          showLoadMoreButton: !!data.length,
          arePostsLoading: false,
          postsModalVisible: true,
        })
      })
    }
  }

  reportSelectionOnChange = value => {
    this.setState(
      {
        selectedReportType: value,
      },
      () => {
        this.fetchData(this.state.searchValues)
      },
    )
  }

  ageOnChange = value => {
    let [gt, lt] = value.split('-')
    let values = this.state.searchValues.age || {}
    values.lt = lt
    values.gt = gt

    this.setState(
      {
        filterTouched: true,
        searchValues: {
          ...this.state.searchValues,
          profileAge: values,
        },
      },
      () => {
        this.fetchData(this.state.searchValues)
      },
    )
  }

  genderOnChange = value => {
    this.setState(
      {
        filterTouched: true,
        searchValues: {
          ...this.state.searchValues,
          profileGender: value,
        },
      },
      () => {
        this.fetchData(this.state.searchValues)
      },
    )
  }

  followersOnChange = (value, direction) => {
    let values = this.state.searchValues.profileFollowers || {}

    if (direction === 'lt') {
      values.lt = value
    } else {
      values.gt = value
    }

    this.setState(
      {
        filterTouched: true,
        searchValues: {
          ...this.state.searchValues,
          profileFollowers: values,
        },
      },
      () => {
        this.fetchData(this.state.searchValues)
      },
    )
  }

  influencerReportTypeOnClick = e => {
    this.setState({
      influencerReportTypeSelected: e.target.value,
    })
  }

  brandReportTypeOnClick = e => {
    this.setState({
      brandReportTypeSelected: e.target.value,
    })
  }

  influencerRowOnClick = influencer => {
    if (parseInt(influencer.influencerId) === -1) {
      return
    }

    let values = {
      ...this.state.searchValues,
      profileId: parseInt(influencer.influencerId),
      brands: [influencer.brand],
      brandsType: [...this.state.searchValues.brandsType, 'unknown'],
    }

    this.setState(
      {
        searchValues: values,
      },
      () => {
        this.getPostsData(values)
      },
    )
  }

  brandValueOnClick = row => {
    let values = {
      ...this.state.searchValues,
      brandsType: [...this.state.searchValues.brandsType, 'unknown'],
    }

    let gte = row.gte,
      lte = row.lte

    this.setState(
      {
        searchValues: values,
      },
      () => {
        this.getPostsData({
          ...values,
          brands: [row.brand],
          date: [gte, lte],
        })
      },
    )
  }

  influencerLocationsBarOnClick = influencer => {
    let values = {
      ...this.state.searchValues,
      profileId: parseInt(influencer.influencerId),
      //location: { like: influencer.locationName },
      locationId: influencer.locationId,
      brandsType: this.state.defaultBrandsType,
      profileAge: null,
      profileFollowers: null,
      profileGender: 'any',
    }

    this.setState(
      {
        searchValues: values,
      },
      () => {
        this.getPostsData(values)
      },
    )
  }

  brandLocationsBarOnClick = brand => {
    let values = {
      ...this.state.searchValues,
      locationId: brand.locationId,
      brandsType: this.state.searchValues.brandsType,
      brands: [brand.brand],
    }

    this.setState(
      {
        searchValues: values,
      },
      () => {
        this.getPostsData(values)
      },
    )
  }

  influencerMentionsBarOnClick = influencer => {
    let values = {
      ...this.state.searchValues,
      profileId: parseInt(influencer.postInfluencerId),
      location: [],
      profileAge: null,
      profileFollowers: null,
      profileGender: 'any',
    }

    this.getPostsData(values)
  }

  analyticsTypeTypeOnClick = e => {
    let filters = [],
      title = ''

    if (e.target.value === 'brands') {
      filters = ['dates', 'brands']
    } else {
      filters = ['dates', 'search-profiles']
      title = 'Influencer Brands'
    }

    this.setState({
      ...this.initState(),
      mainFilters: filters,
      selectedReportTitle: title,
      analyticsTypeSelected: e.target.value,
    })
  }

  brandsSourceTotalOnClick = (e, source, brand) => {
    e.preventDefault()

    let values = {
      ...this.state.searchValues,
      brandsType: [source],
      brands: [brand.name],
    }

    this.setState(
      {
        searchValues: values,
      },
      () => {
        this.getPostsData(values)
      },
    )
  }

  postModalOnClose = () => {
    this.setState({
      posts: [],
      currentPage: 1,
      showLoadMoreButton: true,
      postsModalVisible: false,
    })
  }

  influencerBrandSourcePieOnClick = e => {
    let data = e.series.userOptions.data.find(d => d[0] === e.options.name)[2]
    let values = {
      ...this.state.searchValues,
      brandsType: [data.brandSource.toLowerCase()],
      location: [],
      brands: [data.brand],
      profileId: data.influencerId,
      profileAge: null,
      profileFollowers: null,
      profileGender: 'any',
    }

    this.setState(
      {
        searchValues: values,
        showLoadMoreButton: true,
      },
      () => {
        this.getPostsData(values)
        this.setState({
          searchValues: {
            ...values,
            brands: [],
          },
        })
      },
    )
  }

  getBrandsExportData = () => {
    let { brandInfluencers } = this.state
    let output = []

    brandInfluencers.forEach(brand => {
      let _brand = _.cloneDeep(brand)
      let data = []

      _brand.data.forEach(influencer => {
        data.push({
          Influencer: influencer.fullName,
          'Brand Source': influencer.brandSource,
          Frequency: influencer.brandPosts,
          Ratio: influencer.ratio,
          'Total Reach': influencer.reach,
          'Total Likes': influencer.likes,
          'Total Views': influencer.views,
          'Media Value (in USD)': influencer.totalMediaValue,
        })
      })

      output.push(data)
    })

    return output
  }

  getInfluencersExportData = () => {
    let { influencerBrandsTable } = this.state
    let output = []

    influencerBrandsTable.forEach(influencer => {
      let _influencer = _.cloneDeep(influencer)
      _influencer.data.push(_influencer.total)
      let data = []

      _influencer.data.forEach(brand => {
        let name = brand.brand ? brand.brand : 'TOTAL'
        data.push({
          Brand: name,
          Frequency: brand.brandPosts,
          Ratio: brand.ratio,
          'Total Reach': brand.reach,
          'Total Likes': brand.likes,
          'Total Views': brand.views,
          'Media Value (in USD)': brand.totalMediaValue,
        })
      })

      output.push(data)
    })

    return output
  }

  fetchData = values => {
    let reportTitle = ''

    this.setState(
      {
        searchValues: values,
        brandsValueLoading: true,
        brandsBySourceLoading: true,
        brandInfluencersCutLoading: true,
        brandInfluencersLoading: true,
        influencerLocationsLoading: true,
        influencerMentionsLoading: true,
        brandDemographicsLoading: true,
        getBrandLocations: true,
        loading: true,
      },
      () => {
        let reportType = this.state.selectedReportType

        if (this.state.analyticsTypeSelected === 'influencers') {
          if (reportType === 'influencerBrands') {
            reportTitle = 'Influencer Brands'
            this.getInfluencerBrandsTableData(values)
            this.getInfluencerBrandsPieData(values)
          } else if (reportType === 'influencerLocations') {
            reportTitle = 'Influencer Locations'
            this.getInfluencerLocationsData(values)
          } else if (reportType === 'influencerMentions') {
            reportTitle = 'Influencer Mentions'
            this.getInfluencerMentionsData(values)
          }
        } else {
          if (reportType === 'brandsSource') {
            reportTitle = 'Brand By Exposure'
            this.getBrandsBySourceData(values)
          } else if (reportType === 'brandsValue') {
            reportTitle = 'Media Value'
            this.getBrandsValueData(values)
          } else if (reportType === 'brandInfluencersCut') {
            reportTitle = 'Brand Influencers'
            this.getBrandInfluencersCutData(values)
            this.getBrandInfluencersData(values)
          } else if (reportType === 'brandDemographics') {
            reportTitle = 'Brand Demographics'
            this.getBrandDemographicsData(values)
          } else if (reportType === 'brandLocations') {
            reportTitle = 'Brand Locations'
            this.getBrandLocationsData(values)
          }
        }

        this.setState({
          selectedReportTitle: reportTitle,
        })
      },
    )
  }

  getRandomIndex(usedIndexs, maxIndex) {
    if (usedIndexs.length === maxIndex) {
      return Math.floor(Math.random() * maxIndex)
    }

    let result = 0
    let min = 0
    let max = maxIndex - 1
    let index = Math.floor(Math.random() * (max - min + 1) + min)
    let count = 0

    while (usedIndexs.indexOf(index) > -1 || count < usedIndexs.length) {
      if (index < max) {
        index++
      } else {
        index = 0
      }

      count++
    }

    return index
  }

  loadMore = () => {
    this.setState(
      {
        currentPage: this.state.currentPage + 1,
      },
      () => {
        this.getPostsData(this.state.searchValues, true)
      },
    )
  }

  brandDemographicsClick(brand, gender, ageRange, data) {
    let pie = {
      title: brand + ' - ' + gender + ' having age range ' + ageRange,
      data: data.data.map(x => {
        return { name: x.influencerName, y: 1, influencerId: x.influencerId, brand: x.brand }
      }),
    }

    this.setState({
      demographicsPie: pie,
      demographicsPieModalVisible: true,
    })
  }

  demographicsModalOnClose = () => {
    this.setState({
      demographicsPieModalVisible: false,
    })
  }

  demographicsPieOnClick = (influencerId, brand) => {
    let values = {
      ...this.state.searchValues,
      profileId: parseInt(influencerId),
      brands: [brand],
      brandsType: [...this.state.searchValues.brandsType, 'unknown'],
    }

    this.setState(
      {
        demographicsPieModalVisible: false,
        searchValues: values,
      },
      () => {
        this.getPostsData(values)
      },
    )
  }

  mediaTypeOnClick = e => {
    let type = e.target.value

    this.setState(
      {
        mediaTypeSelected: type,
        posts: [],
        currentPage: 1,
      },
      () => {
        this.getPostsData(this.state.searchValues)
      },
    )
  }

  render() {
    const {
      brandsValue,
      selectedReportTitle,
      mainFilters,
      analyticsTypeSelected,
      loading,
      searchValues,
      brandInfluencersCut,
      brandInfluencers,
      brandInfluencersDetails,
      brandsBySource,
      brandDemographics,
      brandDemographicsLoading,
      brandLocations,
      brandLocationsLoading,
      influencerBrandsPie,
      influencerBrandsTable,
      selectedReportType,
      postsModalVisible,
      posts,
      brandsBySourceLoading,
      brandsValueLoading,
      brandInfluencersCutLoading,
      brandInfluencersLoading,
      influencerReportTypeSelected,
      brandReportTypeSelected,
      influencerLocations,
      influencerLocationsLoading,
      influencerMentions,
      influencerMentionsLoading,
      showLoadMoreButton,
      arePostsLoading,
      filterTouched,
      demographicsPie,
      demographicsPieModalVisible,
      mediaTypeSelected,
    } = this.state

    const exportData =
      analyticsTypeSelected === 'brands'
        ? this.getBrandsExportData()
        : this.getInfluencersExportData()

    // Brands
    const brandsValueChartOptions = {
      chart: {
        type: 'column',
      },
      title: {
        text: '',
      },
      subtitle: {
        text: '',
      },
      credits: {
        enabled: false,
      },
      xAxis: {
        title: {
          text: 'Date',
        },
        categories: brandsValue.x,
        labels: {
          formatter: function() {
            return moment(this.value).format('Do MMM')
          },
        },
        crosshair: true,
      },
      yAxis: {
        min: 0,
        title: {
          text: 'Value (in USD)',
        },
      },
      tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat:
          '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
          '<td style="padding:0"><b>${point.y}</b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true,
      },
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0,
          point: {
            events: {
              click: e => {
                if (e.point && e.point.series.data[e.point.index]) {
                  let date = e.point.series.data[e.point.index].category
                  let row = {
                    brand: e.point.series.name,
                    gte: date,
                    lte: moment(date)
                      .add(1, 'days')
                      .format('YYYY-MM-DD'),
                  }

                  this.brandValueOnClick(row)
                }
              },
            },
          },
        },
      },
      series: brandsValue.y,
    }

    const brandInfluencersPieOptions = []
    brandInfluencersCut.forEach(brand => {
      brandInfluencersPieOptions.push({
        chart: {
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false,
          type: 'pie',
        },
        title: {
          text: '',
        },
        tooltip: {
          pointFormat: '{series.name} <b>{point.percentage:.1f}%</b>',
        },
        credits: {
          enabled: false,
        },
        navigation: {
          buttonOptions: {
            y: -14,
            x: 14,
          },
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: false,
            },
            showInLegend: true,
            events: {
              click: e => {
                // Check if outer pie is clicked
                if (!e.point.drilldown && e.point.name.toLowerCase() !== 'others') {
                  let influencerId =
                    e.point.influencerId ||
                    this.state.allBrandInfluencersCut.find(x => x.fullName === e.point.name)
                      .influencerId
                  let brand =
                    e.point.brand ||
                    this.state.allBrandInfluencersCut.find(x => x.fullName === e.point.name).brand

                  this.influencerRowOnClick({
                    brand: brand,
                    influencerId: influencerId,
                  })

                  this.setState(
                    {
                      brandInfluencersCut: [],
                      brandInfluencersCutOld: _.cloneDeep(this.state.brandInfluencersCut),
                    },
                    () => {
                      this.setState({
                        brandInfluencersCut: _.cloneDeep(this.state.brandInfluencersCutOld),
                      })
                    },
                  )
                }
              },
            },
          },
        },
        series: [
          {
            name: 'Influencers',
            colorByPoint: true,
            data: brand.data,
          },
        ],
        drilldown: {
          series: brand.drilldowns,
        },
      })
    })

    const brandDemographicsOptions = []
    brandDemographics.forEach(brand => {
      brandDemographicsOptions.push({
        chart: {
          type: 'bar',
        },
        title: {
          text: '',
        },
        credits: {
          enabled: false,
        },
        subtitle: {
          text: '',
        },
        xAxis: [
          {
            categories: BrandDemographicRanges,
            reversed: false,
            labels: {
              step: 1,
            },
          },
          {
            opposite: true,
            reversed: false,
            categories: BrandDemographicRanges,
            linkedTo: 0,
            labels: {
              step: 1,
            },
          },
        ],
        yAxis: {
          title: {
            text: null,
          },
        },
        plotOptions: {
          series: {
            stacking: 'normal',
            events: {
              click: e => {
                let gender = e.point.series.name.toLowerCase()
                let ageRange = e.point.category
                let data = brand[gender].find(x => x.key === ageRange)
                this.brandDemographicsClick(data.brand, gender, ageRange, data)
              },
            },
          },
        },
        tooltip: {
          formatter: function() {
            return (
              '<b>' +
              this.series.name +
              ', age ' +
              this.point.category +
              '</b><br/>' +
              'Population: ' +
              Math.abs(this.point.y)
            )
          },
        },
        navigation: {
          buttonOptions: {
            y: -14,
            x: 10,
          },
        },
        series: [
          {
            name: 'Male',
            data: brand.male.map(d => d.value * -1),
          },
          {
            name: 'Female',
            data: brand.female.map(d => d.value),
          },
        ],
      })
    })

    const brandLocationsOptions = []
    brandLocations.map(locations => {
      brandLocationsOptions.push({
        chart: {
          type: 'column',
        },
        title: {
          text: '',
        },
        subtitle: {
          text: '',
        },
        credits: {
          enabled: false,
        },
        xAxis: {
          title: {
            text: 'Locations',
          },
          categories: locations.map(l => l.locationName),
          crosshair: true,
        },
        yAxis: {
          min: 0,
          title: {
            text: 'Counts',
          },
        },
        tooltip: {
          headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
          pointFormat: '<tr><td style="color:{series.color};padding:0">Counts: {point.y}</td></tr>',
          footerFormat: '</table>',
          shared: true,
          useHTML: true,
        },
        plotOptions: {
          column: {
            pointPadding: 0.2,
            borderWidth: 0,
            point: {
              events: {
                click: e => {
                  if (e.point && e.point.series.data[e.point.index]) {
                    let name = e.point.series.userOptions.data[0][2]
                    let brand = {}

                    brandLocations.forEach(locs => {
                      locs.forEach(loc => {
                        if (
                          loc.locationName === e.point.category &&
                          loc.brand.toLowerCase() === name.toLowerCase()
                        ) {
                          brand = loc
                        }
                      })
                    })

                    this.brandLocationsBarOnClick(brand)
                  }
                },
              },
            },
          },
        },
        legend: {
          enabled: false,
        },
        series: [
          {
            name: 'Locations',
            color: ColorPalette[Math.floor(Math.random() * 6)],
            data: locations.map((l, index) => [index, parseInt(l.locationCount), l.brand]),
            cursor: 'pointer',
          },
        ],
      })
    })

    // Influencers
    const influencerLocationsOptions = []
    influencerLocations.map((locations, i) => {
      influencerLocationsOptions.push({
        chart: {
          type: 'column',
        },
        title: {
          text: '',
        },
        subtitle: {
          text: '',
        },
        credits: {
          enabled: false,
        },
        xAxis: {
          title: {
            text: 'Locations',
          },
          categories: locations.map(l => l.locationName),
          crosshair: true,
        },
        yAxis: {
          min: 0,
          title: {
            text: 'Counts',
          },
        },
        tooltip: {
          headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
          pointFormat: '<tr><td style="color:{series.color};padding:0">Counts: {point.y}</td></tr>',
          footerFormat: '</table>',
          shared: true,
          useHTML: true,
        },
        plotOptions: {
          column: {
            pointPadding: 0.2,
            borderWidth: 0,
          },
        },
        legend: {
          enabled: false,
        },
        series: [
          {
            name: 'Locations',
            color: ColorPalette[Math.floor(Math.random() * 6)],
            data: locations.map(l => parseInt(l.locationCount)),
            cursor: 'pointer',
            point: {
              events: {
                click: e => {
                  if (e.point && e.point.series.data[e.point.index]) {
                    let influencer = influencerLocations[i].find(
                      l =>
                        l.locationName.toLowerCase() ===
                        e.point.series.data[e.point.index].category.toLowerCase(),
                    )
                    this.influencerLocationsBarOnClick(influencer)
                  }
                },
              },
            },
          },
        ],
      })
    })

    const influencerMentionsOptions = []
    influencerMentions.map((mentions, i) => {
      influencerMentionsOptions.push({
        chart: {
          type: 'column',
        },
        title: {
          text: '',
        },
        subtitle: {
          text: '',
        },
        credits: {
          enabled: false,
        },
        xAxis: {
          title: {
            text: '',
          },
          categories: mentions.map(m => m.postInfluencerName),
          crosshair: true,
        },
        yAxis: {
          min: 0,
          title: {
            text: 'Counts',
          },
        },
        tooltip: {
          headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
          pointFormat: '<tr><td style="color:{series.color};padding:0">Counts: {point.y}</td></tr>',
          footerFormat: '</table>',
          shared: true,
          useHTML: true,
        },
        plotOptions: {
          column: {
            pointPadding: 0.2,
            borderWidth: 0,
          },
        },
        legend: {
          enabled: false,
        },
        series: [
          {
            name: 'Locations',
            color: ColorPalette[Math.floor(Math.random() * 6)],
            data: mentions.map(m => parseInt(m.mentionCount)),
            cursor: 'pointer',
            point: {
              events: {
                click: e => {
                  if (e.point && e.point.series.data[e.point.index]) {
                    let influencer = influencerMentions[i].find(
                      l =>
                        l.postInfluencerName.toLowerCase() ===
                        e.point.series.data[e.point.index].category.toLowerCase(),
                    )
                    this.influencerMentionsBarOnClick(influencer)
                  }
                },
              },
            },
          },
        ],
      })
    })

    const influencerBrandsPieOptions = []
    influencerBrandsPie.forEach(influencer => {
      influencerBrandsPieOptions.push({
        chart: {
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false,
          type: 'pie',
        },
        title: {
          text: '',
        },
        credits: {
          enabled: false,
        },
        plotOptions: {
          pie: {
            colors: ColorPalette,
            showInLegend: true,
            events: {
              click: e => {
                // Check if outer pie is clicked
                if (e.point.drilldown) {
                  return
                }

                this.influencerBrandSourcePieOnClick(e.point)

                this.setState(
                  {
                    influencerBrandsPie: [],
                    influencerBrandsPieOld: _.cloneDeep(this.state.influencerBrandsPie),
                  },
                  () => {
                    this.setState({
                      influencerBrandsPie: _.cloneDeep(this.state.influencerBrandsPieOld),
                    })
                  },
                )
              },
            },
          },
          series: {
            dataLabels: {
              enabled: true,
              format: '{point.name}: {point.y:.1f}%',
            },
          },
        },
        tooltip: {
          headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
          pointFormat:
            '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>',
        },
        navigation: {
          buttonOptions: {
            y: -14,
            x: 14,
          },
        },
        series: [
          {
            name: 'Brands',
            colorByPoint: true,
            data: influencer.series,
            influencerId: influencer.influencerId,
          },
        ],
        drilldown: {
          series: influencer.drilldowns,
        },
      })
    })

    const demographicsPieOption = {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie',
      },
      title: {
        text: '',
      },
      credits: {
        enabled: false,
      },
      plotOptions: {
        pie: {
          colors: ColorPalette,
          showInLegend: true,
          events: {
            click: e => {
              this.demographicsPieOnClick(e.point.options.influencerId, e.point.options.brand)
            },
          },
        },
      },
      tooltip: {
        headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
        pointFormat:
          '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>',
      },
      series: [
        {
          name: 'Brands',
          colorByPoint: true,
          data: demographicsPie.data,
        },
      ],
    }

    if (this.initialized) {
      setItem('analyticsPageState', this.state)
    }

    return (
      <div>
        <div className="utils__title utils__title--flat mb-3">
          <span className="text-uppercase font-size-16">
            <strong>Analytics</strong>
          </span>
          <span className="margin-left-md">
            <Radio.Group value={analyticsTypeSelected} onChange={this.analyticsTypeTypeOnClick}>
              <Radio.Button value="brands">Brands</Radio.Button>
              <Radio.Button value="influencers">Influencers</Radio.Button>
            </Radio.Group>
          </span>
        </div>
        <div className="filter__right">
          <MainFilter
            key={analyticsTypeSelected}
            onSearch={this.onSearch}
            loading={loading}
            filters={mainFilters}
            searchValues={searchValues}
            title={'Search'}
          />
          <div className="margin-top-xs">
            {analyticsTypeSelected === 'brands' ? (
              <FormItem key={analyticsTypeSelected} label="Report type" colon={false}>
                <Select
                  placeholder="Select a report type"
                  className="report-select"
                  value={selectedReportType}
                  onChange={this.reportSelectionOnChange}
                >
                  <Option value="brandsSource">Brand By Exposure</Option>
                  <Option value="brandsValue">Media Value</Option>
                  <Option value="brandInfluencersCut">Brand Influencers</Option>
                  <Option value="brandDemographics">Brand Demographics</Option>
                  <Option value="brandLocations">Brand Locations</Option>
                </Select>
              </FormItem>
            ) : (
              <FormItem key={analyticsTypeSelected} label="Report type" colon={false}>
                <Select
                  placeholder="Select a report type"
                  className="report-select"
                  value={selectedReportType}
                  onChange={this.reportSelectionOnChange}
                >
                  <Option value="influencerBrands">Influencer Brands</Option>
                  <Option value="influencerLocations">Influencer Locations</Option>
                  <Option value="influencerMentions">Influencer Mentions</Option>
                </Select>
              </FormItem>
            )}
          </div>
        </div>
        <div className="lb filter__left">
          {(analyticsTypeSelected === 'brands' &&
            !brandsValue.x.length &&
            !brandsBySource.length &&
            !brandInfluencersCut.length &&
            !brandInfluencers.length &&
            !brandDemographics.length &&
            !brandLocations.length &&
            !filterTouched) ||
          (analyticsTypeSelected === 'influencers' &&
            !influencerBrandsPie.length &&
            !influencerBrandsTable.length &&
            !influencerLocations.length &&
            !influencerMentions.length) ? (
            <div className="utils__noItems">
              <span>No Data Found</span>
            </div>
          ) : (
            <div className="card">
              <div className="card-body">
                {analyticsTypeSelected === 'influencers' && (
                  <div>
                    <span className="text-uppercase font-size-16">
                      <strong>{selectedReportTitle}</strong>
                      {selectedReportType === 'influencerBrands' && (
                        <Radio.Group
                          className="float-right"
                          value={brandReportTypeSelected}
                          onChange={this.brandReportTypeOnClick}
                        >
                          <Radio.Button value="pie">Pie Chart</Radio.Button>
                          <Radio.Button value="table">Table</Radio.Button>
                        </Radio.Group>
                      )}
                    </span>

                    {loading && (
                      <div className="spinner-container">
                        <Spin indicator={AntIcon} />
                      </div>
                    )}

                    {!!(
                      brandReportTypeSelected === 'pie' &&
                      selectedReportType === 'influencerBrands' &&
                      influencerBrandsPieOptions.length
                    ) &&
                      influencerBrandsPie.map(function(brand, i) {
                        return (
                          <div key={brand.influencer} className="brand-influencers-container">
                            <div className="text-uppercase font-size-14 text-center">
                              <strong>{brand.influencer}</strong>
                            </div>
                            <div>
                              <HighchartsReact
                                highcharts={Highcharts}
                                options={influencerBrandsPieOptions[i]}
                              />
                            </div>
                          </div>
                        )
                      })}

                    {!!(
                      brandReportTypeSelected === 'table' &&
                      selectedReportType === 'influencerBrands'
                    ) &&
                      influencerBrandsTable.map((brand, i) => {
                        return (
                          <div key={brand.influencer} className="margin-top-lg">
                            <div className="text-uppercase font-size-14">
                              <strong>{brand.influencer}</strong>
                              <div className="float-right download-csv-btn">
                                <CSVLink data={exportData[i]} filename={`${brand.influencer}.csv`}>
                                  <Button className="mr-3" icon="download">
                                    Download CSV
                                  </Button>
                                </CSVLink>
                              </div>
                            </div>
                            <table className="table table-hover influencer-table">
                              <thead className="ant-table-thead">
                                <tr>
                                  <th scope="col">Brand</th>
                                  <th scope="col">Frequency</th>
                                  <th scope="col">Ratio {RatioTooltip}</th>
                                  <th scope="col">TTL Reach</th>
                                  <th scope="col">TTL Likes</th>
                                  <th scope="col">TTL Comments</th>
                                  <th scope="col">TTL Views {ViewsTooltip}</th>
                                  <th scope="col">Media Value</th>
                                </tr>
                              </thead>
                              <tbody>
                                {brand.data.map(influencer => {
                                  return (
                                    <tr key={influencer.brand}>
                                      <th scope="row">{influencer.brand}</th>
                                      <td>{influencer.brandPosts}</td>
                                      <td>{influencer.ratio}</td>
                                      <td>{influencer.reach}</td>
                                      <td>{influencer.likes}</td>
                                      <td>{influencer.comments}</td>
                                      <td>{influencer.views}</td>
                                      <td>{influencer.totalMediaValue}</td>
                                    </tr>
                                  )
                                })}
                                <tr className="table-active">
                                  <th>TOTAL</th>
                                  <th>{brand.total.brandPosts}</th>
                                  <th>{brand.total.ratio.toFixed(2)}</th>
                                  <th>{brand.total.reach}</th>
                                  <th>{brand.total.likes}</th>
                                  <th>{brand.total.comments}</th>
                                  <th>{brand.total.views}</th>
                                  <th>{brand.total.totalMediaValue}</th>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        )
                      })}

                    {!!(
                      selectedReportType === 'influencerLocations' && !influencerLocationsLoading
                    ) &&
                      influencerLocations.map((location, i) => {
                        return (
                          <div key={location[0].influencerId} className="brands-value-container">
                            <div className="margin-top-lg">
                              <HighchartsReact
                                highcharts={Highcharts}
                                options={influencerLocationsOptions[i]}
                              />
                            </div>
                          </div>
                        )
                      })}

                    {!!(
                      selectedReportType === 'influencerMentions' && !influencerMentionsLoading
                    ) &&
                      influencerMentions.map((mention, i) => {
                        return (
                          <div key={mention[0].influencerId} className="brands-value-container">
                            <div className="margin-top-lg">
                              <HighchartsReact
                                highcharts={Highcharts}
                                options={influencerMentionsOptions[i]}
                              />
                            </div>
                          </div>
                        )
                      })}
                  </div>
                )}

                {analyticsTypeSelected === 'brands' && (
                  <div>
                    <span className="text-uppercase font-size-16">
                      <strong>{selectedReportTitle}</strong>
                      {selectedReportType === 'brandInfluencersCut' && (
                        <Radio.Group
                          className="float-right"
                          value={influencerReportTypeSelected}
                          onChange={this.influencerReportTypeOnClick}
                        >
                          <Radio.Button value="pie">Pie Chart</Radio.Button>
                          <Radio.Button value="table">Table</Radio.Button>
                        </Radio.Group>
                      )}
                    </span>

                    <div className="filter-container">
                      <Row gutter={16}>
                        <Col className="gutter-row" span={5}>
                          <div className="gutter-box">
                            <FormItem label="Age" colon={false}>
                              <Select
                                defaultValue="Any"
                                placeholder="Age"
                                className="filter-form-item"
                                value={
                                  searchValues && searchValues.profileAge
                                    ? searchValues.profileAge.gt + '-' + searchValues.profileAge.lt
                                    : '0-150'
                                }
                                onChange={this.ageOnChange}
                              >
                                <Option value="0-150">Any</Option>
                                <Option value="0-20">Less than 20</Option>
                                <Option value="21-24">21 - 24</Option>
                                <Option value="25-28">25 - 28</Option>
                                <Option value="29-32">29 - 32</Option>
                                <Option value="33-36">33 - 36</Option>
                                <Option value="37-40">37 - 40</Option>
                                <Option value="41-150">Greater than 41</Option>
                              </Select>
                            </FormItem>
                          </div>
                        </Col>
                        <Col className="gutter-row" span={5}>
                          <div className="gutter-box">
                            <FormItem label="Gender" colon={false}>
                              <Select
                                defaultValue="any"
                                placeholder="Gender"
                                className="filter-form-item"
                                value={
                                  searchValues.profileGender ? searchValues.profileGender : 'any'
                                }
                                onChange={this.genderOnChange}
                              >
                                <Option value="any">Any</Option>
                                <Option value="male">Male</Option>
                                <Option value="female">Female</Option>
                              </Select>
                            </FormItem>
                          </div>
                        </Col>
                        <Col className="gutter-row" span={14}>
                          <div className="gutter-box">
                            <FormItem label="Followers" colon={false}>
                              <Tag closable={false}>between</Tag>
                              <InputNumber
                                size="large"
                                min={1}
                                max={1000000000}
                                defaultValue={
                                  searchValues && searchValues.profileFollowers
                                    ? searchValues.profileFollowers.gt
                                    : DefaultFilterValues.profileFollowers.gt
                                }
                                onChange={e => this.followersOnChange(e, 'gt')}
                              />
                              <Tag closable={false} className="margin-left-xs">
                                and
                              </Tag>
                              <InputNumber
                                size="large"
                                min={1}
                                max={1000000000}
                                defaultValue={
                                  searchValues && searchValues.profileFollowers
                                    ? searchValues.profileFollowers.lt
                                    : DefaultFilterValues.profileFollowers.lt
                                }
                                onChange={e => this.followersOnChange(e, 'lt')}
                              />
                            </FormItem>
                          </div>
                        </Col>
                      </Row>
                    </div>

                    {loading && (
                      <div className="spinner-container">
                        <Spin indicator={AntIcon} />
                      </div>
                    )}

                    {!!(
                      selectedReportType === 'brandsSource' &&
                      brandsBySource.length &&
                      !brandsBySourceLoading
                    ) && (
                      <div className="table-responsive">
                        <table className="table table-bordered table-hover margin-top-sm brand-source-table">
                          <thead className="ant-table-thead">
                            <tr>
                              <th
                                scope="col"
                                rowSpan="1"
                                className="text-center talign-center table-col-border"
                              >
                                Brand
                              </th>
                              <th scope="col" colSpan="3" className="text-center table-col-border">
                                Tags
                              </th>
                              <th scope="col" colSpan="3" className="text-center table-col-border">
                                Mentions
                              </th>
                              <th scope="col" colSpan="3" className="text-center table-col-border">
                                Media Detection
                              </th>
                              <th scope="col" colSpan="3" className="text-center table-col-border">
                                Text
                              </th>
                              <th scope="col" colSpan="3" className="text-center table-col-border">
                                TOTAL
                              </th>
                            </tr>
                            <tr>
                              <th scope="col"> </th>
                              <th scope="col">Total#</th>
                              <th scope="col">Reach</th>
                              <th scope="col">Value (in USD)</th>

                              <th scope="col">Total#</th>
                              <th scope="col">Reach</th>
                              <th scope="col">Value (in USD)</th>

                              <th scope="col">Total#</th>
                              <th scope="col">Reach</th>
                              <th scope="col">Value (in USD)</th>

                              <th scope="col">Total#</th>
                              <th scope="col">Reach</th>
                              <th scope="col">Value (in USD)</th>

                              <th scope="col" className="table-active">
                                Total #
                              </th>
                              <th scope="col" className="table-active">
                                Reach
                              </th>
                              <th scope="col" className="table-active">
                                Value $
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {brandsBySource.map(brand => {
                              return (
                                <tr key={brand.name} className="table-hover">
                                  <th>{brand.name}</th>

                                  <td>
                                    <a
                                      href="#"
                                      onClick={e => this.brandsSourceTotalOnClick(e, 'tag', brand)}
                                    >
                                      {brand.data['tag'].total}
                                    </a>
                                  </td>
                                  <td>{brand.data['tag'].reach}</td>
                                  <td>{brand.data['tag'].value}</td>

                                  <td>
                                    <a
                                      href="#"
                                      onClick={e =>
                                        this.brandsSourceTotalOnClick(e, 'mention', brand)
                                      }
                                    >
                                      {brand.data['mention'].total}
                                    </a>
                                  </td>
                                  <td>{brand.data['mention'].reach}</td>
                                  <td>{brand.data['mention'].value}</td>

                                  <td>
                                    <a
                                      href="#"
                                      onClick={e =>
                                        this.brandsSourceTotalOnClick(e, 'media', brand)
                                      }
                                    >
                                      {brand.data['media'].total}
                                    </a>
                                  </td>
                                  <td>{brand.data['media'].reach}</td>
                                  <td>{brand.data['media'].value}</td>

                                  <td>
                                    <a
                                      href="#"
                                      onClick={e =>
                                        this.brandsSourceTotalOnClick(e, 'unknown', brand)
                                      }
                                    >
                                      {brand.data['text'].total}
                                    </a>
                                  </td>
                                  <td>{brand.data['text'].reach}</td>
                                  <td>{brand.data['text'].value}</td>

                                  <td className="table-warning">{brand.total.totalCount}</td>
                                  <td className="table-warning">{brand.total.reach}</td>
                                  <td className="table-warning">{brand.total.value}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {!!(
                      selectedReportType === 'brandsValue' &&
                      brandsValue.x.length &&
                      !brandsValueLoading
                    ) && (
                      <div className="brands-value-container">
                        <div className="margin-top-lg">
                          <HighchartsReact
                            highcharts={Highcharts}
                            options={brandsValueChartOptions}
                          />
                        </div>
                      </div>
                    )}

                    {!!(
                      selectedReportType === 'brandInfluencersCut' &&
                      brandInfluencersCut.length &&
                      !brandInfluencersCutLoading
                    ) && (
                      <div>
                        <div>
                          {influencerReportTypeSelected === 'pie' &&
                            brandInfluencersCut.map(function(brand, i) {
                              return (
                                <div key={brand.brand} className="brand-influencers-container">
                                  <div className="text-uppercase font-size-14 text-center">
                                    <strong>{brand.brand}</strong>
                                  </div>
                                  <div>
                                    <HighchartsReact
                                      highcharts={Highcharts}
                                      options={brandInfluencersPieOptions[i]}
                                    />
                                  </div>
                                </div>
                              )
                            })}
                        </div>
                        <div>
                          {influencerReportTypeSelected === 'table' &&
                            brandInfluencers.map((brand, i) => {
                              return (
                                <div key={brand.brand} className="margin-bot-lg">
                                  <div className="text-uppercase font-size-14">
                                    <strong>{brand.brand}</strong>
                                    <div className="float-right download-csv-btn">
                                      <CSVLink data={exportData[i]} filename={`${brand.brand}.csv`}>
                                        <Button className="mr-3" icon="download">
                                          Download CSV
                                        </Button>
                                      </CSVLink>
                                    </div>
                                  </div>
                                  <Table
                                    onRow={record => {
                                      return {
                                        onClick: () => {
                                          this.influencerRowOnClick(record)
                                        },
                                      }
                                    }}
                                    columns={BrandInfluencerColumns}
                                    dataSource={brand.data}
                                  />
                                </div>
                              )
                            })}
                        </div>
                      </div>
                    )}

                    {!!(
                      selectedReportType === 'brandDemographics' &&
                      brandDemographics.length &&
                      !brandDemographicsLoading
                    ) &&
                      brandDemographics.map((brand, i) => {
                        return (
                          <div key={brand.name} className="brands-value-container margin-bot-lg">
                            <div className="text-uppercase font-size-14">
                              <strong>{brand.name}</strong>
                            </div>
                            <div>
                              <HighchartsReact
                                highcharts={Highcharts}
                                options={brandDemographicsOptions[i]}
                              />
                            </div>
                          </div>
                        )
                      })}

                    {!!(
                      selectedReportType === 'brandLocations' &&
                      brandLocations.length &&
                      !brandLocationsLoading
                    ) &&
                      brandLocations.map((location, i) => {
                        return (
                          <div key={location} className="brands-value-container margin-bot-lg">
                            <div className="text-uppercase font-size-14">
                              <strong>{location[0].brand}</strong>
                            </div>
                            <div>
                              <HighchartsReact
                                highcharts={Highcharts}
                                options={brandLocationsOptions[i]}
                              />
                            </div>
                          </div>
                        )
                      })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div>
          <Modal
            className="posts-modal"
            title="Media"
            onOk={this.postModalOnClose}
            onCancel={this.postModalOnClose}
            visible={postsModalVisible}
          >
            <div className="posts-modal-container">
              <span className="margin-left-md media-type-btns">
                <Radio.Group value={mediaTypeSelected} onChange={this.mediaTypeOnClick}>
                  <Radio.Button value="default">Posts</Radio.Button>
                  <Radio.Button value="story">Stories</Radio.Button>
                </Radio.Group>
              </span>
              <div className="md post-card-container">
                {!!(posts && posts.length) &&
                  (mediaTypeSelected === 'default'
                    ? posts.map((item, index) => (
                        <div className="md__item" key={index}>
                          <PostCard post={item} />
                        </div>
                      ))
                    : posts.map((stories, index) => (
                        <div className="md__item__story" key={index}>
                          <Stories
                            stories={stories}
                            defaultInterval={1500}
                            width={380}
                            height={675}
                          />
                        </div>
                      )))}
              </div>
              {posts && posts.length && showLoadMoreButton && (
                <div className="my-5 text-center lb__loadMore">
                  <Button
                    type="primary"
                    size="large"
                    onClick={this.loadMore}
                    loading={arePostsLoading}
                  >
                    Load More
                  </Button>
                </div>
              )}
            </div>
          </Modal>
        </div>
        <div>
          <Modal
            className="posts-modal"
            title={demographicsPie.title}
            onOk={this.demographicsModalOnClose}
            onCancel={this.demographicsModalOnClose}
            visible={demographicsPieModalVisible}
          >
            <div>
              <div>
                <HighchartsReact highcharts={Highcharts} options={demographicsPieOption} />
              </div>
            </div>
          </Modal>
        </div>
      </div>
    )
  }
}

export default Analytics
