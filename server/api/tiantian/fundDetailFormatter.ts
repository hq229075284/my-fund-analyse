import dayjs from 'dayjs'
import log from '@/utils/log'
import { ResponseData } from './fundDetail'

enum nameMap {
  'Z' = '近1周',
  'Y' = '近1月',
  '3Y' = '近3月',
  '6Y' = '近6月',
  '1N' = '近1年',
  '2N' = '近2年',
  '3N' = '近3年',
  '5N' = '近5年',
  'JN' = '今年以来',
  'LN' = '成立以来',
}
type categories='近1周'|'近1月'|'近3月'|'近6月'|'近1年'|'近2年'|'近3年'|'近5年'|'今年以来'|'成立以来'
export type IDescriptionOfFundRank = {
  [key in categories]:{
    类别:categories
    排名:number
    总数:number
    前百分之:number|''
  }
}

function rankFormatter(detail:ResponseData) {
  let rankInfo:IDescriptionOfFundRank
  if (detail.JDZF?.Datas) {
    rankInfo = detail.JDZF.Datas.reduce((collection, item) => {
      const description = {
        类别: nameMap[item.title],
        排名: Number(item.rank),
        总数: Number(item.sc),
        前百分之: Number.isNaN((+item.rank) / (+item.sc) * 100)
          ? '' as const
          : (+item.rank) / (+item.sc) * 100,
      }
      collection[nameMap[item.title]] = description
      return collection
    }, {} as IDescriptionOfFundRank)
  } else {
    rankInfo = (['近1周', '近1月', '近3月', '近6月', '近1年', '近2年', '近3年', '近5年', '今年以来', '成立以来'] as const).reduce((collection, title) => {
      const description = {
        类别: title,
        排名: 9999,
        总数: 9999,
        前百分之: 100,
      }
      collection[title] = description
      return collection
    }, {} as IDescriptionOfFundRank)
  }
  return rankInfo
}

function tradeFormatter(detail:ResponseData) {
  try {
    if (detail.JJCC?.Datas) {
      const tradeInfo = detail.JJCC.Datas.InverstPosition.fundStocks.map((item) => ({
        股票简称: item.GPJC,
        行业名称: item.INDEXNAME,
      }))
      return tradeInfo
    }
    return []
  } catch {
    log.error(`${detail.fundCode} has error in tradeFormatter`)
    return []
  }
}

function baseInfoFormatter(detail:ResponseData) {
  const maxAndMinInRange = {
    /**
     * 时间段
     */
    近1周: {
      /**
       * 该时间段内，最大净值
       */
      max: 0,
      /**
       * 该时间段内，最小净值
       */
      min: 99,
      /**
       * 最近一天在该时间段内处于的净值百分比位置
       */
      currentPercent: 0,
    },
    近1月: { max: 0, min: 99, currentPercent: 0 },
    近3月: { max: 0, min: 99, currentPercent: 0 },
    近6月: { max: 0, min: 99, currentPercent: 0 },
    近1年: { max: 0, min: 99, currentPercent: 0 },
  }

  function getDateRange(value:number, unit:dayjs.ManipulateType) {
    const endDate = dayjs().hour(0).minute(0).second(0).millisecond(0).valueOf()
    const startDate = dayjs().subtract(value, unit).hour(0).minute(0).second(0).millisecond(0).valueOf()
    return { startDate, endDate }
  }

  type keyType=keyof typeof maxAndMinInRange

  (Object.keys(maxAndMinInRange) as keyType[]).forEach((key) => {
    const timeMap:{
      [key in keyType]:[number, dayjs.ManipulateType]
    } = {
      近1周: [1, 'week'],
      近1月: [1, 'month'],
      近3月: [3, 'month'],
      近6月: [6, 'month'],
      近1年: [1, 'year'],
    }
    const { startDate, endDate } = getDateRange(...timeMap[key])

    let { max, min } = maxAndMinInRange[key]
    detail.trend.forEach((item, i) => {
      const time = dayjs(`${item.FSRQ} 00:00:00`).valueOf()
      if (time >= startDate && time <= endDate) {
        max = Math.max(+item.DWJZ, max)
        min = Math.min(+item.DWJZ, min)
      }
      maxAndMinInRange[key].max = max
      maxAndMinInRange[key].min = min
      if (i === detail.trend.length - 1) {
        let currentPercent = ((+item.DWJZ - min) / (max - min)) * 100
        if (Object.is(NaN, currentPercent)) currentPercent = 0
        maxAndMinInRange[key].currentPercent = currentPercent
      }
    })
  })

  let FTYPE
  let SGZT
  let RISKLEVEL
  if (detail.JJXQ?.Datas) {
    ({ FTYPE, SGZT } = detail.JJXQ.Datas);
    ({ RISKLEVEL } = detail.JJXQ.Datas)
    if (RISKLEVEL === '--') RISKLEVEL = '1'
  } else {
    FTYPE = ''
    SGZT = ''
    RISKLEVEL = '1'
  }
  return {
    基金类型: FTYPE,
    申购状态: SGZT,
    /**
      * 风险等级
      *  -- 低,
      *  1  低,
      *  2  中低,
      *  3  中,
      *  4  中高,
      *  5  高
      */
    RISKLEVEL,
    风险等级: `${['低', '中低', '中', '中高', '高'][+RISKLEVEL - 1]}风险`,
    maxAndMinInRange,
  }
}

export default function formatter(detail:ResponseData) {
  const rankInfo = rankFormatter(detail)
  const tradeInfo = tradeFormatter(detail)
  const baseInfo = baseInfoFormatter(detail)
  return {
    rankInfo,
    tradeInfo,
    baseInfo,
  }
}

export type IFormattedFundDetail=ReturnType<typeof formatter>
