import { Message } from 'lib/notification';
import skills from 'lib/skills';
import { culAttackWidth, getAwayArmy, getAwayEnemy } from 'lib/utils';
import _ from 'lodash';
import { computed, observable, toJS } from 'mobx';

import Base from './base';

class BattleStore extends Base {
  @observable allHeroes = [];
  @observable damageHeroes = {};
  @observable timer = null;

  @observable skillMoveHeroes = [];

  // 给线用的数据
  @observable skillItems = [];

  @observable tmpTargets = {};

  @observable round = 0;

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
        if (+hero.chessId === 43) {
          hero.aimArmy = getAwayArmy(hero, armyHeroes, 'near');
        }
        if (+hero.chessId === 134) {
          hero.balls = 0;
        }
      }
      return hero;
    });
    const newEnemyHeroes = _.map(enemyHeroes, (hero, index) => {
      if (hero) {
        hero.role = 'enemy';
        hero.uniqId = `${hero.role}${index}`
        if (+hero.chessId === 43) {
          hero.aimArmy = getAwayEnemy(hero, enemyHeroes, 'near');
        }
        if (+hero.chessId === 134) {
          hero.balls = 0;
        }
      }
      return hero;
    });
    if (!_.isEmpty(armyHeroes)) {
      this.allHeroes = _.cloneDeep(newEnemyHeroes.concat(newArmyHeroes));
      this.round = 0;
      this.roundBattle();
    } else {
      clearInterval(this.timer);
    }
  }

  /**
   * @description: 计算单个英雄伤害（目前由于伤害太低，默认2倍攻击力）
   * 致盲可以普攻但没有伤害
   * @param {object} targetHero 目标英雄
   * @param {object} hero 始发英雄
   * @return { damage: Number } 返回目标受到的伤害
   */
  calDamage(target, origin) {
    let damage = +origin.attack * this.calHeroAttr(origin, 'attackSpeed') * 2 -
    +target.armor - this.calHeroAttr(target, 'mitigation') +
    this.calHeroAttr(origin, 'extraDamage');
    if (origin.blind && origin.blind > 0) {
      damage = 0;
    }
    return {
      originId: origin.uniqId,
      originLocation: origin.locationId,
      targetLocation: target.locationId,
      damage: damage >= 0 ? damage : 0,
      type: 'attack'
    };
  }

  /**
   * @description: 获取当前英雄的某种属性（添加上buffs和nerfs）
   * @param {object} hero 英雄信息 
   * @param {string} key 属性名 
   * @return: 属性值
   */
  calHeroAttr(hero, key) {
    const extraKeys = ['buffs', 'nerfs']
    let tmpAttr = +hero[key] || 0;
    _.map(extraKeys, (extraKey) => {
      if (hero[extraKey]) {
        _.map(hero[extraKey], (item) => {
          if (item[key]) {
            if (extraKey === 'buffs') {
              tmpAttr = item[key] > 1 ? tmpAttr += item[key] : tmpAttr * ( 1 + item[key])
            } else {
              tmpAttr = item[key] > 1 ? tmpAttr -= item[key] : tmpAttr * ( 1 - item[key])
            }
            
          }
        })
      }
    })
    return tmpAttr;
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
    const moveHeroes = [];
    this.allHeroes = _.map(this.allHeroes, (heroItem) => {
      let hero = heroItem;
      // 位置为空直接返回
      if (!hero) {
        return hero;
      }
      // 计算致盲和控制 这块的位置有点问题，被致盲和缴械其实可以释放技能，致盲也可以平A，放这里不合理
      if (this.judgeHeroStatus(hero)) {
        return this.updateHeroStatus(hero);
      }
      hero = this.updateHeroBuffsAndNerfs(hero)
      // 铁男的特殊情况
      if (+hero.chessId === 82) {
        if (hero.shield > 0) {
          hero.skill = skills[hero.chessId](hero, this.allHeroes, null, true);          
        } else if (+hero.leftMagic >= +hero.magic) {
          hero.skill = skills[hero.chessId](hero, this.allHeroes, null, false); 
        }
      }
      // 腰子、诺手、兰博的技能持续情况
      if (hero.timeLasting > 0) {
        hero.skill = skills[hero.chessId](hero, this.allHeroes, this.getTargetHero(this.cleanAllHeroes, hero, rangeIds), true);
      }
      // else if (+hero.leftMagic >= +hero.magic) {
      //   hero.skill = skills[hero.chessId](hero, this.allHeroes, this.getTargetHero(this.cleanAllHeroes, hero, rangeIds), false); 
      // }
      // 判断是否需要释放技能(后面需要更改一下，铁男、腰子需要提出来)
      const rangeIds = culAttackWidth(hero.locationId, +hero.attackRange, 49);
      if (+hero.leftMagic >= +hero.magic && +hero.magic !== 0 && +hero.chessId === 16) {
        hero.leftMagic = 0;
        if (!hero.skill) {
          hero.skill = skills[hero.chessId](hero, this.allHeroes, this.getTargetHero(this.cleanAllHeroes, hero, rangeIds));
        }
      }
      // 处理技能为被动的情况
      if (hero.skillType === '被动') {
        hero = this.updateHeroPassivity(hero);
      }
      // 判断是否在释放技能(前摇)
      if (hero.skill && hero.skill.timeLeft >= 0 && _.indexOf(skills.skillAndAttack, +hero.chessId) < 0) {
        return this.updateHeroSkills(hero);
      // 平A输出
      } else {
        let targetHero =this.getTargetHero(this.cleanAllHeroes, hero, rangeIds);
        if (targetHero) {
          this.tmpTargets[hero.uniqId] = targetHero;
          if (this.judgeNormalAttack(hero)) {
            this.updateDamageHeroesWrapper(targetHero.uniqId, this.calDamage(targetHero, hero));
          }
        } else {
          moveHeroes.push(hero);
        }
        // 某些的特殊情况，既能释放技能，又能普攻（铁男）
        if (_.indexOf(skills.skillAndAttack, +hero.chessId) >= 0 && hero.skill) {
          return this.updateHeroSkills(hero);
        }
        return hero;
      }
    });
    this.moveHeroes(moveHeroes);
    return this.damageHeroes;
  }

  judgeNormalAttack(hero) {
    if (hero.ctrl && hero.ctrl > 0) {
      return false;
    }
    if (hero.disarm && hero.disarm > 0) {
      return false;
    }
    return true;
  }

  /**
   * @description: 处理英雄被动技能
   * @param {object} hero 英雄信息 
   * 1. 石头人 回合开始时给自己增加护盾
   * @return: 更新后的英雄信息
   */
  updateHeroPassivity(hero) {
    // 石头人情况 仅在第一回合触发一次
    if (+hero.chessId === 54 && this.round === 1) {
      const { shield } = skills[hero.chessId](hero);
      return {
        ...hero,
        shield,
      }
    }
    return hero;
  }

  /**
   * @description: 更新英雄技能信息
   * 英雄技能前摇-1 <= 0即可释放技能，否则继续等待
   * 释放技能时更新英雄受伤信息
   * 前摇时更新前摇时间
   * @param {object} hero 英雄信息 
   * @return: 更新后的英雄信息
   */
  updateHeroSkills(hero) {
    let newSkill = hero.skill;
    const aimArmy = newSkill.aimArmy || null;
    const balls = newSkill.balls || null;
    // 技能持续时间
    const timeLasting = (newSkill.timeLasting || hero.timeLasting || 0) - 1;
    if (newSkill.timeLeft -1 <= 0) {
      // 如果是需要二次计算的英雄，则重新计算目标英雄（会阻挡）
      if (_.indexOf(skills.reCalTargetHeroes, +hero.chessId) >= 0) {
        newSkill = skills[hero.chessId](hero, this.allHeroes, newSkill.effect[0].target, true);
      }
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
      timeLasting,
      aimArmy,
      balls,
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
        this.allHeroes[locationId - 1] = {
          ...hero,
          locationId
        }
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
        ..._.omit(dmgInfo, ['target', 'role', 'locationId']),
        type: 'skills',
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
    return this.judgeHeroStatusSingle(hero, 'ctrl') || this.judgeHeroStatusSingle(hero, 'blind') || this.judgeHeroStatusSingle(hero, 'disarm');
  }

  /**
   * @description: 更新英雄的控制、致盲、缴械状态
   * 1. 控制，无法平A，无法释放技能
   * 2. 缴械，无法平A，可释放技能
   * 3. 致盲，可平A，无法命中，可释放技能
   * @param {object} hero 英雄信息
   * @return: 更新后的英雄信息
   */
  updateHeroStatus(hero) {
    let res = {
      ctrl: hero.ctrl ? hero.ctrl - 1 : 0,
      blind: hero.blind ? hero.blind - 1 : 0,
      disarm: hero.disarm ? hero.disarm - 1 : 0,
    }
    if (!this.judgeHeroStatusSingle(hero, 'ctrl') &&
      !this.judgeHeroStatusSingle(hero, 'disarm') &&
      this.judgeHeroStatusSingle(hero, 'blind')
    ) {
      res.leftMagic = hero.leftMagic += 10;
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
    let { ctrl, blind, disarm } = hero;
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
        if (item.disarm && item.disarm > 0) {
          blind += item.disarm;
        }
      })
    }
    return {
      ...hero,
      ctrl,
      blind,
      disarm
    }
  }

  /**
   * @description: 更新英雄buffs和nerfs的剩余时间
   * @param {object} hero 英雄信息 
   * @return: 更新后的英雄信息
   */
  updateHeroBuffsAndNerfs(hero) {
    const tmpHero = hero;
    const extraKeys = ['buffs', 'nerfs'];
    _.map(extraKeys, (extraKey) => {
      if (tmpHero[extraKey]) {
        tmpHero[extraKey] = _.compact(_.map(tmpHero[extraKey], item => {
          if (item.time - 1 <= 0) {
            return null;
          }
          return {
            ...item,
            time: item.time -= 1
          }
        }));
      }
    })
    return tmpHero;
  }

  /**
   * @description: 添加英雄的buffs和nerfs
   * 根据dps查找当前英雄的buff和nerf，然后添加即可
   * @param {object} hero 英雄信息 
   * @param {object[]} dpsItem 当前回合英雄有关内容 
   * @return: 更新后的英雄信息
   */
  addHeroBuffsAndNerfs(hero, dpsItem = null) {
    if (!dpsItem) {
      return hero;
    } else {
      const tmpHero = hero;
      const extraKeys = ['buffs', 'nerfs'];
      _.map(dpsItem, (item) => {
        _.map(extraKeys, (extraKey) => {
          if (tmpHero[extraKey]) {
            if (item[extraKey]) {
              tmpHero[extraKey].push(item[extraKey]);
            }
          } else {
            if (item[extraKey]) {
              tmpHero[extraKey] = [item[extraKey]];
            }
          }
        })
      })
      return tmpHero;
    }
  }

  /**
   * @description: 战斗模拟，每秒发生一次战斗，用计时器来模拟此种情况
   * 首先获取到所有Hero的受伤情况，更新Hero的血量蓝量状态，血量小于0的Hero踢出allHeroes集合
   * 每轮末尾判断战斗是否结束
   */
  roundBattle() {
    this.timer = setInterval(() => {
      this.round += 1;
      this.skillMoveHeroes = [];
      const allDps = this.getAllDps();
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
          hero = this.addHeroBuffsAndNerfs(hero, allDps[hero.uniqId]);
          // 计算英雄伤害（护盾和生命值）
          hero = this.getLeftHealth(hero, allDps[hero.uniqId]);
          console.log(toJS(hero))
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
      // 对因为技能进行位移的英雄进行位移操作
      _.map(this.skillMoveHeroes, (item) => {
        if (this.allHeroes[item.locationId - 1] && this.allHeroes[item.locationId - 1].leftLife > 0) {
          this.allHeroes[item.locationId - 1] = null;
          this.allHeroes[item.newLocationsId - 1] = _.omit({
            ...item,
            locationId: item.newLocationsId
          }, 'newLocationsId'); 
        }
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

  getHeroAttackDefence(hero) {
    let attackDefence = false;
    if (hero.buffs) {
      _.map(hero.buffs, (buff) =>{
        if (buff.attackDefence) {
          attackDefence = true
        }
      })
    }
    return attackDefence;
  }

  /**
   * @description: 获取英雄剩余生命值
   * 如果buffs里有护盾值，则加上护盾值
   * 如果有clearNerfs属性，则去掉所有nerfs
   * 如果有heal属性，在剩余生命值上加上heal值，但总值不能超过当前最大生命值
   * 如果在受伤列表上有当前Hero，当前英雄扣血，否则生命值不变
   * @param {Object} dps 所有Hero受伤情况
   * @param {Object} hero 当前Hero
   * @return: 英雄剩余生命值
   */
  getLeftHealth(heroItem, dpsItem) {
    let hero = heroItem;
    let { leftLife, shield, locationId } = hero;
    const attackDefence = this.getHeroAttackDefence(hero);
    if (dpsItem) {
      _.map(dpsItem, (item) => {
        // 计算伤害
        let damage = 0;
        if (item.type === 'attack') {
          damage = attackDefence ? 0 : (item.damage || 0); 
        } else {
          damage = item.damage || 0;
        }
        // 计算护盾变更
        if (item.shield && item.shield > 0) {
          shield += +item.shield;
        }
        // 计算治疗量
        if (_.isNumber(item.heal) && item.heal > 0) {
          leftLife = (leftLife + item.heal) > +hero.lifeData.split('/')[hero.grade - 1] ? +hero.lifeData.split('/')[hero.grade - 1] : leftLife + item.heal;
        }
        // 计算移除所有Buff
        if (item.clearNerfs) {
          hero.nerfs = [];
        }
        // 计算伤害
        if (shield > 0) {
          if (shield >= damage) {
            shield = shield - damage;
          } else {
            leftLife = leftLife + shield - damage
            shield = 0;
          }
        } else {
          leftLife -= damage;
        }
        // 计算位置变更
        if (item.moveLocation && _.isNumber(item.moveLocation)) {
          locationId = item.moveLocation
          this.skillMoveHeroes.push({
            ...hero,
            leftLife,
            shield,
            newLocationsId: item.moveLocation
          })
        }
      })
    }
    return {
      ...hero,
      leftLife,
      shield,
      locationId
    };
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
   * 先判断tmpTargets中有无对象，若有对象，判断对象是否存在并且位移
   * 若无位移且存在，则选定，否则重现选择对象进行攻击
   * 没有rangeIds参数意味着当前英雄的攻击范围内没有敌方Hero，需选定距离最近的敌方Hero返回
   * 有rangeIds参数需先判断攻击范围内有无敌方Hero，有则返回敌方Hero，没有则返回null
   * @param {Array<Object>} targets 目标Hero列表
   * @param {Object} hero 当前Hero
   * @param {Object} rangeIds Hero攻击范围ID
   * @return: 目标Hero或者null
   */
  getTargetHero(targets, hero, rangeIds = null) {
    const tmpTargetOrigin = this.tmpTargets[hero.uniqId];
    if (tmpTargetOrigin) {
      const tmpTarget = _.find(_.compact(targets), (item) => item.uniqId === tmpTargetOrigin.uniqId && item.locationId === tmpTargetOrigin.locationId)
      if (tmpTarget) {
        return tmpTarget;
      }
    }
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