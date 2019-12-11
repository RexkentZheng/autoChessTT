import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { inject, observer } from 'mobx-react';

@inject('homeStore')
@observer
export default class Home extends Component {
  constructor(props) {
    super(props);
    this.homeStore = props.homeStore.default;
  }
  render() {
    return(
      <div>
        <p>{this.homeStore.aloha}</p>
        <p>Here is Home Page</p>
        <Link to='/test'>Jump to Test Page</Link>
      </div>
    )
  }
}