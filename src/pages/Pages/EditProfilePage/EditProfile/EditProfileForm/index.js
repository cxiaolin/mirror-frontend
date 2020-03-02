import React from 'react'
import { connect } from 'react-redux'
import { getProfiles, editProfile } from 'ducks/profile'
import { getOptions, getAsyncOptions } from 'ducks/presets'
import { push } from 'react-router-redux'
import { Form, Input, Button, message, Spin, Icon, Select, DatePicker } from 'antd'
import history from 'index'
import moment from 'moment-timezone'
import { debounce } from 'lodash'

const FormItem = Form.Item
const Option = Select.Option
const Textarea = Input.TextArea

const loadingIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />

const formOptions = {
  onValuesChange: (props, values) => {},
}

@Form.create(formOptions)
@connect()
class EditProfileForm extends React.Component {
  constructor(props) {
    super(props)
    this.fetchOptions = debounce(this.fetchOptions, 500)
  }

  state = {
    loading: false,
    optionsLoading: true,
    optionLoading: {
      categories: false,
      industries: false,
      profileTags: false,
    },
    profileLoading: true,
    profileId: '',
    profileData: {},
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
    const url = history.location.pathname.toString()
    const profileId = url.replace(/admin\/profiles\/edit/g, '').replace(/\//g, '')

    dispatch(getOptions()).then(data => {
      options.countries = data.countries
      this.setState({
        options,
        optionsLoading: false,
        profileId,
      })
    })
    this.getProfileData(profileId)
  }

  getProfileData = profileId => {
    const { dispatch, form } = this.props
    const fetchOptions = {
      id: profileId,
    }
    dispatch(getProfiles(fetchOptions)).then(({ data }) => {
      let profileData = data[0]
      profileData = {
        ...profileData,
        birthDate: profileData.birthDate ? moment(profileData.birthDate, 'YYYY-MM-DD') : undefined,
        location: profileData.location ? profileData.location.name : undefined,
      }
      this.setState({
        profileLoading: false,
        profileData,
      })
    })
  }

  onSubmit = event => {
    event.preventDefault()
    const { isSubmitForm, form, dispatch } = this.props
    const { profileId } = this.state
    if (!isSubmitForm) {
      form.validateFields((error, values) => {
        if (!error) {
          values.birthDate = values.birthDate ? moment(values.birthDate).format('YYYY-MM-DD') : ''
          values.id = profileId
          this.setState({
            loading: true,
          })
          dispatch(editProfile(values)).then(data => {
            if (data) {
              message.success('Profile was successfully saved!')
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
    const { form } = this.props
    const { options, optionsLoading, optionLoading, profileLoading, profileData } = this.state
    return (
      <Form hideRequiredMark onSubmit={this.onSubmit}>
        <div className="row">
          <div className="col-lg-12 offset-lg-0">
            <Spin spinning={optionsLoading || profileLoading} indicator={loadingIcon}>
              <FormItem label="Instagram Username" colon={false}>
                {form.getFieldDecorator('userName', {
                  initialValue: profileData.userName || '',
                  rules: [{ required: true }],
                })(<Input size="default" />)}
              </FormItem>
            </Spin>
            <div className="row">
              <div className="col-lg-6">
                <FormItem label="First Name" colon={false}>
                  {form.getFieldDecorator('firstName', {
                    initialValue: profileData.firstName || '',
                    rules: [{ required: false }],
                  })(<Input size="default" />)}
                </FormItem>
              </div>
              <div className="col-lg-6">
                <FormItem label="Last Name" colon={false}>
                  {form.getFieldDecorator('lastName', {
                    initialValue: profileData.lastName || '',
                    rules: [{ required: false }],
                  })(<Input size="default" />)}
                </FormItem>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-6">
                <FormItem label="Gender" colon={false}>
                  {form.getFieldDecorator('gender', {
                    initialValue: profileData.gender || '',
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
                    initialValue: profileData.language || '',
                    rules: [{ required: false }],
                  })(<Input size="default" />)}
                </FormItem>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12">
                <FormItem label="Date of Birth" colon={false}>
                  {form.getFieldDecorator('birthDate', {
                    initialValue: profileData.birthDate || undefined,
                    rules: [{ required: false }],
                  })(<DatePicker style={{ width: '100%' }} />)}
                </FormItem>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-6">
                <FormItem label="Email" colon={false}>
                  {form.getFieldDecorator('email', {
                    initialValue: profileData.email || '',
                    rules: [{ required: false }],
                  })(<Input size="default" />)}
                </FormItem>
              </div>
              <div className="col-lg-6">
                <FormItem label="Mobile" colon={false}>
                  {form.getFieldDecorator('mobile', {
                    initialValue: profileData.mobile || '',
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
                      initialValue: profileData.country || undefined,
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
                          return <Option key={item.name}>{item.name}</Option>
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
                      initialValue: profileData.location || undefined,
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
                          return <Option key={item.name}>{item.name}</Option>
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
                      initialValue: profileData.industries || undefined,
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
                      initialValue: profileData.categories || undefined,
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
              <Spin spinning={optionLoading.profileTags || profileLoading} indicator={loadingIcon}>
                {form.getFieldDecorator('tags', {
                  initialValue: profileData.tags || undefined,
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
                initialValue: profileData.biography || '',
                rules: [{ required: false }],
              })(<Textarea size="default" rows={4} />)}
            </FormItem>
            <FormItem label="Description" colon={false}>
              {form.getFieldDecorator('description', {
                initialValue: profileData.description || '',
                rules: [{ required: false }],
              })(<Textarea size="default" rows={4} />)}
            </FormItem>
            <Spin spinning={optionsLoading || profileLoading} indicator={loadingIcon}>
              <FormItem label="Inner Notes" colon={false}>
                {form.getFieldDecorator('notes', {
                  initialValue: profileData.notes || '',
                  rules: [{ required: false }],
                })(<Textarea size="default" rows={4} />)}
              </FormItem>
            </Spin>
            <div className="row">
              <div className="col-lg-6">
                <FormItem label="Facebook URL" colon={false}>
                  {form.getFieldDecorator('linkFacebook', {
                    initialValue: profileData.linkFacebook || '',
                    rules: [{ required: false }],
                  })(<Input size="default" />)}
                </FormItem>
              </div>
              <div className="col-lg-6">
                <FormItem label="Snapchat URL" colon={false}>
                  {form.getFieldDecorator('linkSnapchat', {
                    initialValue: profileData.linkSnapchat || '',
                    rules: [{ required: false }],
                  })(<Input size="default" />)}
                </FormItem>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-6">
                <FormItem label="Youtube URL" colon={false}>
                  {form.getFieldDecorator('linkYoutube', {
                    initialValue: profileData.linkYoutube || '',
                    rules: [{ required: false }],
                  })(<Input size="default" />)}
                </FormItem>
              </div>
              <div className="col-lg-6">
                <FormItem label="Twitter URL" colon={false}>
                  {form.getFieldDecorator('linkTwitter', {
                    initialValue: profileData.linkTwitter || '',
                    rules: [{ required: false }],
                  })(<Input size="default" />)}
                </FormItem>
              </div>
            </div>
            <FormItem label="Website URL" colon={false}>
              {form.getFieldDecorator('linkWebsite', {
                initialValue: profileData.linkWebsite || '',
                rules: [{ required: false }],
              })(<Input size="default" />)}
            </FormItem>
          </div>
        </div>
        <div className="form-actions">
          <div className="form-group row">
            <div className="col-xl-12">
              <Button type="primary" htmlType="submit" loading={this.state.loading}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </Form>
    )
  }
}

export default EditProfileForm
