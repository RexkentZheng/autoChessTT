import { Button, Tooltip } from 'antd';
import config from 'config';
import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';

@inject('homeStore', 'battleStore')
@observer
export default class HeroRelations extends Component {
  constructor(props) {
    super(props);
    this.homeStore = props.homeStore.default;
    this.battleStore = props.battleStore.default;
  }

  getRelationStatus (relation, key) {
    return (
      <span key={`${relation.TFTID}-${relation.id}`} className={relation.num >= key ? 'normal' : 'disable'}>
        {`(${key}) +${relation.level[key]}`}
      </span>
    )
  }

  getTooltipHeroes (relation) {
    const relationHeroes =_.sortBy(_.compact(_.map(config.heroes, (hero) => {
      if (relation.type === 'job') {
        return +hero.jobIds === +relation.id ? hero : null;
      }
      return +hero.raceIds === +relation.id ? hero : null;
    })), ['price']);
    return _.map(relationHeroes, (hero) => {
      const className = this.homeStore.heroTable.find( item => item ? +item.chessId === +hero.chessId : false) ? '' : 'disabled';
      return (
        <div key={`hero-relation-hero-${relation.TFTID}-${hero.chessId}`} className={`cost${hero.price}`}>
          <img
            className={className}
            src={`https://game.gtimg.cn/images/lol/act/img/tft/champions/${hero.name}`}
          />
        </div>
      )
    })
  }

  getTooltipContent (relation) {
    return (
      <div className="hover-tooltip hover-relations">
        <p>
          {relation.name}
        </p>
        <p className="relation-dsc">{relation.introduce}</p>
        <p className="relation-status">
          {
            _.map(_.keys(relation.level), (key) => this.getRelationStatus(relation, key))
          }
        </p>
        <div className="relation-hero">
          <p>【{relation.name}】英雄们：</p>
          {this.getTooltipHeroes(relation)}
        </div>
      </div>
    )
  }

  getRelationNum (relation) {
    return (
      <Tooltip
        placement="right"
        title={this.getTooltipContent(relation)}
      >
        <div>
          <span>
            <img
              className={relation.num >= _.keys(relation.level)[0] ? 'icon-img-active' : 'icon-img-disable'}
              src={relation.imagePath}
              alt=""
            />
          </span>
          <p className="num">{relation.num}</p>
          <p>
            <span>{relation.name}</span>
            {
              <span>{_.keys(relation.level).join(' > ')}</span>
            }
          </p >
        </div>
      </Tooltip>
    )
  }

  updateStatus (type) {
    this.homeStore.updateStatus(type);
    if (type === 'battling') {
      this.battleStore.updateHero(this.homeStore.heroTable, this.homeStore.heroTableEnemy)
    } else {
      this.battleStore.updateHero([], [])
    }
  }

  render() {
    return (
      <div className="hero-relations">
        <div>
          <Button onClick={this.updateStatus.bind(this, 'battling')}> Start </Button>
          <Button onClick={this.updateStatus.bind(this, 'end')}> End </Button>
        </div>
        <div className="bg-top"></div>
        <div className="bg-middle"></div>
        <div className="relations-list">
          {
            _.map(_.orderBy(this.homeStore.relations, ['num'], ['desc']), (relation) => (
              <div key={`hero-relation-${relation.TFTID}-${relation.type}`}>
                {this.getRelationNum(relation)}
              </div>
            ))
          }
        </div>
        <div className="bg-bottom"></div>
      </div>
    )
  }
}