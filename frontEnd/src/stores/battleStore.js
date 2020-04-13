import { Message } from 'lib/notification';
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
  @observable skillItems = [];

  @observable tmpTargets = {};

  /**
   * @description: 得出没有null值的所有hero
   */
  @computed
  get cleanAllHeroes() {
    return _.compact(this.allHeroes);
  }

  /**
   * @description: 初始化更新战斗状态下的所有Hero，先给Hero增加role属性，
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
    }
  }

  /**
   * @description: 计算单个英雄伤害（目前由于伤害太低，默认2倍攻击力）
   * @param {object} targetHero 目标英雄
   * @param {object} hero 始发英雄
   * @return { damage: Number } 返回目标受到的伤害
   */
  calDamage(target, origin) {
    return {
      originId: origin.uniqId,
      originLocation: origin.locationId,
      targetLocation: target.locationId,
      damage: +origin.attack * +origin.attackSpeed * 2 - +target.armor
    };
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
  newGetAllDps() {
    this.damageHeroes = {};
    const moveHeroes = [];
    this.allHeroes = _.map(this.allHeroes, (hero) => {
      // 位置为空直接返回
      if (!hero) {
        return hero;
      }
      // 计算致盲和控制
      if (this.judgeHeroStatus(hero)) {
        return this.updateHeroStatus(hero);
      }
      // 判断是否需要释放技能
      if (+hero.leftMagic >= +hero.magic && +hero.chessId === 142) {
        if (!hero.skill) {
          hero.skill = skills[hero.chessId](hero, this.allHeroes, this.tmpTargets[hero.uniqId]);
        }
      }
      // 判断是否在释放技能(前摇)
      if (hero.skill && hero.skill.timeLeft >= 0) {
        return this.updateHeroSkills(hero);
      // 平A输出
      } else {
        const rangeIds = culAttackWidth(hero.locationId, +hero.attackRange, 49);
        let targetHero = this.tmpTargets[hero.uniqId] ? this.tmpTargets[hero.uniqId] : this.getTargetHero(this.cleanAllHeroes, hero, rangeIds);
        if (targetHero) {
          this.tmpTargets[hero.uniqId] = targetHero;
          this.updateDamageHeroesWrapper(targetHero.uniqId, this.calDamage(targetHero, hero));
        } else {
          moveHeroes.push(hero);
        }
        return hero;
      }
    });
    this.moveHeroes(moveHeroes);
    return this.damageHeroes;
  }

  /**
   * @description: 更新英雄技能信息
   * 英雄技能前摇-1<=0即可释放技能，否则继续等待
   * 释放技能时更新英雄受伤信息
   * 前摇时更新前摇时间
   * @param {object} hero 英雄信息 
   * @return: 更新后的英雄信息
   */
  updateHeroSkills(hero) {
    let newSkill = hero.skill;
    if (newSkill.timeLeft -1 <= 0) {
      _.map(newSkill.effect, (item) => {
        //  这里需要区分target是uniqId还是locationId
        let target = null;
        if (_.indexOf(item.target, ':') > 0) {
          target = _.find(_.compact(this.allHeroes),
            (target) => target.locationId === +item.target.split(':')[1] && target.role !== hero.role);
        } else {
          target = item.target;
        }
        this.updateDamageHeroes(hero, item, target)
      });
      newSkill = null;
    } else {
      newSkill.timeLeft -= 1;
    }
    return {
      ...hero,
      skill: newSkill
    };
  }

  /**
   * @description: 英雄位移
   * 在getAllDps方法中可得到所有没有攻击目标的英雄，之后利用此方法查找其他目标英雄
   * 根据新目标英雄位置进行位移处理，位置上有其他英雄则位置+1
   * @param {object[]} 等待位移的英雄 
   * @return: void
   */
  moveHeroes(heroes) {
    _.map(heroes, (hero) => {
      const targetHero = this.getTargetHero(this.cleanAllHeroes, hero);
      if (targetHero) {
        const { xMove, yMove } = this.getMovedLocation(targetHero, hero);
        //  如果将要移动的位置已有英雄存在，位置+1，以此类推，是一个递归
        const locationId = this.getLoopLocation(this.allHeroes, hero.locationId + xMove + yMove * 7);
        this.allHeroes[hero.locationId - 1] = null;
        this.allHeroes[locationId - 1] = _.extend(
          hero,
          {
            locationId
          }
        );
      }
    })
  }

  /**
   * @description: 更新英雄伤害列表，若无目标英雄，则不作操作
   * @param {object} origin 出手英雄
   * @param {object} dmgInfo 伤害信息
   * @param {object} target 目标英雄
   * @return: void
   */
  updateDamageHeroes(origin, dmgInfo, target) {
    if (target) {
      this.updateDamageHeroesWrapper(target.uniqId, {
        originId: origin.uniqId,
        originLocation: origin.locationId,
        targetLocation: target.locationId,
        ..._.omit(dmgInfo, ['target', 'role', 'locationId'])
      })
    }
  }

  /**
   * @description: 更新英雄伤害列表包裹方法
   * 判断damageHeroes有无目标ID，有则push，没有直接赋值数组
   * @param {string} targetId 目标英雄唯一ID
   * @return: void
   */
  updateDamageHeroesWrapper(targetId, item) {
    if (this.damageHeroes[targetId]) {
      this.damageHeroes[targetId].push(item);
    } else {
      this.damageHeroes[targetId] = [item];
    }
  }

  /**
   * @description: 判断英雄的某种状态是否存在
   * 先判断是否是数字，接下来判断是否大于0
   * @param {object} hero 英雄信息 
   * @param {string} key 属性名
   * @return: 名为key的状态是否存在
   */
  judgeHeroStatusSingle(hero, key) {
    return _.isNumber(hero[key]) && hero[key] > 0
  }

  /**
   * @description: 判断英雄是否被致盲或者控制
   * @param {object} hero 英雄信息
   * @return: 是否被控制
   */
  judgeHeroStatus(hero) {
    return this.judgeHeroStatusSingle(hero, 'ctrl') || this.judgeHeroStatusSingle(hero, 'blind');
  }

  /**
   * @description: 更新英雄的控制和致盲状态，共三种情况
   * 1. 致盲但不控制 更新致盲时间，加10点蓝量
   * 2. 致盲又控制，更新致盲和控制时间
   * 3. 控制单不致盲，更新控制时间
   * @param {object} hero 英雄信息
   * @return: 更新后的英雄信息
   */
  updateHeroStatus(hero) {
    let res = {};
    if (this.judgeHeroStatusSingle(hero, 'blind') && !this.judgeHeroStatusSingle(hero, 'ctrl')) {
      res = {
        blind: hero.blind - 1 >= 0 ? hero.blind -= 1 : 0,
        leftMagic: hero.leftMagic += 10
      };
    } else if (this.judgeHeroStatusSingle(hero, 'blind') && this.judgeHeroStatusSingle(hero, 'ctrl')) {
      res = {
        blind: hero.blind - 1 >= 0 ? hero.blind -= 1 : 0,
        ctrl: hero.ctrl - 1 >= 0 ? hero.ctrl -= 1 : 0
      };
    } else {
      res = {
        ctrl: hero.ctrl - 1 >= 0 ? hero.ctrl -= 1 : 0
      };
    }
    return {
      ...hero,
      ...res
    };
  }

  /**
   * @description: 更新英雄被控或者致盲状态
   * @param {object} hero 目标英雄
   * @param {object} dpsItem 新增状态
   * @return: 更新状态后的hero
   */
  updateHeroCtrlAndBlind(hero, dpsItem = null) {
    let { ctrl, blind } = hero;
    if (!dpsItem) {
      return hero;
    } else {
      _.map(dpsItem, (item) => {
        if (item.ctrl && item.ctrl > 0) {
          ctrl += item.ctrl;
        }
        if (item.blind && item.blind > 0) {
          blind += item.blind;
        }
      })
    }
    return {
      ...hero,
      ctrl,
      blind
    }
  }

  /**
   * @description: 战斗模拟，每秒发生一次战斗，用计时器来模拟此种情况
   * 首先获取到所有Hero的受伤情况，更新Hero的血量蓝量状态，血量小于0的Hero踢出allHeroes集合
   * 每轮末尾判断战斗是否结束
   */
  roundBattle() {
    this.timer = setInterval(() => {
      const allDps = this.newGetAllDps();
      console.log(toJS(allDps))
      this.allHeroes = this.allHeroes.map((hero) => {
        if (hero) {
          // 释放技能前摇时判断何种状态 status字段:'invincible'无敌
          if (hero.skill && hero.skill.timeLeft >= 0) {
            if (hero.skill.status === 'invincible') {
              return hero;
            }
          }
          hero = this.updateHeroCtrlAndBlind(hero, allDps[hero.uniqId]);
          hero.leftLife = this.getLeftHealth(allDps, hero);
          // if (hero.leftMagic >= +hero.magic && +hero.magic !== 0) {
          //   // Notification('success', 'Success', `【${hero.title}-${hero.displayName}】已施放技能`);
          //   hero.leftMagic = 0;
          // }
          // Todo 英雄被攻击一次会增加2点蓝量
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
  }

  /**
   * @description: 获取英雄剩余生命值
   * 如果在受伤列表上有当前Hero，当前英雄扣血，否则生命值不变
   * @param {Object} dps 所有Hero受伤情况
   * @param {Object} hero 当前Hero
   * @return: 英雄剩余生命值
   */
  getLeftHealth(dps, hero) {
    let { leftLife } = hero;
    if (dps[hero.uniqId]) {
      _.map(dps[hero.uniqId], (item) => {
        leftLife -= item.damage;
      })
    }
    return leftLife;
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