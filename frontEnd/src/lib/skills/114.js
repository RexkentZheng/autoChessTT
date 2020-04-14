/**
 * @Description: 英雄技能-无双剑姬-菲奥娜-114
 * @Author: Rex Zheng
 * @Date: 2020-04-10 17:14:12
 * @LastEditor: Rex Zheng
 * @LastEditTime: 2020-04-13 11:37:01
 */
import _ from 'lodash';

import { culAttackWidth, getSkillDamages, getTargetHero } from './../utils';

/**
 * @description: 剑姬的技能方法
 * 内容：菲奥娜进入一种防御姿态，持续1.5秒，期间免疫伤害和敌人的技能效果。在她离开这个姿态时，她会进行回击，对一名附近的敌人造成伤害并使其晕眩1.5秒
 * 主要就是在于这1.5秒的无敌，于是在返回里面多增加了一个status属性，invincible代表无敌
 * 之后就是目标英雄的选定也是问题，因为别的英雄的目标是一个英雄，而她的是一个位置，所以给target增加了另外一种情况
 * 如果目标是格子就用 location:位置 表明英雄所在位置，之后battleStore再进行解析
 * 其他的就正常操作了，没啥了
 * @param {object} hero 释放技能的英雄-无双剑姬
 * @param {object[]} allHeroes 所有英雄
 * @param {object} paramTargetHero 目标英雄
 * @return {object} 格式参见4.js
 */
export default (hero, allHeroes, paramTargetHero = null) => {
  const damage = +getSkillDamages(hero);
  const rangeIds = culAttackWidth(hero.locationId, +hero.attackRange, 49);

  const targetHero = paramTargetHero || getTargetHero(_.compact(allHeroes), hero, rangeIds);

  if (!targetHero) {
    return null;
  }

  return {
    timeLeft: 1.5,
    status: 'invincible',
    effect: [{
      target: `location:${targetHero.locationId}`,
      damage,
      ctrl: 1.5,
      blind: 0,
      buffs: null,
      nerfs: null
    }]
  }
}