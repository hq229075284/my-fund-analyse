import axios from 'axios'
import chalk from 'chalk'

// 获取前端申购费率
function getFrontEndSubscriptionRate(source) {
  const result = []
  let reg
  let matched
  reg = /前端申购费率.*?(<table[\s>].*?<\/table>)/
  matched = source.match(reg)
  const table = matched[1]

  reg = /<td>(.*?)<\/td>/g
  const values = []
  // eslint-disable-next-line no-cond-assign
  while (matched = reg.exec(table)) {
    values.push(matched[1])
  }
  for (let i = 0; i < values.length / 2; i += 1) {
    const rate = values[i + values.length / 2]

    const range = {}
    const startEdgeReg = /^(\d+)(.{1})/
    const endEdgeReg = /(.{1})(\d+)$/
    const value = values[i]
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
        case '≦':
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
  }

  return result
}

// 获取前端赎回费率
function getFrontEndRedemptionRate(source) {
  const result = []
  let reg
  let matched
  reg = /前端赎回费率.*?(<table[\s>].*?<\/table>)/
  matched = source.match(reg)
  const table = matched[1]

  reg = /<td>(.*?)<\/td>/g
  const values = []
  // eslint-disable-next-line no-cond-assign
  while (matched = reg.exec(table)) {
    values.push(matched[1])
  }
  for (let i = 0; i < values.length / 2; i += 1) {
    const rate = values[i + values.length / 2]

    const range = {}
    const startEdgeReg = /^(\d+)(.{1})/
    const endEdgeReg = /(.{1})(\d+)$/
    const value = values[i]
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
        case '≦':
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
  }

  return result
}

export default async function getTransactionRate(fundCode) {
  const r = await axios({
    url: `https://www.howbuy.com/fund/ajax/gmfund/fundrate.htm?jjdm=${fundCode}`,
  }).then((response) => {
    const result = {}
    const html = response.data.replace(/\n/g, '').replace(/>\s*</g, '><')
    try {
      result['前端申购费率'] = getFrontEndSubscriptionRate(html)
    } catch {
      result['前端申购费率'] = []
      console.log(chalk.red(`${fundCode}前端申购费率获取失败`))
    }
    try {
      result['前端赎回费率'] = getFrontEndRedemptionRate(html)
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
    const ltRate = 0.15
    const result = []
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
  const result = await filter(fundCode)
  console.log(`${fundName}(${fundCode})`, '是否符合预期:', result)
  return result
}

// doFilter()
