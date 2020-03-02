import React from 'react'
import Page from 'components/LayoutComponents/Page'
import Helmet from 'react-helmet'
import BrandsManagement from './BrandsManagement'

class BrandsManagementPage extends React.Component {
  static defaultProps = {
    pathName: 'Brands Management',
    roles: ['admin'],
  }

  render() {
    const props = this.props
    return (
      <Page {...props}>
        <Helmet title="Brands Management" />
        <BrandsManagement />
      </Page>
    )
  }
}

export default BrandsManagementPage
