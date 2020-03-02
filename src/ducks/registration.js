import { createReducer } from 'redux-act'
import * as app from './app'
import axios from 'axios'
import { message } from 'antd'
import authAPI from 'authAPI'

export const REDUCER = 'registration'

export const submit = ({ name, email, password }) => (dispatch, getState) => {
  dispatch(app.addSubmitForm(REDUCER))
  return authAPI
    .post('user/create', {
      login: "u"+(Math.random() * 1e10 |0),
      name,
      email,
      password,
    })
    .then(() => {

      console.log(password, email)

      dispatch(app.login({ username: email, password })).then(() => {
        dispatch(app.deleteSubmitForm(REDUCER))
      })
    })
    .catch(error => {
      if (axios.isCancel(error)) {
        // nothing
      } else {
        dispatch(app.deleteSubmitForm(REDUCER))
        if (error.response.data) {
          if (error.response.data[0]) {
            message.error(error.response.data[0].message)
          }
        }
      }
    })
}

const initialState = {}
export default createReducer({}, initialState)
