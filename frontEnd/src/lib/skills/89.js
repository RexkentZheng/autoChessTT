/**
 * @Description: 英雄技能-曙光女神-蕾欧娜-leona-89
 * @Author: Rex Zheng
 * @Date: 2020-04-14 15:06:33
 * @LastEditor: Rex Zheng
 * @LastEditTime: 2020-04-14 15:34:06
 */

import { getSkillDamages } from './../utils';

/**
 * @description: 日女的技能方法
 * 内容：蕾欧娜创造一道屏障，使接下来所受的所有伤害降低，持续4秒。
 * 基础伤害降低: 40 / 80 / 120
 * 没有敌人的判定，每次释放技能给自己加Buff即可，计算伤害时减去mitigation即可
 * @param {object} hero 释放技能的英雄-曙光女神
 * @return: 格式参见4.js
 */
export default (hero) => {
  const mitigation = +getSkillDamages(hero);

  return {
    timeLeft: 0,
    effect: [{
      target: hero,
      damage: 0,
      buffs: {
        time: 4,
        mitigation
      },
      nerfs: null
    }]
  }
}