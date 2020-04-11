/**
 * @Description: 英雄技能-法外狂徒-格雷福斯-104
 * @Author: Rex Zheng
 * @Date: 2020-04-08 17:56:52
 * @LastEditor: Rex Zheng
 * @LastEditTime: 2020-04-11 11:26:14
 */

import _ from 'lodash';

import { calLength, culAttackWidth, getLocationFuc, getSkillDamages } from './../utils';

/**
 * @description: 男枪的技能方法
 * 内容：雷福斯朝着攻击速度最快的敌人发射出一颗烟幕弹，在命中第一个敌人时爆炸，对一个区域的敌人造成魔法伤害并使他们的攻击无法命中，持续4秒。
 * 这里分为两部分，首先主目标，根据敌方英雄的攻速来决定，其次再加上主目标周围是否有地方英雄，有的话就加上
 * 确定了目标之后添加伤害计算和致盲效果即可
 * @param {object} hero 释放技能的英雄-法外狂徒 
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
  const enemies = _.filter(_.compact(allHeroes), (item) => item.role !== hero.role);
  let targetHero = _.sortBy(enemies, (item) => -+item.attackSpeed)[0];

  if (targetHero) {
    const { x: tx, y: ty } = getLocationFuc(targetHero.locationId);
    const { x: ox, y: oy } = getLocationFuc(hero.locationId);

    _.map(enemies, (heroItem) => {
      const {x, y} = getLocationFuc(heroItem.locationId);
      if (
        (x / ox === tx / ox && y / oy === ty / oy) &&
        (calLength(x, y, ox, oy) < calLength(tx, ty, ox, oy)) &&
        (x > ox === tx > ox && y > oy === ty > oy)
      ) {
        targetHero = heroItem;
      }
    })

    const aoeIds = culAttackWidth(targetHero.locationId, 1, 49);
    console.log(aoeIds)
    const targetHeroes = _.map(enemies, (heroItem) => {
      if (_.indexOf(aoeIds, +heroItem.locationId) >= 0) {
        return heroItem;
      }
      return null;
    })

    console.log(targetHeroes)

    return {
      timeLeft: 0,
      effect: _.map(_.compact(targetHeroes), (targetItem) => ({
        target: targetItem.uniqId,
        damage,
        blind: 4,
        ctrl: 0,
        buffs: null,
        nerfs: null,
      }))
    }

  }

}