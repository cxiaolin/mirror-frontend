import authAPI from 'authAPI'
import axios from 'axios'
import { message } from 'antd'
import * as moment from 'moment'
import { isEmpty } from 'lodash'

const POSTS_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss'
const DATE_FORMAT = 'YYYY-MM-DD'

let cancelToken = ''

export const getPosts = (
  values = {},
  pager = {
    perPage: 9,
    page: 1,
  },
) => (dispatch, getState) => {
  let filter = {}
  let brands = ''

  if (!isEmpty(values.date)) {
    filter.createdAt = {
      gte: moment(values.date[0]).format(POSTS_DATE_FORMAT),
      lte: moment(values.date[1]).format(POSTS_DATE_FORMAT),
    }
  }
  if (values.profileId) {
    filter.profileId = values.profileId
  }
  if (!isEmpty(values.id)) {
    filter.profile = [values.id].map(Number)
  }
  if (!isEmpty(values.country)) {
    filter.countryId = parseInt(values.country, 10)
  }
  if (!isEmpty(values.location)) {
    filter.location = {
      like: values.location,
    }
  }
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
  if (!isEmpty(values.industries)) {
    filter.industryId = values.industries.map(Number)
  }
  if (!isEmpty(values.categories)) {
    filter.categoryId = values.categories.map(Number)
  }
  if (!isEmpty(values.tags)) {
    filter.tagId = values.tags.map(Number)
  }

  if (!isEmpty(values.mentions)) {
    filter.mentionId = values.mentions.map(Number)
  }

  if (!isEmpty(values.brandsType) && !isEmpty(values.brands)) {
    filter.brandSource = values.brandsType
  }

  if (!isEmpty(values.brands)) {
    brands = values.brands.toString()
  }

  if (values.locationId) {
    filter.locationId = values.locationId
  }

  const query = JSON.stringify(filter || {})
  const perPage = pager.perPage
  const page = pager.page

  // cancel previous query call
  if (cancelToken !== '') {
    cancelToken.cancel('Operation canceled due to new request.')
  }
  cancelToken = axios.CancelToken.source()

  let url = []

  if (values.profileAge) {
    url.push(`profileAge=${JSON.stringify(values.profileAge)}`)
  }

  if (values.profileFollowers) {
    url.push(`profileFollowers=${JSON.stringify(values.profileFollowers)}`)
  }

  if (values.profileGender) {
    url.push(`profileGender=${values.profileGender}`)
  }

  return authAPI
    .get(
      `/post/?per-page=${perPage}&page=${page}&sort=-createdAt&expand=profile,location&fields=author,type,text,comments,likes,createdAt,media,profile.userName,profile.avatar,profile.id,profile.fullName,tags,mentions,location,mediaBrands,textBrands,tagBrands,mentionBrands,brands,link&filter=${query}${
        brands ? `&brands=${brands}` : ''
      }${url.length ? `&${url.join('&')}` : ''}`,
      {
        cancelToken: cancelToken.token,
      },
    )
    .then(response => {
      return Promise.resolve(response ? response.data : undefined)
    })
    .catch(error => {
      if (axios.isCancel(error)) {
        console.log('Request canceled', error.message)
      } else {
        message.error(error.message)
      }
      return Promise.reject(error)
    })
}

export const getPostMetric = (values = {}) => (dispatch, getState) => {
  let filter = {}
  if (values.date && values.date.length) {
    filter.createdAt = {
      gte: moment(values.date[0]).format(POSTS_DATE_FORMAT),
      lte: moment(values.date[1]).format(POSTS_DATE_FORMAT),
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
    .get(`/post-metric/?per-page=1000${query}`)
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

export const getTopData = (values = {}) => (dispatch, getState) => {
  let filter = {}

  if (!isEmpty(values.date)) {
    filter.date = {
      gte: moment(values.date[0]).format(DATE_FORMAT),
      lte: moment(values.date[1]).format(DATE_FORMAT),
    }
  }

  if (!isEmpty(values.id)) {
    filter.profile = [values.id].map(Number)
  }

  if (!isEmpty(values.profile)) {
    filter.profile = values.profile.map(Number)
  }

  const query = JSON.stringify(filter || {})

  return authAPI
    .get(`/top/?per-page=10&filter=${query}`)
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
