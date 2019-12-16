import Koa from 'koa'
const app = new Koa()
import views from 'koa-views'
import json from 'koa-json'
import onerror from 'koa-onerror'
import bodyparser from 'koa-bodyparser'
import logger from 'koa-logger'
import routes from './src/server/routes'
import resBeautiful from './src/lib/resBeautiful'

// error handler
onerror(app)

// middlewares
app.on("error",(error,ctx)=>{
  ctx.response.body = resBeautiful.error(
    -1, 
    error.message
  )
});
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/src/views', {
  map : {html:'ejs'}
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(routes());

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

console.log('==============================================================');
console.log(' DZ-VPN Subserver');
console.log('--------------------------------------------------------------');
console.log(' Start prot : 8987 ')
console.log(` Up time: ${new Date().toString()}`);
console.log('==============================================================');

module.exports = app
