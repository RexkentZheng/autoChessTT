/**
 * @Description: 英雄技能-逆羽-霞-498
 * @Author: Rex Zheng
 * @Date: 2020-04-14 17:03:36
 * @LastEditor: Rex Zheng
 * @LastEditTime: 2020-04-14 17:12:38
 */

import { getSkillDamages } from './../utils';

/**
 * @description: 霞的技能方法
 * 内容：霞创造一阵羽刃风暴，获得100%加成的攻击速度，持续数秒
 * 持续时间: 5 / 7 / 12
 * 获取到加速时间后给自己加上即可
 * @param {object} hero 释放技能的英雄-逆羽
 * @return {object} 格式参见4.js
 */
export default (hero) => {
  const duration = getSkillDamages(hero);

  return {
    timeLeft: 0,
    effect: [{
      target: hero,
      buffs: {
        time: duration,
        attackSpeed: 1
      },
    }]
  }
}