import React from 'react'
import { connect } from 'react-redux'
import { addProfile } from 'ducks/profile'
import { getOptions, getAsyncOptions } from 'ducks/presets'
import { push } from 'react-router-redux'
import { Form, Input, Button, message, Spin, Icon, Select, DatePicker } from 'antd'
import moment from 'moment-timezone'

const FormItem = Form.Item
const Option = Select.Option
const Textarea = Input.TextArea

const loadingIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />

const formOptions = {
  onValuesChange: (props, values) => {},
}

@Form.create(formOptions)
@connect()
class AddProfileForm extends React.Component {
  state = {
    loading: false,
    optionLoading: {
      categories: false,
      industries: false,
      profileTags: false,
    },
    optionsLoading: true,
    options: {
      countries: [],
      categories: [],
      industries: [],
      profileTags: [],
    },
  }

  componentWillMount() {
    const { dispatch } = this.props
    let { options } = this.state

    dispatch(getOptions()).then(data => {
      options.countries = data.countries
      this.setState({
        options,
        optionsLoading: false,
      })
    })
  }

  onSubmit = event => {
    event.preventDefault()
    const { isSubmitForm, form, dispatch, userState } = this.props
    if (!isSubmitForm) {
      form.validateFields((error, values) => {
        if (!error) {
          values.birthDate = values.birthDate ? moment(values.birthDate).format('YYYY-MM-DD') : ''
          this.setState({
            loading: true,
          })
          dispatch(addProfile(values)).then(data => {
            if (data) {
              message.success('Profile was successfully added!')
              dispatch(push('/admin/profiles'))
            }
            this.setState({
              loading: false,
            })
          })
        }
      })
    }
  }

  fetchOptions = (fieldName, searchValue) => {
    const { dispatch } = this.props
    const value = searchValue.trim()
    if (value.length === 0) {
      return null
    }
    let { options, optionLoading } = this.state
    optionLoading[fieldName] = true
    this.setState({
      optionLoading,
    })
    const fetchValues = {
      fieldName,
      searchValue: value,
    }
    dispatch(getAsyncOptions(fetchValues)).then(data => {
      if (data.length === 0) {
        options[fieldName] = null
      } else {
        options[fieldName] = data
      }
      optionLoading[fieldName] = false
      this.setState({
        optionLoading,
        options,
      })
    })
  }

