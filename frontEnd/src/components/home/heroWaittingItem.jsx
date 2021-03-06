import { Tooltip } from 'antd';
import { inject, observer } from 'mobx-react'
import React, { Component } from 'react';

@inject('homeStore')
@observer
export default class HeroWaittingItem extends Component {

  /**
   * @description: 开始拖拽
   * 如果当前没有hero，直接return掉
   * 如果有hero，封装hero, index, from参数进拖拽事件
   * 设置拖拽过程中的图像
   * @param {DropEvent} e 拖拽事件
   * @return: void
   */
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
    img.src = `https://game.gtimg.cn/images/lol/act/img/tft/champions/${hero.name}`;
    img.className = 'move-img hidden'
    e.dataTransfer.setDragImage(img, 10, 10);
  }

  /**
   * @description: 拖动中
   * @param {DropEvent} e 拖拽事件
   * @return: void
   */
  dragging = () => e => {
    e.preventDefault()
  }

  /**
   * @description: 允许drop定义方法
   * @param {Event} event 拖拽事件
   * @return: void
   */
  allowDrop(event) {
    event.preventDefault();
  }

  /**
   * @description: 拖拽放置方法
   * 拿到传递过来的hero, index, from参数
   * 如果来自waitting，去掉旧的hero，新增新的hero
   * 否则去掉table中hero，waitting新增hero
   * @param {DropEvent} e 拖拽事件
   * @return: void
   */
  drop = () => e => {
    e.preventDefault()
    const { hero, index, from } = JSON.parse(e.dataTransfer.getData('info'));
    if (from === 'waitting') {
      this.props.homeStore.default.updateHeroWaitting(hero, this.props.index);
      this.props.homeStore.default.updateHeroWaitting(null, index);
    } else {
      this.props.homeStore.default.updateHeroWaitting(hero, this.props.index);
      this.props.homeStore.default.updateHeroTable(null, index);
    }
  }

  render() {
    return (
      <div
        className={`hero-waitting-item ${this.props.hero ? `star${this.props.hero.grade}` : ''}`}
        onDragStart={this.dragStart()}
        onDrag={this.dragging()}
        onDrop={this.drop()}
        onDragOver={this.allowDrop.bind(this)}
        draggable="true"
      >
        {
          this.props.hero ?
          <div>
            <Tooltip
              placement="top"
              title={(
                <div className="hover-tooltip heroTableHover">
                  {/* <div className="skill-img">
                    <img src={`//game.gtimg.cn/images/lol/tft/skills/tft2/${this.props.hero.chessId}.png`} alt=""/>
                  </div>
                  <div className="skill-introduce">
                    <p>{this.props.hero.skill_name}</p>
                    <p>{this.props.hero.skill_introduce}</p>
                  </div> */}
                </div>
              )}
            >
              <img src={this.props.hero ? `https://game.gtimg.cn/images/lol/act/img/tft/champions/${this.props.hero.name}` : ''} alt=""/>
            </Tooltip>
          </div>
          : null
        }
      </div>
    )
  }
}