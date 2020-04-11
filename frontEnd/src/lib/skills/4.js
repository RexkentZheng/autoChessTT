/**
 * @Description: 英雄技能-卡牌大师-崔斯特-4
 * @Author: Rex Zheng
 * @Date: 2020-04-06 21:42:05
 * @LastEditor: Rex Zheng 
 * @LastEditTime: 2020-04-11 11:26:21
 */

import _ from 'lodash';

import { culAttackWidth, getLocationFuc, getSkillDamages, getTargetHero } from './../utils';

/**
 * @description: 卡牌的技能方法
 * 内容：崔斯特沿锥形掷出三张牌，对沿途的每个敌人造成魔法伤害。
 * 这里的三张牌我们假定为33度角为标准，也就是三条线中间相邻两条的夹角为33度
 * 首先我们拿到目标英雄，以目标英雄为基准，也就是中间的那条线，之后查找剩余的对手英雄，
 * 依次进行匹配计算，符合夹角为33度的即可划入目标英雄
 * 那如何计算夹角为33度呢？
 * 这时就用到了三角形内角的计算方法，先获取到三个英雄的位置（目标英雄，释放技能英雄，等待判断英雄）
 * 根据其在平面直角坐标系中的位置，获取到三角形三边的长度，再根据计算弧度的方法  (a² + b² - c²)/ (2 * a * b)得出我们需要比例
 * 使用Math.acos，也就是arccos来计算出弧度，之后将弧度转换为角度即可完成计算。
 * @param {object} hero 释放技能的英雄-卡牌大师  
 * @param {object[]} allHeroes 所有英雄
 * @param {object} paramTargetHero 目标英雄
 * @return {object} 格式如下：
 * skill: {
 *  timeLeft: 0,
 *  effect: [{
 *    target: army21,
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
  const rangeIds = culAttackWidth(hero.locationId, +hero.attackRange, 49);
  const targetHero = paramTargetHero || getTargetHero(_.compact(allHeroes), hero, rangeIds);

  if (targetHero) {
    const { x: tx, y: ty } = getLocationFuc(targetHero.locationId);
    const { x: ox, y: oy } = getLocationFuc(hero.locationId);

    const targetHeros = _.map(allHeroes, (heroItem) => {
      if (heroItem && hero.role !== heroItem.role) {
        const {x, y} = getLocationFuc(heroItem.locationId);
        if (
          ((tx > ox === x > ox) && ( ty > oy === y > oy)) ||
          (tx === ox && (ty > oy) === (y > oy)) ||
          (ty === oy && (tx > ox) === (x > ox))
        ) {
          const xo = Math.sqrt((Math.pow(Math.abs(x - ox), 2) + Math.pow(Math.abs(y - oy), 2)));
          const xt = Math.sqrt((Math.pow(Math.abs(x - tx), 2) + Math.pow(Math.abs(y - ty), 2)));
          const ot = Math.sqrt((Math.pow(Math.abs(ox - tx), 2) + Math.pow(Math.abs(oy - ty), 2)));
          const res = Math.acos((xo * xo + ot * ot - xt * xt) / (2 * xo * ot));
          const angle = res * 180 / Math.PI;
          console.log(angle)
          if (parseInt(angle) === 33) {
            return heroItem;
          }
          return null;
        }
        return null;
      }
      return null;
    })

    const effect =  _.map(_.compact(targetHeros).concat(targetHero), (item) => ({
      target: item.uniqId,
      damage,
      blind: 0,
      ctrl: 0,
      buffs: null,
      nerfs: null,
    }))

    return {
      timeLeft: 0,
      effect
    }
  } else {
    return null;
  }
}
