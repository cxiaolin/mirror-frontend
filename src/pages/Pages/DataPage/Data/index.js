import React from 'react'
import MainFilter from 'components/Mirrorr/MainFilter'
import UserDescription from 'components/Mirrorr/UserDescription'
import { getProfiles } from 'ducks/profile'
import { getTopData } from 'ducks/posts'
import { connect } from 'react-redux'
import { Button, Tooltip, Tag, Icon, Tabs } from 'antd'
import { SocialIcon } from 'react-social-icons'
import { withRouter } from 'react-router-dom'
import { isEmpty } from 'lodash'
import moment from 'moment-timezone'
import queryString from 'query-string'
import { getItem, setItem } from 'ducks/localstorage'

const TabPane = Tabs.TabPane
const DEFAULT_DATE_RANGE = [moment().startOf('day'), moment().endOf('day')]

const mapStateToProps = (state, props) => ({
  userState: state.app.userState,
})

@connect(mapStateToProps)
class Data extends React.Component {
  state = {
    loading: false,
    selectedProfile: undefined,
    data: [],
    topData: [],
    searchValues: this.getSearchValues(),
  }

  getSearchValues() {
    let searchValues = null
    let date = getItem('filterDates')

    if (date) {
      searchValues = { date: date.map(d => moment(d)) }
    }

    return searchValues
  }

  componentDidMount() {
    const id = this.props.location.pathname.split('/data/')[1]
    if (id) {
      this.fetchData({ id, date: DEFAULT_DATE_RANGE })
    }
  }

  componentWillReceiveProps(newProps) {
    if (newProps.match.params.id) {
      this.setState(
        {
          selectedProfile: newProps.match.params.id,
        },
        () => {
          this.fetchData({ id: newProps.match.params.id, date: this.state.filterValues.date })
        },
      )
    }
  }

  onSearch = values => {
    this.setState(
      {
        selectedProfile: values.id,
        filterValues: values,
      },
      () => {
        this.fetchData({
          id: values.id,
          date: values.date,
        })
      },
    )

    setItem('filterDates', values.date)
  }

  toMediaLink = (evt, fieldName, value) => {
    evt.preventDefault()
    const { history } = this.props
    const {
      data,
      filterValues: { date },
    } = this.state
    const user = data[0]
    const fromDate = moment(date[0]).format('MM/DD/YYYY')
    const toDate = moment(date[1]).format('MM/DD/YYYY')
    let params = {
      search: user.userName,
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

  fetchData = (
    values = {
      country: undefined,
      industries: [],
      categories: [],
      tags: [],
      id: undefined,
      date: [],
    },
  ) => {
    const { dispatch } = this.props
    if (values.id) {
      this.setState({
        loading: true,
      })
      dispatch(getProfiles(values)).then(({ data }) => {
        this.setState(
          {
            data: data || [],
          },
          () => {
            dispatch(getTopData(values)).then(data => {
              this.setState({
                topData: data || [],
                loading: false,
              })
            })
          },
        )
      })
    }
  }

  render() {
    const { data, topData, loading, selectedProfile, searchValues } = this.state
    const { userState } = this.props
    const isAdmin = userState.role === 'admin'
    return (
      <div>
        <div className="utils__title utils__title--flat mb-3">
          <span className="text-uppercase font-size-16">
            <strong>Mirrorr Data</strong>
          </span>
        </div>
        <div className="filter__right">
          <MainFilter
            searchValues={searchValues}
            onSearch={this.onSearch}
            loading={loading}
            filters={['dates', 'profiles']}
            title={'Search'}
            selectedProfile={selectedProfile}
          />
        </div>
        <div className="lb filter__left">
          {data.length < 1 && (
            <div className="utils__noItems">
              <span>No Data Found</span>
            </div>
          )}
          {data.length > 0 && (
            <div>
              {data.map((item, index) => {
                return (
                  <div className="lb__item" key={item.id}>
                    <div className="lb__photoContainer">
                      <div className="lb__photo">
                        <div
                          className="lb__photo__img"
                          style={{ backgroundImage: `url(${item.avatar})` }}
                        />
                        <div className="lb__country">
                          <span>
                            <i className="icmn-location" />
                            {item.country}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="lb__content">
                      <div className="lb__header mb-0">
                        <div className="lb__metrics">
                          <span className="lb__metrics__item mb-2">
                            Posts: <Tag color="magenta">{item.posts || '—'}</Tag>
                          </span>
                          <br />
                          <span className="lb__metrics__item mb-2">
                            Followers: <Tag color="green">{item.followers || '—'}</Tag>
                          </span>
                          <br />
                          <span className="lb__metrics__item mb-2">
                            Following: <Tag color="volcano">{item.following || '—'}</Tag>
                          </span>
                        </div>
                        <div className="lb__title">
                          <span>
                            {((item.firstName || item.lastName) &&
                              `${item.firstName}${' '}${item.lastName}`) ||
                              '—'}
                          </span>
                        </div>
                      </div>
                      <div className="lb__footer">
                        <div className="lb__socials">
                          <Tooltip title="Instagram">
                            <SocialIcon url={`http://instagram.com/${item.userName}`} />
                          </Tooltip>
                          <a
                            href={`http://instagram.com/${item.userName}`}
                            target="_blank"
                            className="utils__link--blue"
                            style={{ fontSize: '16px' }}
                          >
                            {item.userName}
                          </a>
                        </div>
                        <div className="lb__description">
                          <UserDescription isAdmin={isAdmin} item={item} />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div className="row">
                <div className="col-lg-6">
                  <div className="card">
                    <div className="card-header">
                      <div className="utils__title">Top Tags</div>
                      <div className="utils__titleDescription">
                        Most used hashtags across social platforms.
                      </div>
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
                      <div className="utils__titleDescription">
                        Most mentioned users across social platforms.
                      </div>
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
                                <a
                                  href="javascript: void(0);"
                                  className={'utils__link--blue utils__link--underlined'}
                                  onClick={evt => {
                                    this.toMediaLink(evt, 'locations', item)
                                  }}
                                >
                                  {item.name}
                                </a>
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
                          ? topData.brands.map((item, index) => (
                              <div className="list__item" key={index}>
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
      </div>
    )
  }
}

export default withRouter(Data)
