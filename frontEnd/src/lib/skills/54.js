/**
 * @Description: 英雄技能-熔岩巨兽-墨菲特-malphite-54
 * @Author: Rex Zheng
 * @Date: 2020-04-13 16:14:26
 * @LastEditor: Rex Zheng
 * @LastEditTime: 2020-04-13 22:54:34
 */

/**
 * @description: 石头的技能方法
 * 内容：在战斗环节开始时，墨菲特会带着一层护盾，护盾值相当于他的最大生命值。
 * 护盾最大生命值: 40 / 45 / 50
 * 这英雄其实没啥可说的，就获取到生命自最大的百分比，然后这个百分比是按照星级成长的
 * @param {object} hero 释放技能的英雄-熔岩巨兽
 * @return: 如下
 */
export default (hero) => {
  return {
    shield: +hero.life * [40, 45, 50][hero.grade - 1] / 100
  }
}