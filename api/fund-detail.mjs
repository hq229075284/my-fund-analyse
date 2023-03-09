import axios from 'axios'
import chalk from 'chalk'
import dayjs from 'dayjs'

function getDateRange(...args) {
  //  'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year' | 'week'
  const endDate = dayjs().hour(0).minute(0).second(0).millisecond(0).valueOf()
  const startDate = dayjs().subtract(...args).hour(0).minute(0).second(0).millisecond(0).valueOf()
  return { startDate, endDate }
}
function getChartData(fundCode) {
  if (!fundCode) {
    console.log(chalk.red('缺失需要查询的基金编码'))
    return
  }
  axios({
    url: `http://fund.eastmoney.com/pingzhongdata/${fundCode}.js?v=${20230309183305}`,
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
          prev[args.join('')] = {
            ...getDateRange(...args.slice(0, 2)),
            collection: [],
            description: args[2],
          }
          return prev
        }, {}),
      )

      console.log(fundCode)
      console.table(
        Object.entries(chartData).map(([key, item]) => ({
          描述: item.description,
          最新净值: item.collection[item.collection.length - 1].y,
          最大净值: item.max,
          最小净值: item.min,
          当日所在范围内的当前百分点: `${(item.collection[item.collection.length - 1].y - item.min) / (item.max - item.min) * 100}%`,
        })),
      )

      // console.table(Object.entries(chartData).reduce((prev, [key, item]) => {
      //   console.log('--------------------')
      //   console.log(`|${item.description}`)
      //   console.log(
      //     chalk.red(`|最大净值: ${item.max}`),
      //     chalk.green(`|最小净值： ${item.min}`),
      //     chalk.black(`|最新净值：${item.collection[item.collection.length - 1].y}`),
      //   )
      //   console.log(chalk.greenBright(`|${item.description}内，当日所处百分点：${(item.collection[item.collection.length - 1].y - item.min) / (item.max - item.min) * 100}%`))
      //   console.log('--------------------')
      // }), {})
    })
}

getChartData('675093')
