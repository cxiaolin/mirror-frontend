import React from 'react'
import MainFilter from 'components/Mirrorr/MainFilter'
import UserDescription from 'components/Mirrorr/UserDescription'
import { Link } from 'react-router-dom'
import { getProfiles } from 'ducks/profile'
import { push } from 'react-router-redux'
import { connect } from 'react-redux'
import { CSVLink } from 'react-csv'
import { Table, Button, Popconfirm, Icon, Tag, Avatar, Tabs } from 'antd'
import { isEmpty } from 'lodash'
import { SocialIcon } from 'react-social-icons'

const TabPane = Tabs.TabPane
const loadingIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />

const mapStateToProps = (state, props) => ({
  userState: state.app.userState,
})

@connect(mapStateToProps)
class Reports extends React.Component {
  state = {
    loading: true,
    data: [],
    selectedProfiles: [],
    selectedProfilesData: [],
    pagination: {
      showTotal: total => `Total ${total} items`,
      total: 0,
      pageSize: 10,
      current: 1,
    },
    filterValues: {},
  }

  fetchData = (
    values = {
      country: undefined,
      industries: [],
      categories: [],
      tags: [],
    },
  ) => {
    const { dispatch } = this.props
    let { pagination } = this.state
    const pagerOptions = {
      perPage: pagination.pageSize,
      page: pagination.current,
    }
    this.setState({
      loading: true,
    })
    dispatch(getProfiles(values, pagerOptions)).then(({ data, pager }) => {
      pagination.total = parseInt(pager['x-pagination-total-count'], 10)
      pagination.current = parseInt(pager['x-pagination-current-page'], 10)
      this.setState({
        data: data || [],
        loading: false,
        pagination,
      })
    })
  }

  onSearch = values => {
    let { pagination } = this.state
    pagination.current = 1
    this.setState(
      {
        pagination,
        filterValues: values,
      },
      () => {
        this.fetchData(values)
      },
    )
  }

  onRowSelection = (selectedRowKeys, selectedRows) => {
    this.setState({
      selectedProfiles: selectedRowKeys,
      selectedProfilesData: selectedRows,
    })
  }

  deleteSelectedProfile = (profileIndex, profileId) => {
    let { selectedProfiles, selectedProfilesData } = this.state

    const rowKeyIndex = selectedProfiles.indexOf(profileId)

    selectedProfiles.splice(rowKeyIndex, 1)
    selectedProfilesData.splice(profileIndex, 1)

    this.setState({
      selectedProfiles,
      selectedProfilesData,
    })
  }

  goToCompare = () => {
    const { dispatch } = this.props
    const { selectedProfiles } = this.state
    const url = `/reports/compare/${selectedProfiles.join('+')}`
    dispatch(push(url))
  }

  handleTableChange = pager => {
    let { pagination, filterValues } = this.state
    pagination.current = pager.current
    pagination.pageSize = pager.pageSize
    this.setState({
      pagination,
    })
    this.fetchData(filterValues)
  }

  renderInfo = item => {
    const { userState } = this.props
    const isAdmin = userState.role === 'admin'
    return (
      <div className="mb-3">
        <UserDescription isAdmin={isAdmin} item={item} />
      </div>
    )
  }

