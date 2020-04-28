/**
 * @Description: 英雄技能-皮城执法官-蔚-vi-254
 * @Author: Rex Zheng
 * @Date: 2020-04-28 11:15:15
 * @LastEditor: Rex Zheng
 * @LastEditTime: 2020-04-28 17:09:29
 */

import _ from 'lodash';

import {
  calSlope,
  culAttackWidth,
  getAwayEnemy,
  getLocationFuc
} from './../utils';

const getMoveLocation = (hero, allHeroes, rangeNum = 1) => {
  let heroAroundIds = culAttackWidth(hero.locationId, rangeNum, 49);
  _.map(_.compact(allHeroes), (heroItem) => {
    if (_.indexOf(heroAroundIds, heroItem.locationId) >= 0) {
      heroAroundIds = _.filter(heroAroundIds, id => id !== heroItem.locationId);
    }
  })
  if (heroAroundIds === 0) {
    return getMoveLocation(hero, allHeroes, rangeNum + 1);
  }
  return _.sample(heroAroundIds)
}

/**
 * @description: 蔚的英雄技能——天霸横空烈轰
 * 内容：蔚冲向距离最远的敌人，震开沿途的敌人并对他们造成魔法伤害。当她接触到她的目标时，会对其造成魔法伤害并将其击飞数秒
 * 伤害: 450 / 650 / 1300
 * 沿途伤害: 150 / 200 / 500
 * 击飞眩晕时间: 2 / 2.5 / 3
 * 因为没法计算移动的时间，所以给一个1s的前摇
 * @param {object} hero 释放技能的英雄-皮城执法官
 * @param {object[]} allHeroes 所有英雄
 * @return {object} 格式参见4.js
 */
export default (hero, allHeroes) => {
  const allSkillInfo = hero.skillDetail.split(/\r\n|[\r\n]/)
  const damage = +allSkillInfo[1].match(/\d+.+/)[0].split(' / ')[hero.grade - 1];
  const sideDamage = +allSkillInfo[2].match(/\d+.+/)[0].split(' / ')[hero.grade - 1];
  const ctrl = +allSkillInfo[3].match(/\d+.+/)[0].split(' / ')[hero.grade - 1];
  const targetHero = getAwayEnemy(hero, allHeroes, 'far');
  const enemies = _.filter(_.compact(allHeroes), (item) => item.role !== hero.role);

  if (!targetHero) {
    return null;
  }

  const { x: ox, y: oy } = getLocationFuc(hero.locationId);
  const { x: tx, y: ty } = getLocationFuc(targetHero.locationId);
  const originSlope = calSlope(tx, ty, ox, oy);

  const targetHeros = _.compact(_.map(enemies, (enemy) => {
    const {x, y} = getLocationFuc(enemy.locationId);
    const newSlope = calSlope(x, y, ox, oy);
    if ((x > ox === tx > ox) &&
      (y > oy === ty > oy) &&
      (originSlope === newSlope) &&
      (enemy.uniqId !== targetHero.uniqId)
    ) {
      return enemy;
    }
    return null;
  }))

  const moveLocation = getMoveLocation(targetHero, allHeroes);

  return {
    timeLeft: 2,
    effect: [{
      target: hero,
      moveLocation
    }, {
      target: targetHero,
      damage,
      ctrl
    }].concat(_.map(targetHeros, target => ({
      target,
      damage: sideDamage
    })))
  }

}