import model from '../models';
import resBeautiful from './../lib/resBeautiful';
const { heroes:Hero } = model;
import _ from 'lodash';

const list = async (ctx, next) => {
  try {
    const testList = await Hero.findAll();
    ctx.response.body = resBeautiful.set(testList);
  } catch (error) {
    ctx.app.emit('error', error, ctx);
  }
}

const updateHeroList = async (ctx, next) => {
  try {
    const originHeroes = ctx.request.body;
    const allHeroes = [];
    for (let id in originHeroes) {
      allHeroes.push(_.extend(originHeroes[id], {
        id
      }))
    }
    await Hero.bulkCreate(allHeroes, {
      updateOnDuplicate: ['id', 'level', 'heroId', 'season_id', 'skill_introduce']
    })
      .then((res) => {
        ctx.response.body = resBeautiful.set(res);
      })
  } catch (error) {
    ctx.app.emit('error', error, ctx);
  }
}

const getRandomHeroes = async (ctx, next) => {
  try {
    const { price, number } = ctx.query;
    await Hero.findAll({
      where: {
        season_id: 2
      },
      attributes: ['id', 'heroId', 'hero_name', 'hero_tittle', 'price', 'job', 'race'],
      row: true
    }).then((heroes) => {
      ctx.response.body = resBeautiful.set(_.sampleSize(heroes, number))
    })
  } catch (error) {
    ctx.app.emit('error', error, ctx);
  }
}

module.exports = {
  'GET /' : list,
  'POST /update' : updateHeroList,
  'GET /randomHeroes' : getRandomHeroes,
}