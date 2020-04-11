/**
 * @Description: 英雄技能-无双剑姬-菲奥娜-114
 * @Author: Rex Zheng
 * @Date: 2020-04-10 17:14:12
 * @LastEditor: Rex Zheng
 * @LastEditTime: 2020-04-11 17:33:24
 */
import _ from 'lodash';

import { culAttackWidth, getSkillDamages, getTargetHero } from './../utils';

export default (hero, allHeroes, paramTargetHero = null) => {
  const damage = +getSkillDamages(hero)[hero.grade - 1];
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