/**
 * @Description: 英雄技能-铁铠冥魂-莫德凯撒-mordekaiser-82
 * @Author: Rex Zheng
 * @Date: 2020-04-17 14:28:53
 * @LastEditor: Rex Zheng
 * @LastEditTime: 2020-04-17 16:13:22
 */

import _ from 'lodash';

import { culAttackWidth } from './../utils';

/**
 * @description: 铁男的英雄技能
 * 内容：莫德凯撒获得一层生命值的护盾。在护盾存在时，莫德凯撒每秒对所有附近的敌人造成魔法伤害
 * 伤害量每级：50/75/125
 * 护盾值每级：400/600/1000
 * 目标英雄判定不是主要问题，比较简单，问题是技能的二次以及三次释放会是一些问题，根据updateHero来判断是否N次释放
 * @param {object} hero 释放技能的英雄-铁铠冥魂
 * @param {object[]} allHeroes 所有英雄
 * @param {object} paramTargetHero 目标英雄
 * @param {boolean} updateHero 是否再次释放
 * @return {object} 格式参见4.js
 */
export default (hero, allHeroes, paramTargetHero, updateHero) => {
  const allSkillInfo = hero.skillDetail.split(/\r\n|[\r\n]/)
  const damage = +allSkillInfo[1].match(/\d+.+/)[0].split('/')[hero.grade - 1];
  const shield = +allSkillInfo[2].match(/\d+.+/)[0].split('/')[hero.grade - 1];
  const enemies = _.filter(_.compact(allHeroes), (item) => item.role !== hero.role);
  const damageRange = culAttackWidth(hero.locationId, 1, 49);
  const targetHeros = _.compact(_.map(enemies, (enemy) => {
    if (_.indexOf(damageRange, enemy.locationId) >= 0) {
      return enemy;
    }
    return null;
  }));;

  if (updateHero) {
    if (hero.shield > 0) {
      return {
        timeLeft: 0,
        effect: _.map(targetHeros, (target) => ({
          target,
          damage
        }))
      }
    }
    return null
  }
  return {
    timeLeft: 0,
    effect: [{
      target: hero,
      shield
    }].concat(_.map(targetHeros, (target) => ({
      target,
      damage
    })))
  }

}