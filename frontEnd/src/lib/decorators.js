import _ from 'lodash';
import Root from 'stores/globalStore';
import { Message } from './notification';

export function request(url, verb='GET') {
  // target 实际是prototype，所以不能使用target调用成员函数或者修改observable的内容
  return (target, propertyKey, descriptor) => {
    target.debug('decorator request init');
    const method = descriptor.value;
    const objName = target.constructor.name;
    const logPrefix = `decorator request for ${objName}/${propertyKey}`;
    const storeFuncKey = `${objName}/${propertyKey}`
    descriptor.value = function(...args) {
      Root.startLoading(storeFuncKey);
      const payloadKey = verb.toLowerCase() === 'get' ? 'params' : 'data';
      const opts = {
        url: _.isFunction(url) ? url.apply(this, args) : url,
        method: verb,
        [payloadKey]: _.isObject(args[0]) ? args[0] : {}
      }
      this.debug(opts);
      const promise = method.apply(this, [opts, ...args]);
      this.debug(
        `${logPrefix} request called: ${JSON.stringify(opts)}`,
        opts,
        args
      );
      if (promise && promise.then) {
        return promise
          .then((res = {}) => {
            this.debug(`${logPrefix} promise done`, res);
            Root.stopLoading(storeFuncKey);
            return res;
          }).catch(e => {
            const source = _.get(e, 'from', false);
            this.debug(`${logPrefix} promise error:`, e, _.get(e, 'stack', 'no stack'), source);
            Root.stopLoading(storeFuncKey);
            // 只处理返回200的code非空result
            if (source === 'code') {
              Message('warning', 'Warning', e.toString());
            }
            if (!(e instanceof Error)) {
              e = Error(e.toString ? e.toString() : e);
            }
            return e;
          });
      }
      Root.stopLoading(storeFuncKey);
      return promise;
    }
  }
}