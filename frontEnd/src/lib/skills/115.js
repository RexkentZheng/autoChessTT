/**
 * @Description: 英雄技能-爆破鬼才-吉格斯-115
 * @Author: Rex Zheng
 * @Date: 2020-04-10 15:20:03
 * @LastEditor: Rex Zheng
 * @LastEditTime: 2020-04-10 16:13:45
 */

import _ from 'lodash';

import { calLength, getLocationFuc, getSkillDamages } from './../utils';

/**
 * @description: 炸弹人的技能方法
 * 内容：吉格斯朝距离最近的敌人扔出一个爆炸电荷，电荷可以引爆，对爆炸格内的所有敌人造成魔法伤害和击退效果，并且如果吉格斯在爆炸半径内，则将其击退。
 * 注意：当前未考虑击飞炸弹人自己的问题
 * 利用getLocationFuc方法获取英雄的位置，然后计算出英雄之间的距离，取距离最近的英雄
 * 之后算下伤害返回即可。
 * @param {object} hero 释放技能的英雄-爆破鬼才 
 * @param {object[]} allHeroes 所有英雄
 * @param {object} paramTargetHero 目标英雄
 * @return {object} 格式如下：
 * skill: {
 *  timeLeft: 0,
 *  effect: [{
 *    target: 21,
 *    role: 'enemy'
 *    damage: 300,
 *    pause: 3,
 *    buff: {
 *      attack: 32
 *    }
 *    debuff: {
 *      attack: -32
 *    },
 *  }]
 *}
 */
export default (hero, allHeroes, paramTargetHero = null) => {
  const damage = +getSkillDamages(hero)[hero.grade - 1];
  const enemies = _.filter(_.compact(allHeroes), (item) => item.role !== hero.role);

  let targetInfo = {
    distance: 0,
    hero: {}
  }
  
  const { x: ox, y: oy } = getLocationFuc(hero.locationId);

  _.map(enemies, (item) => {
    const { x, y } = getLocationFuc(item.locationId);
    const tmpDistance = calLength(ox, oy, x, y);
    if (tmpDistance < targetInfo.distance || targetInfo.distance === 0) {
      targetInfo = {
        distance: tmpDistance,
        hero: item
      }
    }
  })

  return {
    timeLeft: 0,
    effect: [{
      target: targetInfo.hero.chessId,
      role:  targetInfo.hero.role,
      damage,
      blind: 0,
      ctrl: 0,
      buffs: null,
      nerfs: null,
    }]
  }

}