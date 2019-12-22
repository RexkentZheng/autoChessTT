import React, { Component } from 'react';
import HeroTableItem from './heroTableItem';

export default class HeroTable extends Component {

  render() {

    const generateHexagon = () => {
      let all = [];
      for (let index = 0; index < 28; index++) {
        all.push(
          <HeroTableItem key={index}/>
        )
      }
      return all;
    }

    return(
      <div className="box-wrapper">
        <div className="board-box editor">
          {generateHexagon()}
        </div>
        <div className="board-box editor">
          {generateHexagon()}
        </div>
      </div>
    )
  }
}