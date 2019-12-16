import resBeautiful from './../lib/resBeautiful';

const index = async (ctx, next) => {
  try {
    const a = await new Promise((reslove) => {
      setTimeout(() => {
        reslove();
      }, 2000);
    })
    ctx.response.status = 200;
    ctx.response.body = resBeautiful.set({
      a: 'Here we go'
    })
  } catch (error) {
    ctx.app.emit('error', error, ctx);
  }
}

const error = async (ctx, next) => {
  await ctx.render('error')
}

module.exports = {
  'GET /' : index,
  'GET /error': error,
}
