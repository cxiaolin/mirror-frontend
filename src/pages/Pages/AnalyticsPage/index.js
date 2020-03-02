import React from 'react'
import Page from 'components/LayoutComponents/Page'
import Helmet from 'react-helmet'
import Analytics from './Analytics'

class AnalyticsPage extends React.Component {
  static defaultProps = {
    pathName: 'analytics',
    roles: ['user', 'admin'],
  }

  render() {
    const props = this.props
    return (
      <Page {...props}>
        <Helmet title="Analytics" />
        <Analytics />
      </Page>
    )
  }
}

export default AnalyticsPage
