import * as app from './app'
import authAPI from 'authAPI'
import { message } from 'antd'
import axios from 'axios'
import * as moment from 'moment'
import { isEmpty } from 'lodash'

const DATE_FORMAT = 'YYYY-MM-DD'

export const getProfileMetric = (values = {}) => (dispatch, getState) => {
  let filter = {}
  if (values.date && values.date.length) {
    filter.date = {
      gte: moment(values.date[0]).format(DATE_FORMAT),
      lte: moment(values.date[1]).format(DATE_FORMAT),
    }
  }
  if (values.profile && values.profile) {
    filter.profile = values.profile.map(Number)
  }
  let query = '&filter=' + JSON.stringify(filter)
  if (query === '&filter={}') {
    query = ''
  }
  return authAPI
    .get(`/profile-metric/?per-page=1000${query}`)
    .then(response => {
      return Promise.resolve(response ? response.data : undefined)
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

export const forceUpdate = profileId => (dispatch, getState) => {
  return authAPI
    .put(`/profile/populate/?id=${profileId}`)
    .then(response => {
      return Promise.resolve(response.data)
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

export const getProfiles = (
  values = {},
  pager = {
    perPage: 100,
    page: 1,
  },
) => (dispatch, getState) => {
  let filter = {}

  if (!isEmpty(values.search)) {
    filter.or = [
      {
        userName: {
          like: values.search,
        },
      },
      {
        fullName: {
          like: values.search,
        },
      },
    ]
  }

  if (!isEmpty(values.profile)) {
    filter.profile = [values.profile].map(Number)
  }

  if (!isEmpty(values.id)) {
    filter.id = values.id.map ? values.id.map(Number) : parseInt(values.id)
  }

  if (!isEmpty(values.profileId)) {
    filter.id = [values.profileId].map(Number)
  }

  if (!isEmpty(values.country)) {
    filter.countryId = parseInt(values.country, 10)
  }

  if (!isEmpty(values.industries)) {
    filter.industryId = values.industries.map(Number)
  }

  if (!isEmpty(values.categories)) {
    filter.categoryId = values.categories.map(Number)
  }

  if (!isEmpty(values.tags)) {
    filter.tagId = values.tags.map(Number)
  }

  if (!isEmpty(values.brands)) {
    filter.brandId = values.brands.map(Number)
  }

  if (!isEmpty(values.followersFrom || values.followersTo)) {
    filter.followers = {
      gte: parseInt(values.followersFrom, 10) || 0,
      lte: parseInt(values.followersTo, 10) || 999999999,
    }
  }

  if (!isEmpty(values.language)) {
    filter.language = {
      like: values.language,
    }
  }

  if (!isEmpty(values.gender)) {
    filter.gender = values.gender
  }

  const query = JSON.stringify(filter || {})
  const perPage = pager.perPage
  const page = pager.page

  return authAPI
    .get(
      `/profile/?per-page=${perPage}&page=${page}&filter=${query}${
        values.fields ? `&fields=${values.fields}` : ''
      }`,
    )
    .then(response => {
      const data = typeof response !== 'undefined' ? response.data : []
      const pager = typeof response !== 'undefined' ? response.headers : []
      return Promise.resolve({ data, pager })
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

export const getProfilesList = (
  values = {},
  pager = {
    perPage: 100,
    page: 1,
  },
) => (dispatch, getState) => {
  let filter = {}

  if (!isEmpty(values.search)) {
    filter.or = [
      {
        userName: {
          like: values.search,
        },
      },
      {
        fullName: {
          like: values.search,
        },
      },
    ]
  }

  const perPage = pager.perPage
  const page = pager.page
  return authAPI
    .get(`/profile/?per-page=${perPage}&page=${page}&fields=id,userName,firstName,lastName`)
    .then(response => {
      const profiles = typeof response !== 'undefined' ? response.data : []
      return Promise.resolve(profiles)
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

export const addProfile = values => (dispatch, getState) => {
  return authAPI
    .post(`/profiles`, values)
    .then(response => {
      return Promise.resolve(response ? response.data : undefined)
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

export const editProfile = values => (dispatch, getState) => {
  return authAPI
    .put(`/profiles/${values.id}`, values)
    .then(response => {
      return Promise.resolve(response ? response.data : undefined)
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

export const deleteProfile = profileId => (dispatch, getState) => {
  return authAPI
    .delete(`/profiles/${profileId}`)
    .then(response => {})
    .catch(error => {
      if (axios.isCancel(error)) {
        // nothing
      } else {
        message.error(error.message)
      }
      return Promise.reject(error)
    })
}
