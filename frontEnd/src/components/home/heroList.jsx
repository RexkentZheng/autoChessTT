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

  state = {
    allHeroes: []
  }

  refreshHeroes() {
    this.homeStore.getHeroes().then((res) => {
      this.setState({
        allHeroes: res
      })
    })
  }

  refreshRealHeroes() {
    this.homeStore.getRealHeroes({
      number: 5
    }).then((res) => {
      this.setState({
        allHeroes: res
      })
    })
  }
  

  updateLevel(type) {
    this.homeStore.updateLevel(type);
  }

  render() {
    return(
      <div className="hero-list">
        <Button onClick={this.refreshRealHeroes.bind(this)}>刷新</Button>
        <Spin spinning={this.globalStore.isLoading('HomeStore/getHeroes')}>
          <div className="champions">
            <div className="champion-list">
              {
                _.map(this.state.allHeroes, (hero, index) => {
                  if (!hero) {
                    return '';
                  }
                  return (
                    <div key={`${index}${hero.id}`} className={`champion cost${hero.price}`}>
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
        <div>
          <p>{this.homeStore.level}</p>
          <Button onClick={this.updateLevel.bind(this, 'add')}>+</Button>
          <Button onClick={this.updateLevel.bind(this, '')}>-</Button>
        </div>
      </div>
    )
  }
}