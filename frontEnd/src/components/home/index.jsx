import React, { Component } from 'react'
import HeroList from './heroList';
import HeroTable from './heroTable';
import HeroWaitting from './heroWaitting';
import HeroRelations from './heroRelations';
import './index.less';
import './raceAndJob.less';

export default class Home extends Component {
  componentDidMount() {
  }
  render() {
    return(
      <div className="hero-main">
        <HeroRelations />
        <HeroTable />
        <HeroWaitting />
        <HeroList />
      </div>
    )
  }
}