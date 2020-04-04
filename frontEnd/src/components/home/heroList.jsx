import 'antd/dist/antd.css';

import { Spin, Tooltip } from 'antd';
import config from 'config';
import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';

@inject('homeStore', 'globalStore')
@observer
export default class HeroList extends Component {
  constructor(props) {
    super(props);
    this.homeStore = props.homeStore.default;
    this.globalStore = props.globalStore.default;
  }

  /**
   * @description: 刷新list列表
   * @return: void
   */
  refreshRealHeroes() {
    if (this.homeStore.money >= 2) {
      this.homeStore.getRealHeroes({
        number: 5
      })
    }
  }
  
  /**
   * @description: 更新等级
   * @param {string} type 更新类型
   * @return: vodi
   */
  updateLevel(type) {
    this.homeStore.updateLevel(type);
  }

  /**
   * @description: 购买英雄
   * @param {number} index list顺序
   * @param {object} hero 英雄信息
   * @return: void
   */
  buyHero(index, hero) {
    this.homeStore.buyHero(hero, index);
  }

  /**
   * @description: 允许drop定义方法
   */
  allowDrop(event) {
    event.preventDefault();
  }

  /**
   * @description: 拖拽放置
   * 拿到传递过来的hero, index, from参数
   * 如果来自waitting，去掉waitting中hero，更新金钱
   * @param {DropEvent} e 拖拽事件
   * @return: void
   */
  drop = () => e => {
    e.preventDefault()
    const { hero, index, from } = JSON.parse(e.dataTransfer.getData('info'));
    if (from === 'waitting') {
      this.props.homeStore.default.updateHeroWaitting(null, index);
      this.props.homeStore.default.updateMoney(+hero.price)
    }
  }

  render() {
    return(
      <div className="hero-list">
        <Spin spinning={this.globalStore.isLoading('HomeStore/getHeroes')}>
          <div className="player-info">
            <div className="level">
              <div className="level-bg"></div>
              <div className="level-info">
                <p>等级：{this.homeStore.level}</p>
                <p>0/10</p>
              </div>
            </div>
            <div className="money">
              <Tooltip
                placement="right"
                title={(
                  <div className="hover-tooltip heroListMoney">
                    <div className="first">
                      连胜
                    </div>
                    <div className="second">
                      每回合基于你连续胜利或失败的回合数来获得额外的金币。
                    </div>
                    <div className="third">
                      <span><span>2-3</span><span>+1</span></span>
                      <span><span>4-6</span><span>+2</span></span>
                      <span><span>7+</span><span>+3</span></span>
                    </div>
                  </div>
                )}
              >
                <div className="money-bg"></div>
                <div className="money-info">
                  <p>{this.homeStore.money}</p>
                </div>
              </Tooltip>
            </div>
          </div>
          <div
            className="champions"
            onDrop={this.drop()}
            onDragOver={this.allowDrop.bind(this)}
          >
            <div className="champion-list clearfix">
              <div className="champion-info">
                <div
                  className="refresh"
                  onClick={this.refreshRealHeroes.bind(this)}
                >
                </div>
                <div
                  className="level"
                  onClick={this.updateLevel.bind(this, 'add')}
                >
                  {/* <Button onClick={this.updateLevel.bind(this, '')}>-</Button> */}
                </div>
              </div>
              {
                _.map(this.homeStore.heroList, (hero, index) => {
                  if (!hero) {
                    return (
                      <div key={`heroList${index}null`} className="champion champion-saled">
                        <div className="position"></div>
                      </div>
                    );
                  }
                  return (
                    <div
                      key={`heroList${index}${hero.id}`}
                      className={`champion cost${hero.price}`}
                      onClick={this.buyHero.bind(this, index,hero)}
                    >
                      <img className="hidden" src={`https://game.gtimg.cn/images/lol/act/img/tft/champions/${hero.name}`} alt=""/>
                      <div className="triangle"></div>
                      <div className="pic-shadow"></div>
                      <div className="synergies">
                        {
                          _.map(hero.raceIds.split(','), (raceId) => (
                            <span key={`heroList${index}null-${raceId}-race`} >
                              <img className="icon-img" src={config.allRaces[raceId].imagePath} alt=""/>
                              {hero.races}
                            </span>
                          ))
                        }
                        {
                          _.map(hero.jobIds.split(','), (jobId) => (
                            <span key={`heroList${index}null-${jobId}-job`}>
                              <img className="icon-img" src={config.allJobs[jobId].imagePath} alt=""/>
                              {hero.jobs}
                            </span>
                          ))
                        }
                      </div>
                      <img className="champion" src={`https://game.gtimg.cn/images/lol/tft/cham-icons/624x318/${hero.name}`} alt="" />
                      <p>{hero.displayName}<span>{hero.price}</span></p>
                    </div>
                  );
                })
              }
            </div>
          </div>
        </Spin>
      </div>
    )
  }
}