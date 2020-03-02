import React from 'react'
import { Select, Input, Checkbox, DatePicker, Form, Spin, Icon, Row, Col, Button } from 'antd'
import { getOptions, getAsyncOptions } from 'ducks/presets'
import { getProfilesList, getProfiles } from 'ducks/profile'
import { getBrandsAsync } from 'ducks/brands'
import { connect } from 'react-redux'
import moment from 'moment-timezone'
import { debounce, mergeWith } from 'lodash'

const FormItem = Form.Item
const Option = Select.Option
const CheckboxGroup = Checkbox.Group

const DEFAULT_DATE_RANGE = [
  moment()
    .startOf('day')
    .subtract(1, 'month'),
  moment().endOf('day'),
]
const loadingIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />

const formOptions = {}

@Form.create(formOptions)
@connect()
class MainFilter extends React.Component {
  constructor(props) {
    super(props)
    this.fetchOptions = debounce(this.fetchOptions, 500)
    this.fetchProfilesSearch = debounce(this.fetchProfilesSearch, 500)
  }

  state = {
    optionsLoading: false,
    optionLoading: {
      categories: false,
      industries: false,
      profileTags: false,
      postTags: false,
      brands: false,
      countries: false,
      mentions: false,
    },
    options: {
      categories: [],
      countries: [],
      industries: [],
      profileTags: [],
      postTags: [],
      mentions: [],
      brands: [],
      followersFrom: undefined,
      followersTo: undefined,
    },
    profilesLoading: false,
    profiles: [],
    brandsTypes: ['media', 'text', 'tag', 'mention'],
    brandsIndeterminate: false,
    brandsCheckAll: true,
    selectedProfiles:
      this.props.searchValues && this.props.searchValues.profile
        ? this.props.searchValues.profile
        : [],
  }

  componentDidMount() {
    const { dispatch } = this.props
    let { options } = this.state
    this.setState({
      optionsLoading: true,
    })
    dispatch(getOptions()).then(data => {
      options = mergeWith(options, data)
      this.setState({
        options,
        optionsLoading: false,
      })
    })
    this.onSubmit()
  }

  onSubmit = () => {
    const { isSubmitForm, form } = this.props

    if (!isSubmitForm) {
      form.validateFields((error, values) => {
        if (!error) {
          if (values.date) {
            if (values.date.length === 0) {
              form.setFieldsValue({
                date: DEFAULT_DATE_RANGE,
              })
              values.date = DEFAULT_DATE_RANGE
            }
          }
          this.props.onSearch(values)
        }
      })
    }
  }

