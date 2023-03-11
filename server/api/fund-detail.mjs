import axios from 'axios'
import chalk from 'chalk'
import dayjs from 'dayjs'

export function getDateRange(...args) {
  //  'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year' | 'week'
  const endDate = dayjs().hour(0).minute(0).second(0).millisecond(0).valueOf()
  const startDate = dayjs().subtract(...args).hour(0).minute(0).second(0).millisecond(0).valueOf()
  return { startDate, endDate }
}

export async function getChartData(fundCode) {
  if (!fundCode) {
    console.log(chalk.red('缺失需要查询的基金编码'))
    return
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
      let message
      eval(`message = ${response.data.match(/Data_netWorthTrend[^[]*(\[.*\]);/)[1]}`)

      const sort = [
        [1, 'week', '近1周'],
        [1, 'month', '近1月'],
        [3, 'month', '近3月'],
        [6, 'month', '近6月'],
        [1, 'year', '近1年'],
      ]

      const chartData = message.reduce(
        (prev, data) => {
        // eslint-disable-next-line no-unused-vars
          Object.entries(prev).forEach(([key, item]) => {
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
        sort.reduce((prev, args) => {
        // eslint-disable-next-line no-param-reassign
          prev[args[2]] = {
            ...getDateRange(...args.slice(0, 2)),
            collection: [],
            description: args[2],
          }
          return prev
        }, { fundCode }),
      )

      const excludes = ['fundCode']
      Object.entries(chartData).forEach(([key, item]) => {
        if (excludes.includes(key)) return
        // if (fundCode === '006933' && key === '近1年') debugger
        item.currentPercent = (item.collection[item.collection.length - 1].y - item.min) / (item.max - item.min) * 100
      })

      return chartData
    })

  return dataAfterHandle
}

export async function output(fundCode) {
  const chartData = await getChartData(fundCode)
  if (!chartData) {
    console.log(chalk.red(`该基金数据获取失败：${fundCode}`))
    return
  }
  console.log(fundCode)
  console.table(
    Object.entries(chartData).map(([key, item]) => ({
      描述: item.description,
      最新净值: item.collection[item.collection.length - 1].y,
      最大净值: item.max,
      最小净值: item.min,
      当日所在范围内的当前百分点: `${item.currentPercent}%`,
    })),
  )
}

// output('675093')
