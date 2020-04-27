/**
 * @Description: 英雄技能-九尾妖狐-阿狸-ahri-103
 * @Author: Rex Zheng
 * @Date: 2020-04-18 20:54:30
 * @LastEditor: Rex Zheng
 * @LastEditTime: 2020-04-18 21:55:47
 */

import _ from 'lodash';

import {
  calSlope,
  getAwayEnemy,
  getLocationFuc,
  getSkillDamages
} from './../utils';

/**
 * @description: 狐狸的英雄技能
 * 阿狸沿直线发射一颗宝珠，对沿途的所有敌人造成魔法伤害
 * 随后它会折返回阿狸处，对沿途的所有敌人造成真实伤害
 * 技能伤害: 175 / 250 / 450
 * 目标选择：默认距离最远的敌方为目标英雄
 * 稍微有些问题，因为实在是无法判断球的速度和时间，所以做成了瞬间伤害
 * 木的办法，为了平衡一下，加了一个2s抬手
 * @param {object} hero 释放技能的英雄-暮光之眼
 * @param {object[]} allHeroes 所有英雄
 * @param {object} paramTargetHero 目标英雄
 * @param {boolean} updateHero 是否再次释放
 * @return {object} 格式参见4.js
 */
export default (hero, allHeroes) => {
  const damage = +getSkillDamages(hero);
  const targetHero = getAwayEnemy(hero, allHeroes, 'far');
  const enemies = _.filter(_.compact(allHeroes), (item) => item.role !== hero.role);

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
    timeLeft: 2,
    effect: _.map(targetHeros, target => ({
      target,
      damage: damage * 2
    }))
  }

}