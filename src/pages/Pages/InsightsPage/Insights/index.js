import React from 'react'
import { connect } from 'react-redux'
import { Button, Modal, Tag } from 'antd'
import PostCard from 'components/Mirrorr/PostCard'
import { getPosts } from 'ducks/posts'
import InsightsFilter from 'components/Mirrorr/InsightsFilter'
import { getProfileMetric } from 'ducks/profile'
import { getTopData, getPostMetric } from 'ducks/posts'
import { withRouter } from 'react-router-dom'
import { isEmpty } from 'lodash'
import moment from 'moment-timezone'
import queryString from 'query-string'
import Highcharts from 'highcharts'
import Highstocks from 'highcharts/highstock'
import HighchartsReact from 'highcharts-react-official'
import Exporting from 'highcharts/modules/exporting'
import _ from 'lodash'
import { getItem, setItem } from 'ducks/localstorage'

const splineStyles = [
  'Solid',
  'ShortDash',
  'ShortDot',
  'ShortDashDot',
  'ShortDashDotDot',
  'Dot',
  'Dash',
  'LongDash',
  'DashDot',
  'LongDashDot',
  'LongDashDotDot',
]

@connect()
class Insights extends React.Component {
  state = {
    dataLoading: false,
    loaded: false,
    posts: [],
    currentPage: 1,
    showLoadMoreButton: true,
    postsModalVisible: false,
    profileMetric: {},
    postMetric: {
      activityType: [],
      activity: [],
      posts: [],
    },
    topData: {},
    filterValues: {},
    selectedDateRange: [],
    activityEngagementOptions: {},
    initialDates: this.getInitialDates(),
  }

  getInitialDates() {
    let date = getItem('filterDates')

    if (date) {
      return date.map(d => moment(d))
    }

    return null
  }

  componentDidMount() {
    Exporting(Highcharts)
  }

