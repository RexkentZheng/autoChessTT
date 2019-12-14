import { observable, action } from 'mobx';
import Base from './base';

class GlobalStore extends Base {
  @observable loading = false

  @observable effectSets = new Map()

  @action updatedLoading = (boolean) => {
    this.loading = boolean;
  }

  startLoading(name) {
    this.changeEffects('add', name);
  }

  stopLoading(name) {
    this.changeEffects('delete', name);
  }

  changeEffects(method = 'add', name) {
    if (name.match('/')) {
      const storeName = name.split('/')[0];
      this.changeEffects(method, storeName);
    }
    this.debug(`set ${method}, ${name}`);
    this.effectSets.set(name, method === 'add' ? true : false);
  }

  isLoading(name = '') {
    this.debug(`isLoading ${name}`);
    return !!this.effectSets.get(name);
  }
}

export default new GlobalStore();
