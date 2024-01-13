import React, { Component } from 'react'
import { createPortal } from 'react-dom'

export class Iframe extends Component {
  constructor(props) {
    super(props)
    this.state = {
      mountNode: null
    }
    this.setContentRef = (contentRef) => {
      this.setState({
        mountNode: contentRef?.contentWindow?.document?.body
      })
    }
  }

  render() {
    const { children, ...props } = this.props
    const { mountNode } = this.state
    return (
      <iframe
        {...props}
        ref={this.setContentRef}
      >
        {mountNode && createPortal(children, mountNode)}
      </iframe>
    )
  }
}
export default Iframe;