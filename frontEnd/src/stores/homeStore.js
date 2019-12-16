import { observable } from 'mobx'
import { request } from 'lib/decorators';
import config from 'config';
import Base from './base';

class HomeStore extends Base {
  @observable info = {};
  @observable line = {};
  @observable aloha = 'Hi, Rex';
  @observable res = null;

  @request(config.urls.root, 'GET')
  getHomeRes(opts) {
    return this.http(opts).then((res) => {
      this.res = res;
      return res;
    })
  }
}
export default new HomeStore();
