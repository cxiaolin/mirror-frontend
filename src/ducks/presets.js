import authAPI from 'authAPI'
import axios from 'axios'
import { message } from 'antd'
import { isEmpty } from 'lodash'

export const getAsyncOptions = (values = {}) => (dispatch: Function, getState: Function) => {
  let query = ``
  let filter = {}

  if (!isEmpty(values.searchValue)) {
    filter.name = {
      like: values.searchValue,
    }
  }

  filter = JSON.stringify(filter || {})
  switch (values.fieldName) {
    case 'categories':
      query = `/categories?per-page=1000&filter=${filter}`
      break
    case 'industries':
      query = `/industries?per-page=1000&filter=${filter}`
      break
    case 'profileTags':
      query = `/profile/tags?per-page=1000&filter=${filter}`
      break
    case 'postTags':
      query = `/post/tags?per-page=1000&filter=${filter}`
      break
    case 'mentions':
      query = `/post/mentions?per-page=1000&filter=${filter}`
      break
    case 'brands':
      query = `/post/brands?per-page=1000&filter=${filter}`
      break
    default:
      break
  }

  return authAPI
    .get(query)
    .then(responses => {
      const data = responses.data
      return Promise.resolve(data)
    })
    .catch(error => {
      if (axios.isCancel(error)) {
        // nothing
      } else {
        message.error(error.message)
      }
      return Promise.reject(error)
    })
}

export const getOptions = (values = {}) => (dispatch: Function, getState: Function) => {
  return axios
    .all([authAPI.get(`/countries?per-page=1000`)])
    .then(responses => {
      const data =
        typeof responses[0] !== 'undefined'
          ? {
              countries: responses[0] ? responses[0].data : [],
            }
          : {
              countries: [],
            }
      return Promise.resolve(data)
    })
    .catch(error => {
      if (axios.isCancel(error)) {
        // nothing
      } else {
        message.error(error.message)
      }
      return Promise.reject(error)
    })
}

export const addPreset = ({ name, profiles }) => {
  return () => {
    return axios
      .all([
        authAPI.post(`/presets`, {
          name,
          profiles,
        }),
      ])
      .then(responses => {
        if (responses[0] === undefined) return
        message.success(`Preset ${responses[0].data.name} is created!`)
      })
      .catch(error => {
        if (axios.isCancel(error)) {
          // nothing
        } else {
          message.error(error.message)
        }
        return Promise.reject(error)
      })
  }
}

export const getPresets = () => {
  return () => {
    return axios
      .all([authAPI.get(`/presets`)])
      .then(responses => {
        const presets = typeof responses[0] !== 'undefined' ? responses[0].data : []
        return Promise.resolve(presets)
      })
      .catch(error => {
        if (axios.isCancel(error)) {
          // nothing
        } else {
          message.error(error.message)
        }
        return Promise.reject(error)
      })
  }
}

export const loadPreset = id => {
  return () => {
    return axios
      .all([authAPI.get(`/presets/${id}`)])
      .then(responses => {
        const presets = typeof responses[0] !== 'undefined' ? responses[0].data.profiles : []
        return Promise.resolve(presets)
      })
      .catch(error => {
        if (axios.isCancel(error)) {
          // nothing
        } else {
          message.error(error.message)
        }
        return Promise.reject(error)
      })
  }
}

export const deletePreset = ({ id }) => {
  return () => {
    return axios
      .all([authAPI.delete(`/presets/${id}`)])
      .then(responses => {
        return Promise.resolve()
      })
      .catch(error => {
        if (axios.isCancel(error)) {
          // nothing
        } else {
          message.error(error.message)
        }
        return Promise.reject(error)
      })
  }
}
