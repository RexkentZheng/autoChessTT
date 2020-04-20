/**
 * @Description: 英雄技能-诺克萨斯之手-德莱厄斯-darius-122
 * @Author: Rex Zheng
 * @Date: 2020-04-20 10:53:39
 * @LastEditor: Rex Zheng
 * @LastEditTime: 2020-04-20 11:22:27
 */

import _ from 'lodash';

import { culAttackWidth, getSkillDamages, getTargetHero } from './../utils';

/**
 * @description: 诺手的英雄技能
 * 内容：德莱厄斯暴扣一名敌人，造成魔法伤害。如果这个技能击杀了目标，那么德莱厄斯会立刻再次施放它。生命值在50%以下的目标会受到双倍伤害
 * 技能伤害: 300 / 425 / 700
 * 技能内容无需多言，利用timeLasting属性来判断是否需要二次释放即可
 * @param {object} hero 释放技能的英雄-德莱厄斯
 * @param {object[]} allHeroes 所有英雄
 * @param {object} paramTargetHero 目标英雄
 * @param {boolean} updateHero 是否再次释放
 * @return {object} 格式参见4.js
 */
export default (hero, allHeroes, paramTargetHero) => {
  const damage = +getSkillDamages(hero);
  const rangeIds = culAttackWidth(hero.locationId, 9, 49);
  const targetHero = paramTargetHero || getTargetHero(_.compact(allHeroes), hero, rangeIds);

  if (!targetHero) {
    return null;
  }

  const isDoubleDamage = +targetHero.leftLife < +targetHero.lifeData.split('/')[targetHero.grade - 1] / 2;

  const realDamage = isDoubleDamage ? damage * 2 : damage;

  const isKillTarget = realDamage > +targetHero.leftLife;

  return {
    timeLeft: 0,
    timeLasting: isKillTarget ? 2 : 0,
    effect: [{
      target: targetHero,
      damage: realDamage
    }]
  }

}