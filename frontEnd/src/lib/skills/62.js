/**
 * @Description: 英雄技能-齐天大圣-孙悟空-wukong-62
 * @Author: Rex Zheng
 * @Date: 2020-05-05 15:47:36
 * @LastEditor: Rex Zheng
 * @LastEditTime: 2020-05-05 15:47:38
 */

import _ from 'lodash';

import { culAttackWidth, getAwayEnemy, getEnemies } from './../utils';

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
 * @description: 猴子的英雄技能-大闹宇宙
 * 内容：孙悟空开始急速旋转，在3秒里持续对附近的单位额造成魔法伤害。孙悟空在首次命中每个敌人时，都会将其击飞并使其晕眩数秒
 * 伤害： 350 / 500 / 2000
 * 眩晕时长: 2.5 / 2.5 / 5
 * 由于没有移动速度，并且1S移动一次，所以改成对3个不同英雄进行操作，每次取最近的英雄作为目标
 * 还有就是因为实在没办法存储谁被猴子的技能打中了，可能会出现重复攻击某个英雄的情况
 * 所以本来由三回合释放的技能，此处改成3秒前摇，之后命中所有目标英雄
 * @param {object} hero 释放技能的英雄-齐天大圣
 * @param {object[]} allHeroes 所有英雄
 * @return {object} 格式参见4.js
 */
export default (hero, allHeroes) => {
  const allSkillInfo = hero.skillDetail.split(/\r\n|[\r\n]/)
  const damage = +allSkillInfo[1].match(/\d+.+/)[0].split(' / ')[hero.grade - 1];
  const ctrl = +allSkillInfo[2].match(/\d+.+/)[0].split(' / ')[hero.grade - 1];
  let enemies = getEnemies(hero, allHeroes);
  if (enemies.length === 0) return null;

  let targets = [];
  let moveLocation = null;

  // 寻找三个敌方英雄
  for (let index = 0; index < 3; index++) {
    const target = getAwayEnemy(hero, enemies, 'near');
    const aoeIds = culAttackWidth(target.locationId, 1, 49);
    targets = targets.concat( _.filter(enemies, enemy => ~aoeIds.indexOf(enemy.locationId)));
    enemies = _.filter(enemies, enemy => !~aoeIds.indexOf(enemy.locationId));
    // 最后一次定位猴子的位置
    if (index === 2) moveLocation = getMoveLocation(target, allHeroes);
  }

  return {
    timeLeft: 0,
    effect: [{
      target: hero,
      moveLocation
    }].concat(targets.map(target => ({
      target,
      damage,
      ctrl
    })))
  }
}
