import React, { Component } from 'react'
import Container from './components/Container'
import PropTypes from 'prop-types'

export default class ReactInstaStories extends Component {
  componentDidMount() {
    this.props.stories.map(s => {
      let i = new Image()
      if (!(typeof s === 'object' && s.type === 'video')) {
        i.src = typeof s === 'object' ? s.url : s
      }
    })
  }

  render() {
    return (
      <div>
        <Container
          stories={this.props.stories}
          defaultInterval={this.props.defaultInterval}
          width={this.props.width}
          height={this.props.height}
          loader={this.props.loader}
          header={this.props.header}
        />
      </div>
    )
  }
}

ReactInstaStories.propTypes = {
  stories: PropTypes.array,
  defaultInterval: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  loader: PropTypes.element,
  header: PropTypes.element,
}
