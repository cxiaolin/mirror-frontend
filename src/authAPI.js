import axios from 'axios'
import { notification } from 'antd'

const authAPI = axios.create({
  baseURL: 'https://mirrorr.com/api',
  withCredentials: true,
})

authAPI.interceptors.request.use(request => {
  const accessToken = window.localStorage.getItem('app.accessToken')
  if (accessToken && !request.headers['Authorization']) {
    request.headers['Authorization'] = `Bearer ${accessToken}`
  }
  return request
})

authAPI.interceptors.response.use(response => {
  if (response.headers['x-xsrf-token']) {
    document.cookie = 'XSRF-TOKEN=' + response.headers['x-xsrf-token'] + '; path=/'
  }
  return response
})

authAPI.interceptors.response.use(undefined, error => {
  // Validation error
  const { response } = error
  if (error && response && response.status === 422 && response.data) {
    const messageDescription = (response.data || [])[0].message
    if (messageDescription) {
      notification['error']({
        message: 'Validation error',
        description: messageDescription,
      })
    }
  }
})

export default authAPI
