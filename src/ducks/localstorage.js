export const setItem = (k, v) => {
  if (!k) {
    throw new Error('key cant be null')
  }

  window.localStorage.setItem(k, JSON.stringify(v))
}

export const getItem = k => {
  if (!k) {
    throw new Error('key cant be null')
  }

  let value = window.localStorage.getItem(k)
  return value ? JSON.parse(value) : null
}

export const clearKey = k => {
  setItem(k, null)
}
