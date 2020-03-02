import React from 'react'
import { connect } from 'react-redux'
import { setCommonLogin } from 'ducks/app'
import { REDUCER, submit } from 'ducks/resetPassword'
import Dialog from 'components/LayoutComponents/Dialog'
import { Form, Input, Button } from 'antd'

const FormItem = Form.Item

const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
}

const mapStateToProps = (state, props) => ({
  isSubmitForm: state.app.submitForms[REDUCER],
  commonLogin: state.app.commonLogin,
})

const formOptions = {
  onValuesChange: (props, values) => {
    if (values.hasOwnProperty('login')) {
      props.dispatch(setCommonLogin(values['login']))
    }
  },
}

@connect(mapStateToProps)
@Form.create(formOptions)
class ResetPasswordDialog extends React.Component {
  props: {}

  static defaultProps = {}

  state = {
    loading: false,
  }

  // $FlowFixMe
  onSubmit = event => {
    event.preventDefault()
    // $FlowFixMe
    const { isSubmitForm, form, dispatch } = this.props
    if (!isSubmitForm) {
      form.validateFields((error, values) => {
        if (!error) {
          this.setState({
            loading: true,
          })
          dispatch(submit(values))
            .then(response => {
              this.setState({
                loading: false,
              })
            })
            .catch(() => {
              this.setState({
                loading: false,
              })
            })
        }
      })
    }
  }

  dialogForm = () => {
    // $FlowFixMe
    const { form, commonLogin } = this.props
    return (
      <Form hideRequiredMark onSubmit={this.onSubmit}>
        <div className="modal-body">
          <div className="mt-1">
            <div className="mb-5 text-center">
              <h4 className="text-black" style={{lineHeight: 1.7}}>
                Please enter your account Email.
                <br />
                Recovery link will be sent to you shortly.
              </h4>
            </div>
            <div className="row">
              <div className="col-lg-8 offset-lg-2">
                <FormItem {...formItemLayout} label="Email" colon={false}>
                  {form.getFieldDecorator('username', {
                    initialValue: commonLogin,
                    rules: [
                      {
                        required: true,
                        message: 'Please enter your Username',
                      },
                    ],
                  })(<Input size="default" />)}
                </FormItem>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <Button type="primary" htmlType="submit" loading={this.state.loading}>
            Send Recovery Link
          </Button>
        </div>
      </Form>
    )
  }
  render() {
    // передаю form для исполнения рендеринга
    // $FlowFixMe
    const { form } = this.props
    const dialogForm = this.dialogForm
    return <Dialog id={REDUCER} title="Reset Your Password" {...{ form, dialogForm }} />
  }
}

export default ResetPasswordDialog
