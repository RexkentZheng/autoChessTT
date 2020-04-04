import { Popover, Progress, Tooltip } from 'antd';
import config from 'config';
import _ from 'lodash';
import { inject, observer } from 'mobx-react'
import React, { Component } from 'react';

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
      if (this.props.type === 'enemy') {
        this.props.homeStore.default.updateHeroTableEnemy(null, index);
        this.props.homeStore.default.updateHeroTableEnemy({
          ...hero,
          locationId: this.props.rangeIndex
        }, this.props.index);
      } else {
        this.props.homeStore.default.updateHeroTable(null, index);
        this.props.homeStore.default.updateHeroTable({
          ...hero,
          locationId: this.props.rangeIndex
        }, this.props.index);
      }
    } else {
      this.props.homeStore.default.updateHeroWaitting(null, index);
      if (this.props.type === 'enemy') {
        this.props.homeStore.default.updateHeroTableEnemy({
          ...hero,
          locationId: this.props.rangeIndex
        }, this.props.index);
      } else {
        this.props.homeStore.default.updateHeroTable({
          ...hero,
          locationId: this.props.rangeIndex
        }, this.props.index);
      }
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

    const hasBattling = this.props.homeStore.default.status && this.props.hero;

    return(
      <div
        id={`position-${this.props.rangeIndex}`}
        className={`grid ${hasBattling ? 'battling' : ''}`}
        onDrop={this.drop()}
        onDragOver={this.allowDrop.bind(this)}
        onDragStart={this.dragStart()}
        onDrag={this.dragging()}
        draggable="true"
      >
        {
          this.props.hero ?
          <Popover
            title={`${this.props.hero.hero_name} - ${this.props.hero.hero_tittle}`}
            trigger="click"
            content={(
              <div className="hero-hover">
                <div className={`main cost${this.props.hero.price}`}>
                  <div className="img">
                    <div className="pic-shadow"></div>
                    <div className="synergies">
                    {
                      _.map(this.props.hero.raceIds.split(','), (raceId) => (
                        <span key={`heroTableItem-${this.props.hero.chessId}-${raceId}-race`}>
                          <img className="icon-img" src={config.allRaces[raceId].imagePath} alt=""/>
                          {this.props.hero.races}
                        </span>
                      ))
                    }
                    {
                      _.map(this.props.hero.jobIds.split(','), (jobId) => (
                        <span key={`heroTableItem-${this.props.hero.chessId}-${jobId}-job`}>
                          <img className="icon-img" src={config.allJobs[jobId].imagePath} alt=""/>
                          {this.props.hero.jobs}
                        </span>
                      ))
                    }
                    </div>
                    <p className={`star star${this.props.hero.grade}`}></p>
                    <p className="price">{this.props.hero.price}</p>
                    <p className="name">{this.props.hero.hero_tittle}</p>
                    <img src={`https://game.gtimg.cn/images/lol/tft/cham-icons/624x318/${this.props.hero.name}`} alt=""/>
                    <Progress
                      className="hover-health"
                      percent={+this.props.hero.leftLife / +this.props.hero.life * 100}
                      showInfo={false}
                      strokeColor="#0E8E3E"
                      strokeLinecap="square"
                      strokeWidth={14}
                    />
                    <Progress
                      className="hover-mana"
                      percent={+this.props.hero.leftMagic / +this.props.hero.magic * 100}
                      showInfo={false}
                      strokeColor="#194d61"
                      strokeLinecap="square"
                      strokeWidth={16}
                    />
                  </div>
                  <div className="skill-equip">
                    <Tooltip
                      placement="bottom"
                      title={(
                        <div className="hover-tooltip">
                          <p className="first">
                            <img src={this.props.hero.originalImage} alt=""/>
                            <span>{this.props.hero.skillName}</span>
                          </p>
                          <p className="second">
                            {this.props.hero.skillIntroduce}
                          </p>
                          <div className="third">
                            {this.props.hero.skillDetail}
                          </div>
                        </div>
                      )}
                    >
                      <div className="skill">
                        <img src={this.props.hero.originalImage} alt=""/>
                      </div>
                    </Tooltip>
                    <div className="equipment">
                      {
                        _.map(this.props.hero.recEquip ? this.props.hero.recEquip.split(',') : [], (item, index) => {
                          return (
                            <div key={`equipmentHeroListHover${this.props.hero.chessId}${item}${index}`} className="equipment-item">
                              <img draggable="false" src={`https://game.gtimg.cn/images/lol/act/img/tft/equip/${item}.png`} alt="" />
                            </div>
                          )
                        })
                      }
                    </div>
                  </div>
                </div>
                <div className="info">
                  <div className="property">
                    <span className="icon">攻击力：</span>
                    <span>{this.props.hero.attack}</span>
                  </div>
                  <div className="property">
                    <span className="icon">法强：</span>
                    <span>{this.props.hero.crit}</span>
                  </div>
                  <div className="property">
                    <span className="icon">护甲：</span>
                    <span>{this.props.hero.armor}</span>
                  </div>
                  <div className="property">
                    <span className="icon">魔抗：</span>
                    <span>{this.props.hero.spellBlock}</span>
                  </div>
                  <div className="property">
                    <span className="icon">攻速：</span>
                    <span>{this.props.hero.attackSpeed}</span>
                  </div>
                  <div className="property">
                    <span className="icon">攻击范围：</span>
                    <span>{this.props.hero.attackRange}</span>
                  </div>
                  <div className="property">
                    <span className="icon">暴击：</span>
                    <span>{this.props.hero.crit}</span>
                  </div>
                  <div className="property">
                    <span className="icon">暴击伤害：</span>
                    <span>150%</span>
                  </div>
                </div>
              </div>
            )}
          >
            <div className="grid-cont">
              <Progress
                className="health-percent"
                percent={+this.props.hero.leftLife / +this.props.hero.life * 100}
                showInfo={false}
                size="small"
                strokeColor="#87d068" />
              <Progress
                className="mana-percent"
                percent={+this.props.hero.leftMagic / +this.props.hero.magic * 100}
                showInfo={false}
                size="small"
                strokeColor="#108ee9" />
              <div className={`grid-champion cost${this.props.hero.price} `}>
                <div className={`${this.props.hero ? `star${this.props.hero.grade}` : ''}`}>
                  <img src={this.props.hero.chessId ? `https://game.gtimg.cn/images/lol/act/img/tft/champions/${this.props.hero.name}` : ''} alt="" />
                </div>
              </div>
              <div className="grid-items">
                {
                  
                  _.map(this.props.hero.equipment ? this.props.hero.equipment.split(',') : [], (item, index) => {
                    return (
                      <div key={`equipmentHeroList${this.props.hero.chessId}${item}${index}`} className="equipment">
                        <img draggable="false" src={`https://game.gtimg.cn/images/lol/tft/items/${item}.png`} alt="" />
                      </div>
                    )
                  })
                }
              </div>
            </div>
          </Popover>
          :
          null
        }
      </div>
    )
  }
}