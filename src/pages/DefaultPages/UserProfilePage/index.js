import React from 'react'
import Page from 'components/LayoutComponents/Page'
import Helmet from 'react-helmet'
import UserProfile from './UserProfile'

class UserProfilePage extends React.Component {
  static defaultProps = {
    pathName: 'Edit Profile',
    roles: ['user', 'admin', 'dataEntry'],
  }

  render() {
    const props = this.props
    return (
      <Page {...props}>
        <Helmet title="Edit Profile" />
        <UserProfile />
      </Page>
    )
  }
}

export default UserProfilePage
