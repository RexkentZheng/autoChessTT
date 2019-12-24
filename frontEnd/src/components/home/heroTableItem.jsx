import React, { Component } from 'react';
import _ from 'lodash';
import { inject, observer } from 'mobx-react'

@inject('homeStore')
@observer
export default class HeroTableItem extends Component {

  /**
   * @description: 允许drop定义方法
   * @param {DropEvent} event 拖拽事件
   * @return: void
   */
  allowDrop(event) {
    event.preventDefault();
  }

  /**
   * @description: 拖拽放置方法
   * 拿到传递过来的hero, index, from参数
   * 如果来自table，去掉旧的hero，新增新的hero
   * 否则去掉waitting中hero，table新增hero
   * @param {DropEvent} e 拖拽事件
   * @return: void
   */
  drop = () => e => {
    e.preventDefault()
    const { hero, index, from } = JSON.parse(e.dataTransfer.getData('info'));
    if (from === 'table') {
      this.props.homeStore.default.updateHeroTable(null, index);
      this.props.homeStore.default.updateHeroTable(hero, this.props.index);
    } else {
      this.props.homeStore.default.updateHeroWaitting(null, index);
      this.props.homeStore.default.updateHeroTable(hero, this.props.index);
    }
  }

  /**
   * @description: 开始拖拽
   * 如果当前没有hero，直接return掉
   * 如果有hero，封装hero, index, from参数进拖拽事件
   * @param {DropEvent} e 拖拽事件
   * @return: void
   */
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

  /**
   * @description: 拖动中
   * @param {DropEvent} e 拖拽事件
   * @return: void
   */
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
            <div className={`grid-champion cost${this.props.hero.price} `}>
              <div className={`${this.props.hero ? `star${this.props.hero.grade}` : ''}`}>
                <img src={this.props.hero.heroId ? `https://game.gtimg.cn/images/lol/tft/cham-icons/tft2/120x120/${this.props.hero.heroId}.png` : ''} alt="" />
              </div>
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