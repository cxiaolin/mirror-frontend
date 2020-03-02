import React from 'react'
import Page from 'components/LayoutComponents/Page'
import Helmet from 'react-helmet'
import EditProfile from './EditProfile'

class EditProfilePage extends React.Component {
  static defaultProps = {
    pathName: 'Edit Profile',
    roles: ['user', 'admin', 'dataEntry'],
  }

  render() {
    const { match, ...props } = this.props
    return (
      <Page {...props}>
        <Helmet title="Edit Profile" />
        <EditProfile match={match} />
      </Page>
    )
  }
}

export default EditProfilePage
