/**
 * @Description: 英雄技能-众星之子-索拉卡-soraka-16
 * @Author: Rex Zheng
 * @Date: 2020-05-05 10:03:36
 * @LastEditor: Rex Zheng
 * @LastEditTime: 2020-05-05 10:12:38
 */

import _ from 'lodash';

import { getArmies } from './../utils';

/**
 * @description: 奶妈的英雄技能-祈愿
 * 内容：索拉卡为所有友军治疗生命值
 * 治疗量:  350/500/2000'
 * @param {object} hero 释放技能的英雄-众星之子
 * @param {object[]} allHeroes 所有英雄
 * @return {object} 格式参见4.js
 */
export default (hero, allHeroes) => {
  const allSkillInfo = hero.skillDetail.split(/\r\n|[\r\n]/)
  const heal = +allSkillInfo[1].match(/\d+.+/)[0].split('/')[hero.grade - 1];
  const armies = getArmies(hero, allHeroes)

  return {
    timeLeft: 0,
    effect: _.map(armies, target => ({
      target,
      heal
    }))
  }

}