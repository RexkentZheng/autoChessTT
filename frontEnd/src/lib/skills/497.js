/**
 * @Description: 英雄技能-幻翎-洛-497
 * @Author: Rex Zheng
 * @Date: 2020-04-14 17:03:36
 * @LastEditor: Rex Zheng
 * @LastEditTime: 2020-04-14 17:12:38
 */

import _ from 'lodash';

import { culAttackWidth, getEnemies, getSkillDamages, getTargetHero } from './../utils';

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
 * @description: 洛的英雄技能
 * 内容：洛朝着他的目标突进，并跳向空中，对所有附近的敌人造成魔法伤害和击飞效果
 * 伤害: 150 / 250 / 350  击飞持续时间: 1.5  击飞半径：1
 * 正常操作，问题不大
 * @param {object} hero 释放技能的英雄-圣枪游侠
 * @param {object[]} allHeroes 所有英雄
 * @param {object} paramTargetHero 目标英雄 
 * @return {object} 格式参见4.js
 */
export default (hero, allHeroes, paramTargetHero) => {
  const damage = +getSkillDamages(hero);
  const rangeIds = culAttackWidth(hero.locationId, 9, 49);
  const targetHero = paramTargetHero || getTargetHero(_.compact(allHeroes), hero, rangeIds);
  const enemies = getEnemies(hero, allHeroes);

  if (!targetHero) {
    return null;
  }

  const targetRanges = culAttackWidth(targetHero.locationId, 1, 49);
  const targetHeros = _.compact(_.map(enemies, (enemy) => {
    if (_.indexOf(targetRanges, enemy.locationId) >= 0) {
      return enemy;
    }
    return null;
  }))

  const moveLocation = getMoveLocation(targetHero, allHeroes);

  return {
    timeLeft: 0,
    effect: [{
      target: hero,
      moveLocation
    }].concat(_.map(targetHeros, target => ({
      target,
      damage,
      ctrl: 2
    })))
  }
}