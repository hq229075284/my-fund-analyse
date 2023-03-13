import axios from 'axios'
import dayjs from 'dayjs'
import log from '../utils/log.js'

export function getDateRange(value:number, unit:dayjs.ManipulateType) {
  const endDate = dayjs().hour(0).minute(0).second(0).millisecond(0).valueOf()
  const startDate = dayjs().subtract(value, unit).hour(0).minute(0).second(0).millisecond(0).valueOf()
  return { startDate, endDate }
}

interface ISort<T=string>{
  key:T,
  range:[number, dayjs.ManipulateType]
}

type ISortName='近1周'|'近1月'|'近3月'|'近6月'|'近1年'
export type IClassifiedFund = {fundCode:string}&{
  [Category in ISortName]:{
    collection: {x:number, y:number}[]
    description: ISortName
    startDate:number
    endDate:number
    max:number,
    min:number,
    currentPercent:number
  }
}

export async function getChartData(fundCode:string) {
  if (!fundCode) {
    throw new Error(('缺失需要查询的基金编码'))
  }
  const dataAfterHandle = await axios({
    url: `http://fund.eastmoney.com/pingzhongdata/${fundCode}.js?v=${dayjs().format('YYYYMMDDHHmmss')}`,
    method: 'get',
    params: {},
    headers: {
      Referer: 'http://fund.eastmoney.com/',
    },
  })
    .then((response) => {
      let message:{x:number, y:number}[]
      eval(`message = ${response.data.match(/Data_netWorthTrend[^[]*(\[.*\]);/)[1]}`)

      const sort:ISort<ISortName>[] = [
        { key: '近1周', range: [1, 'week'] },
        { key: '近1月', range: [1, 'month'] },
        { key: '近3月', range: [3, 'month'] },
        { key: '近6月', range: [6, 'month'] },
        { key: '近1年', range: [1, 'year'] },
      ]

      // @ts-ignore: 执行eval时赋值
      const chartData = message.reduce(
        (prev, data) => {
        // eslint-disable-next-line no-unused-vars
          Object.entries(prev).forEach(([key, item]) => {
            if (typeof item === 'string') return
            if (data.x >= item.startDate && data.x <= item.endDate) {
              item.collection.push(data)
              if (item.max) {
                if (data.y > item.max) item.max = data.y
              } else {
                item.max = data.y
              }
              if (item.min) {
                if (data.y < item.min) item.min = data.y
              } else {
                item.min = data.y
              }
            }
          })
          return prev
        },
        sort.reduce((prev, item) => {
        // eslint-disable-next-line no-param-reassign
          prev[item.key] = {
            ...getDateRange(...item.range),
            collection: [] as {x: number; y: number;}[],
            description: item.key,
            max:0,
            min:Infinity,
            currentPercent:0
          }
          return prev
        }, { fundCode } as IClassifiedFund),
      )

      Object.entries(chartData).forEach(([key, item]) => {
        if (typeof item === 'string') return
        item.currentPercent = (item.collection[item.collection.length - 1].y - item.min) / (item.max - item.min) * 100
      })

      return chartData
    })

  return dataAfterHandle
}

export async function getDetail(fundCode) {
  try {
    const chartData = await getChartData(fundCode)

    // log.table(Object.entries(chartData).map(([key, item]) => {
    //   if (typeof item === 'string') return ''
    //   return {
    //     描述: item.description,
    //     最新净值: item.collection[item.collection.length - 1].y,
    //     最大净值: item.max,
    //     最小净值: item.min,
    //     当日所在范围内的当前百分点: `${item.currentPercent}%`,
    //   }
    // }))

    return chartData
  } catch (e) {
    log.error(`该基金详情数据获取失败：${fundCode}`)
  }
}

// getDetail('675093')
