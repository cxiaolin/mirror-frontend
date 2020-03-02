import React from 'react'
import Page from 'components/LayoutComponents/Page'
import Helmet from 'react-helmet'
import Reports from './Reports/index'

class ReportsPage extends React.Component {
  static defaultProps = {
    pathName: 'Reports',
    roles: ['user', 'admin'],
  }

  render() {
    const props = this.props
    return (
      <Page {...props}>
        <Helmet title="Reports" />
        <Reports />
      </Page>
    )
  }
}

export default ReportsPage
