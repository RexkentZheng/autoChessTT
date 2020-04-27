/**
 * @Description: 英雄技能-虚空行者-卡萨丁-kassadin-38
 * @Author: Rex Zheng
 * @Date: 2020-04-20 17:53:27
 * @LastEditor: Rex Zheng
 * @LastEditTime: 2020-04-27 15:38:43
 */

import _ from 'lodash';

import { calLength, culAttackWidth, getLocationFuc, getTargetHero } from './../utils';

/**
 * @description: 卡萨丁的英雄技能-能量脉冲
 * 内容：卡萨丁朝他前方放出一道能量波，造成魔法伤害并使命中的所有目标造成缴械效果
 * 伤害: 250 / 400 / 800
 * 缴械持续时间: 2.5 / 3 / 3.5
 * 能量波的形式和安妮类似，一个锥形范围
 * @param {object} hero 释放技能的英雄-虚空行者
 * @param {object[]} allHeroes 所有英雄
 * @param {object} paramTargetHero 目标英雄
 * @return {object} 格式参见4.js
 */
export default (hero, allHeroes, paramTargetHero) => {
  const allSkillInfo = hero.skillDetail.split(/\r\n|[\r\n]/)
  const damage = +allSkillInfo[1].match(/\d+.+/)[0].split(' / ')[hero.grade - 1];
  const disarmTime = +allSkillInfo[2].match(/\d+.+/)[0].split(' / ')[hero.grade - 1];

  const enemies = _.filter(_.compact(allHeroes), (item) => item.role !== hero.role);
  const rangeIds = culAttackWidth(hero.locationId, +hero.attackRange, 49);
  const targetHero = paramTargetHero || getTargetHero(_.compact(allHeroes), hero, rangeIds);

  // 下面的数据是比间距大0.1的数值，方便进行比较
  const [distanceOne, distanceTwo] = [3.47, 6.94];

  if (targetHero) {
    const { x: tx, y: ty } = getLocationFuc(targetHero.locationId);
    const { x: ox, y: oy } = getLocationFuc(hero.locationId);

    const targetHeros = _.compact(_.map(enemies, (enemy) => {
      const { x, y } = getLocationFuc(enemy.locationId);
      const distanceToTarget = +calLength(x, y, tx, ty).toFixed(2);
      const distanceToOrigin = +calLength(x, y, ox, oy).toFixed(2);
      const xo = Math.sqrt((Math.pow(Math.abs(x - ox), 2) + Math.pow(Math.abs(y - oy), 2)));
      const xt = Math.sqrt((Math.pow(Math.abs(x - tx), 2) + Math.pow(Math.abs(y - ty), 2)));
      const ot = Math.sqrt((Math.pow(Math.abs(ox - tx), 2) + Math.pow(Math.abs(oy - ty), 2)));
      const res = Math.acos((xo * xo + ot * ot - xt * xt) / (2 * xo * ot));
      const angle = res * 180 / Math.PI;
      if ((distanceToTarget < distanceOne) &&
        (distanceToOrigin < distanceTwo) &&
        (parseInt(angle) < 33)
      ) {
        return enemy;
      }
      return null;
    }));

    return {
      timeLeft: 0,
      effect: _.map(targetHeros, (target) => ({
        target,
        damage,
        disarm: disarmTime
      }))
    };
  } else {
    return null;
  }
}