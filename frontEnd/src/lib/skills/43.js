/**
 * @Description: 英雄技能-天启者-卡尔玛-karma-43
 * @Author: Rex Zheng
 * @Date: 2020-04-20 17:53:27
 * @LastEditor: Rex Zheng
 * @LastEditTime: 2020-04-27 15:38:43
 */

import { getAwayArmy, getAwayEnemy } from './../utils';

/**
 * @description: 扇子妈的英雄技能-鼓舞
 * 内容：在战斗环节开始时，卡尔玛用灵链系住距离最近的一名友方英雄。卡尔玛为被系住的英雄(如果其阵亡，则随机选择一名友军)提供持续护盾，吸收伤害。
 * 在护盾持续时，该友方英雄会获得4秒攻击速度加成
 * 攻击速度: 35% / 50% / 100%
 * 屏障: 250 / 400 / 800
 * @param {object} hero 释放技能的英雄-天启者
 * @param {object[]} allHeroes 所有英雄
 * @return {object} 格式参见4.js
 */
export default (hero, allHeroes) => {
  const allSkillInfo = hero.skillDetail.split(/\r\n|[\r\n]/)
  const attackSpeed = +allSkillInfo[1].match(/\d+.+/)[0].split(' / ')[hero.grade - 1].replace('%', '') / 100;
  const shield = +allSkillInfo[2].match(/\d+.+/)[0].split(' / ')[hero.grade - 1];

  let aimArmy = hero.aimArmy;

  if (!aimArmy) {
    if (hero.role === 'army') {
      aimArmy = getAwayArmy(hero, allHeroes, 'near');
    } else {
      aimArmy = getAwayEnemy(hero, allHeroes, 'near');
    }
  }

  if (!aimArmy) {
    return null;
  }

  return {
    timeLeft: 0,
    effect: [{
      target: hero,
      aimArmy
    }, {
      target: aimArmy,
      shield,
      buffs: {
        time: 4,
        attackSpeed
      }
    }]
  };

}