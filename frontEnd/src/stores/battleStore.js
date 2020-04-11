import { Message, Notification } from 'lib/notification';
import skills from 'lib/skills';
import { culAttackWidth } from 'lib/utils';
import _ from 'lodash';
import { computed, observable, toJS } from 'mobx';

import Base from './base';

class BattleStore extends Base {
  @observable allHeroes = [];
  @observable damageHeroes = {};
  @observable timer = null;

  // 给线用的数据
  @observable damageItems = [];
  @observable skillItems = [];

  @observable tmpTargets = {
    enemy: {},
    army: {}
  };

  /**
   * @description: 得出没有null值的所有hero
   */
  @computed
  get cleanAllHeroes() {
    return _.compact(this.allHeroes);
  }

  /**
   * @description: 更新战斗状态下的所有Hero，先给Hero增加role属性，
   * 之后放到allHeroes中，开始战斗或者重置timer和单位伤害
   * uniqId为战斗时英雄唯一标识符
   * @param {Array<Object>} armyHeroes 己方Heroes
   * @param {Array<Object>} enemyHeroes 敌方Heroes
   */
  updateHero(armyHeroes, enemyHeroes) {
    const newArmyHeroes = _.map(armyHeroes, (hero, index) => {
      if (hero) {
        hero.role = 'army';
        hero.uniqId = `${hero.role}${index}`
      }
      return hero;
    });
    const newEnemyHeroes = _.map(enemyHeroes, (hero, index) => {
      if (hero) {
        hero.role = 'enemy';
        hero.uniqId = `${hero.role}${index}`
      }
      return hero;
    });
    if (!_.isEmpty(armyHeroes)) {
      this.allHeroes = _.cloneDeep(newEnemyHeroes.concat(newArmyHeroes));
      this.roundBattle();
    } else {
      clearInterval(this.timer);
      this.damageItems = [];
    }
  }

  /**
   * @description: 计算单个英雄伤害（目前由于伤害太低，默认2倍攻击力）
   * @param {object} targetHero 目标英雄
   * @param {object} hero 始发英雄
   * @return { damage: Number } 返回目标受到的伤害
   */
  calDamage(targetHero, hero) {
    return {
      damage: this.damageHeroes[targetHero.uniqId] ? this.damageHeroes[targetHero.uniqId].damage + +hero.attack * +hero.attackSpeed * 2 - +targetHero.armor : +hero.attack * +hero.attackSpeed * 2 - +targetHero.armor};
  }

  /**
   * @description: 获取allDps中的英雄伤害
   * @param {object} 出手英雄 
   * @return {number} 目标英雄应该承受的伤害
   */
  getDpsDamage(hero) {
    return this.damageHeroes[hero.uniqId] ? this.damageHeroes[hero.uniqId].damage : 0;
  }

  /**
   * @description: 获取所有Hero的每秒受伤情况，在没有目标的情况下进行位移
   * @return {Array<Object>} damageHeroes 每秒受伤情况
   */
  getAllDps() {
    this.damageHeroes = {};
    let tmpHeroes = [];
    this.damageItems = [];
    tmpHeroes = _.cloneDeep(this.allHeroes);
    _.map(this.allHeroes, (hero, index) => {
      if (hero) {
        // 致盲和控制的特殊情况，致盲可以普攻并加蓝，但不能放技能，控制什么都不能做
        if (hero.ctrl !== 0) {
          hero.ctrl -= 1;
          hero.blind -= 1;
        }
        if (hero.blind !== 0) {
          return hero.blind -= 1;
        }
        console.log(`${hero.chessId}-${hero.leftMagic}-${hero.magic}`)
        if (+hero.leftMagic >= +hero.magic && +hero.chessId === 142) {
          hero.skill = skills[hero.chessId](hero, this.allHeroes, this.tmpTargets[hero.role][hero.uniqId]);
          if (hero.skill.timeLeft === 0) {
            this.skillItems.push({
              startPosition: index + 1,
              endPosition: _.map(hero.skill.effect, item => item.locationId),
            })
            //  这里需要区分target是uniqId还是locationId
            _.map(hero.skill.effect, (item) => {
              this.damageHeroes[item.target] = {
                ..._.omit(item, ['target', 'role']),
                damage: this.getDpsDamage(item) + item.damage,
              }
            });
          } else {
            hero.skill.timeLeft -= 1;
          }
        } else {
          if (+hero.chessId === 104) {
            console.log('here')
          }
          const rangeIds = culAttackWidth(hero.locationId, +hero.attackRange, 49);
          let targetHero = null;
          if (this.tmpTargets[hero.role][hero.uniqId]) {
            targetHero = this.tmpTargets[hero.role][hero.uniqId];
          } else {
            targetHero = this.getTargetHero(this.cleanAllHeroes, hero, rangeIds);
          }
          if (targetHero) {
            this.tmpTargets[hero.role][hero.uniqId] = targetHero;
            this.damageHeroes[targetHero.uniqId] = this.calDamage(targetHero, hero);
            this.damageItems.push([index + 1, targetHero.locationId])
          } else {
            targetHero = this.getTargetHero(this.cleanAllHeroes, hero);
            if (targetHero) {
              const { xMove, yMove } = this.getMovedLocation(targetHero, hero);
              //  如果将要移动的位置已有英雄存在，位置+1，以此类推，是一个递归
              const locationId = this.getLoopLocation(tmpHeroes, hero.locationId + xMove + yMove * 7);
              tmpHeroes[index] = null;
              tmpHeroes[locationId - 1] = _.extend(
                hero,
                {
                  locationId
                }
              );
            }
          }
        }
      }
    })
    this.allHeroes = tmpHeroes;
    return this.damageHeroes;
  }

