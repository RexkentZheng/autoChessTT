const index = async (ctx, next) => {
  try {
    const a = await new Promise((reslove) => {
      setTimeout(() => {
        reslove();
      }, 2000);
    })
    ctx.response.status = 200;
    ctx.response.body = {
      code: 0,
      data: {
        a : 111
      }
    };

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
