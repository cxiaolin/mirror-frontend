import React from 'react'
import MainFilter from 'components/Mirrorr/MainFilter'
import PresetsFilter from 'components/Mirrorr/PresetsFilter'
import UserDescription from 'components/Mirrorr/UserDescription'
import { getProfiles } from 'ducks/profile'
import { connect } from 'react-redux'
import { Tooltip, Button, Tabs, Icon, Tag, Pagination, Spin } from 'antd'
import { SocialIcon } from 'react-social-icons'
import { Link } from 'react-router-dom'
import * as app from 'ducks/app'
import { map, isEmpty } from 'lodash'

const loadingIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />

const mapStateToProps = (state, props) => ({
  profilesInPreset: state.app.profilesInPreset,
  userState: state.app.userState,
})

@connect(mapStateToProps)
class Leaderboard extends React.Component {
  state = {
    loading: true,
    data: [],
    profilesInPreset: [],
    filterValues: '',
    lazyUpdate: false,
    pagination: {
      showTotal: total => `Total ${total} items`,
      total: 0,
      pageSize: 10,
      current: 1,
    },
  }

  componentWillMount() {
    const { profiles } = this.props
    this.setState({
      profiles,
    })
  }

  // componentDidMount() {
  //   this.fetchData()
  // }

  componentWillReceiveProps(newProps) {
    const { profilesInPreset } = newProps
    this.markProfilesInPreset(this.state.data, profilesInPreset)
  }

  markProfilesInPreset = (data, profiles) => {
    data.forEach(profileData => {
      let inPreset = !!profiles.find(selectedProfile => selectedProfile.id === profileData.id)
      profileData.inPreset = inPreset
    })
    const lazyData = this.state.lazyUpdate ? this.state.data.concat(data) : data
    this.setState({
      data: lazyData || [],
      profilesInPreset: profiles,
    })
  }

  fetchData = (
    values = {
      country: undefined,
      industries: [],
      categories: [],
      tags: [],
    },
  ) => {
    const { dispatch, profilesInPreset } = this.props
    let { pagination } = this.state
    const pagerOptions = {
      perPage: pagination.pageSize,
      page: pagination.current,
    }
    this.setState({
      loading: true,
    })

    if (values.profile) {
      values.id = values.profile.map(i => parseInt(i.key))
      values.profile = []
    }

    dispatch(getProfiles(values, pagerOptions)).then(({ data, pager }) => {
      pagination.total = parseInt(pager['x-pagination-total-count'], 10)
      pagination.current = parseInt(pager['x-pagination-current-page'], 10)
      this.setState(
        {
          data: data || [],
          loading: false,
          pagination,
        },
        this.markProfilesInPreset(data, profilesInPreset),
      )
    })
  }

  handleTableChange = (pager, pageSize) => {
    let { pagination, filterValues } = this.state
    pagination.current = pager
    pagination.pageSize = pageSize
    this.setState({
      pagination,
    })
    this.fetchData(filterValues)
  }

  onSearch = values => {
    let { pagination, filterValues } = this.state

    if (values.search !== filterValues.search) {
      pagination.current = 1
    }

    this.setState(
      {
        pagination,
        filterValues: values,
        lazyUpdate: false,
      },
      () => {
        this.fetchData(values)
      },
    )
  }

  addToPreset = profile => {
    const { dispatch } = this.props
    let { profilesInPreset } = this.state
    profilesInPreset = profilesInPreset.concat(profile)
    dispatch(app.setProfilesInPreset(profilesInPreset))
  }

  removeFromPreset = profileId => {
    const { dispatch } = this.props
    let { profilesInPreset } = this.state
    const ids = map(profilesInPreset, 'id')
    const deleteIndex = ids.indexOf(profileId)
    profilesInPreset.splice(deleteIndex, 1)
    profilesInPreset = [].concat(profilesInPreset)
    dispatch(app.setProfilesInPreset(profilesInPreset))
  }

  render() {
    const {
      data,
      loading,
      pagination: { showTotal, total, pageSize, current },
    } = this.state
    const items = data.map((item, index) => {
      const { userState } = this.props
      const isAdmin = userState.role === 'admin'
      return (
        <div className="lb__item" key={item.id}>
          <div className="lb__photoContainer">
            <Link to={`/data/${item.id}`} className="lb__photo">
              <div className="lb__photo__img" style={{ backgroundImage: `url(${item.avatar})` }} />
              <div className="lb__country">
                <span>
                  <i className="icmn-location" />
                  {item.country}
                </span>
              </div>
            </Link>
          </div>
          <div className="lb__content">
            <div className="lb__header mb-0">
              <div className="lb__metrics">
                <div className="lb__controls">
                  {!item.inPreset && (
                    <Button type="primary" icon="plus" onClick={() => this.addToPreset(item)}>
                      Add To Preset
                    </Button>
                  )}
                  {item.inPreset && (
                    <Button
                      type="danger"
                      icon="delete"
                      onClick={() => this.removeFromPreset(item.id)}
                    >
                      Remove From Preset
                    </Button>
                  )}
                </div>
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
                <Link to={`/data/${item.id}`}>
                  {((item.firstName || item.lastName) &&
                    `${item.firstName}${' '}${item.lastName}`) ||
                    '—'}
                </Link>
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
    })

    return (
      <div>
        <div className="utils__title utils__title--pager utils__title--flat mb-3 d-flex flex-column flex-xl-row align-items-xl-center">
          <span className="text-uppercase font-size-16">
            <strong>Social Leaderboard</strong>
          </span>
          {data.length > 0 && (
            <div className="mt-3 mt-xl-0 ml-xl-auto">
              <Pagination
                current={current}
                pageSize={pageSize}
                showTotal={showTotal}
                total={total}
                onChange={this.handleTableChange}
              />
            </div>
          )}
        </div>
        <div className="filter__right">
          <Tabs defaultActiveKey="1">
            <Tabs.TabPane
              tab={
                <span>
                  <Icon type="search" />
                  Search
                </span>
              }
              key="1"
            >
              <div className="pt-3">
                <MainFilter
                  onSearch={this.onSearch}
                  loading={loading}
                  filters={[
                    'search-profiles',
                    'country',
                    'industries',
                    'categories',
                    'profileTags',
                    'followers',
                    'gender',
                    'language',
                  ]}
                  title={'Search'}
                  autoload={false}
                />
              </div>
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={
                <span>
                  <Icon type="team" />
                  Presets
                </span>
              }
              key="2"
            >
              <div className="pt-3">
                <PresetsFilter />
              </div>
            </Tabs.TabPane>
          </Tabs>
        </div>
        <div className="lb filter__left">
          <Spin spinning={loading} indicator={loadingIcon}>
            {data.length < 1 && (
              <div className="utils__noItems">
                <span>No Items Found</span>
              </div>
            )}
            {items}
          </Spin>
          {data.length > 0 && (
            <div className="d-flex mt-3">
              <Pagination
                className="ml-xl-auto"
                current={current}
                pageSize={pageSize}
                showTotal={showTotal}
                total={total}
                onChange={this.handleTableChange}
              />
            </div>
          )}
        </div>
      </div>
    )
  }
}

export default Leaderboard
