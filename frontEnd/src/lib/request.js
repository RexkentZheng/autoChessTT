import axios from 'axios';
import Qs from 'qs';
import _ from 'lodash';
import { Message } from './notification';

const request = axios.create({
  timeout: 10 * 60 * 1000,
  baseURL: 'api',
  validateStatus: (status) => {
    return status >= 200 && status < 400;
  },
  paramsSerializer: (params) => {
    return Qs.stringify(params, { format: 'RFC3986' });
  },
  headers: {
    Accept: 'application/octet-stream, application/json, text/plain, */*',
    post: {
      'Content-Type': 'application/json'
    }
  }
});

const checkEmptyVal = (config, payloadKey) => {
  _.each(config[payloadKey], (val, key) => {
    const _isNaN = _.isNaN(val);
    const _isNull = _.isNull(val);
    const _isUndefined = _.isUndefined(val);
    if (_isNaN) {
      // eslint-disable-next-line no-console
      console.error(`request ${config.url} ${payloadKey}.${key} is NaN`, config);
    }
    if (_isNull) {
      // eslint-disable-next-line no-console
      console.error(`request ${config.url} ${payloadKey}.${key} is Null`, config);
    }
    if (_isUndefined) {
      // eslint-disable-next-line no-console
      console.error(`request ${config.url} ${payloadKey}.${key} is Undefined`, config);
    }
  })
}

// 请求拦截
request.interceptors.request.use((config) => {
  // 下面为跨域配置
  // config.withCredentials = true;

  // 转换数据格式
  if (config.data instanceof FormData) {
    const tmpData = {};
    const entries = config.data.entries();
    for (let [k, v] of entries) {
      entries[k] = v;
    }
    config.data = tmpData;
  }

  checkEmptyVal(config, 'params');
  checkEmptyVal(config, 'data');

  if (_.isObject(config.data) && _.isEmpty(config.data)) {
    delete config.data;
  }
  return config;
}, (error) => {
  Message('error', 'Request Error', error);
  return Promise.reject(error instanceof Error ? error: Error(`${error}`));
});

// 响应拦截
request.interceptors.response.use((response) => {
  try {
    if (response.headers['content-type'].match('application/json')) {
      let { code, data, msg } = response.data;
      if (code !== 0) {
        // reject会被直接catch，不会传递
        const err = Error(msg);
        err.from = 'code';
        return Promise.reject(err);
      }
      return data;
    }
    return response;
  } catch (e) {
    e.form = 'response-use';
    return Promise.reject(e);
  }
}, (error) => {
  const code = _.get(error, 'response.data.status', '');
  // 可以根据code类型来判断是何种错误，比方说token是否过期之类
  if (!axios.isCancel(error)) {
    Message('error', `Network Error: ${code}`, error);
    error = Error(`[Network Error]: ${error}`);
  }
  error.form = 'network';
  return Promise.reject(error);
});

export default request;

