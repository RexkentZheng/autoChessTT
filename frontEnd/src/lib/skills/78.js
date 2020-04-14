/**
 * @Description: 英雄技能-圣锤之毅-波比-poppy-78
 * @Author: Rex Zheng
 * @Date: 2020-04-14 12:51:07
 * @LastEditor: Rex Zheng
 * @LastEditTime: 2020-04-14 13:14:36
 */

import _ from 'lodash';

import { calLength, getLocationFuc } from './../utils';

/**
 * @description: 波比的技能方法
 * 内容：波比朝距离最远的敌人投掷她的标枪，造成魔法伤害。圆盾随后会折返至波比处，为她提供护盾值
 * 伤害：100 / 175 / 300
 * 护盾值：200 / 350 / 600'
 * 主要是有两个目标，一个是地方目标，取最远的即可
 * 另外就是自己了，给自己加上护盾即可
 * @param {object} hero 释放技能的英雄-圣锤之毅
 * @param {object[]} allHeroes 所有英雄
 * @return: 格式参见4.js
 */
export default (hero, allHeroes) => {
  const allSkillInfo = hero.skillDetail.split(/\r\n|[\r\n]/)
  const damage = allSkillInfo[1].match(/\d+.+/)[0].split(' / ')[hero.grade - 1];
  const shield = allSkillInfo[2].match(/\d+.+/)[0].split(' / ')[hero.grade - 1];
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
  })
  
  return {
    timeLeft: 0,
    effect: [{
      target: hero,
      damage: 0,
      ctrl: 0,
      blind: 0,
      buffs: {
        shield
      },
      nerfs: null
    }, {
      target: targetInfo.hero,
      damage,
      ctrl: 0,
      blind: 0,
      buffs: null,
      nerfs: null
    }]
  }

}