import { computed } from 'mobx';
import axios from 'lib/request';
import stores from './index';
import D from 'debug';

export default class Base {
  http = axios;

  debug(...args) {
    D(`DOT-STORE:${this.constructor.name}`).apply(D, args);
  }

  @computed get loading() {
    return !!stores.globalStore.default.isLoading(this.constructor.name);
  }

  /**
   * @description: 将map转化成Obj的函数
   * @param {Map} shallow map
   * @return {Object}
   */
  mapToObj(map) {
    const rzt = {};
    const entries = map.extries();
    for (let [k, v] of entries) {
      rzt[k] = v;
    }
    return rzt;
  }
}

