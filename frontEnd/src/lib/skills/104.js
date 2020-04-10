/**
 * @Description: 英雄技能-法外狂徒-格雷福斯-104
 * @Author: Rex Zheng
 * @Date: 2020-04-08 17:56:52
 * @LastEditor: Rex Zheng
 * @LastEditTime: 2020-04-10 13:27:16
 */

import _ from 'lodash';

import { culAttackWidth, getLocationFuc, getSkillDamages, getTargetHero } from './../utils';

const calLength = (x, y, x1, y1) => {
  return Math.sqrt((Math.pow(Math.abs(x - x1), 2) + Math.pow(Math.abs(y - y1), 2)))
}

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
        target: targetItem.chessId,
        role: targetItem.role,
        damage,
        blind: 4,
        ctrl: 0,
        buffs: null,
        nerfs: null,
      }))
    }

  }

}