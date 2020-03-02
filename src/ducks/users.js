import * as app from './app'
import authAPI from 'authAPI'
import { message } from 'antd'

export const getUsers = () => (dispatch, getState) => {
  return authAPI
    .get(`/users`)
    .then(response => {
      return Promise.resolve(response.data)
    })
    .catch(error => {
      console.log('error', error)
      // return Promise.reject(error)
    })
}

export const getUser = id => (dispatch, getState) => {
  return authAPI
    .get(`/users/${id}`)
    .then(response => {
      return Promise.resolve(response.data)
    })
    .catch(error => {
      console.log('error', error)
      // return Promise.reject(error)
    })
}

export const deleteUser = id => (dispatch, getState) => {
  return authAPI
    .delete(`/users/${id}`)
    .then(response => {
      return Promise.resolve(response.data)
    })
    .catch(error => {
      console.log('error', error)
      // return Promise.reject(error)
    })
}

export const addUser = values => (dispatch, getState) => {
  return authAPI
    .post(`/users`, values)
    .then(response => {
      return Promise.resolve()
    })
    .catch(error => {
      console.log('error', error)
      // return Promise.reject(error)
    })
}

export const updateUser = values => (dispatch, getState) => {
  return authAPI
    .put(`/users/${values.id}`, values)
    .then(response => {
      return Promise.resolve()
    })
    .catch(error => {
      console.log('error', error)
      // return Promise.reject(error)
    })
}
