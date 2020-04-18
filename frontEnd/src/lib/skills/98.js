/**
 * @Description: 英雄技能-暮光之眼-慎-shen-98
 * @Author: Rex Zheng
 * @Date: 2020-04-17 16:17:38
 * @LastEditor: Rex Zheng
 * @LastEditTime: 2020-04-18 20:52:20
 */

import _ from 'lodash';

import { culAttackWidth } from './../utils';

/**
 * @description: 腰子的技能
 * 内容：慎创造一个环绕自身的领域，持续数秒，为所有附近的友军提供100%几率来闪避普通攻击。在激活时，慎获得一定魔法抗性
 * 持续时间: 3 / 4 / 6
 * 魔法抗性: 20 / 40 / 60
 * 获取技能范围过程很正常，问题在于技能的持续时间
 * 新增了timeLasting字段，会判断技能是否在持续释放，为0时会判定技能完结
 * @param {object} hero 释放技能的英雄-暮光之眼
 * @param {object[]} allHeroes 所有英雄
 * @param {object} paramTargetHero 目标英雄
 * @param {boolean} updateHero 是否再次释放
 * @return {object} 格式参见4.js
 */
export default (hero, allHeroes, paramTargetHero, updateHero) => {
  const allSkillInfo = hero.skillDetail.split(/\r\n|[\r\n]/)
  const duration = +allSkillInfo[1].match(/\d+.+/)[0].split(' / ')[hero.grade - 1];
  const magicRes = +allSkillInfo[2].match(/\d+.+/)[0].split(' / ')[hero.grade - 1];
  const protectRanges = culAttackWidth(hero.locationId, 1, 49);
  const armies = _.filter(_.compact(allHeroes), (item) => item.role === hero.role);

  const targetHeroes = _.compact(_.map(armies, (army) => {
    if (_.indexOf(protectRanges, army.locationId) >= 0) {
      return army;
    }
    return null;
  }));

  if (updateHero) {
    return {
      timeLeft: 0,
      effect: _.map(targetHeroes, target => ({
        target,
        buffs: {
          time: 1,
          attackDefence: true
        }
      }))
    }
  }

  return {
    timeLeft: 0,
    timeLasting: duration,
    effect: [{
      target: hero,
      buffs: {
        time: duration,
        magicRes
      }
    }].concat(_.map(targetHeroes, target => ({
      target,
      buffs: {
        time: 1,
        attackDefence: true
      }
    })))
  }

}