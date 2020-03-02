import React from 'react'
import EditProfileForm from './EditProfileForm'

class EditProfile extends React.Component {
  render() {
    return (
      <div>
        <div className="utils__title utils__title--flat mb-3">
          <span className="text-uppercase font-size-16">
            <strong>Edit Profile</strong>
          </span>
        </div>
        <div className="card">
          <div className="card-body">
            <div style={{ maxWidth: '720px', margin: '0px auto' }}>
              <EditProfileForm />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default EditProfile
