import React from 'react'
import { connect } from 'react-redux'
import { updateUser } from 'ducks/users'
import { Form, Input, Button, message, Row, Col, Select } from 'antd'
import AvatarEditor from 'react-avatar-editor'

const FormItem = Form.Item
const Option = Select.Option

const formOptions = {
  onValuesChange: (props, values) => {},
}

const mapStateToProps = (state, props) => ({
  userState: state.app.userState,
})

@connect(mapStateToProps)
@Form.create(formOptions)
class UserProfileForm extends React.Component {
  state = {
    submitting: false,
    confirmDirty: false,
    loading: false,
    avatarPreview: this.props.userState.avatar,
    avatarReady: this.props.userState.avatar,
  }

  onSubmit = event => {
    event.preventDefault()
    const { isSubmitForm, form, dispatch, userState } = this.props
    if (!isSubmitForm) {
      form.validateFields((error, values) => {
        if (!error) {
          const avatar = this.editor.getImageScaledToCanvas().toDataURL()
          values.avatar = avatar

          if (!values.password) {
            delete values.password
            delete values.confirm
          }

          this.setState({
            loading: true,
            avatarReady: avatar,
          })
          dispatch(updateUser(userState.id, values))
          setTimeout(() => {
            this.setState({
              loading: false,
            })
          }, 500)
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

  componentWillReceiveProps(newProps) {
    this.setState({
      avatarPreview: newProps.userState.avatar,
      avatarReady: newProps.userState.avatar,
    })
  }

  handleImageChange = e => {
    e.preventDefault()

    function checkFile(file) {
      if (!/^image\/(x-png|bmp|jpg|jpeg|gif|png)$/i.test(file.type)) {
        message.error('You can only upload Image files.')
        return false
      }

      const smallerThenOneMb = file.size / 1024 / 1024 > 1
      if (smallerThenOneMb) {
        message.error('Image must smaller than 1MB!')
        return false
      }

      return true
    }

    let reader = new FileReader()
    let file = e.target.files[0]

    if (file && checkFile(file)) {
      reader.onloadend = () => {
        this.setState({
          avatarPreview: reader.result,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  setEditorRef = editor => (this.editor = editor)

  render() {
    const { form, userState } = this.props

    return (
      <Form hideRequiredMark onSubmit={this.onSubmit}>
        <div className="row">
          <div className="col-lg-12 offset-lg-0">
            <FormItem label="Name" colon={false}>
              {form.getFieldDecorator('name', {
                initialValue: userState.name,
                rules: [{ required: true }],
              })(<Input size="default" />)}
            </FormItem>
            <FormItem label="Phone" colon={false}>
              {form.getFieldDecorator('phone', {
                initialValue: userState.phone,
                rules: [{ required: false }],
              })(<Input size="default" />)}
            </FormItem>
            <FormItem label="Email" colon={false}>
              {form.getFieldDecorator('email', {
                initialValue: userState.email,
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
            <FormItem label="Avatar" colon={false}>
              <div className="float-left">
                <AvatarEditor
                  image={this.state.avatarPreview}
                  width={50}
                  height={50}
                  border={10}
                  ref={this.setEditorRef}
                  color={[0, 0, 50, 0.1]}
                />
              </div>
              <div style={{ marginLeft: 80 }}>
                <Input type="file" size="default" onChange={e => this.handleImageChange(e)} />
                <div className="mt-2 ml-3 text-muted">
                  Please follow the next rules: file can be only JPG format and smaller then 1Mb.
                </div>
              </div>
            </FormItem>
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
                Save Profile
              </Button>
            </div>
          </div>
        </div>
      </Form>
    )
  }
}

export default UserProfileForm
