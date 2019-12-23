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

    const generateHexagon = () => {
      return _.map(this.homeStore.heroTable, (hero, index) => (<HeroTableItem hero={hero} index={index} key={index}/>));
    }

    return(
      <div className="box-wrapper">
        {/* <div className="board-box editor">
          {generateHexagon()}
        </div> */}
        <div className="board-box editor">
          {generateHexagon()}
        </div>
      </div>
    )
  }
}