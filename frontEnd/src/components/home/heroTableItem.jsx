import React, { Component } from 'react';
import _ from 'lodash';
import { inject, observer } from 'mobx-react'

@inject('homeStore')
@observer
export default class HeroTableItem extends Component {

  allowDrop(event) {
    event.preventDefault();
  }
  drop = () => e => {
    e.preventDefault()
    const { hero, index, from } = JSON.parse(e.dataTransfer.getData('info'));
    if (from === 'table') {
      this.props.homeStore.default.updateHeroTable(null, index);
      this.props.homeStore.default.updateHeroTable(hero, this.props.index);
    } else {
      this.props.homeStore.default.updateHeroWaitting('', null, index);
      this.props.homeStore.default.updateHeroTable(hero, this.props.index);
    }
  }

  dragStart = () => e => {
    const hero = this.props.hero;
    if (!hero) {
      return e.preventDefault();
    }
    e.dataTransfer.setData('info', JSON.stringify({
      hero: this.props.hero,
      index: this.props.index,
      from: 'table'
    }));
  }

  dragging = () => e => {
    e.preventDefault()
  }

  render() {
    return(
      <div
        className="grid"
        onDrop={this.drop()}
        onDragOver={this.allowDrop.bind(this)}
        onDragStart={this.dragStart()}
        onDrag={this.dragging()}
        draggable="true"
      >
        {
          this.props.hero ?
          <div className="grid-cont">
            <div className={`grid-champion cost${this.props.hero.price}`}>
              <img src={this.props.hero.heroId ? `https://game.gtimg.cn/images/lol/tft/cham-icons/tft2/120x120/${this.props.hero.heroId}.png` : ''} alt="" />
            </div>
            <div className="grid-items">
              {
                
                _.map(this.props.hero.equipment ? this.props.hero.equipment.split(',') : [], (item, index) => {
                  return (
                    <div key={`equipmentHeroList${this.props.hero.heroId}${item}${index}`} className="equipment">
                      <img draggable="false" src={`https://game.gtimg.cn/images/lol/tft/items/${item}.png`} alt="" />
                    </div>
                  )
                })
              }
            </div>
          </div> :
          null
        }
        
      </div>
    )
  }
}