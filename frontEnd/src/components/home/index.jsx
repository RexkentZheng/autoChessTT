import './../../styles/index.less';
import './raceAndJob.less';

import { inject, observer }     from 'mobx-react';
import React, { Component }     from 'react'

import HeroList                 from './heroList';
import HeroRelations            from './heroRelations';
import HeroTable                from './heroTable';
import HeroTableBattle          from './heroTableBattle';
import HeroWaitting             from './heroWaitting';

@inject('homeStore')
@observer
export default class Home extends Component {
  constructor(props) {
    super(props);
    this.homeStore = this.props.homeStore.default;
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
        <HeroWaitting />
        <HeroList />
      </div>
    )
  }
}