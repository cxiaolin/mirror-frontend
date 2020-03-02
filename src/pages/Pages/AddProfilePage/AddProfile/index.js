import React from 'react'
import AddProfileForm from './AddProfileForm'

class AddProfile extends React.Component {
  render() {
    const { match } = this.props
    const { action, id } = match.params
    return (
      <div>
        <div className="utils__title utils__title--flat mb-3">
          <span className="text-uppercase font-size-16">
            <strong>Add Profile</strong>
          </span>
        </div>
        <div className="card">
          <div className="card-body">
            <div style={{ maxWidth: '720px', margin: '0px auto' }}>
              <AddProfileForm />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default AddProfile
