import authAPI from 'authAPI'
import moment from 'moment-timezone'
import { isEmpty } from 'lodash'
import axios from 'axios'
import { message } from 'antd'

const STORIES_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss'
const DATE_FORMAT = 'YYYY-MM-DD'
let cancelToken = ''

export const getStories = (
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
      gte: moment(values.date[0]).format(STORIES_DATE_FORMAT),
      lte: moment(values.date[1]).format(STORIES_DATE_FORMAT),
    }
  }
  if (!isEmpty(values.id)) {
    filter.profile = [values.id].map(Number)
  }
  if (values.profileId) {
    filter.profile = [values.profileId].map(Number)
  }
  if (!isEmpty(values.country)) {
    filter.countryId = parseInt(values.country, 10)
  }

  if (!isEmpty(values.industries)) {
    filter.industryId = values.industries.map(Number)
  }
  if (!isEmpty(values.categories)) {
    filter.categoryId = values.categories.map(Number)
  }
  if (!isEmpty(values.brandsType) && !isEmpty(values.brands)) {
    filter.brandSource = values.brandsType
  }
  if (!isEmpty(values.brands)) {
    brands = values.brands.toString()
  }
  if (!isEmpty(values.tags)) {
    filter.tagId = values.tags.map(Number)
  }

  if (!isEmpty(values.mentions)) {
    filter.mentionId = values.mentions.map(Number)
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
      `/story/?per-page=${perPage}&page=${page}&sort=-createdAt&expand=profile&fields=expiringAt,id,images,videos,createdAt,media,profile.id,profile.userName,profile.fullName,profile.avatar&filter=${query}${
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

export const transformIntoStory = data => {
  let allStories = []
  if (!data || !data.length) return []

  data.map(item => {
    let stories = []

    if (item.media) {
      item.media.map(media => {
        let story = {
          url: media.isVideo ? media.video : media.image,
          expired: item.expiringAt ? moment(item.expiringAt) < moment().toDate() : false,
          header: {
            link: '',
            heading: item.profile.userName,
            subheading: moment(item.createdAt).fromNow(),
            profileImage: item.profile.avatar,
          },
          type: media.isVideo ? 'video' : null,
        }

        stories.push(story)
      })
      allStories.push(stories)
    }
  })
  return allStories
}
