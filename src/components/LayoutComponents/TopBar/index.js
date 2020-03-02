import React from 'react'
import ProfileMenu from './ProfileMenu'
import Logo from './Logo'
import MainMenu from './MainMenu'
import { connect } from 'react-redux'
import './style.scss'

const mapStateToProps = (state, props) => ({
  userState: state.app.userState,
})

@connect(mapStateToProps)
class TopBar extends React.Component {
  render() {
    const { role } = this.props.userState
    return (
      <div className="topbar">
        <div className="topbar__left">
          <Logo />
          <MainMenu />
        </div>
        <div className="topbar__right">
          <ProfileMenu />
        </div>
      </div>
    )
  }
}

export default TopBar
