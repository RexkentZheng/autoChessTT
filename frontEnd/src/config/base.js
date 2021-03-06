import heroes from './heroes';
import allJobs from './jobs';
import allRaces from './races';

const groupByRacesAndJobs = (collection) => {
  const obj = {};
  collection.map((item) => {
    obj[item.traitId] = item;
  })
  return obj;
}

export default {
  heroes,
  allRaces: groupByRacesAndJobs(allRaces),
  allJobs: groupByRacesAndJobs(allJobs),
  urls: {
    root: '/',
    test: '/test',
    getHeroes: '/heroes/randomHeroes',
    getRealHeroes: '/heroes/getRealRandomHeroes'
  },
  raceImg: {
    '1': 'demon',
    '2': 'dragon',
    '3': 'exile',
    '4': 'glacial',
    '5': 'imperial',
    '6': 'ninja',
    '7': 'noble',
    '8': 'phantom',
    '9': 'pirate',
    '10': 'robot',
    '11': 'void',
    '12': 'wild',
    '13': 'yordle',
    '14': 'hextech'
  }, //种族小图对应关系配置表
  jobImg: {
    '1': 'sorcerer',
    '2': 'assassin',
    '3': 'blademaster',
    '4': 'brawler',
    '5': 'elementalist',
    '6': 'guardian',
    '7': 'gunslinger',
    '8': 'knight',
    '9': 'ranger',
    '10': 'shapeshifter'
  }, //职业对应关系配置表
  raceImg2: {
    '15': 'crystal',
    '16': 'desert',
    '17': 'electric',
    '18': 'glacial',
    '19': 'inferno',
    '20': 'light',
    '21': 'steel',
    '22': 'mountain',
    '23': 'ocean',
    '24': 'poison',
    '25': 'shadow',
    '26': 'wind',
    '27': 'woodland'
  }, //二期种族小图对应关系配置表
  jobImg2: {
    '11': 'alchemist',
    '12': 'assassin',
    '13': 'avatar',
    '14': 'berserker',
    '15': 'summoner',
    '16': 'druid',
    '17': 'sorcerer',
    '18': 'mystic',
    '19': 'predator',
    '20': 'ranger',
    '21': 'warden',
    '22': 'blademaster2',
    '23': 'soul'
  } //二期职业对应关系配置表
}
