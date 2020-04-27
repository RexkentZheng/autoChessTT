/**
 * @Description: 英雄技能-恶魔小丑-萨科-shaco-35
 * @Author: Rex Zheng
 * @Date: 2020-04-20 17:53:27
 * @LastEditor: Rex Zheng
 * @LastEditTime: 2020-04-27 15:38:43
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
 * @description: 小丑的英雄技能-欺诈魔术
 * 内容：萨科传送并背刺他的目标，必定暴击，造成自身百分比的普通攻击伤害。
 * 技能额外伤害: 250%/325%/400%
 * 这里没法区分正面后面，所以会选择最近的一个地方
 * @param {object} hero 释放技能的英雄-恶魔小丑
 * @param {object[]} allHeroes 所有英雄
 * @param {object} paramTargetHero 目标英雄
 * @return {object} 格式参见4.js
 */
export default (hero, allHeroes, paramTargetHero) => {
  const damagePercent = hero.skillDetail.match(/\d+.+/)[0].split('/')[hero.grade - 1].replace('%', '') / 100;
  const rangeIds = culAttackWidth(hero.locationId, +hero.attackRange, 49);
  const target = paramTargetHero || getTargetHero(_.compact(allHeroes), hero, rangeIds);

  if (!target) {
    return null;
  }

  const moveLocation = getMoveLocation(target, allHeroes);

  return {
    timeLeft: 0,
    effect: [{
      target: hero,
      moveLocation
    }, {
      target,
      damage: +hero.attack * +hero.attackSpeed * damagePercent
    }]
  };

}