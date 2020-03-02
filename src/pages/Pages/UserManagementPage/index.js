import React from 'react'
import Page from 'components/LayoutComponents/Page'
import Helmet from 'react-helmet'
import UserManagement from './UserManagement'

class UserManagementPage extends React.Component {
  static defaultProps = {
    pathName: 'User Management',
    roles: ['admin'],
  }

  render() {
    const props = this.props
    return (
      <Page {...props}>
        <Helmet title="User Management" />
        <UserManagement />
      </Page>
    )
  }
}

export default UserManagementPage