  render() {
    const { form, userState } = this.props
    const { options, optionsLoading, optionLoading } = this.state
    return (
      <Form hideRequiredMark onSubmit={this.onSubmit}>
        <div className="row">
          <div className="d-none">
            <FormItem label="SocialTypeId" colon={false}>
              {form.getFieldDecorator('socialTypeId', {
                initialValue: 1,
                rules: [{ required: true }],
              })(<Input size="default" />)}
            </FormItem>
          </div>
          <div className="col-lg-12 offset-lg-0">
            <FormItem label="Instagram Username" colon={false}>
              {form.getFieldDecorator('userName', {
                initialValue: '',
                rules: [{ required: true }],
              })(<Input size="default" />)}
            </FormItem>
            <div className="row">
              <div className="col-lg-6">
                <FormItem label="First Name" colon={false}>
                  {form.getFieldDecorator('firstName', {
                    initialValue: '',
                    rules: [{ required: false }],
                  })(<Input size="default" />)}
                </FormItem>
              </div>
              <div className="col-lg-6">
                <FormItem label="Last Name" colon={false}>
                  {form.getFieldDecorator('lastName', {
                    initialValue: '',
                    rules: [{ required: false }],
                  })(<Input size="default" />)}
                </FormItem>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12">
                <FormItem label="Date of Birth" colon={false}>
                  {form.getFieldDecorator('birthDate', {
                    initialValue: undefined,
                    rules: [{ required: false }],
                  })(<DatePicker style={{ width: '100%' }} />)}
                </FormItem>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-6">
                <FormItem label="Gender" colon={false}>
                  {form.getFieldDecorator('gender', {
                    initialValue: '',
                    rules: [{ required: false }],
                  })(
                    <Select placeholder="Select a gender">
                      <Option key="Male">Male</Option>
                      <Option key="Female">Female</Option>
                      <Option key="Other">Other</Option>
                    </Select>,
                  )}
                </FormItem>
              </div>
              <div className="col-lg-6">
                <FormItem label="Language" colon={false}>
                  {form.getFieldDecorator('language', {
                    initialValue: '',
                    rules: [{ required: false }],
                  })(<Input size="default" />)}
                </FormItem>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-6">
                <FormItem label="Email" colon={false}>
                  {form.getFieldDecorator('email', {
                    initialValue: '',
                    rules: [{ required: false }],
                  })(<Input size="default" />)}
                </FormItem>
              </div>
              <div className="col-lg-6">
                <FormItem label="Mobile" colon={false}>
                  {form.getFieldDecorator('mobile', {
                    initialValue: '',
                    rules: [{ required: false }],
                  })(<Input size="default" />)}
                </FormItem>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-6">
                <Spin spinning={optionsLoading} indicator={loadingIcon}>
                  <FormItem label="Country" colon={false}>
                    {form.getFieldDecorator('country', {
                      initialValue: undefined,
                      rules: [{ required: false }],
                    })(
                      <Select
                        allowClear
                        showSearch
                        placeholder="Select a country"
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {options.countries.map(item => {
                          return <Option key={item.id}>{item.name}</Option>
                        })}
                      </Select>,
                    )}
                  </FormItem>
                </Spin>
              </div>
              <div className="col-lg-6">
                <Spin spinning={optionsLoading} indicator={loadingIcon}>
                  <FormItem label="Location" colon={false}>
                    {form.getFieldDecorator('location', {
                      initialValue: undefined,
                      rules: [{ required: false }],
                    })(
                      <Select
                        allowClear
                        showSearch
                        placeholder="Select a location"
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {options.countries.map(item => {
                          return <Option key={item.id}>{item.name}</Option>
                        })}
                      </Select>,
                    )}
                  </FormItem>
                </Spin>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-6">
                <FormItem label="Industries" colon={false}>
                  <Spin spinning={optionLoading.industries} indicator={loadingIcon}>
                    {form.getFieldDecorator('industries', {
                      initialValue: undefined,
                      rules: [{ required: false }],
                    })(
                      <Select
                        allowClear
                        mode="tags"
                        placeholder="Select or add industries"
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        notFoundContent={options.industries === null ? 'Not Found' : null}
                        onSearch={value => this.fetchOptions('industries', value)}
                      >
                        {options.industries &&
                          options.industries.map(item => {
                            return <Option key={item.name}>{item.name}</Option>
                          })}
                      </Select>,
                    )}
                  </Spin>
                </FormItem>
              </div>
              <div className="col-lg-6">
                <FormItem label="Categories" colon={false}>
                  <Spin spinning={optionLoading.categories} indicator={loadingIcon}>
                    {form.getFieldDecorator('categories', {
                      initialValue: undefined,
                      rules: [{ required: false }],
                    })(
                      <Select
                        allowClear
                        mode="tags"
                        placeholder="Select or add categories"
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option.props.children.toLowerCase().indexOf(input.toLowerCase().trim()) >=
                          0
                        }
                        notFoundContent={options.categories === null ? 'Not Found' : null}
                        onSearch={value => this.fetchOptions('categories', value)}
                      >
                        {options.categories &&
                          options.categories.map(item => {
                            return <Option key={item.name}>{item.name}</Option>
                          })}
                      </Select>,
                    )}
                  </Spin>
                </FormItem>
              </div>
            </div>
            <FormItem label="Tags" colon={false}>
              <Spin spinning={optionLoading.profileTags} indicator={loadingIcon}>
                {form.getFieldDecorator('tags', {
                  initialValue: undefined,
                  rules: [{ required: false }],
                })(
                  <Select
                    allowClear
                    mode="tags"
                    placeholder="Select or add tags"
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.props.children.toLowerCase().indexOf(input.toLowerCase().trim()) >= 0
                    }
                    notFoundContent={options.profileTags === null ? 'Not Found' : null}
                    onSearch={value => this.fetchOptions('profileTags', value)}
                  >
                    {options.profileTags &&
                      options.profileTags.map(item => {
                        return <Option key={item.name}>{item.name}</Option>
                      })}
                  </Select>,
                )}
              </Spin>
            </FormItem>
            <FormItem label="Biography" colon={false}>
              {form.getFieldDecorator('biography', {
                initialValue: '',
                rules: [{ required: false }],
              })(<Textarea size="default" rows={4} />)}
            </FormItem>
            <FormItem label="Description" colon={false}>
              {form.getFieldDecorator('description', {
                initialValue: '',
                rules: [{ required: false }],
              })(<Textarea size="default" rows={4} />)}
            </FormItem>
            <FormItem label="Inner Notes" colon={false}>
              {form.getFieldDecorator('notes', {
                initialValue: '',
                rules: [{ required: false }],
              })(<Textarea size="default" rows={4} />)}
            </FormItem>
            <div className="row">
              <div className="col-lg-6">
                <FormItem label="Facebook URL" colon={false}>
                  {form.getFieldDecorator('linkFacebook', {
                    initialValue: '',
                    rules: [{ required: false }],
                  })(<Input size="default" />)}
                </FormItem>
              </div>
              <div className="col-lg-6">
                <FormItem label="Snapchat URL" colon={false}>
                  {form.getFieldDecorator('linkSnapchat', {
                    initialValue: '',
                    rules: [{ required: false }],
                  })(<Input size="default" />)}
                </FormItem>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-6">
                <FormItem label="Youtube URL" colon={false}>
                  {form.getFieldDecorator('linkYoutube', {
                    initialValue: '',
                    rules: [{ required: false }],
                  })(<Input size="default" />)}
                </FormItem>
              </div>
              <div className="col-lg-6">
                <FormItem label="Twitter URL" colon={false}>
                  {form.getFieldDecorator('linkTwitter', {
                    initialValue: '',
                    rules: [{ required: false }],
                  })(<Input size="default" />)}
                </FormItem>
              </div>
            </div>
            <FormItem label="Website URL" colon={false}>
              {form.getFieldDecorator('linkWebsite', {
                initialValue: '',
                rules: [{ required: false }],
              })(<Input size="default" />)}
            </FormItem>
          </div>
        </div>
        <div className="form-actions">
          <div className="form-group row">
            <div className="col-xl-12">
              <Button type="primary" htmlType="submit" loading={this.state.loading}>
                Add Profile
              </Button>
            </div>
          </div>
        </div>
      </Form>
    )
  }
}

export default AddProfileForm
