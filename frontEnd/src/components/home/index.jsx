import React, { Component } from 'react'
import HeroList from './heroList';
import './index.less';
import './raceAndJob.less';

export default class Home extends Component {
  componentDidMount() {
  }
  render() {
    return(
      <div>
        <HeroList />
      </div>
    )
  }
}