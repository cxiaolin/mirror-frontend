import React from 'react'
import { Link } from 'react-router-dom'
import { getUsers, deleteUser } from 'ducks/users'
import { connect } from 'react-redux'
import { Table, Button, Popconfirm, Icon, Avatar, message } from 'antd'

const loadingIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />

@connect()
class UserManagement extends React.Component {
  state = {
    loading: false,
    data: [],
  }

  componentDidMount() {
    this.fetchData()
  }

  fetchData = () => {
    const { dispatch } = this.props
    this.setState({
      loading: true,
    })
    dispatch(getUsers()).then(data => {
      this.setState({
        data,
        loading: false,
      })
    })
  }

  deleteProfile = id => {
    const { dispatch } = this.props
    dispatch(deleteUser(id)).then(data => {
      message.success('User was successfully deleted.')
      this.fetchData()
    })
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
        dataIndex: 'name',
        sorter: false,
        render: row => (row ? row : '—'),
      },
      {
        title: 'Phone',
        dataIndex: 'phone',
        sorter: false,
        render: row => (row ? row : '—'),
      },
      {
        title: 'Email',
        dataIndex: 'email',
        sorter: false,
        render: row => (row ? row : '—'),
      },
      {
        title: 'Administrator',
        dataIndex: 'role',
        sorter: false,
        render: row => (row === 'admin' ? 'Yes' : '—'),
      },
      {
        title: '',
        dataIndex: 'edits',
        sorter: false,
        width: '150px',
        render: (row, rows) => {
          return (
            <div className="text-right">
              <Link to={`/users/edit/${rows.id}`}>
                <Button className="mr-3" size="small" icon="edit">
                  Edit
                </Button>
              </Link>
              <Popconfirm
                title={'Delete this user?'}
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
    ]

    const { data, loading } = this.state

    return (
      <div>
        <div>
          <div className="utils__title utils__title--flat mb-3">
            <span className="text-uppercase font-size-16">
              <strong>User Management</strong>
            </span>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="mb-4">
              <Link to={'/users/add'}>
                <Button type="primary" className="mr-3 mb-2" icon="plus">
                  Add New
                </Button>
              </Link>
            </div>
            <Table
              className="text-nowrap mb-4"
              columns={columns}
              rowKey={record => record.id}
              dataSource={data}
              loading={{ spinning: loading, indicator: loadingIcon }}
              scroll={{ x: 700 }}
              pagination={{ pageSize: 10 }}
            />
            <div>
              <Link to={'/users/add'}>
                <Button type="primary" className="mr-3 mb-2" icon="plus">
                  Add New
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default UserManagement
