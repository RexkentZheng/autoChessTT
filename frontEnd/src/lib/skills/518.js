/**
 * @Description: 英雄技能-万花通灵-妮蔻-neeko-518
 * @Author: Rex Zheng
 * @Date: 2020-04-21 15:13:17
 * @LastEditor: Rex Zheng
 * @LastEditTime: 2020-04-21 15:24:13
 */

import _ from 'lodash';

import { culAttackWidth, getEnemies } from './../utils';

/**
 * @description: 妮蔻的英雄技能
 * 内容：妮蔻跃到空中，然后猛落至地面，对所有附近的敌人造成魔法伤害和秒晕眩效果
 * 伤害：100 / 150 / 250
 * 眩晕时长：1.5 / 2 / 2.5
 * PS：伤害范围默认为2格
 * @param {object} hero 释放技能的英雄-万花通灵
 * @param {object[]} allHeroes 所有英雄
 * @return {object} 格式参见4.js
 */
export default (hero, allHeroes) => {
  const allSkillInfo = hero.skillDetail.split(/\r\n|[\r\n]/)
  const damage = +allSkillInfo[1].match(/\d+.+/)[0].split(' / ')[hero.grade - 1];
  const ctrl = +allSkillInfo[2].match(/\d+.+/)[0].split(' / ')[hero.grade - 1];
  const enemies = getEnemies(hero, allHeroes);

  const aoeRanges = culAttackWidth(hero.locationId, 2, 49);

  const targetHeroes = _.compact(_.map(enemies, enemy =>
    _.indexOf(aoeRanges, enemy.locationId) >= 0 ? enemy : null
  ));

  return {
    timeLeft: 2,
    effect: _.map(targetHeroes, target => ({
      target,
      damage,
      ctrl
    }))
  }
}