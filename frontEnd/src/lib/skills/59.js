/**
 * @Description: 英雄技能-德玛西亚皇子-嘉文四世-jarvan-59
 * @Author: Rex Zheng
 * @Date: 2020-04-14 13:16:45
 * @LastEditor: Rex Zheng
 * @LastEditTime: 2020-04-14 13:51:31
 */

import _ from 'lodash';

import { culAttackWidth, getSkillDamages } from './../utils';

export default (hero, allHeroes, paramTargetHero = null) => {
  const buffPercent = getSkillDamages(hero).replace('%', '') / 100;

  const targetHero = paramTargetHero || getTargetHero(_.compact(allHeroes), hero);

  if (!targetHero) {
    return null;
  }

  const aoeIds = culAttackWidth(targetHero.locationId, 2, 49);

  const targetHeroes = _.map(allHeroes, (heroItem) => {
    if (heroItem) {
      if (_.indexOf(aoeIds, +heroItem.locationId) >= 0 && heroItem.role === hero.role) {
        return heroItem;
      }
      return null;
    }
    return null;
  })

  return {
    timeLeft: 0,
    effect: _.map(targetHeroes, (item) => ({
      target: item,
      damage: 0,
      buffs: {
        time: 6,
        attackSpeed: buffPercent
      },
      nerfs: null
    }))
  }

}