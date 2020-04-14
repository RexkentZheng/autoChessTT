/**
 * @Description: 英雄技能-虚空掠夺者-卡兹克-khazix-121
 * @Author: Rex Zheng
 * @Date: 2020-04-14 15:36:34
 * @LastEditor: Rex Zheng
 * @LastEditTime: 2020-04-14 16:49:09
 */

import _ from 'lodash';

import { culAttackWidth, getAwayHero } from './../utils';

/**
 * @description: 螳螂的技能方法
 * 内容：卡兹克斩击距离最近的敌人，造成魔法伤害。如果该敌人的队友不在他的邻近格子上，那么这个伤害就会提升
 * 伤害: 200 / 275 / 450
 * 隔断伤害: 600 / 825 / 1350
 * 先找到指定目标，如果参数有则用参数中的，否则使用getAwayHero方法找打最近的敌人
 * 之后判断敌人附近是否有其他敌人，如果有使用正常伤害，否则使用隔断伤害
 * @param {object} hero 释放技能的英雄-虚空掠夺者
 * @param {object[]} allHeroes 所有英雄
 * @param {object} paramTargetHero 目标英雄
 * @return {object} 格式参见4.js
 */
export default (hero, allHeroes, paramTargetHero) => {
  const allSkillInfo = hero.skillDetail.split(/\r\n|[\r\n]/)
  const damage = +allSkillInfo[1].match(/\d+.+/)[0].split(' / ')[hero.grade - 1];
  const aloneDamage = +allSkillInfo[2].match(/\d+.+/)[0].split(' / ')[hero.grade - 1];

  const targetHero = paramTargetHero || getAwayHero(hero, allHeroes, 'near');
  const targetRanges = culAttackWidth(targetHero.locationId, 1, 49);
  const enemies = _.filter(_.compact(allHeroes), (item) => item.role !== hero.role);
  const isAlone = _.map(enemies, (enemy) => _.indexOf(targetRanges, enemy.locationId) >= 0).length === 1;

  return {
    timeLeft: 0,
    effect: [{
      target: targetHero,
      damage: isAlone ? aloneDamage : damage,
      buffs: null,
      nerfs: null
    }]
  }
}