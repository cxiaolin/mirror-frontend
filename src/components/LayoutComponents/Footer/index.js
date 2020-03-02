import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from 'antd'
import { connect } from 'react-redux'
import './style.scss'

const mapStateToProps = (state, props) => ({
  userState: state.app.userState,
})

@connect(mapStateToProps)
class AppFooter extends React.Component {
  render() {
    const { userState, logout } = this.props
    const isAdmin = userState.role === 'admin'
    const isDataEntry = userState.role === 'dataEntry'
    return (
      <div className="footer">
        <div className="footer__bottom">
          <div className="row">
            <div className="col-sm-6">
              {!isDataEntry && (
                <Link to="/leaderboard" className="mr-4">
                  <Button>Go to Leaderboard</Button>
                </Link>
              )}
              {(isAdmin || isDataEntry) && (
                <Link to="/admin/profiles" className="mr-4">
                  <Button>Administration</Button>
                </Link>
              )}
            </div>
            <div className="col-sm-6">
              <div className="footer__copyright">
                <img src="resources/images/logo.svg" alt="Mirrorr Social" />
                <span>
                  {'© ' + new Date().getFullYear() + ' '}
                  Mirrorr Social
                  <br />
                  All rights reserved
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default AppFooter
