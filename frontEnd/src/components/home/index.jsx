import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { inject, observer } from 'mobx-react';
import { Spin } from 'antd';

@inject('homeStore', 'globalStore')
@observer
export default class Home extends Component {
  constructor(props) {
    super(props);
    this.homeStore = props.homeStore.default;
    this.globalStore = props.globalStore.default;
  }
  state = {
    res: null
  };
  componentDidMount() {
    this.homeStore.getHomeRes();
  }
  render() {
    return(
      <Spin spinning={this.globalStore.isLoading('HomeStore/getHomeRes')}>
        <p>{this.homeStore.res ? this.homeStore.res.a : ''}</p>
        <p>{this.homeStore.aloha}</p>
        <p>Here is Home Page</p>
        <Link to='/test'>Jump to Test Page</Link>
      </Spin>
    )
  }
}