/**
 * @Description: 英雄技能-疾风剑豪-亚索-yasuo-157
 * @Author: Rex Zheng
 * @Date: 2020-04-20 17:32:55
 * @LastEditor: Rex Zheng
 * @LastEditTime: 2020-04-20 17:50:10
 */

import { culAttackWidth, getAwayHero, getSkillDamages } from 'lib/utils';
import _ from 'lodash';

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
 * @description: 亚索的英雄技能
 * 内容：亚索闪烁到带有最多装备的敌人处，然后将其击飞，使其滞空1秒并对其进行数次打击，造成普通额外的攻击伤害并施加攻击特效
 * 打击次数: 4 / 5 / 6
 * PS：这里的判定暂时无法开发，因为装备系统还没开始，所以只能先选择最远的敌人了
 * @param {object} hero 释放技能的英雄-疾风剑豪
 * @param {object[]} allHeroes 所有英雄
 * @return {object} 格式参见4.js
 */
export default (hero, allHeroes) => {
  const attackTimes = +getSkillDamages(hero);
  const target = getAwayHero(hero, allHeroes, 'far');

  if (!target) {
    return null;
  }

  const moveLocation = getMoveLocation(target, allHeroes);

  return {
    timeLeft: 0,
    effect: [{
      target: hero,
      ctrl: 1,
      moveLocation
    }, {
      target,
      damage: +hero.attack * +hero.attackSpeed * attackTimes,
      ctrl: 1
    }]
  }
}