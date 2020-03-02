import React from 'react'
import ReactDOM from 'react-dom'
import { Select, Input, Button, Popconfirm, DatePicker, Form, message, Spin, Icon } from 'antd'
import { getOptions, addPreset, getPresets, deletePreset, loadPreset } from 'ducks/presets'
import { map } from 'lodash'
import { connect } from 'react-redux'
import moment from 'moment-timezone'
import { Tabs } from 'antd/lib/tabs'
import * as app from 'ducks/app'

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

const mapStateToProps = (state, props) => ({
  profilesInPreset: state.app.profilesInPreset,
})

@Form.create(formOptions)
@connect(mapStateToProps)
class Presets extends React.Component {
  state = {
    profiles: [],
    selectedProfiles: [],
    presets: [],
    selectedPreset: undefined,
  }

  componentWillMount() {
    this.getPresets()
    this.checkProfileInPreset(this.props.profilesInPreset)
  }

  checkProfileInPreset(profilesInPreset) {
    let { profiles } = this.state
    profilesInPreset.forEach(selectedProfile => {
      let inProfiles = profiles.find(profile => profile.id === selectedProfile.id)
      if (!inProfiles) {
        profiles.push(selectedProfile)
      }
    })

    this.setState({
      selectedProfiles: map(profilesInPreset, 'id'),
      profiles,
    })
  }

  componentWillReceiveProps(newProps) {
    const { profilesInPreset } = newProps
    this.checkProfileInPreset(profilesInPreset)
  }

  // addAllToPreset = () => {
  //   const { dispatch } = this.props
  //   let { profiles, selectedProfiles } = this.state
  //   profiles.forEach(profile => {
  //     let isSelected = selectedProfiles.find(selectedProfile => selectedProfile === profile.id)
  //     if (!isSelected) {
  //       selectedProfiles.push(profile.id)
  //     }
  //   })
  //   selectedProfiles = [].concat(selectedProfiles)
  //   dispatch(app.setProfilesInPreset(selectedProfiles))
  //
  //   this.setState({
  //     selectedProfiles,
  //   })
  // }

  selectProfile = value => {
    const { dispatch } = this.props
    const { profiles } = this.state

    const selectedProfiles = profiles.filter(profile => {
      let isProfileValue = !!value.find(selectedProfile => selectedProfile === profile.id)
      return isProfileValue
    })

    dispatch(app.setProfilesInPreset(selectedProfiles))
    this.setState({
      selectedProfiles: value,
    })
  }

  resetPreset = () => {
    const { dispatch } = this.props
    dispatch(app.setProfilesInPreset([]))
    ReactDOM.findDOMNode(this.refs.PresetName).value = ''

    this.setState({
      selectedProfiles: [],
    })
  }

  savePreset = () => {
    const { dispatch } = this.props
    const { selectedProfiles } = this.state
    let presetName = ReactDOM.findDOMNode(this.refs.PresetName).value

    const params = {
      name: presetName,
      profiles: selectedProfiles,
    }

    dispatch(addPreset(params))
      .then(() => {
        this.getPresets()
        ReactDOM.findDOMNode(this.refs.PresetName).value = ''
      })
      .catch(() => {})
  }

  getPresets = () => {
    const { dispatch } = this.props
    dispatch(getPresets())
      .then(data => {
        this.setState({
          presets: data,
        })
      })
      .catch(() => {})
  }

  selectPreset = value => {
    this.setState({
      selectedPreset: value,
    })
  }

  getPreset = () => {
    const { dispatch } = this.props
    const { selectedPreset } = this.state
    dispatch(loadPreset(selectedPreset)).then(data => {
      console.log('data', data)
      this.setState({
        profiles: data,
      })
      dispatch(app.setProfilesInPreset(data))
    })
  }

  removePreset = () => {
    const { dispatch } = this.props
    const { selectedPreset } = this.state

    const params = {
      id: selectedPreset,
    }

    dispatch(deletePreset(params))
      .then(() => {
        message.success('Profile successfully deleted.')
        this.getPresets()
        this.setState({
          selectedPreset: undefined,
        })
      })
      .catch()
  }

  render() {
    const { form, loading, filters = [], title = 'Filter' } = this.props
    const { profiles, selectedProfiles, presets, selectedPreset } = this.state
    return (
      <Form hideRequiredMark onSubmit={this.onSubmit}>
        <div>
          {/*<Button icon="plus" onClick={this.addAllToPreset}>*/}
          {/*Add All Profiles to Preset*/}
          {/*</Button>*/}
          {/*<div className="filter__divider" />*/}
          <div className="filter__title">Current Profile Preset</div>
          <div className="filter__item">
            <FormItem label="Selected Profiles" colon={false}>
              <Select
                mode="multiple"
                placeholder="Select Profile"
                value={selectedProfiles}
                style={{ width: '100%' }}
                allowClear={true}
                onChange={this.selectProfile}
              >
                {profiles.map(profile => (
                  <Option key={profile.id}>{`${profile.fullName} (${profile.userName})`}</Option>
                ))}
              </Select>
            </FormItem>
          </div>
          <div className="filter__item">
            <FormItem label="Preset Name" colon={false}>
              <Input
                ref="PresetName"
                placeholder="Enter Preset Name..."
                disabled={selectedProfiles.length === 0}
              />
            </FormItem>
          </div>
          <div className="filter__buttons">
            <Button
              onClick={this.savePreset}
              type="primary"
              className="mr-3"
              icon="plus"
              disabled={selectedProfiles && selectedProfiles.length === 0}
            >
              Save Preset
            </Button>
            <Popconfirm
              placement="bottomLeft"
              title={'Reset current selection?'}
              okText="Yes"
              cancelText="No"
              onConfirm={this.resetPreset}
            >
              <Button
                className="mr-3"
                icon="close"
                disabled={selectedProfiles && selectedProfiles.length === 0}
              >
                Reset
              </Button>
            </Popconfirm>
          </div>
          <div className="filter__divider" />
          <div className="filter__title">Profile Presets</div>
          <div className="filter__item">
            <FormItem label="Preset" colon={false}>
              <Select
                showSearch
                showArrow={true}
                allowClear={true}
                disabled={false}
                style={{ width: '100%' }}
                placeholder="Select Preset..."
                value={selectedPreset}
                onChange={this.selectPreset}
              >
                {presets.map(preset => (
                  <Option key={preset.id}>{preset.name}</Option>
                ))}
              </Select>
            </FormItem>
          </div>
          <div className="filter__buttons">
            <Button
              type="primary"
              className="mr-3"
              icon="export"
              onClick={this.getPreset}
              disabled={!selectedPreset}
            >
              Load Preset
            </Button>
            <Popconfirm
              placement="bottomLeft"
              title={'Remove selected Preset?'}
              okText="Yes"
              cancelText="No"
              onConfirm={this.removePreset}
            >
              <Button className="mr-3" icon="delete" disabled={!selectedPreset}>
                Remove
              </Button>
            </Popconfirm>
          </div>
        </div>
      </Form>
    )
  }
}

export default Presets
