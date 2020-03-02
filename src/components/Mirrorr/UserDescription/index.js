import React from 'react'
import { Tabs, Tag } from 'antd'
import { isEmpty } from 'lodash'
import { SocialIcon } from 'react-social-icons'

const TabPane = Tabs.TabPane

class UserDescription extends React.Component {
  render() {
    const { item, isAdmin } = this.props
    return (
      <Tabs animated={false}>
        <TabPane tab="Information" key="1">
          <div className="mb-3">
            {!isEmpty(item.tags)
              ? item.tags.map((item, index) => (
                  <Tag key={index} className="mb-2">
                    #{item}
                  </Tag>
                ))
              : '—'}
          </div>
          <div className="row">
            <div className="col-md-4">
              <div className="lb__description">
                <strong>Gender</strong>
                <br />
                {item.gender || '—'}
              </div>
            </div>
            <div className="col-md-4">
              <div className="lb__description">
                <strong>Language</strong>
                <br />
                {item.language || '—'}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-4">
              <div className="lb__description">
                <strong>Category</strong>
                <br />
                {(item.categories.length && item.categories[0]) || '—'}
              </div>
            </div>
            <div className="col-md-4">
              <div className="lb__description">
                <strong>Industry</strong>
                <br />
                {(item.industries.length && item.industries[0]) || '—'}
              </div>
            </div>
          </div>
          <div className="lb__description">
            <strong>Description</strong>
            <br />
            {item.description || '—'}
          </div>
        </TabPane>
        <TabPane tab="Additional Info" key="2">
          <div className="row">
            <div className="col-md-4">
              <div className="lb__description">
                <strong>Date of Birth</strong>
                <br />
                {item.birthDate || '—'}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-6">
              <div className="lb__description">
                <strong>Country</strong>
                <br />
                {item.country || '—'}
              </div>
            </div>
            <div className="col-6">
              <div className="lb__description">
                <strong>Location</strong>
                <br />
                {item.location ? item.location.name : '—'}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-6">
              <div className="lb__description">
                <strong>Mobile</strong>
                <br />
                {item.mobile || '—'}
              </div>
            </div>
            <div className="col-6">
              <div className="lb__description">
                <strong>Email</strong>
                <br />
                {item.email || '—'}
              </div>
            </div>
          </div>
          <div className="lb__description">
            <strong>Biography</strong>
            <br />
            {item.biography || '—'}
          </div>
          {isAdmin && (
            <div className="lb__description">
              <strong>Internal Notes</strong>
              <br />
              {item.notes || '—'}
            </div>
          )}
        </TabPane>
        <TabPane tab="Social Media Links" key="3">
          <div className="row">
            <div className="col-6">
              <div className="lb__description">
                <strong>Instagram</strong>
                <br />
                <span className="lb__linkIcon">
                  <SocialIcon network="instagram" />
                  {(item.userName && (
                    <span>
                      <a href={`https://www.instagram.com/${item.userName}/`} target="_blank">
                        {item.userName}{' '}
                      </a>
                    </span>
                  )) ||
                    '—'}
                </span>
              </div>
            </div>
            <div className="col-6">
              <div className="lb__description">
                <strong>Website</strong>
                <br />
                <span className="lb__linkIcon">
                  <SocialIcon network="rss" />
                  {(item.linkWebsite && (
                    <a href={item.linkWebsite} target="_blank">
                      {item.linkWebsite}
                    </a>
                  )) ||
                    '—'}
                </span>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-6">
              <div className="lb__description">
                <strong>Facebook</strong>
                <br />
                <span className="lb__linkIcon">
                  <SocialIcon network="facebook" />
                  {(item.linkFacebook && (
                    <a href={`https://www.facebook.com/${item.linkFacebook}/`} target="_blank">
                      {item.linkFacebook}
                    </a>
                  )) ||
                    '—'}
                </span>
              </div>
            </div>
            <div className="col-6">
              <div className="lb__description">
                <strong>Snapchat</strong>
                <br />
                <span className="lb__linkIcon">
                  <SocialIcon network="snapchat" />
                  {(item.linkSnapchat && (
                    <a href={`https://www.snapchat.com/add/${item.linkSnapchat}/`} target="_blank">
                      {item.linkSnapchat}
                    </a>
                  )) ||
                    '—'}
                </span>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-6">
              <div className="lb__description">
                <strong>Twitter</strong>
                <br />
                <span className="lb__linkIcon">
                  <SocialIcon network="twitter" />
                  {(item.linkTwitter && (
                    <a href={`https://www.twitter.com/${item.linkTwitter}/`} target="_blank">
                      {item.linkTwitter}
                    </a>
                  )) ||
                    '—'}
                </span>
              </div>
            </div>
            <div className="col-6">
              <div className="lb__description">
                <strong>Youtube</strong>
                <br />
                <span className="lb__linkIcon">
                  <SocialIcon network="youtube" />
                  {(item.linkYoutube && (
                    <a href={item.linkYoutube} target="_blank">
                      {item.linkYoutube}
                    </a>
                  )) ||
                    '—'}
                </span>
              </div>
            </div>
          </div>
        </TabPane>
      </Tabs>
    )
  }
}

export default UserDescription
