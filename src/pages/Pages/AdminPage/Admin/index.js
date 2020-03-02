import React from 'react'
import MainFilter from 'components/Mirrorr/MainFilter'
import UserDescription from 'components/Mirrorr/UserDescription'
import { Link } from 'react-router-dom'
import { getProfiles, deleteProfile, forceUpdate } from 'ducks/profile'
import { connect } from 'react-redux'
import { CSVLink } from 'react-csv'
import { Table, Button, Popconfirm, Icon, Tag, Avatar, message, notification, Tabs } from 'antd'
import { isEmpty } from 'lodash'
import { SocialIcon } from 'react-social-icons'

const TabPane = Tabs.TabPane
const loadingIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />

const rowSelection = {
  onChange: (selectedRowKeys, selectedRows) => {
    //console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows)
  },
  getCheckboxProps: record => ({
    disabled: record.type === 'Disabled User',
    name: record.name,
  }),
}

const mapStateToProps = (state, props) => ({
  userState: state.app.userState,
})

@connect(mapStateToProps)
class Admin extends React.Component {
  state = {
    loading: true,
    data: [],
    pagination: {
      showTotal: total => `Total ${total} items`,
      total: 0,
      pageSize: 10,
      current: 1,
    },
  }

  fetchData = (values = { country: undefined, industries: [], categories: [], tags: [] }) => {
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

  deleteProfile = profileId => {
    const { dispatch } = this.props
    dispatch(deleteProfile(profileId)).then(() => {
      this.fetchData()
    })
  }

  handleTableChange = pager => {
    let { pagination } = this.state
    pagination.current = pager.current
    pagination.pageSize = pager.pageSize
    this.setState({
      pagination,
    })
    this.fetchData()
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

  forceUpdate = id => {
    const { dispatch } = this.props
    message.success('Profile update moved to queue. Profile will be updated soon.')
    dispatch(forceUpdate(id))
  }

  render() {
    const columns = [
      {
        title: 'ID',
        dataIndex: 'id',
        sorter: false,
      },
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
        title: '',
        dataIndex: 'edits',
        sorter: false,
        width: '150px',
        render: (row, rows) => {
          return (
            <div className="text-right">
              {/*
              <Button
                className="mr-3"
                size="small"
                type="primary"
                icon="redo"
                onClick={() => this.forceUpdate(rows.id)}
              >
                Update
              </Button>
              */}
              <Link to={`/admin/profiles/edit/${rows.id}`}>
                <Button className="mr-3" size="small" icon="edit">
                  Edit
                </Button>
              </Link>
              <Popconfirm
                title={'Delete this profile?'}
                okText="Yes"
                cancelText="No"
                onConfirm={() => this.deleteProfile(rows.id)}
              >
                <Button className="mr-3" type="danger" size="small" icon="delete" />
              </Popconfirm>
            </div>
          )
        },
      },
      // {
      //   title: 'Username',
      //   dataIndex: 'userName',
      //   sorter: false,
      //   render: (row, rows) => {
      //     return (
      //       <a
      //         href={`https://instagram.com/${row}`}
      //         target="_blank"
      //         className="utils__link--blue utils__link--underlined"
      //       >
      //         @{row}
      //       </a>
      //     )
      //   },
      // },
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
      // {
      //   title: 'Status',
      //   dataIndex: 'status',
      //   sorter: false,
      //   render: (row, rows) => {
      //     return <Tag color={'#46be8a'}>Active</Tag>
      //   },
      // },
      {
        title: 'Updated At',
        dataIndex: 'updatedAt',
        sorter: false,
      },
    ]
    const { data, loading, pagination } = this.state
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
              filters={[
                'profileId',
                'search',
                'country',
                'industries',
                'categories',
                'profileTags',
              ]}
              title={'Search'}
            />
          </div>
          <div className="lb filter__left">
            <div className="card">
              <div className="card-body">
                <div className="mb-4">
                  <Link to={'/admin/profiles/add'}>
                    <Button type="primary" className="mr-3 mb-2" icon="plus">
                      Add New
                    </Button>
                  </Link>
                  {/*
                  <Button type="primary" className="mr-3" icon="upload" disabled>
                    Upload CSV
                  </Button>
                  */}
                  <CSVLink data={data} filename={'mirrorr_export.csv'}>
                    <Button className="mr-3" icon="download" disabled={data.length < 1}>
                      Download CSV
                    </Button>
                  </CSVLink>
                </div>
                <Table
                  className="text-nowrap mb-4"
                  columns={columns}
                  rowKey={record => record.id}
                  dataSource={data}
                  loading={{ spinning: loading, indicator: loadingIcon }}
                  scroll={{ x: 700 }}
                  expandedRowRender={row => this.renderInfo(row)}
                  pagination={pagination}
                  onChange={this.handleTableChange}
                />
                <div>
                  <Link to={'/admin/profiles/add'}>
                    <Button type="primary" className="mr-3 mb-2" icon="plus">
                      Add New
                    </Button>
                  </Link>
                  {/*
                  <Button type="primary" className="mr-3" icon="upload" disabled>
                    Upload CSV
                  </Button>
                  */}
                  <CSVLink data={data} filename={'mirrorr_export.csv'}>
                    <Button className="mr-3" icon="download" disabled={data.length < 1}>
                      Download CSV
                    </Button>
                  </CSVLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Admin
