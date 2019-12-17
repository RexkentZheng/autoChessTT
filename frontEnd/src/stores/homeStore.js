import { observable } from 'mobx'
import { request } from 'lib/decorators';
import config from 'config';
import Base from './base';

class HomeStore extends Base {
  @observable info = {};
  @observable line = {};
  @observable aloha = 'Hi, Rex';

  @request(config.urls.getHeroes, 'GET')
  getHeroes(opts) {
    opts.params.number = 5;
    return this.http(opts).then((res) => {
      return res;
    })
  }
}
export default new HomeStore();
