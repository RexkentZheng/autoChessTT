/**
 * @Description: 英雄技能-德玛西亚皇子-嘉文四世-jarvan-59
 * @Author: Rex Zheng
 * @Date: 2020-04-14 13:16:45
 * @LastEditor: Rex Zheng
 * @LastEditTime: 2020-04-20 17:51:16
 */

import _ from 'lodash';

import { culAttackWidth, getSkillDamages } from './../utils';

/**
 * @description: 皇子的技能方法
 * 内容：嘉文召唤他的军旗到附近的一个位置，为所有附近的友军提供攻击速度
 * 攻击速度: 40% / 50% / 60%
 * 先确认旗子插哪里，默认插在敌军的格子上，然后此格两格范围内的友军都加上攻速Buff
 * @param {object} hero 释放技能的英雄-德玛西亚皇子
 * @param {object[]} allHeroes 所有英雄
 * @param {object} paramTargetHero 目标英雄
 * @return: 格式参见4.js
 */
export default (hero, allHeroes, paramTargetHero = null) => {
  const buffPercent = getSkillDamages(hero).replace('%', '') / 100;

  const targetHero = paramTargetHero || getTargetHero(_.compact(allHeroes), hero);

  if (!targetHero) {
    return null;
  }

  const aoeIds = culAttackWidth(targetHero.locationId, 2, 49);

  const targetHeroes = _.map(allHeroes, (heroItem) => {
    if (heroItem) {
      if (_.indexOf(aoeIds, +heroItem.locationId) >= 0 && heroItem.role === hero.role) {
        return heroItem;
      }
      return null;
    }
    return null;
  })

  return {
    timeLeft: 0,
    effect: _.map(targetHeroes, (item) => ({
      target: item,
      damage: 0,
      buffs: {
        time: 6,
        attackSpeed: buffPercent
      },
      nerfs: null
    }))
  }

}