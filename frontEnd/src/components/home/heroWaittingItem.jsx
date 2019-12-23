import React, { Component } from 'react';
import { inject, observer } from 'mobx-react'

@inject('homeStore')
@observer
export default class HeroWaittingItem extends Component {

  dragStart = () => e => {
    const hero = this.props.hero;
    if (!hero) {
      return e.preventDefault();
    }
    e.dataTransfer.setData('info', JSON.stringify({
      hero,
      index: this.props.index,
      from: 'waitting'
    }));
    let img = new Image();
    img.src = `https://game.gtimg.cn/images/lol/tft/cham-icons/tft2/120x120/${hero.heroId}.png`;
    img.className = 'move-img hidden'
    e.dataTransfer.setDragImage(img, 10, 10);
  }

  dragging = () => e => {
    e.preventDefault()
  }

  allowDrop(event) {
    event.preventDefault();
  }
  drop = () => e => {
    e.preventDefault()
    const { hero, index, from } = JSON.parse(e.dataTransfer.getData('info'));
    if (from === 'waitting') {
      this.props.homeStore.default.updateHeroWaitting('', hero, this.props.index);
      this.props.homeStore.default.updateHeroWaitting('', null, index);
    } else {
      this.props.homeStore.default.updateHeroWaitting('', hero, this.props.index);
      this.props.homeStore.default.updateHeroTable(null, index);
    }
  }

  render() {
    return (
      <div
        className="hero-waitting-item"
        onDragStart={this.dragStart()}
        onDrag={this.dragging()}
        onDrop={this.drop()}
        onDragOver={this.allowDrop.bind(this)}
        draggable="true"
      >
        <img src={this.props.hero ? `https://game.gtimg.cn/images/lol/tft/cham-icons/tft2/120x120/${this.props.hero.heroId}.png` : ''} alt=""/>
      </div>
    )
  }
}