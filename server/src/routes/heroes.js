import model from '../models';
import resBeautiful from './../lib/resBeautiful';
const { heroes:Hero } = model;
import _ from 'lodash';
import config from '../config/default'
import { getRateResult } from '../lib/utils';

const heroes = {
  hero1: _.filter(config.heroes, (hero) => hero.price === 1 && hero.season_id === '2'),
  hero2: _.filter(config.heroes, (hero) => hero.price === 2 && hero.season_id === '2'),
  hero3: _.filter(config.heroes, (hero) => hero.price === 3 && hero.season_id === '2'),
  hero4: _.filter(config.heroes, (hero) => hero.price === 4 && hero.season_id === '2'),
  hero5: _.filter(config.heroes, (hero) => hero.price === 5 && hero.season_id === '2') 
}

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

const getRealRandomHeroes = async (ctx, next) => {
  try {
    const pickResult = [];
    const { level, number } = ctx.query;
    const rateArr = _.values(config.pickRate[level]);
    for (let i = 0; i<number; i++) {
      const star = getRateResult(rateArr);
      pickResult.push(_.sample(heroes[`hero${star}`]))
    }
    ctx.response.body = resBeautiful.set(_.map(pickResult, (hero) => ({
      ..._.omit(hero, 'level'),
      info: hero.level[0],
      leftHealth: hero.level[0].health,
      leftMana: hero.level[0].StartingMana
    })));
  } catch (error) {
    ctx.app.emit('error', error, ctx);
  }
}

module.exports = {
  'GET /' : list,
  'POST /update' : updateHeroList,
  'GET /randomHeroes' : getRandomHeroes,
  'GET /getRealRandomHeroes' : getRealRandomHeroes,
}