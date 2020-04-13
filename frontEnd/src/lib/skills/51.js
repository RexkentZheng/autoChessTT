/**
 * @Description: 英雄技能-皮城女警-凯特琳-caitlyn-51
 * @Author: Rex Zheng <rex.zheng@nequal.com>
 * @Date: 2020-04-13 15:20:51
 * @LastEditor: Rex Zheng <rex.zheng@nequal.com>
 * @LastEditTime: 2020-04-13 16:04:09
 */
import _ from 'lodash';

import { calLength, getLocationFuc, getSkillDamages } from './../utils';

/**
 * @description: 女警的技能方法
 * 内容：凯特琳对距离最远的敌人进行瞄准，然后对其发射一颗致命的子弹。子弹会在命中第一个敌人时造成魔法伤害。
 * 这个技能是有CD的，目前假设CD为3秒
 * 首先这个方法会被调用两次，第一次是在一开始释放技能时，找到距离最远的英雄作为目标即可
 * 第二次调用时在CD时间到的时候，看看有没有人会挡到目标英雄，挡道就会选择最近的抵挡英雄作为目标
 * @param {object} hero 释放技能的英雄-卡牌大师
 * @param {object[]} allHeroes 所有英雄
 * @param {object} paramTargetHero 目标英雄
 * @param {boolean} updateHero 是否是第二次调用
 * @return: 格式参见4.js
 */
export default (hero, allHeroes, paramTargetHero, updateHero) => {
  const damage = +getSkillDamages(hero)[hero.grade - 1];
  const enemies = _.filter(_.compact(allHeroes), (item) => item.role !== hero.role);

  let targetInfo = {
    distance: 0,
    hero: null,
  }

  const { x: ox, y: oy } = getLocationFuc(hero.locationId);

  if (updateHero) {
    const { x: tx, y: ty } = getLocationFuc(paramTargetHero.locationId);
    targetInfo = {
      distance: parseInt(calLength(ox, oy, tx, ty)),
      hero: paramTargetHero
    }
    _.map(enemies, (item) => {
      const {x, y} = getLocationFuc(item.locationId);
      const tmpDistance = parseInt(calLength(x, y, ox, oy));
      if (
        (parseInt(x / ox) === parseInt(tx / ox) && parseInt(y / oy) === parseInt(ty / oy)) &&
        (tmpDistance < targetInfo.distance) &&
        (x > ox === tx > ox && y > oy === ty > oy)
      ) {
        targetInfo = {
          distance: tmpDistance,
          hero: item
        };
      }
    })
  } else {
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
  }

  return {
    timeLeft: 3,
    effect: [{
      target: targetInfo.hero,
      damage,
      blind: 0,
      ctrl: 0,
      buffs: null,
      nerfs: null
    }]
  }

}