import React from 'react'
import { connect } from 'react-redux'
import { logout } from 'ducks/app'
import { Link } from 'react-router-dom'
import { Menu, Dropdown, Avatar } from 'antd'

const mapDispatchToProps = dispatch => ({
  logout: event => {
    event.preventDefault()
    dispatch(logout())
  },
})

const mapStateToProps = (state, props) => ({
  userState: state.app.userState,
})

@connect(
  mapStateToProps,
  mapDispatchToProps,
)
class ProfileMenu extends React.Component {
  render() {
    const { userState, logout } = this.props
    const isAdmin = userState.role === 'admin'
    const isDataEntry = userState.role === 'dataEntry'
    const menu = (
      <Menu selectable={false}>
        <Menu.Item>
          <div>
            <strong>Hello, {userState.name}</strong>
          </div>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item>
          <div>
            <strong>Email:</strong> {userState.email}
            <br />
            <strong>Phone:</strong> {userState.phone || '-'}
          </div>
        </Menu.Item>
        <Menu.Divider />
        {(isAdmin || isDataEntry) && (
          <Menu.Item>
            <Link to="/admin/profiles">
              <i className="topbar__dropdownMenuIcon icmn-list" /> Administration
            </Link>
          </Menu.Item>
        )}
        {isAdmin && (
          <Menu.Item>
            <Link to="/users">
              <i className="topbar__dropdownMenuIcon icmn-users" /> User management
            </Link>
          </Menu.Item>
        )}
        {isAdmin && (
          <Menu.Item>
            <Link to="/brands">
              <i className="topbar__dropdownMenuIcon icmn-price-tags" /> Brands management
            </Link>
          </Menu.Item>
        )}
        <Menu.Item>
          <Link to="/profile">
            <i className="topbar__dropdownMenuIcon icmn-user" /> Profile
          </Link>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item>
          <a href="https://mirrorr.com/images_annotation" target="_blank">
            <i className="topbar__dropdownMenuIcon icmn-image" /> Image annotation
          </a>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item>
          <a href="javascript: void(0)" onClick={logout}>
            <i className="topbar__dropdownMenuIcon icmn-exit" /> Logout
          </a>
        </Menu.Item>
      </Menu>
    )
    return (
      <div className="topbar__dropdown d-inline-block">
        <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
          <a className="ant-dropdown-link" href="/">
            <Avatar
              className="topbar__avatar"
              src={userState.avatar}
              shape="square"
              size="large"
              icon="user"
            />
          </a>
        </Dropdown>
      </div>
    )
  }
}

export default ProfileMenu
