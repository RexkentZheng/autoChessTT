/**
 * @Description: 英雄技能-寒冰射手-艾希-ashe-22
 * @Author: Rex Zheng
 * @Date: 2020-04-21 11:15:15
 * @LastEditor: Rex Zheng
 * @LastEditTime: 2020-04-21 14:09:29
 */

import _ from 'lodash';

import {
  calLength,
  calSlope,
  culAttackWidth,
  getAwayHero,
  getEnemies,
  getLocationFuc,
  getSkillDamages
} from './../utils';

/**
 * @description: 寒冰的英雄技能
 * 内容：艾希朝距离最远的敌人射出一支魔法水晶箭。魔法水晶箭会在命中第一个目标后爆炸，对附近所有敌人造成魔法伤害和晕眩效果
 * 技能伤害: 250 / 350 / 700
 * 晕眩时长: 2
 * 正常操作，因为封装的方法比较多，所以调用的也比较多，后期可以把技能阻挡提取为公用方法
 * @param {object} hero 释放技能的英雄-寒冰射手
 * @param {object[]} allHeroes 所有英雄
 * @return {object} 格式参见4.js
 */
export default (hero, allHeroes) => {
  const damage = +getSkillDamages(hero);
  const targetHero = getAwayHero(hero, allHeroes, 'far');
  const enemies = getEnemies(hero, allHeroes);

  if (!targetHero) {
    return null;
  }

  const { x: ox, y: oy } = getLocationFuc(hero.locationId);
  const { x: tx, y: ty } = getLocationFuc(targetHero.locationId);
  const originSlope = calSlope(tx, ty, ox, oy);

  let targetInfo = {
    distance: calLength(ox, oy, tx, ty),
    hero: targetHero
  }

  _.map(enemies, (enemy) => {
    const {x, y} = getLocationFuc(enemy.locationId);
    const newSlope = calSlope(x, y, ox, oy);
    const tmpDistance = calLength(x, y, ox, oy);
    if (tmpDistance < targetInfo.distance &&
      (originSlope === newSlope) &&
      (x > ox === tx > ox) &&
      (y > oy === ty > oy) 
      ) {
      targetInfo = {
        distance: tmpDistance,
        hero: enemy
      }
    }
  })

  const aoeRanges = culAttackWidth(targetInfo.hero.locationId, 1, 49);

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
      damage,
      ctrl: 2
    }))
  }

}