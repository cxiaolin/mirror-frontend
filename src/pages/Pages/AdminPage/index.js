import React from 'react'
import Page from 'components/LayoutComponents/Page'
import Helmet from 'react-helmet'
import Admin from './Admin'

class AdminPage extends React.Component {
  static defaultProps = {
    pathName: 'Admin',
    roles: ['admin'],
  }

  render() {
    const props = this.props
    return (
      <Page {...props}>
        <Helmet title="Admin" />
        <Admin />
      </Page>
    )
  }
}

export default AdminPage
