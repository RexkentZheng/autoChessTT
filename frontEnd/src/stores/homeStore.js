import { observable } from 'mobx'
import { request } from 'lib/decorators';
import config from 'config';
import Base from './base';
import _ from 'lodash';

class HomeStore extends Base {
  @observable level = 1;
  @observable heroList = [];
  @observable heroWaitting = _.map(_.range(9), () => null);
  @observable heroTable = _.map(_.range(28), () => null);

  @request(config.urls.getHeroes, 'GET')
  getHeroes(opts) {
    opts.params.number = 5;
    return this.http(opts).then((res) => {
      return res;
    })
  }

  @request(config.urls.getRealHeroes, 'GET')
  getRealHeroes(opts) {
    opts.params.level = this.level;
    return this.http(opts).then((res) => {
      this.heroList = res;
    })
  }

  updateHeroWaitting(type, hero, delIndex = 0) {
    if (type === 'add') {
      let hasChange = false;
      this.heroWaitting = this.heroWaitting.map((item) => {
        if (!hasChange && !item) {
          hasChange = true;
          return hero;
        }
        return item;
      })
    } else {
      this.heroWaitting[delIndex] = hero;
    }
  }

  updateHeroTableAndList(type) {
    return (hero, index) => {
      this[`hero${type}`][index] = hero;
    }
  }

  updateHeroTable(hero, index) {
    return this.updateHeroTableAndList('Table')(hero, index);
  }

  updateHeroList(hero, index) {
    return this.updateHeroTableAndList('List')(hero, index);
  }

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

}

export default new HomeStore();
