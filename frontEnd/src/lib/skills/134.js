/**
 * @Description: 英雄技能-暗黑元首-辛德拉-syndra-134
 * @Author: Rex Zheng
 * @Date: 2020-04-28 17:23:15
 * @LastEditor: Rex Zheng
 * @LastEditTime: 2020-04-28 18:23:29
 */

import _ from 'lodash';

import { getEnemies, getSkillDamages } from './../utils';

/**
 * @description: 球女的英雄技能——能量倾泻
 * 内容：辛德拉聚集棋盘上的所有法球并创造3颗新的法球，随后将它们朝着拥有最高生命值的敌人发射，每颗法球造成魔法伤害
 * 每颗伤害: 80 / 120 / 200
 * 释放完技能后记得更新balls属性
 * @param {object} hero 释放技能的英雄-暗黑元首
 * @param {object[]} allHeroes 所有英雄
 * @return {object} 格式参见4.js
 */
export default (hero, allHeroes) => {
  const singleDamage = +getSkillDamages(hero);
  const enemies = getEnemies(hero, allHeroes);
  const balls = (hero.balls || 0) + 3;
  
  if (enemies.length === 0) {
    return null;
  }

  const target = _.sortBy(enemies, 'leftLife')[0];

  return {
    timeLeft: 0,
    balls,
    effect: [{
      target,
      damage: balls * singleDamage
    }]
  }

}