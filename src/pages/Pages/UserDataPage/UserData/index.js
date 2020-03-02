import React from 'react'
import UserDataForm from './UserDataForm'

class UserData extends React.Component {
  render() {
    const { pathName, userId } = this.props
    return (
      <div>
        <div className="utils__title utils__title--flat mb-3">
          <span className="text-uppercase font-size-16">
            <strong>{pathName}</strong>
          </span>
        </div>
        <div className="card">
          <div className="card-body">
            <div style={{ maxWidth: '720px', margin: '0px auto' }}>
              <UserDataForm userId={userId} />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default UserData