  fetchOptions = (fieldName, searchValue) => {
    const { dispatch, form } = this.props
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
      brandsType: form.getFieldValue('brandsType'),
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

  fetchProfilesSearch = searchValue => {
    const value = searchValue.trim()
    if (value.length === 0) {
      return null
    }
    const { dispatch } = this.props
    this.setState({
      profilesLoading: true,
    })
    const fetchOption = {
      search: value,
      fields: 'id,userName,firstName,lastName',
    }
    dispatch(getProfiles(fetchOption)).then(({ data }) => {
      this.setState({
        profiles: data || [],
        profilesLoading: false,
      })
    })
  }

  brandsTypeHandle = value => {
    const { brandsTypes } = this.state
    const { form } = this.props
    form.setFieldsValue({
      brandsType: value,
    })

    this.setState({
      brandsIndeterminate: !!value.length && value.length < brandsTypes.length,
      brandsCheckAll: value.length === brandsTypes.length,
    })
    const brandValue = form.getFieldsValue(['brands'])
    if (brandValue.brands.length > 0) {
      this.onSubmit()
    }
  }

  onAllBrandsChange = () => {
    const { form } = this.props
    const { brandsTypes, brandsCheckAll } = this.state
    form.setFieldsValue({
      brandsType: !brandsCheckAll ? brandsTypes : [],
    })
    this.setState({
      brandsIndeterminate: false,
      brandsCheckAll: !brandsCheckAll,
    })
  }

  selectProfiles = value => {
    const { form } = this.props
    form.setFieldsValue({
      profile: value,
      preset: undefined,
    })
    this.setState({
      selectedProfiles: value,
    })
    this.onSubmit()
  }

  render() {
    const {
      form,
      loading,
      filters = [],
      title = 'Filter',
      selectedProfile = undefined,
      searchValues,
    } = this.props

    const {
      options,
      optionsLoading,
      profiles,
      profilesLoading,
      optionLoading,
      brandsType,
      brandsIndeterminate,
      brandsCheckAll,
      selectedProfiles,
    } = this.state

    const cutomDropdown = () => {
      const brandsFilter = (
        <Option key="brandsFilter" disabled className="custom-select-checkboxes">
          <div style={{ borderBottom: '1px solid #d2d9e5' }} className="mb-2">
            <Row>
              <Col span={24} className="mb-1">
                <Checkbox
                  checked={brandsCheckAll}
                  indeterminate={brandsIndeterminate}
                  onChange={this.onAllBrandsChange}
                >
                  All
                </Checkbox>
              </Col>
            </Row>
          </div>
          {form.getFieldDecorator('brandsType', {
            initialValue: ['media', 'text', 'tag', 'mention'],
          })(
            <CheckboxGroup style={{ width: '100%' }} onChange={this.brandsTypeHandle}>
              <Row>
                <Col span={12}>
                  <Checkbox value="media">Media</Checkbox>
                </Col>
                <Col span={12}>
                  <Checkbox value="text">Text</Checkbox>
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  <Checkbox value="tag">Tag</Checkbox>
                </Col>
                <Col span={12}>
                  <Checkbox value="mention">Mention</Checkbox>
                </Col>
              </Row>
            </CheckboxGroup>,
          )}
        </Option>
      )

      const dropdown = options.brands
        ? options.brands.map(item => <Option key={item.name}>{item.name}</Option>)
        : []
      return [brandsFilter, dropdown]
    }

    return (
      <Form hideRequiredMark>
        <div>
          <div className="filter__title">{title}</div>
          {filters.includes('profileId') && (
            <div className="filter__item">
              <FormItem label="Profile ID" colon={false}>
                <Spin spinning={optionsLoading} indicator={loadingIcon}>
                  {form.getFieldDecorator('profileId', {
                    initialValue: [],
                  })(
                    <Input
                      placeholder="Profile ID"
                      onChange={() => {
                        setTimeout(() => {
                          this.onSubmit()
                        })
                      }}
                    />,
                  )}
                </Spin>
              </FormItem>
            </div>
          )}
          {filters.includes('dates') && (
            <div className="filter__item">
              <FormItem label="Dates" colon={false}>
                <Spin spinning={optionsLoading} indicator={loadingIcon}>
                  {form.getFieldDecorator('date', {
                    initialValue: searchValues ? searchValues.date : DEFAULT_DATE_RANGE,
                  })(
                    <DatePicker.RangePicker
                      onChange={() => {
                        setTimeout(() => {
                          this.onSubmit()
                        })
                      }}
                    />,
                  )}
                </Spin>
              </FormItem>
            </div>
          )}
          {filters.includes('search') && (
            <div className="filter__item">
              <FormItem label="Profile Search" colon={false}>
                <Spin spinning={optionsLoading} indicator={loadingIcon}>
                  {form.getFieldDecorator('search', {
                    initialValue: searchValues ? searchValues.search : [],
                  })(
                    <Input
                      placeholder="Search phrase..."
                      onChange={() => {
                        setTimeout(() => {
                          this.onSubmit()
                        })
                      }}
                    />,
                  )}
                </Spin>
              </FormItem>
            </div>
          )}
          {filters.includes('search-profiles') && (
            <div className="filter__item">
              <div className="mb-1 font-size-14">Selected Profiles</div>
              {form.getFieldDecorator('profile', {
                initialValue: [],
              })(
                <Spin spinning={profilesLoading} indicator={loadingIcon}>
                  <Select
                    mode="multiple"
                    placeholder="Please Set Profiles"
                    style={{ width: '100%' }}
                    allowClear={true}
                    onChange={this.selectProfiles}
                    labelInValue={true}
                    notFoundContent={profiles === null ? 'Not Found' : null}
                    onSearch={value => this.fetchProfilesSearch(value)}
                    value={selectedProfiles}
                    filterOption={(input, option) =>
                      option.props.children.toLowerCase().indexOf(input.toLowerCase().trim()) >= 0
                    }
                  >
                    {profiles &&
                      profiles.map(profile => (
                        <Option key={profile.id}>{`${profile.lastName} ${profile.firstName} (${
                          profile.userName
                        })`}</Option>
                      ))}
                  </Select>
                </Spin>,
              )}
            </div>
          )}
          {filters.includes('profiles') && (
            <div className="filter__item">
              <FormItem label="Profile" colon={false}>
                <Spin spinning={profilesLoading || optionsLoading} indicator={loadingIcon}>
                  {form.getFieldDecorator('id', {
                    initialValue: undefined,
                  })(
                    <Select
                      allowClear
                      showSearch
                      showArrow={false}
                      style={{ width: '100%' }}
                      placeholder="Select Profile..."
                      optionFilterProp="children"
                      onChange={() => {
                        setTimeout(() => {
                          this.onSubmit()
                        })
                      }}
                      notFoundContent={profiles === null ? 'Not Found' : null}
                      onSearch={value => this.fetchProfilesSearch(value)}
                      filterOption={(input, option) =>
                        option.props.children.toLowerCase().indexOf(input.toLowerCase().trim()) >= 0
                      }
                    >
                      {profiles &&
                        profiles.map(profile => {
                          return (
                            <Select.Option key={profile.id}>
                              {`${profile.lastName} ${profile.firstName} (${profile.userName})`}
                            </Select.Option>
                          )
                        })}
                    </Select>,
                  )}
                </Spin>
              </FormItem>
            </div>
          )}

          {filters.includes('brands') && (
            <div className="filter__item">
              <FormItem label="Brands" colon={false}>
                <Spin spinning={optionLoading.brands || optionsLoading} indicator={loadingIcon}>
                  {form.getFieldDecorator('brands', {
                    initialValue: searchValues && searchValues.brands ? searchValues.brands : [],
                  })(
                    <Select
                      dropdownClassName="select-custom-dropdown"
                      allowClear
                      mode="multiple"
                      placeholder="Select brands..."
                      optionFilterProp="children"
                      onChange={() => {
                        setTimeout(() => {
                          this.onSubmit()
                        })
                      }}
                      notFoundContent={options.brands === null ? 'Not Found' : null}
                      onSearch={value => this.fetchOptions('brands', value)}
                      filterOption={(input, option) => {
                        if (option.key !== 'brandsFilter') {
                          return (
                            option.props.children
                              .toLowerCase()
                              .indexOf(input.toLowerCase().trim()) >= 0
                          )
                        } else {
                          return option.props.children
                        }
                      }}
                    >
                      {cutomDropdown()}
                    </Select>,
                  )}
                </Spin>
              </FormItem>
            </div>
          )}
          {filters.includes('location') && (
            <div className="filter__item">
              <FormItem label="Post Location / City" colon={false}>
                <Spin spinning={optionsLoading} indicator={loadingIcon}>
                  {form.getFieldDecorator('location', {
                    initialValue: searchValues ? searchValues.locations : undefined,
                  })(
                    <Input
                      placeholder="Search location/city..."
                      onChange={() => {
                        setTimeout(() => {
                          this.onSubmit()
                        })
                      }}
                    />,
                  )}
                </Spin>
              </FormItem>
            </div>
          )}
          {filters.includes('country') && (
            <div className="filter__item">
              <FormItem label="Profile Country" colon={false}>
                <Spin spinning={optionsLoading} indicator={loadingIcon}>
                  {form.getFieldDecorator('country', {
                    initialValue: undefined,
                  })(
                    <Select
                      showSearch
                      showArrow={false}
                      allowClear
                      placeholder="Select country..."
                      optionFilterProp="children"
                      onChange={() => {
                        setTimeout(() => {
                          this.onSubmit()
                        })
                      }}
                      filterOption={(input, option) =>
                        option.props.children.toLowerCase().indexOf(input.toLowerCase().trim()) >= 0
                      }
                    >
                      {options.countries.map(item => {
                        return <Option key={item.id}>{item.name}</Option>
                      })}
                    </Select>,
                  )}
                </Spin>
              </FormItem>
            </div>
          )}
          {filters.includes('industries') && (
            <div className="filter__item">
              <FormItem label="Industries" colon={false}>
                <Spin spinning={optionLoading.industries || optionsLoading} indicator={loadingIcon}>
                  {form.getFieldDecorator('industries', {
                    initialValue: [],
                  })(
                    <Select
                      allowClear
                      mode="multiple"
                      placeholder="Select industries..."
                      optionFilterProp="children"
                      onChange={() => {
                        setTimeout(() => {
                          this.onSubmit()
                        })
                      }}
                      notFoundContent={options.industries === null ? 'Not Found' : null}
                      onSearch={value => this.fetchOptions('industries', value)}
                      filterOption={(input, option) =>
                        option.props.children.toLowerCase().indexOf(input.toLowerCase().trim()) >= 0
                      }
                    >
                      {options.industries &&
                        options.industries.map(item => {
                          return <Option key={item.id}>{item.name}</Option>
                        })}
                    </Select>,
                  )}
                </Spin>
              </FormItem>
            </div>
          )}
          {filters.includes('categories') && (
            <div className="filter__item">
              <FormItem label="Categories" colon={false}>
                <Spin spinning={optionLoading.categories || optionsLoading} indicator={loadingIcon}>
                  {form.getFieldDecorator('categories', {
                    initialValue: [],
                  })(
                    <Select
                      allowClear
                      mode="multiple"
                      placeholder="Select categories..."
                      optionFilterProp="children"
                      onChange={() => {
                        setTimeout(() => {
                          this.onSubmit()
                        })
                      }}
                      notFoundContent={options.categories === null ? 'Not Found' : null}
                      onSearch={value => this.fetchOptions('categories', value)}
                      filterOption={(input, option) =>
                        option.props.children.toLowerCase().indexOf(input.toLowerCase().trim()) >= 0
                      }
                    >
                      {options.categories &&
                        options.categories.map(item => {
                          return <Option key={item.id}>{item.name}</Option>
                        })}
                    </Select>,
                  )}
                </Spin>
              </FormItem>
            </div>
          )}
          {filters.includes('profileTags') && (
            <div className="filter__item">
              <FormItem label="Profile Tags" colon={false}>
                <Spin
                  spinning={optionLoading.profileTags || optionsLoading}
                  indicator={loadingIcon}
                >
                  {form.getFieldDecorator('tags', {
                    initialValue: [],
                  })(
                    <Select
                      allowClear
                      mode="multiple"
                      placeholder="Select tags..."
                      optionFilterProp="children"
                      onChange={() => {
                        setTimeout(() => {
                          this.onSubmit()
                        })
                      }}
                      notFoundContent={options.profileTags === null ? 'Not Found' : null}
                      onSearch={value => this.fetchOptions('profileTags', value)}
                      filterOption={(input, option) =>
                        option.props.children.toLowerCase().indexOf(input.toLowerCase().trim()) >= 0
                      }
                    >
                      {options.profileTags &&
                        options.profileTags.map(item => {
                          return <Option key={item.id}>{item.name}</Option>
                        })}
                    </Select>,
                  )}
                </Spin>
              </FormItem>
            </div>
          )}
          {filters.includes('postTags') && (
            <div className="filter__item">
              <FormItem label="Post Tags" colon={false}>
                <Spin spinning={optionLoading.postTags || optionsLoading} indicator={loadingIcon}>
                  {form.getFieldDecorator('tags', {
                    initialValue: searchValues ? searchValues.tags : [],
                  })(
                    <Select
                      allowClear
                      mode="multiple"
                      placeholder="Select tags..."
                      optionFilterProp="children"
                      onChange={() => {
                        setTimeout(() => {
                          this.onSubmit()
                        })
                      }}
                      notFoundContent={options.postTags === null ? 'Not Found' : null}
                      onSearch={value => this.fetchOptions('postTags', value)}
                      labelInValue={searchValues ? true : false}
                      filterOption={(input, option) =>
                        option.props.children.toLowerCase().indexOf(input.toLowerCase().trim()) >= 0
                      }
                    >
                      {options.postTags &&
                        options.postTags.map(item => {
                          return <Option key={item.id}>{item.name}</Option>
                        })}
                    </Select>,
                  )}
                </Spin>
              </FormItem>
            </div>
          )}
          {filters.includes('mentions') && (
            <div className="filter__item">
              <FormItem label="Post Mentions" colon={false}>
                <Spin spinning={optionLoading.mentions || optionsLoading} indicator={loadingIcon}>
                  {form.getFieldDecorator('mentions', {
                    initialValue: searchValues ? searchValues.mentions : [],
                  })(
                    <Select
                      allowClear
                      mode="multiple"
                      placeholder="Select mentions..."
                      optionFilterProp="children"
                      onChange={() => {
                        setTimeout(() => {
                          this.onSubmit()
                        })
                      }}
                      notFoundContent={options.mentions === null ? 'Not Found' : null}
                      onSearch={value => this.fetchOptions('mentions', value)}
                      labelInValue={searchValues ? true : false}
                      filterOption={(input, option) =>
                        option.props.children.toLowerCase().indexOf(input.toLowerCase().trim()) >= 0
                      }
                    >
                      {options.mentions &&
                        options.mentions.map(item => {
                          return <Option key={item.id}>{item.name}</Option>
                        })}
                    </Select>,
                  )}
                </Spin>
              </FormItem>
            </div>
          )}
          {filters.includes('language') && (
            <div className="filter__item">
              <FormItem label="Language" colon={false}>
                <Spin spinning={optionsLoading} indicator={loadingIcon}>
                  {form.getFieldDecorator('language', {
                    initialValue: [],
                  })(
                    <Input
                      placeholder="Language..."
                      onChange={() => {
                        setTimeout(() => {
                          this.onSubmit()
                        })
                      }}
                    />,
                  )}
                </Spin>
              </FormItem>
            </div>
          )}
          {filters.includes('gender') && (
            <div className="filter__item">
              <FormItem label="Gender" colon={false}>
                <Spin spinning={optionsLoading} indicator={loadingIcon}>
                  {form.getFieldDecorator('gender', {
                    initialValue: [],
                  })(
                    <Select
                      allowClear
                      placeholder="Select gender..."
                      onChange={() => {
                        setTimeout(() => {
                          this.onSubmit()
                        })
                      }}
                    >
                      <Select.Option key="male">Male</Select.Option>
                      <Select.Option key="female">Female</Select.Option>
                      <Select.Option key="other">Other</Select.Option>
                    </Select>,
                  )}
                </Spin>
              </FormItem>
            </div>
          )}
          {filters.includes('followers') && (
            <div>
              <div className="mb-2">Followers</div>
              <div className="row">
                <div className="col-lg-6">
                  <div className="filter__item">
                    <FormItem colon={false}>
                      <Spin spinning={optionsLoading} indicator={loadingIcon}>
                        {form.getFieldDecorator('followersFrom', {
                          initialValue: [],
                        })(
                          <Input
                            placeholder="From..."
                            onChange={() => {
                              setTimeout(() => {
                                this.onSubmit()
                              })
                            }}
                          />,
                        )}
                      </Spin>
                    </FormItem>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="filter__item">
                    <FormItem colon={false}>
                      <Spin spinning={optionsLoading} indicator={loadingIcon}>
                        {form.getFieldDecorator('followersTo', {
                          initialValue: [],
                        })(
                          <Input
                            placeholder="To..."
                            onChange={() => {
                              setTimeout(() => {
                                this.onSubmit()
                              })
                            }}
                          />,
                        )}
                      </Spin>
                    </FormItem>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Form>
    )
  }
}

export default MainFilter
