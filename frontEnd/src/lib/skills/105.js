/**
 * @Description: 英雄技能-潮汐海灵-菲兹-fizz-105
 * @Author: Rex Zheng
 * @Date: 2020-05-12 15:03:36
 * @LastEditor: Rex Zheng
 * @LastEditTime: 2020-05-11 15:12:38
 */

import _ from 'lodash';

import { culAttackWidth, getSkillDamages, getTargetHero } from './../utils';

/**
 * @description: 小鱼的英雄技能-巨鲨强袭
 * 内容：菲兹扔出一块诱饵来吸引一条巨鲨，在短暂的延迟后，巨鲨就会破土而出。巨鲨对被捉到的敌人们造成魔法伤害，并将他们击退，然后击晕1.5秒
 * 技能伤害: 275 / 350 / 2000
 * 范围为2格，延迟为2秒
 * @param {object} hero 释放技能的英雄-潮汐海灵
 * @param {object[]} allHeroes 所有英雄
 * @return {object} 格式参见4.js
 */
export default (hero, allHeroes, paramTargetHero) => {
  const damage = +getSkillDamages(hero);
  const rangeIds = culAttackWidth(hero.locationId, +hero.attackRange, 49);
  const targetHero = paramTargetHero || getTargetHero(_.compact(allHeroes), hero, rangeIds);

  if (!targetHero) return null;

  const aoeIds = culAttackWidth(targetHero.locationId, 2, 49);

  return {
    timeLeft: 3,
    effect: aoeIds.map((targetLocation) => ({
      target: `location:${targetLocation}`,
      damage,
      ctrl: 1.5
    }))
  }

}