import React, { Component } from 'react';
import HeroTableItem from './heroTableItem';
import { inject, observer } from 'mobx-react';
import _ from 'lodash';

@inject('battleStore')
@observer
export default class HeroTableBattle extends Component {

  constructor(props) {
    super(props);
    this.battleStore = this.props.battleStore.default;
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
        <p style={{float: 'left'}}>Battle Filed</p>
        <div className="board-box enemy editor">
          {generateHexagon(_.slice(this.battleStore.allHeroes, 0, 28), _.range(1, 29, 1), 'enemy')}
        </div>
        <div className="board-box editor">
          {generateHexagon(_.slice(this.battleStore.allHeroes, 28, 56), _.range(29, 57, 1))}
        </div>
      </div>
    )
  }
}