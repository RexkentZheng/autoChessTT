import resBeautiful from './../lib/resBeautiful';

const index = async (ctx, next) => {
  try {
    await new Promise((reslove) => {
      setTimeout(() => {
        reslove();
      }, 2000);
    })
    ctx.response.status = 200;
    ctx.response.body = resBeautiful.set({
      a: 111
    })
  } catch (error) {
    console.log(error);
  }
}

const error = async (ctx, next) => {
  await ctx.render('error')
}

module.exports = {
  'GET /' : index,
  'GET /error': error,
}
