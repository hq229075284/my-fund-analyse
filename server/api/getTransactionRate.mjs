import axios from 'axios'
import chalk from 'chalk'

// 获取前端赎回费率
function getFrontEndRedemptionRate(source) {
  const result = []
  source.forEach((s) => {
    const rate = s.fl
    const value = s.tj

    const range = {}
    const startEdgeReg = /^(\d+)日(.{1})/
    const endEdgeReg = /(.{1})(\d+)日$/
    let matched
    let lowValue
    let highValue
    let comparator

    matched = value.match(startEdgeReg)
    if (matched) {
      [lowValue, comparator] = matched.slice(1, 3)
      switch (comparator) {
        case '<':
          range.gt = lowValue
          break
        case '≤':
          range.ge = lowValue
          break
        default:
      }
    }

    matched = value.match(endEdgeReg)
    if (matched) {
      [comparator, highValue] = matched.slice(1, 3)
      range.lt = highValue
    }

    result.push({
      label: value,
      range,
      rate,
    })
  })

  return result
}

export default async function getTransactionRate(fundCode) {
  const fundid = await axios({
    url: 'https://xtrade.newone.com.cn/lc/api/getData',
    method: 'get',
    params: {
      method: 'querycpxqv4',
      zqdm: fundCode,
    },
  }).then((response) => response.data.content.fundid)

  const r = await axios({
    url: 'https://xtrade.newone.com.cn/lc/api/getData',
    params: {
      method: 'queryjyxxv4',
      fundid,
    },
    method: 'get',
  }).then((response) => {
    const { rgfl, sgfl, shfl } = response.data.content
    const result = {}
    try {
      result['前端赎回费率'] = getFrontEndRedemptionRate(shfl)
    } catch {
      result['前端赎回费率'] = []
      console.log(chalk.red(`${fundCode}前端赎回费率获取失败`))
    }
    return result
  })
  return r
}

async function filter(fundCode) {
  const transactionData = await getTransactionRate(fundCode)
  return transactionData['前端赎回费率'].reduce((prev, item) => {
    if (prev) return prev
    if (!item) return prev
    const target = 30
    const ltRate = 0.1
    const result = []

    // if (fundCode === '003176') debugger

    if (item.range.gt != null) {
      result.push(target > item.range.gt)
    }
    if (item.range.ge != null) {
      result.push(target >= item.range.ge)
    }
    if (item.range.lt != null) {
      result.push(target < item.range.lt)
    }
    const fidx = result.indexOf(false)
    if (fidx > -1) return prev
    if (!item.rate) return prev
    return ltRate >= item.rate.replace('%', '')
  }, false)
}

export async function transactionRateFilter(fundCode, fundName) {
  let result
  try {
    result = await filter(fundCode)
    console.log(`${fundName}(${fundCode})`, '是否符合赎回预期:', result)
  } catch {
    console.log(chalk.red(`${fundName}(${fundCode})`, '赎回费率解析异常'))
  }

  return result
}

// doFilter()
