import React from 'react'
import MainFilter from 'components/Mirrorr/MainFilter'
import { Link } from 'react-router-dom'
import { getProfiles } from 'ducks/profile'
import { connect } from 'react-redux'
import { CSVLink } from 'react-csv'
import { Table, Button, Popconfirm, Icon, Tag, Avatar } from 'antd'
import history from 'index'

const loadingIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />

const rowSelection = {
  onChange: (selectedRowKeys, selectedRows) => {},
  getCheckboxProps: record => ({
    disabled: record.type === 'Disabled User',
    name: record.name,
  }),
}

@connect()
class CompareProfiles extends React.Component {
  state = {
    loading: true,
    data: [],
    tableColumns: [],
    tableData: [],
  }

  componentDidMount() {
    const url = history.location.pathname.toString()
    const selectedProfiles = url
      .replace(/reports\/compare\//g, '')
      .replace(/\//g, '')
      .split('+')
    this.getProfileData(selectedProfiles)
  }

  getProfileData = selectedProfiles => {
    const { dispatch } = this.props
    dispatch(getProfiles()).then(({data}) => {
      let profilesData = []
      selectedProfiles.forEach(selectedProfileId => {
        const profileData = data.find(profileData => selectedProfileId === profileData.id)
        if (profileData) profilesData.push(profileData)
      })

      this.generateTable(profilesData)
    })
  }

  generateTable = profilesData => {
    let tableColumns = []
    let tableData = []
    const parametersColumn = {
      title: '',
      dataIndex: 'option',
      key: 'option',
    }
    tableColumns.push(parametersColumn)
    profilesData.forEach((profile, index) => {
      const column = {
        title: profile.fullName,
        dataIndex: profile.userName,
        key: `key${profile.userName}`,
        render: (text, record) => {
          const user = profile.userName
          if (isNaN(parseFloat(text))) {
            if (!text || !text.length) {
              return '—'
            }
          }
          switch (record.key) {
            case 'userName':
              return (
                <a
                  href={`https://instagram.com/${text}`}
                  target="_blank"
                  className="utils__link--blue utils__link--underlined"
                >
                  @{text}
                </a>
              )
            case 'categories':
              return record[user].map((item, index) => {
                return <Tag key={index}>{item}</Tag>
              })
            default:
              return text
          }
        },
      }
      tableColumns.push(column)

      for (const value in profile) {
        switch (value) {
          case 'userName':
            if (index === 0) {
              tableData[0] = {}
              tableData[0].option = 'Username'
              tableData[0].key = value
            }
            tableData[0][profile.userName] = profile.userName
            break
          case 'updatedAt':
            if (index === 0) {
              tableData[1] = {}
              tableData[1].option = 'Updated At'
              tableData[1].key = value
            }
            tableData[1][profile.userName] = profile.updatedAt
            break
          case 'country':
            if (index === 0) {
              tableData[2] = {}
              tableData[2].option = 'Country'
              tableData[2].key = value
            }
            tableData[2][profile.userName] = profile.country
            break
          case 'industries':
            if (index === 0) {
              tableData[3] = {}
              tableData[3].option = 'Industries'
              tableData[3].key = value
            }
            tableData[3][profile.userName] = profile.industries
            break
          case 'categories':
            if (index === 0) {
              tableData[4] = {}
              tableData[4].option = 'Categories'
              tableData[4].key = value
            }
            tableData[4][profile.userName] = profile.categories
            break
          case 'posts':
            if (index === 0) {
              tableData[5] = {}
              tableData[5].option = 'Posts'
              tableData[5].key = value
            }
            tableData[5][profile.userName] = profile.posts
            break
          case 'followers':
            if (index === 0) {
              tableData[6] = {}
              tableData[6].option = 'Followers'
              tableData[6].key = value
            }
            tableData[6][profile.userName] = profile.followers
            break
          case 'following':
            if (index === 0) {
              tableData[7] = {}
              tableData[7].option = 'Following'
              tableData[7].key = value
            }
            tableData[7][profile.userName] = profile.following
            break
          default:
            break
        }
      }
      return
    })

    this.setState({
      loading: false,
      tableColumns,
      tableData,
    })
  }

  render() {
    const { data, loading, tableColumns, tableData } = this.state
    return (
      <div>
        <div>
          <div className="utils__title utils__title--flat mb-3">
            <span className="text-uppercase font-size-16">
              <strong>Compare Profiles</strong>
            </span>
          </div>
          <div className="card">
            <div className="card-body">
              <div className="mb-4">
                <Link to={`/reports`}>
                  <Button type="primary" className="mr-3 mb-2" icon="arrow-left">
                    Back to profiles
                  </Button>
                </Link>
                <CSVLink data={tableData} filename={'mirrorr_export.csv'}>
                  <Button className="mr-3" icon="download" disabled={tableData.length < 1}>
                    Download CSV
                  </Button>
                </CSVLink>
              </div>
              <Table
                className="text-nowrap mb-4 utils__centeredTable"
                columns={tableColumns}
                dataSource={tableData}
                loading={{ spinning: loading, indicator: loadingIcon }}
                scroll={{ x: 700 }}
                pagination={{ pageSize: 20 }}
              />
              <div>
                <Link to={`/reports`}>
                  <Button type="primary" className="mr-3 mb-2" icon="arrow-left">
                    Back to profiles
                  </Button>
                </Link>
                <CSVLink data={tableData} filename={'mirrorr_export.csv'}>
                  <Button className="mr-3" icon="download" disabled={tableData.length < 1}>
                    Download CSV
                  </Button>
                </CSVLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default CompareProfiles
