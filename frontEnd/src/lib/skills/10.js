/**
 * @Description: 英雄技能-正义天使-凯尔-kayle-10
 * @Author: Rex Zheng
 * @Date: 2020-05-05 10:03:36
 * @LastEditor: Rex Zheng
 * @LastEditTime: 2020-05-05 10:12:38
 */

import _ from 'lodash';

import { getSkillDamages } from './../utils';

/**
 * @description: 天使的英雄技能-登神
 * 内容：凯尔登上神阶，使她的攻击可以附带焰浪，造成额外伤害，持续到战斗环节结束
 * 伤害: 100 / 175 / 750
 * 增加extraDamage属性，在每次平A时增加伤害，持续时间为999
 * @param {object} hero 释放技能的英雄-正义天使
 * @return {object} 格式参见4.js
 */
export default (hero) => {
  const damage = +getSkillDamages(hero);

  return {
    timeLeft: 0,
    effect: [{
      target: hero,
      buffs: {
        name: 'skill',
        time: 999,
        extraDamage: damage,
      }
    }]
  }

}