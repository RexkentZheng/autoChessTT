import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Tooltip, Button } from 'antd';
import _ from 'lodash';
import config from 'config';

@inject('homeStore', 'battleStore')
@observer
export default class HeroRelations extends Component {
  constructor(props) {
    super(props);
    this.homeStore = props.homeStore.default;
    this.battleStore = props.battleStore.default;
  }

  getRelationStatus (num, level) {
    return (
      <span key={encodeURI(level.name)} className={num >= +level.name ? 'normal' : 'disable'}>
        {`(${level.name})  ${level.describe}`}
      </span>
    )
  }

  getTooltipHeroes (relation) {
    const relationHeroes =_.sortBy(_.compact(_.map(config.heroes, (hero) => {
      if (relation.type === 'job') {
        return +hero.job === +relation.id ? hero : null;
      }
      return +hero.race === +relation.id ? hero : null;
    })), ['price']);
    return _.map(relationHeroes, (hero) => {
      const className = this.homeStore.heroTable.find( item => item ? +item.heroId === +hero.heroId : false) ? '' : 'disabled';
      return (
        <div key={`hero-relation-hero-${relation.id}-${hero.id}`} className={`cost${hero.price}`}>
          <img
            className={className}
            src={`https://game.gtimg.cn/images/lol/tft/cham-icons/tft2/120x120/${hero.heroId}.png`}
          />
        </div>
      )
    })
  }

  getTooltipContent (relation) {
    return (
      <div className="hover-tooltip hover-relations">
        <p className={`${config.raceImg2[relation.id] || config.jobImg2[relation.id]} relation-name`}>
          {relation.race_name || relation.job_name}
        </p>
        <p className="relation-dsc">{relation.introduce}</p>
        <p className="relation-status">
          {
            _.map(relation.level, (level) => this.getRelationStatus(relation.num, level))
          }
        </p>
        <div className="relation-hero">
          <p>【{relation.race_name || relation.job_name}】元素英雄们：</p>
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
        <div className={config.raceImg2[relation.id] || config.jobImg2[relation.id]}>
          {
            relation.num >= +relation.level[0].name ?
            <p className="num">{relation.num}</p > : null
          }
          <p>
            <span>{relation.race_name || relation.job_name}</span>
            {
              relation.num >= +relation.level[0].name ?
              <span>{_.map(relation.level, (level) => level.name).join(' > ')}</span> :
              <span>{`${relation.num}/${+relation.level[0].name}`}</span>
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
              <div key={`hero-relation-${relation.traitID}`}>
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