import devDB from './dev';

const config = {
  'server': {
    'port': 8987
  },
  'resStatus': [
    [404,'NotFound'],
    [1,'Waitting'],
    [-1, 'Server Error'],
    [10001, 'System Error']
  ]
};

if (process.env.NODE_ENV === 'dev') {
  config.db = devDB
}

// Todo  如果是生产环境需配置生产环境的数据库

module.exports = config;