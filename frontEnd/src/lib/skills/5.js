/**
 * @Description: 英雄技能-德邦总管-赵信-xin-zhao-5
 * @Author: Rex Zheng
 * @Date: 2020-04-20 17:53:27
 * @LastEditor: Rex Zheng
 * @LastEditTime: 2020-04-20 18:38:43
 */

import _ from 'lodash';

import { culAttackWidth, getTargetHero } from './../utils';

/**
 * @description: 赵信的英雄技能
 * 内容：赵信快速攻击他的目标3次，造成普通攻击伤害并施加攻击特效。第三次攻击造额外魔法伤害并将目标击飞数秒
 * 伤害: 200/275/375
 * 由于是快速攻击3次，赵信的攻速是0.7，3次为2.1秒，快一点约等于2秒，所以改成前摇2秒
 * PS：此处默认击飞为1秒
 * @param {object} hero 释放技能的英雄-圣枪游侠
 * @param {object[]} allHeroes 所有英雄
 * @param {object} paramTargetHero 目标英雄
 * @return {object} 格式参见4.js
 */
export default (hero, allHeroes, paramTargetHero) => {
  const damage = +hero.skillDetail.split(/\r\n|[\r\n]/)[1].match(/\d+.+/)[0].split('/')[hero.grade - 1];
  const rangeIds = culAttackWidth(hero.locationId, +hero.attackRange, 49);
  const target = paramTargetHero || getTargetHero(_.compact(allHeroes), hero, rangeIds);

  if (!target) {
    return null;
  }

  return {
    timeLeft: 2,
    effect: [{
      target,
      damage: +hero.attack * 3 + damage,
      ctrl: 1
    }]
  }
}