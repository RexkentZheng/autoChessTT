import { observable, computed } from 'mobx';
import Base from './base';
import { culAttackWidth } from 'lib/utils';
import _ from 'lodash';
import { Message, Notification } from 'lib/notification';

class BattleStore extends Base {
  @observable allHeroes = [];
  @observable damageHeroes = {
    enemy: {},
    army: {}
  };
  @observable timer = null;

  /**
   * @description: 得出没有null值的所有hero
   */
  @computed
  get cleanAllHeroes() {
    return _.compact(this.allHeroes);
  }

  /**
   * @description: 更新战斗状态下的所有Hero，先给Hero增加role属性，
   * 之后放到allHeroes中，开始战斗或者重置timer
   * @param {Array<Object>} armyHeroes 己方Heroes
   * @param {Array<Object>} enemyHeroes 敌方Heroes
   */
  updateHero(armyHeroes, enemyHeroes) {
    const newArmyHeroes = _.map(armyHeroes, (hero) => {
      if (hero) {
        hero.role = 'army';
      }
      return hero;
    });
    const newEnemyHeroes = _.map(enemyHeroes, (hero) => {
      if (hero) {
        hero.role = 'enemy';
      }
      return hero;
    });
    if (!_.isEmpty(armyHeroes)) {
      this.allHeroes = _.cloneDeep(newArmyHeroes.concat(newEnemyHeroes));
      this.roundBattle();
    } else {
      clearInterval(this.timer);
    }
  }

  /**
   * @description: 获取所有Hero的每秒受伤情况，在没有目标的情况下进行位移
   * @return {Array<Object>} damageHeroes 每秒受伤情况
   */
  getAllDps() {
    this.damageHeroes.army = {};
    this.damageHeroes.enemy = {};
    let tmpHeroes = [];
    tmpHeroes = _.cloneDeep(this.allHeroes);
    _.map(this.allHeroes, (hero, index) => {
      if (hero) {
        const rangeIds = culAttackWidth(hero.locationId, +hero.info.range, 49);
        let targetHero = this.getTargetHero(this.cleanAllHeroes, hero, rangeIds);
        if (targetHero) {
          this.damageHeroes[targetHero.role][targetHero.id] = this.damageHeroes[targetHero.role][targetHero.id] ? this.damageHeroes[targetHero.role][targetHero.id] + +hero.info.dps : +hero.info.dps;
        } else {
          targetHero = this.getTargetHero(this.cleanAllHeroes, hero);
          if (targetHero) {
            const { xMove, yMove } = this.getMovedLocation(targetHero, hero);
            tmpHeroes[index] = null;
            const locationId = hero.locationId + xMove + yMove * 7
            tmpHeroes[locationId - 1] = _.extend(
              hero,
              {
                locationId
              }
            );
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
      this.allHeroes = this.allHeroes.map((hero) => {
        if (hero) {
          hero.leftHealth = this.getLeftHealth(allDps, hero);
          if (hero.leftMana >= +hero.info.Mana) {
            Notification('success', 'Success', `${hero.hero_name}已施放技能`);
            hero.leftMana = 0;
          }
          hero.leftMana = +hero.leftMana + 10;
          // hero.leftMana = hero.leftMana >= +hero.info.Mana ? 0 : +hero.leftMana + 10;
          if (hero.leftHealth <= 0) {
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
  }

  /**
   * @description: 获取英雄剩余生命值
   * 如果在受伤列表上有当前Hero，当前英雄扣血，否则生命值不变
   * @param {Object} dps 所有Hero受伤情况
   * @param {Object} hero 当前Hero
   * @return: 英雄剩余生命值
   */
  getLeftHealth(dps, hero) {
    return dps[hero.role][hero.id] ? hero.leftHealth - dps[hero.role][hero.id]: hero.leftHealth;
  }

  /**
   * @description: 当前Hero根据目标Hero进行合理位
   * 当在目标Hero和当前Hero中处在边界时，均为最大值7
   * x轴方向根据二者大小选择左右移动
   * y轴方向因为目前不选择同行Hero进行战斗，所以必须保持一行的距离
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
      allEnemies = _.filter(allEnemies, (enemyItem) => _.indexOf(rangeIds, enemyItem.locationId) > 0);
    }
    if (allEnemies.length > 0) {
      const sortedEnemy = _.sortBy(allEnemies, (enemyItem) => Math.abs(enemyItem.locationId - hero.locationId));
      return _.first(sortedEnemy);
    }
    return null;
  }

}

export default new BattleStore()