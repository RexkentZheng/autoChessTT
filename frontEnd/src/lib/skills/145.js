/**
 * @Description: 英雄技能-虚空之女-卡莎-kaisa-145
 * @Author: Rex Zheng
 * @Date: 2020-04-20 12:57:11
 * @LastEditor: Rex Zheng
 * @LastEditTime: 2020-04-20 13:21:26
 */

import _ from 'lodash';

import { culAttackWidth, getEnemies, getSkillDamages } from './../utils';

/**
 * @description: 卡莎的英雄技能
 * 内容：卡莎朝附近的敌人们发射导弹，每颗造成魔法伤害
 * 导弹数: 6 / 8 / 12
 * 难点在计算导弹的平摊到每个target上的个数，此处先算出每个敌军应到的平均导弹个数
 * 之后判断是否有余数，在循环敌军的时候有余数就在自己的导弹个数上+1，同时导弹剩余个数-1
 * 以此类推，直到导弹余数为0。
 * PS：若敌军个数多余导弹个数，则只取与导弹个数相同的敌军作为目标
 * PS：导弹的默认伤害为50
 * @param {object} hero 释放技能的英雄-德莱厄斯
 * @param {object[]} allHeroes 所有英雄
 * @return {object} 格式参见4.js
 */
export default (hero, allHeroes) => {
  const missileNum = +getSkillDamages(hero);
  const missileDamage = 50;
  const enemies = getEnemies(hero, allHeroes);
  const skillRange = culAttackWidth(hero.locationId, 3, 49);
  let targetHeroes = _.filter(enemies, enemy => _.indexOf(skillRange, enemy.locationId) >= 0);
  
  if (targetHeroes.length === 0) {
    return null;
  }

  if (targetHeroes.length > missileNum) {
    targetHeroes = _.sampleSize(targetHeroes, missileNum);
  }

  const avgMissiles = parseInt(missileNum / targetHeroes.length);
  let leftMissiles = missileNum % targetHeroes.length;
  targetHeroes = _.map(targetHeroes, (target) => {
    let getMissiles = avgMissiles;
    if (leftMissiles > 0) {
      getMissiles += 1;
      leftMissiles -= 1;
    }
    return {
      ...target,
      getMissiles
    }
  })

  return {
    timeLeft: 0,
    effect: _.map(targetHeroes, target => ({
      target: _.omit(target, 'getMissiles'),
      damage: missileDamage * target.getMissiles
    }))
  }

}