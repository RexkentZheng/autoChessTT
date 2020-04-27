/**
 * @Description: 英雄技能-蒸汽机器人-布里茨-blitzcrank-53
 * @Author: Rex Zheng
 * @Date: 2020-04-17 10:45:11
 * @LastEditor: Rex Zheng
 * @LastEditTime: 2020-04-17 14:31:01
 */

import _ from 'lodash';

import { calLength, culAttackWidth, getLocationFuc, getSkillDamages } from './../utils';

const getMoveLocation = (hero, allHeroes, rangeNum = 1) => {
  let heroAroundIds = culAttackWidth(hero.locationId, rangeNum, 49);
  _.map(_.compact(allHeroes), (heroItem) => {
    if (_.indexOf(heroAroundIds, heroItem.locationId) >= 0) {
      heroAroundIds = _.filter(heroAroundIds, id => id !== heroItem.locationId);
    }
  })
  if (heroAroundIds === 0) {
    return getMoveLocation(hero, allHeroes, rangeNum + 1);
  }
  return _.sample(heroAroundIds)
}

/**
 * @description: 机器的英雄技能
 * 内容：布里茨将距离最远的敌人拉拽到他身边，造成魔法伤害和晕眩效果。他在拉拽后的下一次攻击会击飞目标1秒。距离内的友军将优先攻击布里茨的目标
 * 技能伤害: 250 / 350 / 800
 * PS：首先将眩晕和击飞记为1S，所有会有2S的控制时间；目前结构有限，所以无法控制别的友军来攻击
 * 首先就是找到最远的敌人，之后判断机器人身边有无空位，有空位随便选取一个空位，没有空位扩大范围继续寻找，找到位置
 * @param {object} hero 释放技能的英雄-蒸汽机器人
 * @param {object[]} allHeroes 所有英雄
 * @param {object} paramTargetHero 目标英雄
 * @return {object} 格式参见4.js
 */
export default (hero, allHeroes) => {
  const damage = +getSkillDamages(hero);
  const enemies = _.filter(_.compact(allHeroes), (item) => item.role !== hero.role);

  let targetInfo = {
    distance: 0,
    hero: null
  }

  const { x: ox, y: oy } = getLocationFuc(hero.locationId);

  _.map(enemies, (item) => {
    const { x, y } = getLocationFuc(item.locationId);
    const tmpDistance = calLength(ox, oy, x, y);
    if (tmpDistance > targetInfo.distance) {
      targetInfo = {
        distance: tmpDistance,
        hero: item
      }
    }
  });

  if (!targetInfo.hero) {
    return null;
  }

  const moveLocation = getMoveLocation(hero, allHeroes);

  return {
    timeLeft: 0,
    effect: [{
      target: targetInfo.hero,
      ctrl: 2,
      damage,
      moveLocation
    }]
  }
}