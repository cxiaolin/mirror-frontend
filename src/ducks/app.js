import { createAction, createReducer } from 'redux-act'
import { push } from 'react-router-redux'
import { pendingTask, begin, end } from 'react-redux-spinner'
import authAPI from 'authAPI'
import { clearKey } from 'ducks/localstorage'
import { notification, message } from 'antd'

const REDUCER = 'app'
const NS = `@@${REDUCER}/`

const _setFrom = createAction(`${NS}SET_FROM`)
const _setLoading = createAction(`${NS}SET_LOADING`)
const _setHideLogin = createAction(`${NS}SET_HIDE_LOGIN`)

export const setUserState = createAction(`${NS}SET_USER_STATE`)
export const setUpdatingContent = createAction(`${NS}SET_UPDATING_CONTENT`)
export const setActiveDialog = createAction(`${NS}SET_ACTIVE_DIALOG`)
export const deleteDialogForm = createAction(`${NS}DELETE_DIALOG_FORM`)
export const addSubmitForm = createAction(`${NS}ADD_SUBMIT_FORM`)
export const deleteSubmitForm = createAction(`${NS}DELETE_SUBMIT_FORM`)
export const setLayoutState = createAction(`${NS}SET_LAYOUT_STATE`)
export const setCommonLogin = createAction(`${NS}SET_COMMON_LOGIN`)
export const setProfilesInPreset = createAction(`${NS}SET_PROFILES_IN_PRESET`)

export const setLoading = isLoading => {
  const action = _setLoading(isLoading)
  action[pendingTask] = isLoading ? begin : end
  return action
}

export const resetHideLogin = () => (dispatch, getState) => {
  const state = getState()
  if (state.pendingTasks === 0 && state.app.isHideLogin) {
    dispatch(_setHideLogin(false))
  }
  return Promise.resolve()
}

export const initAuth = roles => (dispatch, getState, error) => {
  const token = window.localStorage.getItem('app.accessToken')
  const state = getState()
  const reject = () => {
    const location = state.routing.location
    const from = location.pathname + location.search
    dispatch(_setFrom(from))
    dispatch(push('/login'))
    return Promise.reject()
  }
  const setUser = (userState, userRole) => {
    dispatch(
      setUserState({
        userState: {
          ...userState,
        },
      }),
    )
    if (!roles.find(role => role === userRole)) {
      if (userRole === 'dataEntry') {
        dispatch(push('/admin/profiles'))
      } else {
        dispatch(push('/leaderboard'))
      }
      return Promise.resolve(false)
    }
    return Promise.resolve(true)
  }

  return authAPI
    .get('/user/me?expand=customer')
    .catch(response => {
      reject()
    })
    .then(function(response) {
      if (!token || !response) {
        return reject()
      }

      const { data } = response
      const userState = {
        name: data.name,
        phone: data.phone,
        avatar: data.avatar || null,
        email: data.email,
        role: data.role,
        id: data.id,
      }
      return setUser(userState, data.role)
    })
}

export const login = ({ username, password }) => (dispatch, getState) => {
  return authAPI
    .post('user/login', null, {
      headers: {
        Authorization: 'Basic ' + window.btoa([username, password].join(':')),
      },
      validateStatus: function(status) {
        return status >= 0
      },
    })
    .then(function(response) {
      if (!response) return Promise.reject({ message: 'Invalid username or password' })
      const { data } = response || { data: {} }
      const userRole = data.role || ''
      const { status } = data || { message: 'Invalid username or password' }
      const isInvalid = status >= 400 && status <= 600
      if (isInvalid) {
        return Promise.reject(data)
      }

      window.localStorage['app.accessToken'] = data.accessToken
      dispatch(_setHideLogin(true))
      dispatch(setCommonLogin())
      const state = getState()
      if (state.app.from) {
        dispatch(push(state.app.from))
        dispatch(_setFrom(''))
      } else {
        if (userRole === 'dataEntry') {
          dispatch(push('/admin/profiles'))
        } else {
          dispatch(push('/leaderboard'))
        }
      }
    })
}

export const logout = () => (dispatch, getState) => {
  dispatch(
    setUserState({
      userState: {
        name: '',
        phone: '',
        avatar: '',
        email: '',
        role: '',
        id: '',
      },
    }),
  )
  window.localStorage.setItem('app.accessToken', '')
  clearKey('filterDates')
  dispatch(push('/login'))
}

const initialState = {
  // APP STATE
  from: '',
  isUpdatingContent: false,
  isLoading: false,
  activeDialog: '',
  dialogForms: {},
  submitForms: {},
  isHideLogin: false,
  commonLogin: '',
  profilesInPreset: [],

  // USER STATE
  userState: {
    name: '',
    phone: '',
    avatar: '',
    email: '',
    role: '',
    id: '',
  },
}

export default createReducer(
  {
    [_setFrom]: (state, from) => ({ ...state, from }),
    [_setLoading]: (state, isLoading) => ({ ...state, isLoading }),
    [_setHideLogin]: (state, isHideLogin) => ({ ...state, isHideLogin }),
    [setUpdatingContent]: (state, isUpdatingContent) => ({ ...state, isUpdatingContent }),
    [setUserState]: (state, { userState }) => {
      return { ...state, userState: { ...state.userState, ...userState } }
    },
    [setCommonLogin]: (state, commonLogin) => ({ ...state, commonLogin }),
    [setActiveDialog]: (state, activeDialog) => {
      const result = { ...state, activeDialog }
      if (activeDialog !== '') {
        const id = activeDialog
        result.dialogForms = { ...state.dialogForms, [id]: true }
      }
      return result
    },
    [deleteDialogForm]: (state, id) => {
      const dialogForms = { ...state.dialogForms }
      delete dialogForms[id]
      return { ...state, dialogForms }
    },
    [addSubmitForm]: (state, id) => {
      const submitForms = { ...state.submitForms, [id]: true }
      return { ...state, submitForms }
    },
    [deleteSubmitForm]: (state, id) => {
      const submitForms = { ...state.submitForms }
      delete submitForms[id]
      return { ...state, submitForms }
    },
    [setProfilesInPreset]: (state, profilesInPreset) => {
      return { ...state, profilesInPreset }
    },
  },
  initialState,
)
