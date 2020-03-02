import React from 'react'
import { connect } from 'react-redux'
import { setCommonLogin, setActiveDialog } from 'ducks/app'
import { REDUCER, submit, requestUnlock } from 'ducks/login'
import { Form, Input, Button, message } from 'antd'
import ResetPasswordDialog from '../ResetPasswordModal'
import { Link } from 'react-router-dom'

const FormItem = Form.Item

const mapStateToProps = (state, props) => ({
  isSubmitForm: state.app.submitForms[REDUCER],
  commonLogin: state.app.commonLogin,
})

const formOptions = {
  onValuesChange: (props, values) => {
    if (values.hasOwnProperty('username')) {
      props.dispatch(setCommonLogin(values['username']))
    }
  },
}

@connect(mapStateToProps)
@Form.create(formOptions)
class LoginForm extends React.Component {
  static defaultProps = {}

  state = {
    accountBlocked: false,
  }

  // $FlowFixMe
  onSubmit = (isSubmitForm: ?boolean) => event => {
    event.preventDefault()
    const { form, dispatch } = this.props
    if (!isSubmitForm) {
      form.validateFields((error, values) => {
        if (!error) {
          dispatch(submit(values)).catch(e => {
            this.setState(values)
            this.checkAuth(e)
          })
        }
      })
    }
  }

  checkAuth = serverError => {
    const accountBlocked =
      serverError && (serverError.status === 403 && !/[:]/.test(serverError.message))
    message.error(serverError.message)
    this.setState({
      accountBlocked,
    })
  }

  unlockAccount = () => {
    const { dispatch } = this.props
    const { username } = this.state
    dispatch(requestUnlock({ username })).then(data => {
      if (data.success) {
        this.setState({
          accountBlocked: false,
        })
        message.success('Unlock request has been sent successfully')
      } else {
        message.error((data && data.message) || 'Can not unlock user.')
      }
    })
  }

  changeUser = () => {
    this.setState({
      accountBlocked: false,
    })
  }

  // $FlowFixMe
  showDialog = (dialog: string) => event => {
    event.preventDefault()
    const { dispatch } = this.props
    dispatch(setActiveDialog(dialog))
  }

  render() {
    const { form, isSubmitForm, commonLogin } = this.props
    const { accountBlocked } = this.state

    return (
      <div className="cat__pages__login__block__form">
        {!accountBlocked && (
          <div>
            <ResetPasswordDialog />
            <h4 className="text-uppercase">
              <strong>Please log in</strong>
            </h4>
            <br />
            <Form layout="vertical" hideRequiredMark onSubmit={this.onSubmit(isSubmitForm)}>
              <FormItem label="Email">
                {form.getFieldDecorator('username', {
                  initialValue: commonLogin,
                  rules: [{ required: true, message: 'Please input your username!' }],
                })(<Input size="default" />)}
              </FormItem>
              <FormItem label="Password">
                {form.getFieldDecorator('password', {
                  rules: [{ required: true, message: 'Please input your password!' }],
                })(<Input size="default" type="password" />)}
              </FormItem>
              {/*
              <div className="pb-4">
                <a
                  className="utils__link--blue"
                  href=""
                  onClick={this.showDialog('resetPassword')}
                >
                  Forgot password
                </a>
              </div>
              */}
              <div className="form-actions">
                <Button
                  type="primary"
                  className="width-100"
                  htmlType="submit"
                  loading={isSubmitForm}
                >
                  Login
                </Button>
                {/*
                <Link to={'/registration'}>
                  <Button
                    className="width-100 ml-2"
                  >
                    Sign Up
                  </Button>
                </Link>
                */}
              </div>
            </Form>
          </div>
        )}

        {accountBlocked && (
          <div>
            <div className="text-center mb-3">
              <span className="utils__avatar utils__avatar--border cat__core__avatar--90 d-block mx-auto">
                <img src="/modules/dummy-assets/common/img/avatars/temp.jpg" alt="" />
              </span>
            </div>
            <h2 style={{ color: '#514d6a' }} className="text-center">
              <i className="icmn-lock" />
              <strong>{form.getFieldValue('username')}</strong>
            </h2>
            <div className="form-actions text-center">
              <button type="button" className="btn btn-success" onClick={this.unlockAccount}>
                Unlock
              </button>
            </div>
            <div className="text-center">
              <a href={'javascript:void(0);'} className="text-default" onClick={this.changeUser}>
                Or sign in as a different user
              </a>
            </div>
          </div>
        )}
      </div>
    )
  }
}

export default LoginForm
