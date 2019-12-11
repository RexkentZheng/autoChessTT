import React from 'react'
import { Link } from 'react-router-dom'

export default class Test extends React.Component {
  render() {
    return(
      <div>
        <p>Here is Test Page</p>
        <Link to='/'>Jump to Home Page</Link>
      </div>
    )
  }
}