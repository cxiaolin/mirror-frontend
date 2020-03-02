import React from 'react'
import Page from 'components/LayoutComponents/Page'
import Helmet from 'react-helmet'
import CompareProfiles from './CompareProfiles'

class ReportsPage extends React.Component {
  static defaultProps = {
    pathName: 'Compare Profiles',
    roles: ['user', 'admin'],
  }

  render() {
    const props = this.props
    return (
      <Page {...props}>
        <Helmet title="Compare Profiles" />
        <CompareProfiles />
      </Page>
    )
  }
}

export default ReportsPage
