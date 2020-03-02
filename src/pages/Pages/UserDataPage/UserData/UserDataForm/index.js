import React from 'react'
import { connect } from 'react-redux'
import { Form, Input, Button, message, Row, Col, Select, Checkbox } from 'antd'
import { getUser, updateUser, addUser } from 'ducks/users'
import { push } from 'react-router-redux'

const FormItem = Form.Item
const Option = Select.Option

const formOptions = {
  onValuesChange: (props, values) => {},
}

const mapStateToProps = (state, props) => ({})

@connect(mapStateToProps)
@Form.create(formOptions)
class UserDataForm extends React.Component {
  state = {
    userState: [],
    submitting: false,
    confirmDirty: false,
    loading: false,
    avatarPreview: '',
    avatarReady: '',
  }

  componentDidMount() {
    if (this.props.userId) {
      const { dispatch, form } = this.props
      dispatch(getUser(this.props.userId)).then(data => {
        form.setFieldsValue({
          ...data,
        })
      })
    }
  }

  onSubmit = event => {
    event.preventDefault()
    const { isSubmitForm, form, dispatch, userState } = this.props
    if (!isSubmitForm) {
      form.validateFields((error, values) => {
        if (!error) {
          const { dispatch } = this.props
          if (!values.password) {
            delete values.password
            delete values.confirm
          }

          this.setState({
            loading: true,
          })

          if (values.id) {
            dispatch(updateUser(values)).then(data => {
              message.success('Profile was successfully updated.')
              this.setState({
                loading: false,
              })
            })
          }

          if (!values.id) {
            dispatch(addUser(values)).then(data => {
              message.success('Profile was successfully updated.')
              dispatch(push('/users'))
            })
          }
        }
      })
    }
  }

  checkPassword = (rule, value, callback) => {
    const form = this.props.form
    if (value && value !== form.getFieldValue('password')) {
      callback('Two passwords that you enter is inconsistent!')
    } else {
      callback()
    }
  }

  checkConfirm = (rule, value, callback) => {
    const form = this.props.form
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirm'], { force: true })
    }
    callback()
  }

  handleConfirmBlur = e => {
    const value = e.target.value
    this.setState({ confirmDirty: this.state.confirmDirty || !!value })
  }

  render() {
    const { form, userId } = this.props
    const { userState } = this.state
    return (
      <Form hideRequiredMark onSubmit={this.onSubmit}>
        <div className="row">
          <div className="col-lg-12 offset-lg-0">
            {userId && (
              <FormItem label="Id" colon={false} style={{ display: 'none' }}>
                {form.getFieldDecorator('id', {
                  initialValue: userId,
                  rules: [{ required: true }],
                })(<Input size="default" />)}
              </FormItem>
            )}
            <FormItem label="Name" colon={false}>
              {form.getFieldDecorator('name', {
                initialValue: undefined,
                rules: [{ required: true }],
              })(<Input size="default" />)}
            </FormItem>
            <FormItem label="Phone" colon={false}>
              {form.getFieldDecorator('phone', {
                initialValue: undefined,
                rules: [{ required: false }],
              })(<Input size="default" />)}
            </FormItem>
            <FormItem label="Email" colon={false}>
              {form.getFieldDecorator('email', {
                initialValue: undefined,
                rules: [
                  {
                    type: 'email',
                    message: 'The input is not valid E-mail',
                  },
                  {
                    required: true,
                    message: 'Please input your E-mail',
                  },
                ],
              })(<Input size="default" />)}
            </FormItem>
            <FormItem label="Role" colon={false}>
              {form.getFieldDecorator('role', {
                initialValue: 'user',
              })(
                <Select>
                  <Select.Option key="user">User</Select.Option>
                  <Select.Option key="admin">Administrator</Select.Option>
                  <Select.Option key="dataEntry">Data Entry</Select.Option>
                </Select>,
              )}
            </FormItem>
            <Row gutter={20}>
              <Col span={12}>
                <FormItem label="New Password" colon={false}>
                  {form.getFieldDecorator('password', {
                    initialValue: '',
                    rules: [
                      {
                        required: false,
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
              </Col>
              <Col span={12}>
                <FormItem label="Repeat Password" colon={false}>
                  {form.getFieldDecorator('confirm', {
                    initialValue: '',
                    rules: [
                      {
                        required: false,
                        message: 'Please confirm your password',
                      },
                      {
                        validator: this.checkPassword,
                      },
                    ],
                  })(<Input type="password" size="default" onBlur={this.handleConfirmBlur} />)}
                </FormItem>
              </Col>
            </Row>
          </div>
        </div>
        <div className="form-actions">
          <div className="form-group row">
            <div className="col-xl-12">
              <Button
                type="primary"
                htmlType="submit"
                loading={this.state.submitting}
                disabled={this.state.loading}
              >
                {userId ? 'Save' : 'Add User'}
              </Button>
            </div>
          </div>
        </div>
      </Form>
    )
  }
}

export default UserDataForm
