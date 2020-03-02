import React from 'react'
import MainFilter from 'components/Mirrorr/MainFilter'
import PostCard from 'components/Mirrorr/PostCard'
import Stories from 'components/Mirrorr/StoryCard'
import { getPosts } from 'ducks/posts'
import { getStories } from 'ducks/story'
import { transformIntoStory } from 'ducks/story'
import { connect } from 'react-redux'
import { Button } from 'antd'
import { map } from 'lodash'
import queryString from 'query-string'
import moment from 'moment-timezone'
import { Radio } from 'antd'
import { getItem, setItem } from 'ducks/localstorage'

const mainFilters = {
  default: [
    'dates',
    'search-profiles',
    'country',
    'industries',
    'categories',
    'postTags',
    'brands',
    'location',
    'mentions',
  ],
  story: [
    'dates',
    'search-profiles',
    'country',
    'industries',
    'categories',
    'postTags',
    'brands',
    'mentions',
  ],
}

@connect()
class Media extends React.Component {
  state = {
    loading: true,
    data: [],
    filterValues: '',
    currentPage: 1,
    lazyUpdate: false,
    searchValues: this.getSearchValues(),
    mediaTypeSelected: 'default',
    mainFilters: mainFilters['default'],
  }

  getSearchValues() {
    let searchValues = null
    let date = getItem('filterDates')

    if (date) {
      searchValues = { date: date.map(d => moment(d)) }
    }

    return searchValues
  }

  componentWillMount() {
    const { match } = this.props
    if (match.params.search) {
      const params = queryString.parse(match.params.search)
      let searchValues = {
        date: [moment(params.date[0], 'MM/DD/YYYY'), moment(params.date[1], 'MM/DD/YYYY')],
        search: params.search,
      }
      if (params.tags) {
        searchValues.tags = {
          key: params.tags[0],
          label: params.tags[1],
        }
      }
      if (params.locations) {
        searchValues.locations = params.locations
      }
      if (params.mentions) {
        searchValues.mentions = {
          key: params.mentions[0],
          label: params.mentions[1],
        }
      }
      this.setState({
        searchValues,
      })
    }
  }

  fetchData = (
    values = {
      dates: [],
      id: '',
      country: undefined,
      location: undefined,
      industries: [],
      categories: [],
      tags: [],
      type: this.state.mediaTypeSelected,
    },
    pager = {
      perPage: 27,
      page: this.state.currentPage,
    },
  ) => {
    const { dispatch } = this.props
    const { searchValues } = this.state
    this.setState({
      loading: true,
    })
    let params = values
    if (searchValues) {
      if (params.tags && params.tags.key) {
        params.tags = [params.tags.key]
      } else {
        params.tags = map(params.tags, 'key')
      }
      if (params.mentions && params.mentions.key) {
        params.mentions = [params.mentions.key]
      } else {
        params.mentions = map(params.mentions, 'key')
      }
    }

    if (params.profile) {
      params.id = params.profile.map(i => parseInt(i.key))
    }

    if (this.state.mediaTypeSelected === 'story') {
      dispatch(getStories(params, pager)).then(data => {
        data = transformIntoStory(data)

        let stories = this.state.lazyUpdate ? this.state.data.concat(data) : data

        this.setState(
          {
            data: stories || [],
            loading: false,
          },
          () => {},
        )
      })
    } else {
      dispatch(getPosts(params, pager)).then(data => {
        let posts = this.state.lazyUpdate ? this.state.data.concat(data) : data

        this.setState(
          {
            data: posts || [],
            loading: false,
          },
          () => {},
        )
      })
    }
  }

  onSearch = values => {
    this.setState(
      {
        currentPage: 1,
        filterValues: { ...values, type: this.state.mediaTypeSelected },
        lazyUpdate: false,
        loading: true,
      },
      () => {
        this.fetchData(this.state.filterValues)
      },
    )

    setItem('filterDates', values.date)
  }

  loadMore = () => {
    this.setState(
      {
        currentPage: this.state.currentPage + 1,
        lazyUpdate: true,
      },
      () => {
        this.fetchData(this.state.filterValues || undefined)
      },
    )
  }

  mediaTypeOnClick = e => {
    let type = e.target.value

    this.setState(
      {
        filterValues: { ...this.state.filterValues, type: type },
        mediaTypeSelected: type,
        mainFilters: mainFilters[type],
        data: [],
        currentPage: 1,
      },
      () => {
        this.fetchData(this.state.filterValues)
      },
    )
  }

  render() {
    const { data, loading, searchValues, mediaTypeSelected, mainFilters } = this.state
    return (
      <div style={{ marginBottom: '200px' }}>
        <div className="utils__title utils__title--flat mb-3">
          <span className="text-uppercase font-size-16">
            <strong>Media</strong>
          </span>
          <span className="margin-left-md">
            <Radio.Group value={mediaTypeSelected} onChange={this.mediaTypeOnClick}>
              <Radio.Button value="default">Posts</Radio.Button>
              <Radio.Button value="story">Stories</Radio.Button>
            </Radio.Group>
          </span>
        </div>
        <div className="filter__right">
          <MainFilter
            onSearch={this.onSearch}
            loading={loading}
            filters={mainFilters}
            title={mediaTypeSelected === 'default' ? 'Post Search' : 'Story Search'}
            searchValues={searchValues}
          />
        </div>
        <div className="filter__left">
          {data.length < 1 && (
            <div className="utils__noItems">
              <span>No Items Found</span>
            </div>
          )}
          <div className={loading ? 'md md--loading' : 'md'}>
            {data.length > 0 &&
              (mediaTypeSelected === 'default'
                ? data.map((item, index) => (
                    <div className="md__item" key={index}>
                      <PostCard post={item} />
                    </div>
                  ))
                : data.map((stories, index) => (
                    <div className="md__item__story" key={index}>
                      <Stories stories={stories} defaultInterval={1500} width={432} height={768} />
                    </div>
                  )))}
          </div>
          <div className="my-5 text-center lb__loadMore">
            <Button type="primary" size="large" onClick={this.loadMore} loading={loading}>
              Load More
            </Button>
          </div>
        </div>
      </div>
    )
  }
}

export default Media
