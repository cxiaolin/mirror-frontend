import React from 'react'
import Page from 'components/LayoutComponents/Page'
import Helmet from 'react-helmet'
import UserData from './UserData'

class UserDataPage extends React.Component {
  static defaultProps = {
    roles: ['admin'],
  }

  render() {
    const props = this.props
    const userId = this.props.match.params.id
    const pathName = userId ? 'Edit User' : 'Add User'
    return (
      <Page {...props} pathName={pathName}>
        <Helmet title={pathName} />
        <UserData pathName={pathName} userId={userId} />
      </Page>
    )
  }
}

export default UserDataPage
