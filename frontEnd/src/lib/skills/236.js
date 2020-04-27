/**
 * @Description: 英雄技能-圣枪游侠-卢锡安-lucian-236
 * @Author: Rex Zheng
 * @Date: 2020-04-20 17:53:27
 * @LastEditor: Rex Zheng
 * @LastEditTime: 2020-04-20 18:38:43
 */

import _ from 'lodash';

import { calLength, culAttackWidth, getLocationFuc, getSkillDamages, getTargetHero } from './../utils';

/**
 * @description: 奥巴马的英雄技能-冷酷追击
 * 内容：卢锡安跳离他的当前目标，然后对其进行一次普通攻击和一次附带攻击，附带攻击造成伤害
 * 伤害: 175 / 225 / 400
 * 主要就是跳来跳去的位置计算
 * 首先获取到当前位置两格以内的范围，之后计算该格子离目标英雄的距离，去距离最长的
 * 在保证距离最长的情况下还要保证在此位置奥巴马依然可以攻击到目标英雄
 * @param {object} hero 释放技能的英雄-圣枪游侠
 * @param {object[]} allHeroes 所有英雄
 * @param {object} paramTargetHero 目标英雄
 * @return {object} 格式参见4.js
 */
export default (hero, allHeroes, paramTargetHero) => {
  const damage = +getSkillDamages(hero);
  const moveRanges = _.filter(culAttackWidth(hero.locationId, 2, 49), item => item !== hero.locationId);
  const rangeIds = culAttackWidth(hero.locationId, +hero.attackRange, 49);
  const targetHero = paramTargetHero || getTargetHero(_.compact(allHeroes), hero, rangeIds);

  if (!targetHero) {
    return null;
  }

  let targetLocation = {
    id: null,
    distance: 0
  }

  const { x: tx, y: ty } =  getLocationFuc(targetHero.locationId);

  _.map(moveRanges, (locationId) => {
    const { x, y } = getLocationFuc(locationId);
    const tmpDistance = calLength(x, y, tx, ty);
    if (tmpDistance > targetLocation.distance) {
      const attackRanges = culAttackWidth(locationId, +hero.attackRange, 49)
      if (_.indexOf(attackRanges, targetHero.locationId) >= 0) {
        targetLocation = {
          id: locationId,
          distance: tmpDistance
        }
      }
    }
  })

  return {
    timeLeft: 0,
    effect: [{
      target: hero,
      moveLocation: targetLocation.id
    }, {
      target: targetHero,
      damage: +hero.attack * +hero.attackSpeed + damage
    }]
  }

}