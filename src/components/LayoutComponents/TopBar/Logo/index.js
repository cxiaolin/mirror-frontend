import React from 'react'
import { Link } from 'react-router-dom'
import './style.scss'

class ProfileMenu extends React.Component {
  render() {
    return (
      <div className="d-inline-block mr-5">
        <span className="mirrorr__logo">
          <Link to="/leaderboard">
            <img
              src="resources/images/logo.svg"
              alt="Mirrorr Social"
            />
          </Link>
        </span>
      </div>
    )
  }
}

export default ProfileMenu
