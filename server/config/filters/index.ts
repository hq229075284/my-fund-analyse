import { IRowOfFundList } from '@/api/tiantian/fundList'
import * as group1 from './group1'

export function listFilter(row:IRowOfFundList):boolean {
  return true
    // return row['近1周(%)'] >= 0
    // return row['近1月(%)'] > -0.3
    // && row['近1周(%)'] < 2
    // && row['日增长(%)'] <= 0.2
    && !['一年', '两年', '三年', '五年', '3个月', '6个月', '9个月', '九个月', '12个月', '18个月', '1年', '2年', '六个月', /* '港股', */ '港深', '沪深', 'FOF'/* , '医药', '医疗', '健康' */].find((key:string|RegExp) => {
      if (key instanceof RegExp) {
        return key.test(row['基金名称'])
      }
      return row['基金名称'].includes(key)
    })
    && row['日增长(%)'] !== 0
    // && row['手续费'] === 0
    // && row['近1周(%)'] - row['日增长(%)'] >= 0.5
    // && row['近6月(%)'] < 0
}

export default {
  排名靠前的基金: group1,
}
