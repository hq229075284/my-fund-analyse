import axios from 'axios'
import chalk from 'chalk'

// filter({ customFilter: () => true, limit: 100000 })
// filter({ })
function Row(itemStr) {
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
  this['单位净值'] = unitValue
  this['日增长(%)'] = dayIncrease
  this['近1周(%)'] = lastWeek
  this['近1月(%)'] = lastMonth
  this['近3月(%)'] = last3Month
  this['近6月(%)'] = last6Month
  this['近1年(%)'] = lastYear
  this['起购金额'] = startPrice
  this['手续费'] = (preferentialServiceCharge || originServiceCharge)?.replace('%', '')
}

export async function filter({ requestParams = {}, customFilter, limit = 100 } = {}) {
  const list = await axios({
    method: 'get',
    url: 'https://fundapi.eastmoney.com/fundtradenew.aspx',
    params: {
      /**
         * 类型
         * hh    混合
         * zq    债券
         * pg    偏股
         * gp    股票
         */
      ft: 'zq',
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
      sc: '3y',
      /**
         * 排序方向，asc|desc
         */
      st: 'desc',
      /**
         * 页面
         */
      pi: 1,
      /**
         * 1页条数
         */
      pn: 100000,
      /**
         * 基金公司编码
         */
      cp: '',
      /**
         * 分类
         * ''     全部
         * '041'  长期纯债
         * '042'  短期纯债
         * '043'  混合债基
         * '045'  可转债
         */
      fr: '',
      /**
         * 杠杆
         * 0-100
         * 100-150
         * 150-200
         * 200
         */
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
  }).then((response) => {
    let message
    eval(`message=${response.data.match(/{.*}/)[0]}`)
    if (!message.datas?.length) {
      throw new Error(`${requestParams.ft || 'zq'}数据获取为空`)
    }

    const rows = message.datas
      .map((item) => new Row(item))
      .filter(
        customFilter
          || ((row) => (
          // row['近1月(%)']<0||row['近3月(%)']<0/* ||row['近6月(%)']<0 */)
            row['近1月(%)'] < 0)
            && row['近1周(%)'] >= 0.02
            && row['手续费'] <= 0.06
            && row['日增长(%)'] >= 0
          ),
      )
      .slice(0, limit)

    if (rows.length) {
      // console.table(rows)
      return rows
    }
    console.log(chalk.yellow('无符合条件的数据'))
  })

  return list
}

export async function getFundList() {
  try {
    const list = await filter()
    if (!list?.length) {
      const errorMsg = '基金列表获取失败'
      throw new Error(errorMsg)
    }
    return list
  } catch (e) {
    console.log(chalk.red(e.message))
    return []
  }
}
