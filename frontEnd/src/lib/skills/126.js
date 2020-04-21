/**
 * @Description: 英雄技能-未来守护者-杰斯-jayce-126
 * @Author: Rex Zheng
 * @Date: 2020-04-21 14:58:10
 * @LastEditor: Rex Zheng
 * @LastEditTime: 2020-04-21 15:08:01
 */

import _ from 'lodash';

import { culAttackWidth, getEnemies, getSkillDamages, getTargetHero } from './../utils';

/**
 * @description: 杰斯的英雄技能-苍穹之跃！
 * 内容：杰斯跃向空中然后将他的战锤砸下，对附近的敌人造成魔法伤害
 * 技能伤害: 450 / 600 / 1200
 * 以自身位置为AOE目标
 * @param {object} hero 释放技能的英雄-未来守护者
 * @param {object[]} allHeroes 所有英雄
 * @param {object} paramTargetHero 目标英雄 
 * @return {object} 格式参见4.js
 */
export default (hero, allHeroes, paramTargetHero) => {
  const damage = +getSkillDamages(hero);
  const rangeIds = culAttackWidth(hero.locationId, +hero.attackRange, 49);
  const targetHero = paramTargetHero || getTargetHero(_.compact(allHeroes), hero, rangeIds);
  const enemies = getEnemies(hero, allHeroes);

  if (!targetHero) {
    return null;
  }

  const aoeRanges = culAttackWidth(hero.locationId, 1, 49);

  const targetHeros = _.compact(_.map(enemies, (enemy) => {
    if (_.indexOf(aoeRanges, enemy.locationId) >= 0) {
      return enemy;
    }
    return null;
  }))

  return {
    timeLeft: 0,
    effect: _.map(targetHeros, target => ({
      target,
      damage
    }))
  }
}