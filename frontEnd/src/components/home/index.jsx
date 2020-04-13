import './../../styles/index.less';
import './raceAndJob.less';

import { inject, observer }     from 'mobx-react';
import React, { Component }     from 'react'

import LinesMain               from './../lines/index';
import HeroList                 from './heroList';
import HeroRelations            from './heroRelations';
import HeroTable                from './heroTable';
import HeroTableBattle          from './heroTableBattle';
import HeroWaitting             from './heroWaitting';

@inject('homeStore', 'battleStore')
@observer
export default class Home extends Component {
  constructor(props) {
    super(props);
    this.homeStore = this.props.homeStore.default;
    this.battleStore = this.props.battleStore.default;
  }
  render() {
    return(
      <div className="hero-main">
        <HeroRelations />
        <div className="hero-table-wrapper">
          {
            this.homeStore.status === 'battling' ?
            <HeroTableBattle />   :
            <HeroTable />
          }
        </div>
        <LinesMain data={this.battleStore.damageHeroes} skill={this.battleStore.skillItems} />
        <HeroWaitting />
        <HeroList />
      </div>
    )
  }
}