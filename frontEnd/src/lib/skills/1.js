/**
 * @Description: 英雄技能-黑暗之女-安妮-annie-1
 * @Author: Rex Zheng
 * @Date: 2020-04-16 15:50:46
 * @LastEditor: Rex Zheng
 * @LastEditTime: 2020-04-16 17:38:43
 */

import _ from 'lodash';

import { calLength, culAttackWidth, getLocationFuc, getSkillDamages } from './../utils';

/**
 * @description: 安妮的英雄技能
 * 内容：安妮为她自己提供一层生命值的护盾，并迸发出一道锥形的火焰，对命中的所有目标造成魔法伤害。
 * 伤害数值： 150 / 200 / 350
 * 护盾数值：300 / 400 / 700
 * 安妮的技能是一个锥形，是一片范围型技能，那么重点就是范围的计算
 * 首先我们确定攻击的主体目标，那么其余的目标就需要满足三个条件
 * 1. 其到安妮的距离必须小于2格，也就是坐标系中的距离必须小于6.49
 * 2. 其到主体目标的距离应该是小于1格距离的，也就是3.47
 * 3. 其和主体目标和安妮三者形成的夹角必须小于33度
 * 由此可得到锥形范围内所有受到伤害的英雄，之后计算伤害即可
 * @param {object} hero 释放技能的英雄-黑暗之女
 * @param {object[]} allHeroes 所有英雄
 * @param {object} paramTargetHero 目标英雄
 * @return {object} 格式参见4.js
 */
export default (hero, allHeroes, paramTargetHero = null) => {
  const allSkillInfo = hero.skillDetail.split(/\r\n|[\r\n]/)
  const damage = +allSkillInfo[1].match(/\d+.+/)[0].split(' / ')[hero.grade - 1];
  const shield = +allSkillInfo[2].match(/\d+.+/)[0].split(' / ')[hero.grade - 1];
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
      effect: [{
        target: hero,
        shield,
        buffs: null,
        nerfs: null
      }].concat(_.map(targetHeros, (target) => ({
        target,
        damage,
        buffs: null,
        nerfs: null
      })))
    }
  } else {
    return null;
  }

}