  render() {
    const { data, loading, selectedProfiles, selectedProfilesData, pagination } = this.state

    const columns = [
      {
        title: '',
        dataIndex: 'avatar',
        render: (row, rows) => {
          return <Avatar src={row ? row : undefined} shape="square" size={42} icon="user" />
        },
      },
      {
        title: 'Name',
        dataIndex: 'fullName',
        sorter: false,
        render: (row, rows) => {
          return (
            <Link to={`/data/${rows.id}`} className="utils__link--blue utils__link--underlined">
              {((rows.firstName || rows.lastName) && `${rows.firstName}${' '}${rows.lastName}`) ||
                '—'}
            </Link>
          )
        },
      },
      {
        title: 'Country',
        dataIndex: 'country',
        sorter: false,
      },
      {
        title: 'Location',
        dataIndex: 'location',
        sorter: false,
        render: row => (row ? row.name : ''),
      },
      {
        title: 'Posts',
        dataIndex: 'posts',
        render: row => <Tag color="magenta">{row || '—'}</Tag>,
        sorter: false,
      },
      {
        title: 'Followers',
        dataIndex: 'followers',
        render: row => <Tag color="green">{row || '—'}</Tag>,
        sorter: false,
      },
      {
        title: 'Following',
        dataIndex: 'following',
        render: row => <Tag color="volcano">{row || '—'}</Tag>,
        sorter: false,
      },
      {
        title: 'Industries',
        dataIndex: 'industries',
        sorter: false,
        render: (row, rows) => {
          return row.map(item => {
            return <Tag key={rows.id}>{item}</Tag>
          })
        },
      },
      {
        title: 'Categories',
        dataIndex: 'categories',
        sorter: false,
        render: (row, rows) => {
          return row.map((item, index) => {
            return <Tag key={index}>{item}</Tag>
          })
        },
      },
    ]
    const rowSelection = {
      selectedRowKeys: selectedProfiles,
      onChange: this.onRowSelection,
      getCheckboxProps: record => ({
        disabled: record.type === 'Disabled User',
        name: record.name,
      }),
    }
    return (
      <div>
        <div>
          <div className="utils__title utils__title--flat mb-3">
            <span className="text-uppercase font-size-16">
              <strong>Administration</strong>
            </span>
          </div>
          <div className="filter__right">
            <MainFilter
              onSearch={this.onSearch}
              loading={loading}
              filters={['search', 'country', 'industries', 'categories', 'profileTags']}
              title={'Search'}
              autoload={false}
            />
          </div>
          <div className="lb filter__left">
            <div className="card">
              <div className="card-body">
                <div className="mb-4">
                  <Button
                    type="primary"
                    className="mr-3 mb-2"
                    icon="bar-chart"
                    disabled={data.length < 1 || selectedProfiles.length <= 1}
                    onClick={this.goToCompare}
                  >
                    Compare Selected
                  </Button>
                  <CSVLink data={data} filename={'mirrorr_export.csv'}>
                    <Button className="mr-3" icon="download" disabled={data.length < 1}>
                      Download CSV
                    </Button>
                  </CSVLink>
                </div>
                <Table
                  rowSelection={rowSelection}
                  className="text-nowrap mb-4"
                  columns={columns}
                  rowKey={record => record.id}
                  dataSource={data}
                  loading={{ spinning: loading, indicator: loadingIcon }}
                  scroll={{ x: 700 }}
                  pagination={pagination}
                  expandedRowRender={row => this.renderInfo(row)}
                  onChange={this.handleTableChange}
                />
                <div>
                  <Button
                    type="primary"
                    className="mr-3 mb-2"
                    icon="bar-chart"
                    disabled={data.length < 1 || selectedProfiles.length <= 1}
                    onClick={this.goToCompare}
                  >
                    Compare Selected
                  </Button>
                  <CSVLink data={data} filename={'mirrorr_export.csv'}>
                    <Button className="mr-3" icon="download" disabled={data.length < 1}>
                      Download CSV
                    </Button>
                  </CSVLink>
                </div>
              </div>
            </div>
            {selectedProfiles.length > 0 && (
              <div className="selectedProfiles">
                <Tabs tabPosition={'top'}>
                  {selectedProfilesData.map((profile, index) => {
                    const selectedProfile = (
                      <div className="selectedProfiles__item">
                        <div className="selectedProfiles__itemImgWrapper">
                          <img
                            className="selectedProfiles__itemImage"
                            src={profile.avatar}
                            alt={profile.firstName + ' ' + profile.lastName + ' avatar'}
                          />
                          <button
                            onClick={() => {
                              this.deleteSelectedProfile(index, profile.id)
                            }}
                            className="selectedProfiles__itemDel"
                          >
                            Delete
                          </button>
                        </div>
                        <a
                          href={`https://instagram.com/${profile.userName}`}
                          target="_blank"
                          className="selectedProfiles__itemLink utils__link--blue utils__link--underlined mt-2 d-inline-block"
                        >
                          @{profile.userName}
                        </a>
                      </div>
                    )

                    return <TabPane tab={selectedProfile} key={index} />
                  })}
                </Tabs>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
}

export default Reports
