import React, { Component } from 'react';
import HeroTableItem from './heroTableItem';
import { inject, observer } from 'mobx-react';
import _ from 'lodash';

@inject('homeStore')
@observer
export default class HeroTable extends Component {

  constructor(props) {
    super(props);
    this.homeStore = this.props.homeStore.default;
  }

  render() {

    const generateHexagon = (heroes, type = '') => {
      return _.map(heroes, (hero, index) => (<HeroTableItem type={type} hero={hero} index={index} key={index}/>));
    }

    return(
      <div className="box-wrapper">
        <div className="board-box enemy editor">
          {generateHexagon(this.homeStore.heroTableEnemy, 'enemy')}
        </div>
        <div className="board-box editor">
          {generateHexagon(this.homeStore.heroTable)}
        </div>
      </div>
    )
  }
}