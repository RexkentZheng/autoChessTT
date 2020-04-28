/**
 * @Description: 英雄技能-光辉女郎-拉克丝-lux-99
 * @Author: Rex Zheng
 * @Date: 2020-04-28 11:15:15
 * @LastEditor: Rex Zheng
 * @LastEditTime: 2020-04-28 14:09:29
 */

import _ from 'lodash';

import { calSlope, culAttackWidth, getLocationFuc, getTargetHero } from './../utils';

/**
 * @description: 拉克丝的英雄技能——骇人束缚
 * 内容：拉克丝发射一颗黑暗球体来穿过敌人，造成魔法伤害并使其晕眩
 * 伤害: 200 / 300 / 600
 * 眩晕时间: 1.5 / 2 / 2.5
 * 经实战测试，发现一条线上的敌人都会受到伤害和眩晕效果
 * @param {object} hero 释放技能的英雄-光辉女郎
 * @param {object[]} allHeroes 所有英雄
 * @param {object} paramTargetHero 目标英雄
 * @return {object} 格式参见4.js
 */
export default (hero, allHeroes, paramTargetHero = null) => {
  const allSkillInfo = hero.skillDetail.split(/\r\n|[\r\n]/)
  const damage = +allSkillInfo[1].match(/\d+.+/)[0].split(' / ')[hero.grade - 1];
  const ctrl = +allSkillInfo[2].match(/\d+.+/)[0].split(' / ')[hero.grade - 1];
  const enemies = _.filter(_.compact(allHeroes), (item) => item.role !== hero.role);
  const rangeIds = culAttackWidth(hero.locationId, +hero.attackRange, 49);
  const targetHero = paramTargetHero || getTargetHero(_.compact(allHeroes), hero, rangeIds);

  if (!targetHero) {
    return null;
  }

  const { x: ox, y: oy } = getLocationFuc(hero.locationId);
  const { x: tx, y: ty } = getLocationFuc(targetHero.locationId);
  const originSlope = calSlope(tx, ty, ox, oy);

  const targetHeros = _.compact(_.map(enemies, (enemy) => {
    const {x, y} = getLocationFuc(enemy.locationId);
    const newSlope = calSlope(x, y, ox, oy);
    if ((x > ox === tx > ox) &&
      (y > oy === ty > oy) &&
      (originSlope === newSlope)
    ) {
      return enemy;
    }
    return null;
  }))

  return {
    timeLeft: 0,
    effect: _.map(targetHeros, target => ({
      target,
      damage,
      ctrl
    }))
  }
}