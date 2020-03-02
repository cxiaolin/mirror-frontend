import React from 'react'
import { Select, Input, Button, Popconfirm, DatePicker, Form, message, Spin, Icon } from 'antd'
import { getPresets, loadPreset } from 'ducks/presets'
import { getProfiles } from 'ducks/profile'
import { connect } from 'react-redux'
import moment from 'moment-timezone'
import { debounce } from 'lodash'

const FormItem = Form.Item
const Option = Select.Option
const Textarea = Input.TextArea

const DEFAULT_DATE_RANGE = [
  moment()
    .startOf('day')
    .subtract(1, 'month'),
  moment().endOf('day'),
]
const loadingIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />

const formOptions = {
  onValuesChange: (props, values) => {},
}

@Form.create(formOptions)
@connect()
class InsightsFilter extends React.Component {
  constructor(props) {
    super(props)
    this.fetchProfilesSearch = debounce(this.fetchProfilesSearch, 500)
  }

  state = {
    loading: true,
    presetsLoading: true,
    profilesLoading: false,
    presets: [],
    profiles: [],
    presetProfiles: [],
    selectedProfiles: [],
  }

  componentDidMount() {
    const { dispatch } = this.props
    dispatch(getPresets()).then(data => {
      this.setState({
        loading: false,
        presetsLoading: false,
        presets: data,
      })
    })
  }

  selectPreset = value => {
    const { dispatch, form } = this.props
    this.setState({
      loading: true,
    })
    dispatch(loadPreset(value)).then(data => {
      const selectedProfiles = data.map(item => {
        const profile = {
          key: item.id,
          label: `${item.lastName} ${item.firstName} (${item.userName})`,
        }
        return profile
      })
      this.setState({
        loading: false,
        presetProfiles: data,
        selectedProfiles,
      })
      form.setFieldsValue({
        profile: selectedProfiles,
      })
      this.onSubmit()
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

  onSubmit = () => {
    const { isSubmitForm, form, dispatch } = this.props
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
          if (values.profile.length > 0) {
            values.profile = values.profile.map(profile => profile.key)
          }
          this.props.onSearch(values)
        }
      })
    }
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

  render() {
    const { form, dataLoading, initialDates } = this.props
    const {
      loading,
      presets,
      presetsLoading,
      profiles,
      profilesLoading,
      selectedProfiles,
    } = this.state
    return (
      <Form hideRequiredMark>
        <div>
          <div className="filter__title">Search</div>
          <div className="filter__item">
            <Spin spinning={presetsLoading || loading || dataLoading} indicator={loadingIcon}>
              <FormItem label="Dates" colon={false}>
                {form.getFieldDecorator('date', {
                  initialValue: initialDates ? initialDates : DEFAULT_DATE_RANGE,
                })(
                  <DatePicker.RangePicker
                    onChange={() => {
                      setTimeout(() => {
                        this.onSubmit()
                      })
                    }}
                  />,
                )}
              </FormItem>
            </Spin>
          </div>
          <div className="filter__divider" />
          <div className="filter__title">Current Profile Preset</div>
          <div className="filter__item">
            <div className="mb-1 font-size-14">Selected Profiles</div>
            {form.getFieldDecorator('profile', {
              initialValue: undefined,
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
          <div className="filter__divider" />
          <div className="filter__title">Profile Presets</div>
          <div className="filter__item">
            <Spin spinning={presetsLoading || loading || dataLoading} indicator={loadingIcon}>
              <FormItem label="Preset" colon={false}>
                {form.getFieldDecorator('preset', {
                  initialValue: undefined,
                })(
                  <Select
                    showSearch
                    showArrow={true}
                    allowClear={true}
                    disabled={false}
                    style={{ width: '100%' }}
                    placeholder="Select Preset..."
                    onChange={value => {
                      setTimeout(() => {
                        this.selectPreset(value)
                      })
                    }}
                  >
                    {presets.map(preset => (
                      <Option key={preset.id}>{preset.name}</Option>
                    ))}
                  </Select>,
                )}
              </FormItem>
            </Spin>
          </div>
          {/*
          <div className="filter__buttons">
            <Button
              type="primary"
              className="mr-3"
              icon="search"
              loading={loading}
              htmlType="submit"
            >
              Load Data
            </Button>
          </div>
          */}
        </div>
      </Form>
    )
  }
}

export default InsightsFilter
