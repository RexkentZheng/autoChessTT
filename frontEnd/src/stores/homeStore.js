import { observable } from 'mobx'
import { request } from 'lib/decorators';
import config from 'config';
import Base from './base';

class HomeStore extends Base {
  @observable info = {};
  @observable line = {};
  @observable aloha = 'Hi, Rex';
  @observable level = 1;

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
      return res;
    })
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
