import React from 'react'
import PropTypes from 'prop-types'
import { Spinner } from 'react-redux-spinner'
import { Layout as AntLayout } from 'antd'
import Routes from 'routes'
import TopBar from 'components/LayoutComponents/TopBar'
import Footer from 'components/LayoutComponents/Footer'
import Content from 'components/LayoutComponents/Content'
import Loader from 'components/LayoutComponents/Loader'

const AntContent = AntLayout.Content
const AntHeader = AntLayout.Header
const AntFooter = AntLayout.Footer


let contentBuffer = {
  pathName: null,
  content: null,
}

class Layout extends React.Component {
  static childContextTypes = {
    getContentBuffer: PropTypes.func,
    setContentBuffer: PropTypes.func,
  }

  getChildContext() {
    return {
      getContentBuffer: () => contentBuffer,
      setContentBuffer: ({ pathName, content }) => (contentBuffer = { pathName, content }),
    }
  }

  render() {
    return (
      <AntLayout>
        <Loader />
        <Spinner />
        <Routes />
        <AntLayout>
          <AntHeader>
            <TopBar />
          </AntHeader>
          <AntContent style={{ height: '100%' }}>
            <Content />
          </AntContent>
          <AntFooter>
            <Footer />
          </AntFooter>
        </AntLayout>
      </AntLayout>
    )
  }
}

export default Layout
