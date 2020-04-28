/**
 * @Description: 英雄技能-机械公敌-兰博-rumble-68
 * @Author: Rex Zheng
 * @Date: 2020-04-28 11:15:15
 * @LastEditor: Rex Zheng
 * @LastEditTime: 2020-04-28 14:09:29
 */

import _ from 'lodash';

import { calLength, culAttackWidth, getLocationFuc, getSkillDamages, getTargetHero } from './../utils';

/**
 * @description: 兰博的英雄技能——纵火盛宴
 * 内容：兰博朝锥形范围内的敌人放火，在3秒里持续造成共魔法伤害，并使他们所受的治疗效果降低80%，持续5秒
 * 伤害: 250 / 400 / 800'
 * 锥形范围同安妮类似
 * Todo：为了方便开发，没有增加减治疗的nerfs
 * @param {object} hero 释放技能的英雄-机械公敌
 * @param {object[]} allHeroes 所有英雄
 * @param {object} paramTargetHero 目标英雄
 * @return {object} 格式参见4.js
 */
export default (hero, allHeroes, paramTargetHero = null, updateHero) => {
  const damage = +getSkillDamages(hero) / 3;
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
      timeLasting: updateHero ? hero.timeLasting : 3,
      effect: _.map(targetHeros, (target) => ({
        target,
        damage
      }))
    }
  } else {
    return null;
  }

}
