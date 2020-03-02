import authAPI from 'authAPI'
import axios from 'axios'
import { message } from 'antd'
import * as moment from 'moment'
const DATE_FORMAT = 'YYYY-MM-DD'

export const filterValues = {
  profileFollowers: {
    lt: 5 * 10000000,
    gt: 1 * 1000,
  },
  profileAge: {
    lt: 150,
    gt: 0,
  },
  profileGender: 'any',
}

export const baseCall = (url, values) => () => {
  let filter = {
    date: {
      gte: moment(values.date[0]).format(DATE_FORMAT),
      lte: moment(values.date[1]).format(DATE_FORMAT),
    },
    brands: values.brands || [],
    profileAge: {
      lt: parseInt(values.profileAge ? values.profileAge.lt : filterValues.profileAge.lt),
      gt: parseInt(values.profileAge ? values.profileAge.gt : filterValues.profileAge.gt),
    },
    profileFollowers: {
      lt: parseInt(
        values.profileFollowers ? values.profileFollowers.lt : filterValues.profileFollowers.lt,
      ),
      gt: parseInt(
        values.profileFollowers ? values.profileFollowers.gt : filterValues.profileFollowers.gt,
      ),
    },
    profileGender: values.profileGender || filterValues.profileGender,
    profiles: values.profile ? values.profile.map(p => parseInt(p.key)) : [],
  }

  const query = JSON.stringify(filter)

  return authAPI
    .get(`${url}/?filter=${query}`)
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

export const getBrandInfluencers = (values = {}) => {
  return baseCall('/report/influencer-value-table', values)
}

export const getBrandInfluencersTableDetail = (values = {}) => {
  return baseCall('/report/influencer-value-table-detail', values)
}

export const getBrandsValueByDate = (values = {}) => {
  return baseCall('/report/brands-value-by-date', values)
}

export const getBrandInfluencerCut = (values = {}) => {
  return baseCall('/report/brands-influencer-cut', values)
}

export const getBrandsBySource = (values = {}) => {
  return baseCall('/report/brands-by-source', values)
}

export const getInfluencerBrandsTable = (values = {}) => {
  return baseCall('/report/brands-by-influencer-table', values)
}

export const getInfluencerBrandsPie = (values = {}) => {
  return baseCall('/report/brands-by-influencer-pie', values)
}

export const getBrandDemographics = (values = {}) => {
  return baseCall('/report/brand-demographics', values)
}

export const getBrandLocations = (values = {}) => {
  return baseCall('/report/brand-locations', values)
}

export const getInfluencerLocations = (values = {}) => {
  return baseCall('/report/influencer-locations', values)
}

export const getInfluencerMentions = (values = {}) => {
  return baseCall('/report/influencer-mentions', values)
}
