import React from 'react'
import { connect } from 'react-redux'
import { Link, NavLink } from 'react-router-dom'
import './style.scss'
import { Button, Dropdown, Menu } from 'antd'

const mapStateToProps = (state, props) => ({
  userState: state.app.userState,
})

@connect(mapStateToProps)
class MainMenu extends React.Component {
  render() {
    const { userState } = this.props
    const isDataEntry = userState.role === 'dataEntry'

    const menuDesktop = (
      <div className="mainMenu__desktop">
        <NavLink activeClassName="active" to="/leaderboard">
          Leaderboard
        </NavLink>
        <NavLink activeClassName="active" to="/insights">
          Insights
        </NavLink>
        <NavLink activeClassName="active" to="/data">
          Mirrorr Data
        </NavLink>
        <NavLink activeClassName="active" to="/media">
          Media
        </NavLink>
        <NavLink activeClassName="active" to="/reports">
          Reports
        </NavLink>
        <NavLink activeClassName="active" to="/analytics">
          Analytics
        </NavLink>
      </div>
    )

    const menuMobile = (
      <Menu selectable={false}>
        <Menu.Item>
          <NavLink activeClassName="active" to="/leaderboard" className="mobileMenu__link">
            Leaderboard
          </NavLink>
        </Menu.Item>
        <Menu.Item>
          <NavLink activeClassName="active" to="/insights" className="mobileMenu__link">
            Insights
          </NavLink>
        </Menu.Item>
        <Menu.Item>
          <NavLink activeClassName="active" to="/data" className="mobileMenu__link">
            Mirrorr Data
          </NavLink>
        </Menu.Item>
        <Menu.Item>
          <NavLink activeClassName="active" to="/media" className="mobileMenu__link">
            Media
          </NavLink>
        </Menu.Item>
        <Menu.Item>
          <NavLink activeClassName="active" to="/reports" className="mobileMenu__link">
            Reports
          </NavLink>
        </Menu.Item>
        <Menu.Item>
          <NavLink activeClassName="active" to="/analytics" className="mobileMenu__link">
            Analytics
          </NavLink>
        </Menu.Item>
      </Menu>
    )

    const menuDesktopDataEntry = (
      <div className="mainMenu__desktop">
        <NavLink activeClassName="active" to="/admin/profiles">
          Administration
        </NavLink>
      </div>
    )

    const menuMobileDataEntry = (
      <Menu selectable={false}>
        <Menu.Item>
          <NavLink activeClassName="active" to="/admin/profiles" className="mobileMenu__link">
            Administration
          </NavLink>
        </Menu.Item>
      </Menu>
    )

    return (
      <div className="mainMenu d-inline-block">
        {isDataEntry ? menuDesktopDataEntry : menuDesktop}
        <div className="mainMenu__mobile">
          <Dropdown
            overlay={isDataEntry ? menuMobileDataEntry : menuMobile}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button icon="menu-unfold" />
          </Dropdown>
        </div>
      </div>
    )
  }
}

export default MainMenu
