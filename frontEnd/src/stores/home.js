import { observable } from 'mobx'

class HomeStore {
  @observable info = {};
  @observable line = {};
  @observable aloha = 'Hi, Rex';
}
export default new HomeStore();
