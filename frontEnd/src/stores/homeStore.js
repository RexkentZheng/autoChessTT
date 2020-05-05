import config from 'config';
import { request } from 'lib/decorators';
import _ from 'lodash';
import { autorun, observable } from 'mobx'

import Base from './base';

class HomeStore extends Base {
  @observable level = 9;
  @observable heroList = _.map(_.range(5), () => null);;
  @observable heroWaitting = _.map(_.range(9), () => null);
  @observable heroTable = _.map(_.range(28), () => null);
  @observable heroTableEnemy = _.map(_.range(28), () => null);
  @observable money = 9999;
  @observable jobRelations = {};
  @observable raceRelations = {};
  @observable relations = [];
  @observable status = 'waitting';

  /**
   * @description: 根据等级随机获取英雄
   * 获取英雄后更新list并且更新剩余金钱
   * @return: void
   */
  @request(config.urls.getRealHeroes, 'GET')
  getRealHeroes(opts) {
    opts.params.level = this.level;
    return this.http(opts).then((res) => {
      this.heroList = res.map((hero) => _.extend(hero, {grade: 1}));
    }).then(() => {
      this.updateMoney(-2);
    })
  }

  /**
   * @description: 购买英雄
   * 判断waitting中是否有空位，有空位则填充hero，无空位跳过
   * @param {number} index list中hero的顺序
   * @param {object} hero 购买的英雄
   * @return: void
   */
  buyHero(hero, index) {
    let hasChange = false;
    this.heroWaitting = this.heroWaitting.map((item) => {
      if (!hasChange && !item) {
        hasChange = true;
        return {
          ...hero,
          leftLife: +hero.life,
          leftMagic: +hero.chessId === 31 ? +hero.magic - 10 : +hero.startMagic,
          shield: 0,
          blind: 0,
          ctrl: 0,
          pause: {
            timeLeft: 0,
            dps: []
          }
        };
      }
      return item;
    })
    const completeHero = {
      ...hero,
      leftLife: +hero.life,
      leftMagic: +hero.startMagic
    }
    if (hasChange) {
      this.updateMoney(-hero.price);
      this.updateHeroGrade(completeHero);
      this.updateHeroList(null, index);
    }
  }

  /**
   * @description: 三个相同英雄合成更高等级的英雄
   * 获取table和waitting中所有的英雄，是否有三个指定hero，如果有，开始升级
   * 先判断table中是否有指定hero，如果有，升级table中的英雄，去掉table和waitting中剩余的指定hero
   * 如果没有，升级waitting中hero，并去掉无用hero
   * 升级成功后递归调用改方法，判断是否有三个二星英雄需要升级成三星
   * @param {object} hero 指定hero
   * @return: void
   */
  updateHeroGrade(hero) {
    if (this.heroFilter(_.flatten([this.heroTable, this.heroWaitting]), hero).length === 3) {
      const tableRes = this.heroFilter(this.heroTable, hero);
      if (tableRes.length > 0) {
        this.updateSingleGrade('Table', hero);
        this.removeOtherHeroGrade('Waitting', hero);
      } else {
        this.updateSingleGrade('Waitting', hero);
      }
      this.updateHeroGrade(_.extend(hero, {grade: hero.grade + 1}))
    }
  }

  /**
   * @description: 合并Hero数组中相同的hero，index靠前的升级并且更新状态，其余的干掉
   * @param {string} type 数组类型
   * @param {object} hero 待合并的英雄
   * @return: void
   */
  updateSingleGrade(type, hero) {
    let hasChange = false;
    this[`hero${type}`] = this[`hero${type}`].map((item) => {
      if (this.compareHero(item, hero) && !hasChange) {
        hasChange = true;
        return _.extend(item, {
          grade : hero.grade + 1,
          leftLife: +item.leftLife * 1.8,
          attack: +item.attack * 1.8
        })
      } else if (this.compareHero(item, hero)){
        return null;
      } else {
        return item;
      }
    })
  }

  /**
   * @description: 去掉Hero数组中与hero相同的内容
   * @param {string} type 数组类型
   * @param {object} hero 匹配的hero
   * @return: void
   */
  removeOtherHeroGrade(type, hero) {
    this[`hero${type}`] = this[`hero${type}`].map((item) => {
      if (this.compareHero(item, hero)){
        return null;
      } else {
        return item;
      }
    })
  }

