/**
 * @Description: 英雄技能-探险家-伊泽瑞尔-ezreal-81
 * @Author: Rex Zheng
 * @Date: 2020-04-28 11:15:15
 * @LastEditor: Rex Zheng
 * @LastEditTime: 2020-04-28 14:09:29
 */

import _ from 'lodash';

import { culAttackWidth, getEnemies } from './../utils';

/**
 * @description: EZ的英雄技能——时空射击
 * 内容：伊泽瑞尔对一名随机的敌人发射一道电磁脉冲，在碰撞时爆炸，对附近的所有敌人造成伤害，并使他们的下一次技能施放的法力消耗提升
 * 技能伤害：200/300/600
 * Todo 为了方便开发，这里对下次技能释放，也就是破发的特效没有进行操作
 * @param {object} hero 释放技能的英雄-探险家
 * @param {object[]} allHeroes 所有英雄
 * @param {object} paramTargetHero 目标英雄
 * @return {object} 格式参见4.js
 */
export default (hero, allHeroes) => {
  const allSkillInfo = hero.skillDetail.split(/\r\n|[\r\n]/)
  const damage = +allSkillInfo[1].match(/\d+.+/)[0].split('/')[hero.grade - 1];
  const enemies = getEnemies(hero, allHeroes);
  
  if (enemies.length === 0) {
    return null;
  }

  const targetHero = _.sample(enemies);

  const rangeIds = culAttackWidth(targetHero.locationId, 1, 49);

  const targets = _.compact(_.map(enemies, (enemy) => {
    if (_.indexOf(rangeIds, enemy.locationId) >= 0) {
      return enemy;
    }
    return null;
  }))

  return {
    timeLeft: 0,
    effect: _.map(targets, target => ({
      target,
      damage
    }))
  };
}