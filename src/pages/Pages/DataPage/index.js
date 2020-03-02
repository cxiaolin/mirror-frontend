import React from 'react'
import Page from 'components/LayoutComponents/Page'
import Helmet from 'react-helmet'
import Data from './Data'

class DataPage extends React.Component {
  static defaultProps = {
    pathName: 'Mirrorr Data',
    roles: ['user', 'admin'],
  }

  render() {
    const { match } = this.props
    const props = this.props
    return (
      <Page {...props}>
        <Helmet title="Mirrorr Data" />
        <Data match={match} />
      </Page>
    )
  }
}

export default DataPage