  fetchData = values => {
    const { dispatch } = this.props
    this.setState({
      dataLoading: true,
    })
    if (values.profile.length === 0) {
      this.setState({
        loaded: false,
        dataLoading: false,
      })
      return
    }
    dispatch(getProfileMetric(values)).then(data => {
      let followers = {
        data: [],
      }
      let dateRange = this.getDates(
        this.state.filterValues.date[0],
        this.state.filterValues.date[1],
      )

      _.chain(data)
        .map(i => {
          return {
            ...i,
            profileId: parseInt(i.profileId),
          }
        })
        .groupBy(i => i.profileId)
        .forEach(item => {
          // Adding missing dates

          _.difference(dateRange, item.map(i => i.date)).forEach(date => {
            let profile = item[0].profile

            item.push({
              date: date,
              delta_followers: 0,
              followers: 0,
              profileId: item[0].profileId,
              fullName: item[0].fullName,
            })
          })
        })
        .forEach(i => {
          let sorted = _.sortBy(i, ['date'])
          let name = sorted[0].fullName

          let column = {
            name: name + ' - Followers',
            type: 'column',
            yAxis: 1,
            data: sorted.map(x => x.followers || 0),
          }
          let line = {
            name: name + ' - Growth',
            type: 'spline',
            data: sorted.map(x => x.delta_followers || 0),
          }

          followers.data.push(column)
          followers.data.push(line)
        })
        .value()

      this.setState(
        {
          profileMetric: followers,
          activityEngagementOptions: null,
          selectedDateRange: dateRange,
        },
        () => {
          dispatch(getPostMetric(values)).then(data => {
            let index = 0
            let activityType = {
              influencers: [],
              data: [
                {
                  name: 'Images',
                  data: [],
                },
                {
                  name: 'Videos',
                  data: [],
                },
              ],
            }
            let activities = []
            let posts = []

            // Activity Type
            _.chain(data.activityType)
              .map(i => {
                return {
                  ...i,
                  profileId: parseInt(i.profileId),
                }
              })
              .groupBy(i => i.profileId)
              .forEach(item => {
                let images = 0,
                  videos = 0

                item.forEach(i => {
                  images += i.images || 0
                  videos += i.videos || 0
                })

                activityType.data[0].data[index] = images
                activityType.data[1].data[index++] = videos
                activityType.influencers.push(item[0].profile.fullName)
              })
              .value()

            let groupingUnits = [
              [
                'day', // unit name
                [1], // allowed multiples
              ],
            ]

            // Activity and Engagement
            _.chain(data.activity)
              .map(i => {
                return {
                  ...i,
                  profileId: parseInt(i.profileId),
                }
              })
              .groupBy(i => i.profileId)
              .forEach(item => {
                // Adding missing dates

                _.difference(dateRange, item.map(i => i.date)).forEach(date => {
                  let profile = item[0].profile

                  item.push({
                    date: date,
                    comments: 0,
                    count: 0,
                    likes: 0,
                    profile: {
                      id: profile.id,
                      followers: 1,
                      fullName: profile.fullName,
                    },
                    profileId: profile.id,
                  })
                })
              })
              .forEach(item => {
                let sorted = _.sortBy(item, ['date'])
                let influencerName = sorted[0].profile.fullName
                let color = Highcharts.getOptions().colors[this.getRandom(6)]

                let activity = {
                  name: influencerName + ' Activity',
                  influencerName: item[0].profile.fullName,
                  influencerId: item[0].profile.id,
                  type: 'column',
                  yAxis: 0,
                  color: color,
                  data: sorted.map(i => [i.date, parseInt(i.count)]),
                  showInNavigator: true,
                }
                let line = {
                  type: 'line',
                  yAxis: 1,
                  color: color,
                  influencerName: item[0].profile.fullName,
                  dashStyle: splineStyles[this.getRandom(10)],
                  name: influencerName + ' Engagement Rate',
                  data: sorted.map(i => [
                    i.date,
                    parseFloat(((i.comments + i.likes) / (i.profile.followers || 1)).toFixed(2)),
                  ]),
                  marker: {
                    lineWidth: 2,
                    lineColor: color,
                    fillColor: color,
                    symbol: 'circle',
                  },
                  showInNavigator: true,
                }

                activities.push(activity)
                activities.push(line)
              })
              .value()

            // Post rate
            _.chain(data.posts)
              .map(i => {
                return {
                  ...i,
                  profileId: parseInt(i.profileId),
                }
              })
              .groupBy(i => i.profileId)
              .forEach(item => {
                // Adding missing dates

                _.difference(dateRange, item.map(i => i.date)).forEach(date => {
                  let profile = item[0].profile

                  item.push({
                    date: date,
                    count: 0,
                    profile: {
                      id: profile.id,
                      followers: 1,
                      fullName: profile.fullName,
                    },
                    profileId: profile.id,
                  })
                })
              })
              .forEach(i => {
                let sorted = _.sortBy(i, ['date'])
                let name = sorted[0].profile.fullName

                let line = {
                  name: name,
                  data: sorted.map(x => x.count || 0),
                  type: 'spline',
                }

                posts.push(line)
              })
              .value()

            this.setState(
              {
                postMetric: {
                  ...data,
                  activity: activities,
                  activityType: activityType,
                  posts: posts,
                },
              },
              () => {
                this.setState({
                  activityEngagementOptions: this.getActivityEngagementOptions(),
                })

                dispatch(getTopData(values)).then(data => {
                  this.setState({
                    topData: data || [],
                    dataLoading: false,
                    loaded: true,
                  })
                })
              },
            )
          })
        },
      )
    })
  }

  onSearch = values => {
    this.setState(
      {
        filterValues: values,
      },
      () => {
        this.fetchData(values)
      },
    )

    setItem('filterDates', values.date)
  }

  tooltip = ({ id, data, color }) => {
    const count = data[id].toString().replace(/(?=\B(?:\d{3})+\b)/g, ',')
    return (
      <div className="utils__tooltip">
        <span className="utils__tooltipColor" style={{ backgroundColor: color }} />
        <span>
          {id}:
          <strong>{` ${count} ${
            id === 'Activity Rate' ? this.declOfNum(data[id], ['post', 'posts', 'posts']) : ''
          }`}</strong>
        </span>
      </div>
    )
  }

  declOfNum = (number, titles) => {
    const cases = [2, 0, 1, 1, 1, 2]
    return titles[
      number % 100 > 4 && number % 100 < 20 ? 2 : cases[number % 10 < 5 ? number % 10 : 5]
    ]
  }

  countTooltip = ({ data }) => {
    const values = data[0]
    const name = values.serie.id
    const color = values.serie.color
    const count = values.data.y.toString().replace(/(?=\B(?:\d{3})+\b)/g, ',')
    return (
      <div className="utils__tooltip">
        <span className="utils__tooltipColor" style={{ backgroundColor: color }} />
        <span>
          {name}:<strong>{` ${count}`}</strong>
        </span>
      </div>
    )
  }

  formatLabel = value => {
    const data = '' + value
    const countParts = data.split('.')
    const formatCount = countParts[0].toString().replace(/(?=\B(?:\d{3})+\b)/g, ',')
    const result = `${formatCount}${countParts[1] ? '.' + countParts[1] : ''}`
    return result
  }

