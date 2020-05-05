/**
 * @Description: 英雄技能-刀锋舞者-艾瑞莉娅-irelia-39
 * @Author: Rex Zheng
 * @Date: 2020-05-05 11:47:36
 * @LastEditor: Rex Zheng
 * @LastEditTime: 2020-05-05 11:47:38
 */

import _ from 'lodash';

import { culAttackWidth, getTargetHero } from './../utils';

const getMoveLocation = (hero, allHeroes, rangeNum = 1) => {
  let heroAroundIds = culAttackWidth(hero.locationId, rangeNum, 49);
  _.map(_.compact(allHeroes), (heroItem) => {
    if (_.indexOf(heroAroundIds, heroItem.locationId) >= 0) {
      heroAroundIds = _.filter(heroAroundIds, id => id !== heroItem.locationId);
    }
  })
  if (heroAroundIds === 0) {
    return getMoveLocation(hero, allHeroes, rangeNum + 1);
  }
  return _.sample(heroAroundIds)
}
/**
 * @description: 刀妹的英雄技能-利刃冲击
 * 内容：艾瑞莉娅突进并越过她的目标，在经过时攻击目标，造成相当于她攻击力的伤害
 * 如果这个技能击杀了目标，那么她可以朝着法力值最高的敌人立刻再次施放这个技能
 * 技能伤害百分比: 150% / 200% / 500%
 * @param {object} hero 释放技能的英雄-刀锋舞者
 * @param {object[]} allHeroes 所有英雄
 * @param {object} paramTargetHero 目标英雄
 * @return {object} 格式参见4.js
 */
export default (hero, allHeroes, paramTargetHero = null) => {
  const damagePercent = hero.skillDetail.match(/\d+.+/)[0].split(' / ')[hero.grade - 1].replace('%', '') / 100;
  const damage = +hero.attack * +hero.attackSpeed * damagePercent;
  const rangeIds = culAttackWidth(hero.locationId, +hero.attackRange, 49);
  const target = paramTargetHero || getTargetHero(_.compact(allHeroes), hero, rangeIds);

  if (!target) {
    return null;
  }

  const moveLocation = getMoveLocation(target, allHeroes);

  const isKillTarget = damage > +target.leftLife;

  return {
    timeLeft: 0,
    timeLasting: isKillTarget ? 2 : 0,
    effect: [{
      target: hero,
      moveLocation
    }, {
      target,
      damage
    }]
  }

}