import React from 'react'
import Page from 'components/LayoutComponents/Page'
import Helmet from 'react-helmet'
import Leaderboard from './Leaderboard'

class LeaderboardPage extends React.Component {
  static defaultProps = {
    pathName: 'Social Leaderboard',
    roles: ['user', 'admin'],
  }

  render() {
    const props = this.props
    console.log(props)
    return (
      <Page {...props}>
        <Helmet title="Social Leaderboard" />
        <Leaderboard />
      </Page>
    )
  }
}

export default LeaderboardPage
