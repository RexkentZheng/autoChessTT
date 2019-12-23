import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Button, Spin } from 'antd';
import _ from 'lodash';
import config from 'config';

@inject('homeStore', 'globalStore')
@observer
export default class HeroList extends Component {
  constructor(props) {
    super(props);
    this.homeStore = props.homeStore.default;
    this.globalStore = props.globalStore.default;
  }

  refreshRealHeroes() {
    this.homeStore.getRealHeroes({
      number: 5
    })
  }
  
  updateLevel(type) {
    this.homeStore.updateLevel(type);
  }

  buyHero(delIndex, hero) {
    this.homeStore.updateHeroList(null, delIndex);
    this.homeStore.updateHeroWaitting('add', hero);
  }

  render() {
    return(
      <div className="hero-list">
        <Spin spinning={this.globalStore.isLoading('HomeStore/getHeroes')}>
          <div className="champions">
            <div className="champion-list clearfix">
              <div className="champion-info">
                <div className="refresh">
                  <Button onClick={this.refreshRealHeroes.bind(this)}>刷新</Button>
                </div>
                <div className="level">
                  <p>等级：{this.homeStore.level}</p>
                  <Button onClick={this.updateLevel.bind(this, 'add')}>+</Button>
                  <Button onClick={this.updateLevel.bind(this, '')}>-</Button>
                </div>
              </div>
              {
                _.map(this.homeStore.heroList, (hero, index) => {
                  if (!hero) {
                    return (
                      <div key={`heroList${index}null`} className="champion champion-saled"></div>
                    );
                  }
                  return (
                    <div
                      key={`heroList${index}${hero.id}`}
                      className={`champion cost${hero.price}`}
                      onClick={this.buyHero.bind(this, index,hero)}
                    >
                      <img className="hidden" src={`https://game.gtimg.cn/images/lol/tft/cham-icons/tft2/120x120/${hero.heroId}.png`} alt=""/>
                      <div className="triangle"></div>
                      <div className="pic-shadow"></div>
                      <div className="synergies">
                        <span className={config.raceImg2[hero.race]}>{window.TFTrace_List[hero.race].race_name}</span>
                        <span className={config.jobImg2[hero.job]}>{window.TFTjob_List[hero.job].job_name}</span>
                      </div>
                      <img className="champion" src={`https://game.gtimg.cn/images/lol/tft/cham-icons/tft2/600x345/${hero.heroId}.jpg`} alt="" />
                      <p>{hero.hero_name}<span>{hero.price}</span></p>
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