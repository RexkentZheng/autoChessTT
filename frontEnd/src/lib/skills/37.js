/**
 * @Description: 英雄技能-琴瑟仙女-娑娜-sona-37
 * @Author: Rex Zheng
 * @Date: 2020-04-16 17:41:07
 * @LastEditor: Rex Zheng
 * @LastEditTime: 2020-04-16 18:31:47
 */

import _ from 'lodash';

import { getArmies } from './../utils';

/**
 * @description: 琴女的英雄技能
 * 内容：娑娜为受伤的友军们提供治疗效果并移除他们身上的所有负面效果
 * 治疗效果: 160 / 200 / 240
 * 治疗友军数量: 2 / 3 / 5
 * 首先获取所有友军，循环友军，获取到生命值受损的友军，根据技能治疗数量来判断治疗几个
 * @param {object} hero 释放技能的英雄-琴瑟仙女
 * @param {object[]} allHeroes 所有英雄
 * @return {object} 格式参见4.js
 */
export default (hero, allHeroes) => {
  const allSkillInfo = hero.skillDetail.split(/\r\n|[\r\n]/)
  const heal = +allSkillInfo[1].match(/\d+.+/)[0].split(' / ')[hero.grade - 1];
  let number = +allSkillInfo[2].match(/\d+.+/)[0].split(' / ')[hero.grade - 1];
  const armies = getArmies(hero, allHeroes);

  const targetHeroes = _.compact(_.map(armies, (army) => {
    if (army.leftLife < army.lifeData.split('/')[hero.grade - 1] && number > 0) {
      number -= 1;
      return army;
    }
    return null;
  }));

  return {
    timeLeft: 0,
    effect: _.map(targetHeroes, (target) => ({
      target,
      heal,
      clearNerfs: true
    }))
  }
}