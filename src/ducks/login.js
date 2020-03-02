import { createReducer } from 'redux-act'
import * as app from './app'
import axios from 'axios'
import authAPI from 'authAPI'

export const REDUCER = 'login'

export const requestUnlock = ({ username }) => (dispatch, getState) => {
  dispatch(app.addSubmitForm(REDUCER))
  return authAPI
    .post('user/unlock', { username })
    .catch(error => {
      dispatch(app.deleteSubmitForm(REDUCER))
      if (axios.isCancel(error)) {
        // nothing
      } else {
        return Promise.reject(error)
      }
    })
    .then(response => {
      dispatch(app.deleteSubmitForm(REDUCER))
      return Promise.resolve(response ? response.data : {})
    })
}

export const submit = (values) => (dispatch, getState) => {
  dispatch(app.addSubmitForm(REDUCER))
  return dispatch(app.login(values))
    .catch(error => {
      if (axios.isCancel(error)) {
        // nothing
      } else {
        dispatch(app.deleteSubmitForm(REDUCER))
        return Promise.reject(error)
      }
    })
    .then(response => {
      dispatch(app.deleteSubmitForm(REDUCER))
      return Promise.resolve(response)
    })
}

const initialState = {}
export default createReducer({}, initialState)
