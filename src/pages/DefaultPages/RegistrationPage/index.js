import React from 'react'
import Page from 'components/LayoutComponents/Page'
import Helmet from 'react-helmet'
import Registration from './Registration'

class RegistrationPage extends React.Component {
  render() {
    const { match, ...props } = this.props
    return (
      <Page {...props}>
        <Helmet title="Registration" />
        <Registration match={match} />
      </Page>
    )
  }
}

export default RegistrationPage
