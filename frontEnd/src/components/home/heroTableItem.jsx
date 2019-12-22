import React, { Component } from 'react';
import _ from 'lodash';

export default class HeroTableItem extends Component {

  state = {
    heroInfo: {
      heroId: ''
    }
  }

  allowDrop(event) {
    event.preventDefault();
  }
  drop = () => e => {
    const heroInfo = JSON.parse(e.dataTransfer.getData('hero'));
    this.setState({
      heroInfo
    })
  }

  render() {
    return(
      <div
        className="grid"
        onDrop={this.drop()}
        onDragOver={this.allowDrop.bind(this)}
      >
        <div className="grid-cont">
          <div className="grid-champion">
            <img src={this.state.heroInfo.heroId ? `https://game.gtimg.cn/images/lol/tft/cham-icons/tft2/120x120/${this.state.heroInfo.heroId}.png` : ''} alt="" />
          </div>
          <div className="grid-items">
            {
              
              _.map(this.state.heroInfo.equipment ? this.state.heroInfo.equipment.split(',') : [], (item, index) => {
                return (
                  <div key={`${this.state.heroInfo.heroId}${item}${index}`} className="equipment">
                    <img draggable="false" src={`https://game.gtimg.cn/images/lol/tft/items/${item}.png`} alt="" />
                  </div>
                )
              })
            }
          </div>
        </div>
      </div>
    )
  }
}