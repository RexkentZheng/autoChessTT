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

  dragStart = (hero) => e => {
    e.dataTransfer.setData('hero', JSON.stringify(hero));
    let img = new Image();
    img.src = `https://game.gtimg.cn/images/lol/tft/cham-icons/tft2/120x120/${hero.heroId}.png`;
    img.className = 'move-img hidden'
    e.dataTransfer.setDragImage(img, 10, 10);
  }

  dragging = () => e => {
    // console.log('dragging')
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
                _.map(this.state.allHeroes, (hero, index) => {
                  if (!hero) {
                    return '';
                  }
                  return (
                    <div
                      key={`${index}${hero.id}`}
                      className={`champion cost${hero.price}`}
                      onDragStart={this.dragStart(hero)}
                      onDrag={this.dragging()}
                      draggable="true"
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