/**
 * @Description: 英雄技能-暮光星灵-佐伊-142
 * @Author: Rex Zheng
 * @Date: 2020-04-10 16:24:41
 * @LastEditor: Rex Zheng
 * @LastEditTime: 2020-04-11 11:25:59
 */

import _ from 'lodash';

/**
 * @description: 佐伊的技能方法
 * 内容：佐伊朝生命值最高的敌人踢出一团泡泡，造成魔法伤害和数秒晕眩
 * 佐伊的技能比较简单，主要是伤害和控制的提取。
 * 不能使用getSkillDamages方法了，因为其技能简介中含有两段数据，一段是伤害，一段是控制，所以得手动处理
 * 处理之后也要注意一下，因为其伤害的格式为：'150/225/400',而眩晕的格式为：'2.5 / 3 / 4'
 * 区别在于其间的分隔符不同，一个是：'/'，一个是：' / '
 * 处理好数据的提取后即可根据剩余生命值来判断目标敌人，然后得出伤害之类的信息即可
 * @param {type} 
 * skill: {
 *  timeLeft: 0,
 *  effect: [{
 *    target: army21,
 *    damage: 300,
 *    pause: 3,
 *    buff: {
 *      attack: 32
 *    }
 *    debuff: {
 *      attack: -32
 *    },
 *  }]
 *}
 */
export default (hero, allHeroes, paramTargetHero = null) => {
  const allSkillInfo = hero.skillDetail.split(/\r\n|[\r\n]/)
  const damage = allSkillInfo[1].match(/\d+\/\d+\/\d+/)[0].split('/')[hero.grade - 1];
  const ctrl = allSkillInfo[2].match(/\d+.+/)[0].split(' / ')[hero.grade - 1];
  const enemies = _.filter(_.compact(allHeroes), (item) => item.role !== hero.role);

  let targetInfo = {
    leftLife: 0,
    hero: {}
  }

  _.map(enemies, (item) => {
    if (+item.leftLife > targetInfo.leftLife) {
      targetInfo = {
        leftLife: +item.leftLife,
        hero: item
      }
    }
  })

  console.log(targetInfo.hero.uniqId)

  return {
    timeLeft: 0,
    effect: [{
      target: targetInfo.hero.uniqId,
      damage,
      blind: 0,
      ctrl,
      buffs: null,
      nerfs: null,
    }]
  }

}
