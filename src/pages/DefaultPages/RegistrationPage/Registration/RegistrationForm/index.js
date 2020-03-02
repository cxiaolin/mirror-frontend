import React from 'react'
import { connect } from 'react-redux'
import { REDUCER, submit } from 'ducks/registration'
import { Form, Input, Button, Checkbox, Select } from 'antd'
import { Link } from 'react-router-dom'

const FormItem = Form.Item

const mapStateToProps = (state, props) => ({
  isSubmitForm: state.app.submitForms[REDUCER],
})

const formOptions = {
  onValuesChange: (props, values) => {},
}

@connect(mapStateToProps)
@Form.create(formOptions)
class RegistrationForm extends React.Component {
  static defaultProps = {}

  state = {
    disabled: false,
    confirmDirty: '',
  }

  // $FlowFixMe
  onSubmit = (isSubmitForm: ?boolean) => event => {
    event.preventDefault()
    const { form, dispatch } = this.props
    if (!isSubmitForm) {
      form.validateFields((error, values) => {
        if (!error) {
          dispatch(submit(values))
        }
      })
    }
  }

  handleCheckboxChange() {
    this.setState(state => ({
      ...state,
      disabled: !state.disabled,
    }))
  }

  checkPassword = (rule, value, callback) => {
    const form = this.props.form
    if (value && value !== form.getFieldValue('password')) {
      callback('Passwords must match')
    } else {
      callback()
    }
  }

  checkConfirm = (rule, value, callback) => {
    const form = this.props.form
    if (value && this.state.confirmDirty) {
      form.validateFields(['passwordConfirm'], { force: true })
    }
    callback()
  }

  handleConfirmBlur = e => {
    const value = e.target.value
    this.setState({ confirmDirty: this.state.confirmDirty || !!value })
  }

  render() {
    const { form, isSubmitForm } = this.props
    return (
      <div className="cat__pages__login__block__form">
        <h4 className="text-uppercase">
          <strong>Registration</strong>
        </h4>
        <br />
        <Form layout="vertical" hideRequiredMark onSubmit={this.onSubmit(isSubmitForm)}>
          <FormItem label="Name">
            {form.getFieldDecorator('name', {
              rules: [{ required: true, message: 'Please input your Name' }],
            })(<Input size="default" />)}
          </FormItem>
          <FormItem label="Email">
            {form.getFieldDecorator('email', {
              rules: [
                { type: 'email', message: 'The input is not a valid Email' },
                { required: true, message: 'Please input your Email' },
              ],
            })(<Input size="default" />)}
          </FormItem>
          <FormItem label="Password">
            {form.getFieldDecorator('password', {
              initialValue: '',
              rules: [
                {
                  required: true,
                  message: 'Please input your password',
                },
                {
                  validator: this.checkConfirm,
                },
                {
                  min: 6,
                  message: 'Password must be at least 6 characters',
                },
              ],
            })(<Input type="password" size="default" />)}
          </FormItem>
          <FormItem label="Repeat Password">
            {form.getFieldDecorator('passwordConfirm', {
              initialValue: '',
              rules: [
                {
                  required: true,
                  message: 'Please confirm your password',
                },
                {
                  validator: this.checkPassword,
                },
              ],
            })(<Input type="password" size="default" onBlur={this.handleConfirmBlur} />)}
          </FormItem>
          <div className="form-group">
            <div className="checkbox">
              <Checkbox checked={!this.state.disabled}
                        onChange={e => this.handleCheckboxChange()} />
              <span>
                I have read the
              </span>
              <a
                href="javascript: void(0);"
                target="_blank"
                rel="noopener noreferrer"
                className="utils__link--blue"
              >
                Terms of Use
              </a>
            </div>
          </div>
          <div className="form-actions">
            <Button
              type="primary"
              className="width-100"
              htmlType="submit"
              disabled={this.state.disabled}
              loading={isSubmitForm}
            >
              Sign Up
            </Button>

            <Link to={'/login'}
              className="utils__link--blue float-right mt-2"
            >
              Back to Login
            </Link>
          </div>
        </Form>
      </div>
    )
  }
}

export default RegistrationForm