  /**
   * @description: 战斗模拟，每秒发生一次战斗，用计时器来模拟此种情况
   * 首先获取到所有Hero的受伤情况，更新Hero的血量蓝量状态，血量小于0的Hero踢出allHeroes集合
   * 每轮末尾判断战斗是否结束
   */
  roundBattle() {
    this.timer = setInterval(() => {
      const allDps = this.getAllDps();
      console.log(toJS(allDps))
      this.allHeroes = this.allHeroes.map((hero) => {
        if (hero) {
          if (allDps[hero.uniqId]) {
            hero.blind = allDps[hero.uniqId].blind || 0;
            hero.ctrl =  allDps[hero.uniqId].ctrl || 0;
          }
          hero.leftLife = this.getLeftHealth(allDps, hero);
          // if (hero.leftMagic >= +hero.magic && +hero.magic !== 0) {
          //   // Notification('success', 'Success', `【${hero.title}-${hero.displayName}】已施放技能`);
          //   hero.leftMagic = 0;
          // }
          hero.leftMagic = +hero.leftMagic + 10;
          if (hero.leftLife <= 0) {
            return null;
          }
        }
        return hero;
      })
      this.judgeBattle();
    }, 1000)
  }

  /**
   * @description: 判断战斗是否结束
   * 将所有Hero按照role属性分类，两者有一不存在是即游戏结束
   * 弹窗并且清除timer
   */
  judgeBattle() {
    const finalHeroes = _.groupBy(this.allHeroes, 'role');
    if (!finalHeroes.enemy) {
      Message('success', 'Aloha', 'You win');
      clearInterval(this.timer);
    } else if (!finalHeroes.army) {
      Message('error', 'Aloha', 'You lose');
      clearInterval(this.timer);
    }
    this.damageItems = [];
  }

  /**
   * @description: 获取英雄剩余生命值
   * 如果在受伤列表上有当前Hero，当前英雄扣血，否则生命值不变
   * @param {Object} dps 所有Hero受伤情况
   * @param {Object} hero 当前Hero
   * @return: 英雄剩余生命值
   */
  getLeftHealth(dps, hero) {
    return dps[hero.uniqId] ? +hero.leftLife - dps[hero.uniqId].damage: +hero.leftLife;
  }

  /**
   * @description: 当前Hero根据目标Hero进行合理位移
   * 当在目标Hero和当前Hero中处在边界时，均为最大值7
   * x轴方向根据二者大小选择左右移动
   * y轴方向因为目前不选择同行Hero进行战斗，所以必须保持一行的距离（此句注释有问题）
   * @param {Object} targetHero 目标Hero
   * @param {Object} hero 当前Hero
   * @return: x轴和y轴的位移
   */
  getMovedLocation(targetHero, hero) {
    let xMove = 0;
    let yMove = 0;
    const targetX = targetHero.locationId % 7 === 0 ? 7 : targetHero.locationId % 7;
    const heroX = hero.locationId % 7 === 0 ? 7 : hero.locationId % 7;
    if (targetX > heroX) {
      xMove = 1;
    } else if (targetX % 7 < heroX) {
      xMove = -1;
    }
    if (parseInt(targetHero.locationId / 7) >= parseInt(hero.locationId / 7) + 1) {
      yMove = 1;
    } else if (parseInt(targetHero.locationId / 7) <= parseInt(hero.locationId / 7) - 1) {
      yMove = -1;
    }
    return { xMove, yMove };
  }

  /**
   * @description: 获取目标英雄
   * 没有rangeIds参数意味着当前英雄的攻击范围内没有敌方Hero，需选定距离最近的敌方Hero返回
   * 有rangeIds参数需先判断攻击范围内有无敌方Hero，有则返回敌方Hero，没有则返回null
   * @param {Array<Object>} targets 目标Hero列表
   * @param {Object} hero 当前Hero
   * @param {Object} rangeIds Hero攻击范围ID
   * @return: 目标Hero或者null
   */
  getTargetHero(targets, hero, rangeIds = null) {
    let allEnemies = _.filter(targets, (targetItem) => targetItem.role !== hero.role);
    if (rangeIds) {
      allEnemies = _.filter(allEnemies, (enemyItem) => _.indexOf(rangeIds, enemyItem.locationId) >= 0);
    }
    if (allEnemies.length > 0) {
      const sortedEnemy = _.sortBy(allEnemies, (enemyItem) => Math.abs(enemyItem.locationId - hero.locationId));
      return _.first(sortedEnemy);
    }
    return null;
  }

  /**
   * @description: 位置迭代变动，判断目标位置是否已有英雄，若有，增位置加1，持续迭代，否则直接返回位置
   * @param {Array<Object>} tmpHeroes 全场英雄列表
   * @param {Number} targetLocation 目标即将跳转位置
   * @return: 没有影响占用的位置
   */
  getLoopLocation(tmpHeroes, targetLocation) {
    if (tmpHeroes[targetLocation - 1]) {
      return this.getLoopLocation(tmpHeroes, targetLocation + 1);
    } else {
      return targetLocation;
    }
  }

}

export default new BattleStore()