  isHideTick = (axePosition, tick) => {
    if (tick.value % 1 > 0) return null
    const value = this.formatLabel(tick.value)
    if (axePosition === 'bottom') {
      return (
        <g key={tick.value} transform={`translate(${tick.x},0)`}>
          <line
            x1="0"
            x2="0"
            y1="0"
            y2="5"
            style={{ stroke: 'rgb(119, 119, 119)', strokeWidth: '1' }}
          />
          <text
            alignmentBaseline={tick.textBaseline}
            textAnchor={tick.textAnchor}
            transform={`translate(${tick.textX},${tick.textY})`}
            style={{ fill: 'rgb(51, 51, 51)', fontSize: '11px' }}
          >
            {value}
          </text>
        </g>
      )
    }
    if (axePosition === 'left') {
      return (
        <g key={tick.value} transform={`translate(0,${tick.y})`}>
          <line
            x1="0"
            x2="-5"
            y1="0"
            y2="0"
            style={{ stroke: 'rgb(119, 119, 119)', strokeWidth: '1' }}
          />
          <text
            alignmentBaseline={tick.textBaseline}
            textAnchor={tick.textAnchor}
            transform={`translate(${tick.textX},${tick.textY})`}
            style={{ fill: 'rgb(51, 51, 51)', fontSize: '11px' }}
          >
            {this.formatLabel(tick.value)}
          </text>
        </g>
      )
    }
  }

  toMediaLink = (evt, fieldName, value) => {
    evt.preventDefault()
    const { history } = this.props
    const {
      filterValues: { date },
    } = this.state

    const fromDate = moment(date[0]).format('MM/DD/YYYY')
    const toDate = moment(date[1]).format('MM/DD/YYYY')
    let params = {
      date: [fromDate, toDate],
    }
    switch (fieldName) {
      case 'tags':
        params.tags = [value.id, value.name]
        break
      case 'locations':
        params.locations = value.name
        break
      case 'mentions':
        params.mentions = [value.id, value.name]
        break
      default:
    }
    const mediaLink = `/media/${queryString.stringify(params)}`
    history.push(mediaLink)
  }

  getDates = (startDate, stopDate) => {
    let dateArray = []
    let start = moment(startDate)
    let stop = moment(stopDate)

    while (start <= stop) {
      dateArray.push(moment(start).format('YYYY-MM-DD'))
      start = moment(start).add(1, 'days')
    }

    return dateArray
  }

  getRandom = max => {
    return Math.floor(Math.random() * max)
  }

