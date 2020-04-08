import _ from 'lodash';

/**
 * @description: 获取index在坐标系中X和Y值
 * 此处需要根据奇数偶数来进行不同的判断，首先根据判断出y的内容
 * 如果index除以7没有余数，则y为index除以7的结果，否则需在结果上+1
 * 如果index除以7没有余数，则x为7
 * 否则x为index减去(y-1)*7，因为上面的y有进行+1操作
 * @param {number} index 元素的Index
 * @return {Object} { x, y } 元素的X和Y轴坐标
 */
const getLocation = (index) => {
  // Y值，有余数则加1，没有则取结果
  const y = index % 7 === 0 ? parseInt(index / 7) : parseInt(index / 7) + 1;
  // X值
  const x = index % 7 === 0 ? 7 : index - 7 * (y - 1);
  return { x, y };
}

/**
 * @description: 根据坐标获取元素离坐标系中具体的距离，设六边形一边的长度为2
 * 首先计算xL的值，判断y是否为偶数，如果为偶数，则xL为x*2*√3
 * 否则为需要在x*2后减去1再乘以√3
 * 上述的操作是以为其实并不是每个正六边形都是对其了Y轴的，奇数偶数的正六边形会有不同程度的位移
 * 接下来计算yL值，以为Y值并无偏移，所以可以的yL为3*y-1
 * @param {Object}} { x, y } 元素的X和Y轴坐标
 * @return {Object} { xL, yL } 元素的X和Y轴距离
 */
const getLength = ({x, y}) => {
  const xL = y % 2 === 0 ? x * 2 * Math.sqrt(3) : (x * 2 - 1) * Math.sqrt(3);
  const yL = y * 3 - 1;
  return { xL, yL };
}

/**
 * @description: 计算以目标六边形中心点位圆形，半径为六边形对角线长度的圆能覆盖多少六边形
 * 想象一张平面直角坐标系，X轴在上方，Y轴在左侧，获取到目标点和每个点的绝对距离，根据勾股定理
 * 得出两个六边形中心点的距离，判断此距离是否小于原的半径，得出小于则可以覆盖
 * PS：1. 六边形一边的长度暂定为2，圆半径的一个单位长度为2倍√3
 * @param {number} index 中心点
 * @param {number} unit 半径倍数
 * @return {Array} 在圆形范围内六边形的index
 */
export const culAttackWidth = (index, unit, max) => {
  const all = _.range(1, max, 1);
  const res = []
  const { xL: indexXX, yL: indexYY } = getLength(getLocation(index));
  _.map(all, (item) => {
    const { xL: itemXX, yL: itemYY } = getLength(getLocation(item));
    // 求绝对距离
    const absDistance = Math.sqrt((Math.pow(Math.abs(indexXX - itemXX), 2) + Math.pow(Math.abs(indexYY - itemYY), 2)));
    // 比较距离
    if (+absDistance.toFixed(5) <= +(2 * Math.sqrt(3) * unit).toFixed(5)) {
      res.push(item)
    }
  })
  return res;
}

/**
 * @description: 利用二次贝塞尔方程算出点的位置
 * @param {number} p0 起始位置
 * @param {number} p1 中间位置
 * @param {number} p2 终止位置
 * @param {number} t 曲率
 * @return: 计算后的点的位置
 */
export const calBezier = (p0, p1, p2, t) => {
  const k = 1 - t;
  return k * k * p0 + 2 * (1 - t) * t * p1 + t * t * p2;
}

/**
 * @description: 绘制一条曲线路径
 * 首先根据曲率算出起点和终点的中间点，得到x,y的坐标，存放于cp中
 * 之后算出第一个Q0，B，根据这个可以得到贝塞尔曲线的控制点
 * 最后使用canvas的quadraticCurveTo方法进行绘制
 * @param  {Object} ctx canvas渲染上下文
 * @param  {Array<number>} start 起点
 * @param  {Array<number>} end 终点
 * @param  {number} curveness 曲度(0-1)
 * @param  {number} percent 绘制百分比(0-100)
 */
export const drawCurvePath = ( ctx, start, end, curveness, percent ) => {
  const cp = [
    ( start[ 0 ] + end[ 0 ] ) / 2 - ( start[ 1 ] - end[ 1 ] ) * curveness,
    ( start[ 1 ] + end[ 1 ] ) / 2 - ( end[ 0 ] - start[ 0 ] ) * curveness
  ];

  const t = percent / 100;

  const p0 = start;
  const p1 = cp;
  const p2 = end;

  const v01 = [ p1[ 0 ] - p0[ 0 ], p1[ 1 ] - p0[ 1 ] ];     // 向量<p0, p1>
  const v12 = [ p2[ 0 ] - p1[ 0 ], p2[ 1 ] - p1[ 1 ] ];     // 向量<p1, p2>

  const q0 = [ p0[ 0 ] + v01[ 0 ] * t, p0[ 1 ] + v01[ 1 ] * t ];
  const q1 = [ p1[ 0 ] + v12[ 0 ] * t, p1[ 1 ] + v12[ 1 ] * t ];

  const v = [ q1[ 0 ] - q0[ 0 ], q1[ 1 ] - q0[ 1 ] ];       // 向量<q0, q1>

  const b = [ q0[ 0 ] + v[ 0 ] * t, q0[ 1 ] + v[ 1 ] * t ];

  ctx.moveTo( p0[ 0 ], p0[ 1 ] );
  ctx.quadraticCurveTo(
      q0[ 0 ], q0[ 1 ],
      b[ 0 ], b[ 1 ]
  );

}

/**
 * @description: 获取英雄技能伤害
 * @param {object} hero 英雄信息 
 * @return {Array} 英雄技能伤害数组[200, 300, 400]
 */
export const getSkillDamages = (hero) => hero.skillDetail.match(/\d+\s\/\s\d+\s\/\s\d+/)[0].split(' / ');

/**
 * @description: 获取目标英雄
 * 没有rangeIds参数意味着当前英雄的攻击范围内没有敌方Hero，需选定距离最近的敌方Hero返回
 * 有rangeIds参数需先判断攻击范围内有无敌方Hero，有则返回敌方Hero，没有则返回null
 * @param {Array<Object>} targets 目标Hero列表
 * @param {Object} hero 当前Hero
 * @param {Object} rangeIds Hero攻击范围ID
 * @return: 目标Hero或者null
 */
export const getTargetHero = (targets, hero, rangeIds = null) => {
  let allEnemies = _.filter(targets, (targetItem) => targetItem.role !== hero.role);
  if (rangeIds) {
    allEnemies = _.filter(allEnemies, (enemyItem) => _.indexOf(rangeIds, enemyItem.locationId) >= 0);
  }
  if (allEnemies.length > 0) {
    const sortedEnemy = _.sortBy(allEnemies, (enemyItem) => Math.abs(enemyItem.locationId - hero.locationId));
    return _.first(sortedEnemy);
  }
  return null;
}

export const getLocationFuc = (index) => {
  // Y值，有余数则加1，没有则取结果
  const y = index % 7 === 0 ? parseInt(index / 7) : parseInt(index / 7) + 1;
  // X值
  const x = index % 7 === 0 ? 7 : index - 7 * (y - 1);
  return { x, y };
};
