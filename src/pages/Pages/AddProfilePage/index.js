import React from 'react'
import Page from 'components/LayoutComponents/Page'
import Helmet from 'react-helmet'
import AddProfile from './AddProfile'

class AddProfilePage extends React.Component {
  static defaultProps = {
    pathName: 'Add Profile',
    roles: ['admin', 'dataEntry'],
  }

  render() {
    const { match, ...props } = this.props
    return (
      <Page {...props}>
        <Helmet title="Add Profile" />
        <AddProfile match={match} />
      </Page>
    )
  }
}

export default AddProfilePage