  /**
   * @description: 对比hero，判断二者之间id和grade是否相同
   * @param {object} newHero 英雄1
   * @param {object} oldHero 英雄2
   * @return: 布尔值
   */
  compareHero(newHero, oldHero) {
    if (!newHero) {
      return false;
    }
    return newHero.chessId === oldHero.chessId && newHero.grade === oldHero.grade;
  }

  /**
   * @description: Hero数组过滤器
   * @param {object} hero 条件hero，只保存与之相同的hero
   * @return: 与hero相同的hero数组
   */
  heroFilter(heroArr, hero) {
    return _.filter(heroArr, (item) => {
      if (item) {
        return this.compareHero(item, hero);
      }
      return false;
    })
  }

  /**
   * @description: 更新Hero数组系列函数的柯里化
   * @param {string} type Hero系列的类型
   * @return: 返回新的函数
   */
  updateHeroTableAndListAndWaitting(type) {
    return (hero, index) => {
      this[`hero${type}`][index] = hero;
    }
  }

  /**
   * @description: 更新HeroTable数组，修改当前index的英雄数据
   * @param {object} hero 当前英雄
   * @param {number} index 当前顺序
   * @return: void
   */
  updateHeroTable(hero, index) {
    return this.updateHeroTableAndListAndWaitting('Table')(hero, index);
  }

  updateHeroTableEnemy(hero, index) {
    return this.updateHeroTableAndListAndWaitting('TableEnemy')(hero, index);
  }

  /**
   * @description: 更新HeroList数组，修改当前index的英雄数据
   * @param {object} hero 当前英雄
   * @param {number} index 当前顺序
   * @return: void
   */
  updateHeroList(hero, index) {
    return this.updateHeroTableAndListAndWaitting('List')(hero, index);
  }

  /**
   * @description: 更新HeroWaitting数组，修改当前index的英雄数据
   * @param {object} hero 当前英雄
   * @param {number} index 当前顺序
   * @return: void
   */
  updateHeroWaitting(hero, index) {
    return this.updateHeroTableAndListAndWaitting('Waitting')(hero, index);
  }

  /**
   * @description: 更新等级
   * @param {string} type 增加或者减少
   * @return: void
   */
  updateLevel(type) {
    if (type === 'add') {
      if (this.level < 9) {
        this.level = this.level + 1;
      }
    } else {
      if (this.level > 1) {
        this.level = this.level - 1;
      }
    }
  }

  /**
   * @description: 更新金钱
   * @param {number} num 变动数目
   * @return: void
   */
  updateMoney(num) {
    this.money = this.money += num;
  }

  /**
   * @description: 获取不重复的英雄列表
   * @param {Array[object]} heroes 英雄列表
   * @return: 不重复的英雄列表
   */
  getUniqHeroes(heroes) {
    let uniqHeroes = [];
    _.forEach(_.groupBy(heroes, 'chessId'), (value) => uniqHeroes.push(_.first(value)))
    return uniqHeroes;
  }

  /**
   * @description: 获取英雄中的关系被动
   * @param {Array[object]} heroes 英雄列表
   * @param {string} type 关系类型
   * @return: 英雄关系对象
   */
  getRelationsObj(heroes, type, configType) {
    let relations = {};
    _.map(heroes, (hero) => {
      if (hero) {
        if (relations[+hero[`${type}Ids`]]) {
          relations[+hero[`${type}Ids`]].num += 1;
        } else {
          relations[+hero[`${type}Ids`]] = {
            ...config[configType][+hero[`${type}Ids`]],
            num: 1,
            type
          }
        }
      }
    })
    return relations;
  }

  /**
   * @description: 获取英雄被动数组
   * @param {Array[object]} relationObj 英雄关系对象
   * @return: 英雄关系数组
   */
  getRelationsArr(relationObj) {
    let relations = [];
    _.forIn(relationObj, (value, key) => {
      relations.push({
        ...value,
        id: key
      })
    })
    return relations;
  }

  /**
   * @description: 更新关系数组，每当heroTable有变动时会自动触发
   * @return: void
   */
  heroRelation = autorun(() => {
    const uniqHeroes = this.getUniqHeroes(this.heroTable);
    this.relations = _.sortBy(_.concat(
      this.getRelationsArr(this.getRelationsObj(uniqHeroes, 'job', 'allJobs')),
      this.getRelationsArr(this.getRelationsObj(uniqHeroes, 'race', 'allRaces'))
    ), ['num']);
    // console.log(toJS(this.relations));
  });

  /**
   * @description: 更新当前状态，判断是否在战斗中
   * @param {string} type 更新后的状态
   */
  updateStatus(type) {
    this.status = type;
  }

}

export default new HomeStore();
