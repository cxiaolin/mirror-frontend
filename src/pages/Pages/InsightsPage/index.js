import React from 'react'
import Page from 'components/LayoutComponents/Page'
import Helmet from 'react-helmet'
import Insights from './Insights'

class InsightsPage extends React.Component {
  static defaultProps = {
    pathName: 'Insights',
    roles: ['user', 'admin'],
  }

  render() {
    const { match } = this.props
    const props = this.props
    console.log(props)
    return (
      <Page {...props}>
        <Helmet title="Insights" />
        <Insights match={match} />
      </Page>
    )
  }
}

export default InsightsPage
