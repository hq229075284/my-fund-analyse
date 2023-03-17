import axios from 'axios'
import log from '../utils/log'

export interface IRowOfFundList {
  '基金编码':string
  '基金名称':string
  '统计日期':string
  '单位净值':number
  '日增长(%)':number
  '近1周(%)':number
  '近1月(%)':number
  '近3月(%)':number
  '近6月(%)':number
  '近1年(%)':number
  '起购金额':string
  '手续费':number
}

interface IRowOfFundListConstructor{
  new (str:string):IRowOfFundList
}

const Row = (function Row(itemStr:string) {
  const [
    code,
    name,
    type_ignore,
    currentTime,
    unitValue,
    dayIncrease,
    lastWeek,
    lastMonth,
    last3Month,
    last6Month,
    lastYear,
    last2Year_ignore,
    last3Year_ignore,
    fromCurrentYear_ignore,
    fromStart_ignore,
    ignore1,
    ignore2,
    ignore3,
    ignore4,
    ignore5,
    ignore6,
    ignore7,
    ignore8,
    ignore9,
    startPrice,
    originServiceCharge,
    preferentialServiceCharge,

  ] = itemStr.split('|')
  this['基金编码'] = code
  this['基金名称'] = name
  this['统计日期'] = currentTime
  this['单位净值'] = Number(unitValue)
  this['日增长(%)'] = Number(dayIncrease)
  this['近1周(%)'] = Number(lastWeek)
  this['近1月(%)'] = Number(lastMonth)
  this['近3月(%)'] = Number(last3Month)
  this['近6月(%)'] = Number(last6Month)
  this['近1年(%)'] = Number(lastYear)
  this['起购金额'] = startPrice
  this['手续费'] = Number((preferentialServiceCharge || originServiceCharge)?.replace('%', ''))
  return this
} as unknown as IRowOfFundListConstructor)

interface IFilterParams{
  requestParams?:{
    /**
     * 类型
     * hh    混合
     * zq    债券
     * pg    偏股
     * gp    股票
     */
    ft?:'hh'|'zq'|'pg'|'gp'
    /**
     * 排序字段
     * r     日增长
     * z     近1周
     * y     近1月
     * 3y    近3月
     * 6y    近6月
     * 1n    近1年
     * 2n    近2年
     * 3n    近3年
     * jn    今年以来
     * ln    成立以来
     * dwjz  单位净值
     */
    sc?:'r'|'z'|'y'|'3y'|'6y'|'1n'|'2n'|'3n'|'jn'|'ln'|'dwjz'
    /**
     * 排序方向，asc|desc
     */
    st?:'asc'|'desc'
    /**
     * 页码
     */
    pi?:number
    /**
     * 1页条数
     */
    pn?:number
    /**
     * 基金公司编码
     */
    cp?:string
    /**
     * 分类
     * ''     全部
     * '041'  长期纯债
     * '042'  短期纯债
     * '043'  混合债基
     * '045'  可转债
     */
    fr?:''|'041'|'042'|'043'|'045'
    /**
     * 杠杆
     * 0-100
     * 100-150
     * 150-200
     * 200
     */
    plevel?:'0-100'|'100-150'|'150-200'|'200'
  }
  limit?:number
}

export async function filter({ requestParams = {}, limit = 100000 }:IFilterParams = {}) {
  const list = await axios({
    method: 'get',
    url: 'https://fundapi.eastmoney.com/fundtradenew.aspx',
    params: {
      ft: 'zq',
      sc: '3y',
      st: 'desc',
      pi: 1,
      pn: 100000,
      cp: '',
      fr: '',
      plevel: '',
      // 未知字段
      ct: '',
      cd: '',
      ms: '',
      fst: '',
      ftype: '',
      fr1: '',
      fl: 0,
      isab: 1,
      ...requestParams,
    },
    headers: {
      Referer: 'http://fund.eastmoney.com/',
    },
  }).then((response:{data:string}) => {
    let message
    eval(`message=${response.data.match(/{.*}/)![0]}`)
    const datas = message.datas as string[]
    if (!datas.length) {
      throw new Error(`${requestParams.ft || 'zq'}数据获取为空`)
    }

    const rows = datas
      .map((item) => new Row(item))
      // .filter(
      //   customFilter
      //     || ((row) => (
      //     // row['近1月(%)']<0||row['近3月(%)']<0/* ||row['近6月(%)']<0 */)
      //       row['近1月(%)'] < 0)
      //       && row['近1周(%)'] >= 0.02
      //       && row['手续费'] <= 0.06
      //       && row['日增长(%)'] >= 0
      //     ),
      // )
      .slice(0, limit)

    return rows
    // if (rows.length) {
    // }
    // log.error('无符合条件的数据')
  })

  return list
}

export async function getFundList() {
  try {
    const list = await filter()
    return list
  } catch (e) {
    log.error(e.message)
    log.error('基金列表获取失败')
    return []
  }
}
