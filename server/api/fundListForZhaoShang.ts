/* eslint-disable no-await-in-loop */
import axios from 'axios'
import log from '../utils/log'
import { getDetail } from './fundDetailForZhaoShang'

export interface IRowOfFundListForZhaoShang {
  '基金编码':string
  '基金名称':string
  '统计日期':string
  '单位净值':number
  '日增长(%)':number
  '近1周(%)':number|'暂无数据'
  '近1月(%)':number
  '近3月(%)':number
  '近6月(%)':number
  '近1年(%)':number
  '起购金额':'暂无数据'
  '手续费':'暂无数据'
  '是否可购买': string
}

interface IRowOfFundListConstructor{
  new (str:string):IRowOfFundListForZhaoShang
}

const Row = (function Row(item:any) {
  const {
    cpdm: code,
    cpjc: name,
    gxrq: currentTime,
    dwjz: unitValue,
    zf1d: dayIncrease,

    zf1m: lastMonth,
    zf3m: last3Month,
    zf6m: last6Month,
    zf1y: lastYear,

    isBuyAble,
    fundid,
  } = item
  this['基金编码'] = code
  this['基金名称'] = name
  this['统计日期'] = currentTime
  this['单位净值'] = Number(unitValue)
  this['日增长(%)'] = Number(dayIncrease.replace('%', ''))
  this['近1周(%)'] = '暂无数据'
  this['近1月(%)'] = Number(lastMonth.replace('%', ''))
  this['近3月(%)'] = Number(last3Month.replace('%', ''))
  this['近6月(%)'] = Number(last6Month.replace('%', ''))
  this['近1年(%)'] = Number(lastYear.replace('%', ''))
  this['起购金额'] = '暂无数据'
  this['手续费'] = '暂无数据'
  this['是否可购买'] = isBuyAble
  this.fundid = fundid
  return this
} as unknown as IRowOfFundListConstructor)

interface IFilterParams{
  requestParams?:{
    /**
     * 类型
     * -1    全部
     * 3     债券
     * 2     混合
     * 1     股票
     */
    type?:'-1'|'3'|'2'|'1'
    /**
     * n月内同类排行前1/4
     * -1     全部
     * 1      近1个月
     * 3      近3个月
     * 6      近6个月
     * 12     近1年
     */
    tlph?:'-1'|'1'|'3'|'12'
    /**
     * 排序字段
     * zf1d     日增长
     * zf1m     近1月
     * zf3m     近3月
     * zf6m     近6月
     * zf1y     近1年
     * clyl     成立以来
     * dwjz     单位净值
     */
    pxsx?:'zf1d'|'zf1m'|'zf3m'|'zf6m'|'zf1y'|'clyl'|'dwjz'
    /**
     * 排序方向，asc|desc
     */
    sx?:'asc'|'desc'
    /**
     * 第几个开始查询，从1开始
     */
    fyqsjlh?:number
    /**
     * 当前查询条数
     */
    fyjlsl?:number
  }
  limit?:number
}

export async function filter({ requestParams = {}, limit = 100000 }:IFilterParams = {}) {
  let fyqsjlh = 1
  const fyjlsl = 20
  let isFinished = false
  let result = [] as any[]
  async function getList() {
    const content = await axios({
      method: 'get',
      url: 'https://xtrade.newone.com.cn/lc/api/getData',
      params: {
        method: 'querygmjjsxjgnew',
        type: 3,
        pxsx: 'zf1d',
        sx: 'desc',
        fyqsjlh,
        fyjlsl,
        tlph: -1,
        // 未知字段
        fhjglx: 1,
        sgfl: -1,
        fxdj: -1,
        ...requestParams,
      },
      headers: {
        Referer: 'https://xtrade.newone.com.cn/lc4/pclc/',
      },
    })
      .then((response) => response.data.content)
    if (!content.length) isFinished = true
    result = result.concat(content)
  }

  while (!isFinished) {
    await getList()
    fyqsjlh += fyjlsl
  }

  if (!result.length) {
    throw new Error(`${requestParams.type || '3'}，列表数据获取为空`)
  }

  // await Promise.all(
  //   result.map((r, i) => getDetail(result[i]).then((content) => {
  //     result[i].isBuyAble = content?.isBuyAble || result[i].isBuyAble
  //   })),
  // )

  //   console.log('result', result.length)
  const rows = result
    .filter((item) => item.isBuyAble === '1')
    .map((item) => new Row(item))
    .slice(0, limit)
  //   console.log('rows', rows.length)

  return rows
}

export async function getFundList(...args:Parameters<typeof filter>) {
  try {
    const list = await filter(...args)
    return list
  } catch (e) {
    log.error(e.message)
    log.error('基金列表获取失败')
    return []
  }
}
