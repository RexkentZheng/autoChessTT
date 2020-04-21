/**
 * @Description: 英雄技能-无极剑圣-易-yi-11
 * @Author: Rex Zheng
 * @Date: 2020-04-21 14:29:25
 * @LastEditor: Rex Zheng
 * @LastEditTime: 2020-04-21 14:55:55
 */

import { culAttackWidth, getTargetHero } from './../utils';

/**
 * @description: 剑圣的英雄技能-天选之子
 * 内容：在5秒里，易获得巨额移动速度提升，每秒治疗自身最大生命值，并且他的普通攻击会造成额外真实伤害
 * 真实伤害: 75 / 100 / 200
 * 每秒治疗生命值: 8% / 10% / 20%
 * PS：此处普攻造成真实伤害，在此系统中为1S普攻一次，所以勉强认为是技能伤害
 * @param {object} hero 释放技能的英雄-无极剑圣
 * @param {object[]} allHeroes 所有英雄
 * @param {object} paramTargetHero 目标英雄 
 * @return {object} 格式参见4.js
 */
export default (hero, allHeroes, paramTargetHero) => {
  const allSkillInfo = hero.skillDetail.split(/\r\n|[\r\n]/)
  const realDamage = +allSkillInfo[1].match(/\d+.+/)[0].split(' / ')[hero.grade - 1];
  const heal = allSkillInfo[2].match(/\d+.+/)[0].split(' / ')[hero.grade - 1].replace('%', '') / 100;
  const rangeIds = culAttackWidth(hero.locationId, +hero.attackRange, 49);
  const targetHero = paramTargetHero || getTargetHero(_.compact(allHeroes), hero, rangeIds);

  if (!targetHero) {
    return null;
  }

  return {
    timeLeft: 0,
    timeLasting: 5,
    effect: [{
      target: hero,
      heal: hero.life * heal,
    }, {
      target: targetHero,
      damage: realDamage * +hero.attackSpeed
    }]
  }
}