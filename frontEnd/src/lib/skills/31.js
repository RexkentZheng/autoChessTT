/**
 * @Description: 英雄技能-虚空恐惧-科加斯-chogath-31
 * @Author: Rex Zheng
 * @Date: 2020-05-05 11:03:36
 * @LastEditor: Rex Zheng
 * @LastEditTime: 2020-05-05 11:12:38
 */

import _ from 'lodash';

import { culAttackWidth, getEnemies } from './../utils';

/**
 * @description: 大虫子的英雄技能-碎裂
 * 内容：科加斯碎裂一个大型区域，造成魔法伤害并将区域内的所有敌人击飞
 * 技能伤害: 150 / 225 / 1500
 * 击飞持续时间: 2 / 2 / 4
 * 区域范围默认为随机敌人半径为3的圆形
 * 由于时按照范围进行输出，所以不制定目标英雄，改为指定目标地域（locationId）
 * @param {object} hero 释放技能的英雄-虚空恐惧
 * @param {object[]} allHeroes 所有英雄
 * @return {object} 格式参见4.js
 */
export default (hero, allHeroes) => {
  const allSkillInfo = hero.skillDetail.split(/\r\n|[\r\n]/)
  const damage = +allSkillInfo[1].match(/\d+.+/)[0].split(' / ')[hero.grade - 1];
  const ctrl = +allSkillInfo[2].match(/\d+.+/)[0].split(' / ')[hero.grade - 1];

  const enemies = getEnemies(hero, allHeroes);

  if (enemies.length === 0) {
    return null;
  }

  const targetHero = _.sample(enemies);
  const aoeIds = culAttackWidth(targetHero.locationId, 3, 49);

  return {
    timeLeft: 3,
    effect: _.map(aoeIds, locationId => ({
      target: `location:${locationId}`,
      damage,
      ctrl
    }))
  }
}