import authAPI from 'authAPI'
import { message } from 'antd'
import axios from 'axios'
import { isEmpty } from 'lodash'

export const REDUCER = 'addBrand'

export const getBrands = (
  values = {},
  pager = {
    perPage: 1000,
    page: 1,
  },
) => (dispatch, getState) => {
  let filter = {}

  if (!isEmpty(values.filterName)) {
    filter.or = [
      {
        name: {
          like: values.filterName,
        },
      },
    ]
  }

  const query = JSON.stringify(filter || {})
  const perPage = pager.perPage
  const page = pager.page
  return authAPI
    .get(`/brand-patterns?per-page=${perPage}&page=${page}&filter=${query}&sort=name`)
    .then(response => {
      const brands = typeof response !== 'undefined' ? response.data : []
      const pager = typeof response !== 'undefined' ? response.headers : []
      return Promise.resolve({ brands, pager })
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

export const createBrand = values => (dispatch, getState) => {
  return authAPI
    .post(`/brand-patterns`, values)
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

export const updateBrand = (id, values) => (dispatch, getState) => {
  return authAPI
    .put(`/brand-patterns/${id}`, values)
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

export const deleteBrand = id => (dispatch, getState) => {
  return authAPI
    .delete(`/brand-patterns/${id}`)
    .then(response => {
      return Promise.resolve(response.data)
    })
    .catch(error => {
      console.log('error', error)
    })
}