  getActivityEngagementOptions() {
    let { selectedDateRange, postMetric } = this.state
    let categories = selectedDateRange.map(date => moment(date).format('Do MMM'))

    return {
      chart: {
        type: 'column',
        alignTicks: false,
      },
      title: {
        text: '',
      },
      credits: {
        enabled: false,
      },
      rangeSelector: {
        enabled: false,
      },
      xAxis: {
        categories: categories,
        labels: {
          formatter: function() {
            return categories[this.value] || this.value
          },
        },
      },
      yAxis: [
        {
          allowDecimals: false,
          min: 0,
          opposite: false,
          title: {
            text: 'Activity',
          },
        },
        {
          allowDecimals: true,
          opposite: true,
          min: 0,
          title: {
            text: 'Engagement Rate',
          },
        },
      ],
      navigator: {
        enabled: true,
      },
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0,
          events: {
            click: e => {
              let influencer = postMetric.activity.find(
                x => x.influencerName === e.point.series.userOptions.influencerName,
              )
              this.activityEngagementOnClick(influencer, e.point.name)
            },
          },
        },
        series: {
          dataGrouping: {
            enabled: false,
          },
          events: {
            click: e => {
              let influencer = postMetric.activity.find(
                x => x.influencerName === e.point.series.userOptions.influencerName,
              )
              this.activityEngagementOnClick(influencer, e.point.name)
            },
          },
        },
      },
      series: postMetric.activity,
      legend: {
        enabled: true,
      },
    }
  }

  getPostsData = (values, lazyLoaded) => {
    const { dispatch } = this.props

    this.setState({
      arePostsLoading: true,
    })

    dispatch(getPosts(values, { perPage: 10, page: this.state.currentPage })).then(data => {
      let posts = lazyLoaded ? this.state.posts.concat(data) : data
      let showMoreButton = !!data.length

      this.setState({
        posts: posts,
        showLoadMoreButton: showMoreButton,
        arePostsLoading: false,
        postsModalVisible: true,
      })
    })
  }

  loadMore = () => {
    this.setState(
      {
        currentPage: this.state.currentPage + 1,
      },
      () => {
        this.getPostsData(this.state.postValues, true)
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

  activityTypeOnClick = profile => {
    let values = {
      date: this.state.filterValues.date,
      profileId: parseInt(profile.influencerId),
    }

    this.setState({
      postValues: values,
    })
    this.getPostsData(values)
  }

  activityEngagementOnClick = (profile, date) => {
    let values = {
      date: [
        date,
        moment(date)
          .add(1, 'day')
          .format('YYYY-MM-DD'),
      ],
      profileId: parseInt(profile.influencerId),
    }

    this.setState({
      postValues: values,
    })
    this.getPostsData(values)
  }

  render() {
    const {
      profileMetric,
      postMetric,
      topData,
      dataLoading,
      loaded,
      selectedDateRange,
      activityEngagementOptions,
      posts,
      postsModalVisible,
      arePostsLoading,
      showLoadMoreButton,
      initialDates,
    } = this.state

    const activityTypeOptions = {
      chart: {
        type: 'column',
      },
      title: {
        text: '',
      },
      xAxis: {
        categories: postMetric.activityType.influencers,
      },
      credits: {
        enabled: false,
      },
      yAxis: {
        min: 0,
        title: {
          text: 'Counts',
        },
        stackLabels: {
          enabled: true,
          style: {
            fontWeight: 'bold',
            color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray',
          },
        },
      },
      legend: {
        backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
        borderColor: '#CCC',
        shadow: false,
      },
      tooltip: {
        headerFormat: '{point.x}<br/>',
      },
      plotOptions: {
        column: {
          stacking: 'normal',
          dataLabels: {
            enabled: true,
            color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
          },
          events: {
            click: e => {
              let influencer = postMetric.activity.find(x => x.influencerName === e.point.category)
              this.activityTypeOnClick(influencer)
            },
          },
        },
        series: {
          tooltip: {
            pointFormatter: function() {
              return (
                this.series.name +
                ': ' +
                '<b>' +
                ((this.y / this.stackTotal) * 100).toFixed(2) +
                '%</b>'
              )
            },
          },
        },
      },
      series: postMetric.activityType.data,
    }

    const followersOptions = {
      chart: {
        zoomType: 'xy',
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
          categories: selectedDateRange.map(date => moment(date).format('Do MMM')),
          crosshair: true,
        },
      ],
      yAxis: [
        {
          title: {
            text: 'Growth',
          },
          opposite: true,
        },
        {
          title: {
            text: 'Followers Count',
          },
        },
      ],
      tooltip: {
        shared: true,
      },
      series: profileMetric.data,
    }

    const postRateOptions = {
      title: {
        text: '',
      },
      credits: {
        enabled: false,
      },
      xAxis: [
        {
          categories: selectedDateRange.map(date => moment(date).format('Do MMM')),
          crosshair: true,
        },
      ],
      subtitle: {
        text: '',
      },
      yAxis: {
        title: {
          text: 'Profiles',
        },
      },
      plotOptions: {
        series: {
          label: {
            connectorAllowed: false,
          },
        },
      },
      series: postMetric.posts,
    }

    return (
      <div>
        <div className="utils__title utils__title--flat mb-3">
          <span className="text-uppercase font-size-16">
            <strong>Insights</strong>
          </span>
        </div>
        <div className="filter__right">
          <InsightsFilter
            initialDates={initialDates}
            onSearch={this.onSearch}
            dataLoading={dataLoading}
          />
        </div>
        <div className="lb filter__left">
          {!loaded && (
            <div className="utils__noItems">
              <span>No Data Found</span>
            </div>
          )}
          {loaded && (
            <div>
              <div className="card">
                <div className="card-header">
                  <div className="utils__title">Activity Type</div>
                  <div className="utils__titleDescription">
                    The type of activities taken by the user.
                  </div>
                </div>
                <div className="card-body">
                  {postMetric.activityType && (
                    <div className="height-400">
                      <HighchartsReact highcharts={Highcharts} options={activityTypeOptions} />
                    </div>
                  )}
                </div>
              </div>
              <div className="card">
                <div className="card-header">
                  <div className="utils__title">Activity & Engagement</div>
                  <div className="utils__titleDescription">
                    The activity rate over a period of time.
                  </div>
                </div>
                <div className="card-body">
                  {postMetric.activity && activityEngagementOptions && (
                    <div className="height-400">
                      <HighchartsReact
                        highcharts={Highstocks}
                        constructorType={'stockChart'}
                        options={activityEngagementOptions}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="card">
                <div className="card-header">
                  <div className="utils__title">Followers Rate</div>
                  <div className="utils__titleDescription">
                    Growth and change in number of followers.
                  </div>
                </div>
                <div className="card-body">
                  <div className="height-400">
                    {!isEmpty(profileMetric) ? (
                      <HighchartsReact highcharts={Highcharts} options={followersOptions} />
                    ) : (
                      <div className="text-center" style={{ paddingTop: '80px' }}>
                        No Profiles Snapshots Found
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-header">
                  <div className="utils__title">Posts Rate</div>
                  <div className="utils__titleDescription">
                    Growth and change in number of posts.
                  </div>
                </div>
                <div className="card-body">
                  <div className="height-400">
                    {!isEmpty(postMetric.posts) ? (
                      <HighchartsReact highcharts={Highcharts} options={postRateOptions} />
                    ) : (
                      <div className="text-center" style={{ paddingTop: '80px' }}>
                        No Posts Data Found
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-6">
                  <div className="card">
                    <div className="card-header">
                      <div className="utils__title">Top Tags</div>
                      <div className="utils__titleDescription">Most used hashtags.</div>
                    </div>
                    <div className="card-body">
                      <div className="list">
                        {!isEmpty(topData.tags)
                          ? topData.tags.map((item, index) => (
                              <div className="list__item" key={index}>
                                <div className="float-right">
                                  <Tag color="geekblue">{item.count}</Tag>
                                </div>
                                <div>
                                  <a
                                    href="/media"
                                    className={'utils__link--blue utils__link--underlined'}
                                    onClick={evt => {
                                      this.toMediaLink(evt, 'tags', item)
                                    }}
                                  >
                                    #{item.name}
                                  </a>
                                </div>
                              </div>
                            ))
                          : 'No Tags'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="card">
                    <div className="card-header">
                      <div className="utils__title">Top Mentions</div>
                      <div className="utils__titleDescription">Most mentioned users.</div>
                    </div>
                    <div className="card-body">
                      <div className="list">
                        {!isEmpty(topData.mentions)
                          ? topData.mentions.map((item, index) => (
                              <div className="list__item" key={index}>
                                <div className="float-right">
                                  <Tag color="geekblue">{item.count}</Tag>
                                </div>
                                <div>
                                  <a
                                    href="/media"
                                    className={'utils__link--blue utils__link--underlined'}
                                    onClick={evt => {
                                      this.toMediaLink(evt, 'mentions', item)
                                    }}
                                  >
                                    @{item.name}
                                  </a>
                                </div>
                              </div>
                            ))
                          : 'No Mentions'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-6">
                  <div className="card">
                    <div className="card-header">
                      <div className="utils__title">Top Locations</div>
                      <div className="utils__titleDescription">
                        Most frequent visited locations based on check-ins.
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="list">
                        {!isEmpty(topData.locations)
                          ? topData.locations.map((item, index) => (
                              <div className="list__item" key={index}>
                                <div className="float-right">
                                  <Tag color="geekblue">{item.count}</Tag>
                                </div>
                                <div>
                                  <a
                                    href="/media"
                                    className={'utils__link--blue utils__link--underlined'}
                                    onClick={evt => {
                                      this.toMediaLink(evt, 'locations', item)
                                    }}
                                  >
                                    #{item.name}
                                  </a>
                                </div>
                              </div>
                            ))
                          : 'No Locations'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="card">
                    <div className="card-header">
                      <div className="utils__title">Top Brands</div>
                      <div className="utils__titleDescription">Most mentioned brands in posts.</div>
                    </div>
                    <div className="card-body">
                      <div className="list">
                        {!isEmpty(topData.brands)
                          ? topData.brands.map(item => (
                              <div key={item.name} className="list__item">
                                <div className="float-right">
                                  <Tag color="geekblue">{item.count}</Tag>
                                </div>
                                <div>{item.name}</div>
                              </div>
                            ))
                          : 'No Brands'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <Modal
            className="posts-modal"
            title="Posts"
            onOk={this.postModalOnClose}
            onCancel={this.postModalOnClose}
            visible={postsModalVisible}
          >
            <div className="md post-card-container">
              {posts &&
                posts.map((post, index) => (
                  <div className="md__item" key={index}>
                    <PostCard post={post} />
                  </div>
                ))}
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
      </div>
    )
  }
}

export default withRouter(Insights)
