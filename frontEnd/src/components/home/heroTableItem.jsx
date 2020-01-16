import React, { Component } from 'react';
import _ from 'lodash';
import { inject, observer } from 'mobx-react'
import { Progress, Popover, Tooltip } from 'antd';
import config from 'config';

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
        this.props.homeStore.default.updateHeroTableEnemy(hero, this.props.index);
      } else {
        this.props.homeStore.default.updateHeroTable(null, index);
        this.props.homeStore.default.updateHeroTable(hero, this.props.index);
      }
    } else {
      this.props.homeStore.default.updateHeroWaitting(null, index);
      if (this.props.type === 'enemy') {
        this.props.homeStore.default.updateHeroTableEnemy(hero, this.props.index);
      } else {
        this.props.homeStore.default.updateHeroTable(hero, this.props.index);
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
          <Popover
            title={`${this.props.hero.hero_name} - ${this.props.hero.hero_tittle}`}
            trigger="click"
            content={(
              <div className="hero-hover">
                <div className={`main cost${this.props.hero.price}`}>
                  <div className="img">
                    <div className="pic-shadow"></div>
                    <div className="synergies">
                      <span className={config.raceImg2[this.props.hero.race]}>{window.TFTrace_List[this.props.hero.race].race_name}</  span>
                      <span className={config.jobImg2[this.props.hero.job]}>{window.TFTjob_List[this.props.hero.job].job_name}</span>
                    </div>
                    <p className={`star star${this.props.hero.grade}`}></p>
                    <p className="price">{this.props.hero.price}</p>
                    <p className="name">{this.props.hero.hero_tittle}</p>
                    <img src={`https://game.gtimg.cn/images/lol/tft/cham-icons/tft2/600x345/${this.props.hero.heroId}.jpg`} alt=""/>
                    <Progress
                      className="hover-health"
                      percent={+this.props.hero.leftHealth / +this.props.hero.info.health * 100}
                      showInfo={false}
                      strokeColor="#0E8E3E"
                      strokeLinecap="square"
                      strokeWidth={14}
                    />
                    <Progress
                      className="hover-mana"
                      percent={+this.props.hero.leftMana / +this.props.hero.info.Mana * 100}
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
                            <img src={`//game.gtimg.cn/images/lol/tft/skills/tft2/${this.props.hero.heroId}.png`} alt=""/>
                            <span>{this.props.hero.skill_name}</span>
                          </p>
                          <p className="second">
                            {this.props.hero.skill_introduce}
                          </p>
                          <div className="third">
                            {
                              _.map(this.props.hero.skill_num.split('；'), (sentence) => (
                                <p key={sentence}>
                                  {
                                    _.map(sentence.split('：'), (words, index) => (
                                      <span key={words} className={index === 0 ? 'greenWords' : ''}>{words}</span>
                                    ))
                                  }
                                </p>
                              ))
                            }
                          </div>
                        </div>
                      )}
                    >
                      <div className="skill">
                        <img src={`//game.gtimg.cn/images/lol/tft/skills/tft2/${this.props.hero.heroId}.png`} alt=""/>
                      </div>
                    </Tooltip>
                    <div className="equipment">
                      {
                        _.map(this.props.hero.equipment ? this.props.hero.equipment.split(',') : [], (item, index) => {
                          return (
                            <div key={`equipmentHeroListHover${this.props.hero.heroId}${item}${index}`} className="equipment-item">
                              <img draggable="false" src={`https://game.gtimg.cn/images/lol/tft/items/${item}.png`} alt="" />
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
                    <span>{this.props.hero.info.damage}</span>
                  </div>
                  <div className="property">
                    <span className="icon">不造：</span>
                    <span>{this.props.hero.info.damage}</span>
                  </div>
                  <div className="property">
                    <span className="icon">护甲：</span>
                    <span>{this.props.hero.info.armor}</span>
                  </div>
                  <div className="property">
                    <span className="icon">魔抗：</span>
                    <span>{this.props.hero.info.magic_res}</span>
                  </div>
                  <div className="property">
                    <span className="icon">攻速：</span>
                    <span>{this.props.hero.info.speed}</span>
                  </div>
                  <div className="property">
                    <span className="icon">攻击范围：</span>
                    <span>{this.props.hero.info.range}</span>
                  </div>
                  <div className="property">
                    <span className="icon">暴击：</span>
                    <span>{this.props.hero.info.CR}</span>
                  </div>
                  <div className="property">
                    <span className="icon">攻击力</span>
                    <span>{this.props.hero.info.damage}</span>
                  </div>
                </div>
              </div>
            )}
          >
            <div className="grid-cont">
              <Progress
                className="health-percent"
                percent={+this.props.hero.leftHealth / +this.props.hero.info.health * 100}
                showInfo={false}
                size="small"
                strokeColor="#87d068" />
              <Progress
                className="mana-percent"
                percent={+this.props.hero.leftMana / +this.props.hero.info.Mana * 100}
                showInfo={false}
                size="small"
                strokeColor="#108ee9" />
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
            </div>
          </Popover>
          :
          null
        }
      </div>
    )
  }
}