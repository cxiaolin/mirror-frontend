import { createReducer } from 'redux-act'
import * as app from './app'
import axios from 'axios'
import authAPI from 'authAPI'
import { message } from 'antd'

export const REDUCER = 'resetPassword'

export const submit = ({ username }: { username: string }) => (
  dispatch: Function,
  getState: Function,
) => {
  dispatch(app.addSubmitForm(REDUCER))
  return authAPI
    .get('/user/forgot', {
      withCredentials: false,
      params: {
        username,
      },
    })
    .then(response => {
      dispatch(app.deleteSubmitForm(REDUCER))
      dispatch(app.setActiveDialog(''))
      if (response) {
        message.success('Password recovery link has been sent to your email.', 10)
        return Promise.resolve(response.data)
      } else {
        return Promise.reject(null)
      }

    })
    .catch(error => {
      if (axios.isCancel(error)) {
      } else {
        message.error('Can not find user by given criteria. Please try again.', 10)
      }
      return Promise.reject(error)
    })
}

const initialState = {}
export default createReducer({}, initialState)