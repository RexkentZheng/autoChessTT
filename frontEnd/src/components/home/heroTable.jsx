import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';

import HeroTableItem from './heroTableItem';

@inject('homeStore')
@observer
export default class HeroTable extends Component {

  constructor(props) {
    super(props);
    this.homeStore = this.props.homeStore.default;
  }

  render() {

    const generateHexagon = (heroes, range, type = '') => {
      return _.map(heroes, (hero, index) => (
        <HeroTableItem
          rangeIndex={range[index]}
          type={type}
          hero={hero}
          index={index}
          key={index}
        />));
    }

    return(
      <div className="box-wrapper">
        <div className="board-box enemy editor">
          {generateHexagon(this.homeStore.heroTableEnemy, _.range(1, 29, 1), 'enemy')}
        </div>
        <div className="board-box editor">
          {generateHexagon(this.homeStore.heroTable, _.range(29, 57, 1))}
        </div>
      </div>
    )
  }
}