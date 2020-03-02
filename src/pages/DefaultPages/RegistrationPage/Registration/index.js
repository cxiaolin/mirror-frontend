import React from 'react'
import RegistrationForm from './RegistrationForm'
import './style.scss'

class Registration extends React.Component {
  componentDidMount () {
    document.getElementsByTagName('body')[0].style.overflow = 'hidden'
  }

  componentWillUnmount () {
    document.getElementsByTagName('body')[0].style.overflow = ''
  }

  render () {
    return (
      <div className="main-login main-login--fullscreen">
        <div className="main-login__container">
          <div className="main-login__bg" style={{ backgroundImage: 'url(resources/images/login.jpg)' }} />
          <div className="main-login__header">
            <div className="row">
              <div className="col-lg-12">
                <div className="main-login__header__logo">
                  <a href="javascript: void(0);">
                    <img src="resources/images/logo.svg" alt="Mirrorr Social"/>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="main-login__block pb-0">
            <div className="row">
              <div className="col-xl-12">
                <div className="main-login__block__promo">
                  <h1 className="mb-3">
                    <strong>Mirrorr Social</strong>
                  </h1>
                  <br />
                  <h4>
                    Track influencers on different social media platforms!
                  </h4>
                </div>
                <div className="main-login__block__inner">
                  <div className="main-login__block__form">
                    <RegistrationForm />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="main-login__footer">
            {'© ' + new Date().getFullYear() + ' '} Mirrorr. All Right Reserved
          </div>
        </div>
      </div>
    )
  }
}

export default Registration
