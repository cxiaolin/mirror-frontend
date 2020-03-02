import React from 'react'
import { Link } from 'react-router-dom'
import { Button, Tag, Avatar, Icon, Collapse } from 'antd'
import TimeAgo from 'react-timeago'
import { isEmpty } from 'lodash'

class PostCard extends React.Component {
  render() {
    const { post } = this.props

    return (
      <div>
        <div className="md__item__info">
          <div className="md__item__info__item">
            <div className="md__item__info__descr">
              <div className="md__sentiment">
                <div style={{ width: '66%' }} />
              </div>
            </div>
          </div>
          <a href={post.link} target="_blank" className="md__item__info__link">
            <Button type="primary" icon="link" />
          </a>
          <div className="md__item__info__item">
            <strong className="md__item__info__name">
              <Link to={`/data/${post.profile && post.profile.id}`}>
                {post.profile && post.profile.fullName}
              </Link>
            </strong>
            <a
              href={`https://www.instagram.com/${post.profile.userName}`}
              target="_blank"
              className="utils__link--blue utils__link--underlined mr-3"
            >
              @{post.profile.userName}
            </a>
          </div>
          <div className="md__item__info__item">
            <div className="row">
              <div className="col-6">
                <div className="md__item__info__item">
                  <div className="md__item__info__title">LIKES</div>
                  <div className="md__item__info__descr">
                    <Icon type="like" theme="outlined" /> {post.likes}
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div className="md__item__info__item">
                  <div className="md__item__info__title">COMMENTS</div>
                  <div className="md__item__info__descr">
                    <Icon type="message" theme="outlined" /> {post.comments}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="md__item__info__item">
            <div className="md__item__info__title">TIME</div>
            <div className="md__item__info__descr">{post.createdAt}</div>
          </div>
          {!isEmpty(post.location) && (
            <div className="md__item__info__item">
              <div className="md__item__info__title">LOCATION</div>
              <div className="md__item__info__descr">
                <i className="icmn-location mr-2" />
                {post.location.name}
              </div>
            </div>
          )}
          <Collapse bordered={false} style={{ marginLeft: '-18px', marginRight: '-18px' }}>
            <Collapse.Panel header={`Description`} key="1">
              {post.text || 'No Description'}
            </Collapse.Panel>
            <Collapse.Panel header={`Tags (${post.tags.length})`} key="2">
              {!isEmpty(post.tags)
                ? post.tags.map((item, index) => (
                    <Tag className="mb-2" key={index}>
                      #{item}
                    </Tag>
                  ))
                : 'No Tags'}
            </Collapse.Panel>
            <Collapse.Panel header={`Mentions (${post.mentions.length})`} key="3">
              {!isEmpty(post.mentions)
                ? post.mentions.map((item, index) => (
                    <Tag className="mb-2" key={index}>
                      @{item}
                    </Tag>
                  ))
                : 'No Mentions'}
            </Collapse.Panel>
            <Collapse.Panel header={`Brands (${post.brands.length})`} key="4">
              {!isEmpty(post.brands)
                ? post.brands.map((item, index) => (
                    <Tag className="mb-2" key={index}>
                      {item}
                    </Tag>
                  ))
                : 'No Brands'}
            </Collapse.Panel>
          </Collapse>
        </div>
        <div
          className="md__photo"
          style={{ backgroundImage: `url(${post.media[0] && post.media[0].image})` }}
        >
          {post.media.some(item => {
            return post.isVideo
          }) && <div className="md__video" />}
          <div className="md__sentiment">
            <div style={{ width: '66%' }} />
          </div>
        </div>
        <div className="md__descr">
          <div className="md__avatar">
            <Avatar size={74} src={post.profile && post.profile.avatar} />
          </div>
          <div className="md__info">
            <div className="md__name">
              <Link
                to={`/data/${post.profile && post.profile.id}`}
                className="utils__link--blue utils__link--underlined mr-3"
              >
                @{post.profile.userName}
              </Link>
            </div>
            <div className="mb-2">
              <strong className="font-size-18">
                <Link to={`/data/${post.profile && post.profile.id}`}>
                  {post.profile && post.profile.fullName}
                </Link>
              </strong>
            </div>
            <div>
              <span className="md__date">
                <TimeAgo date={post.createdAt} />
              </span>
              <span className="mr-3">
                <Icon type="like" theme="outlined" /> {post.likes}
              </span>
              <span className="mr-3">
                <Icon type="message" theme="outlined" /> {post.comments}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default PostCard
