import React, { Component }     from 'react'
import HeroList                 from './heroList';
import HeroTable                from './heroTable';
import HeroWaitting             from './heroWaitting';
import HeroRelations            from './heroRelations';
import HeroTableBattle          from './heroTableBattle';
import { inject, observer }     from 'mobx-react';

import './index.less';
import './raceAndJob.less';

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
        {
          this.homeStore.status === 'battling' ?
          <HeroTableBattle />   :
          <HeroTable />
        }
        {/* <HeroTable />
        <HeroTableBattle /> */}
        <HeroWaitting />
        <HeroList />
      </div>
    )
  }
}