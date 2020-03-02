import React from 'react'
import Page from 'components/LayoutComponents/Page'
import Helmet from 'react-helmet'
import Media from './Media'

class MediaPage extends React.Component {
  static defaultProps = {
    pathName: 'Media',
    roles: ['user', 'admin'],
  }

  render() {
    const { match } = this.props
    const props = this.props
    return (
      <Page {...props}>
        <Helmet title="Media" />
        <Media match={match} />
      </Page>
    )
  }
}

export default MediaPage
