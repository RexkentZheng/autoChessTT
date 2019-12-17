import model from '../models';
import resBeautiful from './../lib/resBeautiful';
const { test:Test } = model;

const test = async (ctx, next) => {
  try {
    const testList = await Test.findAll();
    ctx.response.body = resBeautiful.set(testList);
  } catch (error) {
    ctx.app.emit('error', error, ctx);
  }
}

module.exports = {
  'GET /test' : test,
}