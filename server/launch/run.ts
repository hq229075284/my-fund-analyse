import { getFundList } from '@/api/tiantian/fundList'
import createExcel from '@/utils/excel'
import log from '@/utils/log'
import { writeToMd } from '@/utils/md'
import { listFilter } from '@/config/filters/index'
// import * as TTfetch from '@/api/tiantian/fetch'
import * as ZSfetch from '@/api/zhaoshang/fetch'
import { syncData } from '@/utils/pullData'
import { getExecFileFullPath, getFundType } from '@/utils/common'

async function run() {
  const excel = createExcel()

  const ft = getFundType()
  const startTime = Date.now()
  let list = await getFundList({ requestParams: { ft } })
  const { tiantian, zhaoshang } = await syncData()
  // log.success(`${ft}数据${list.length}条`)

  // const fundCodes = list.map((item) => item['基金编码'])
  // log.lineInfo('开始获取天天基金数据')
  // const tiantian = await TTfetch.defaultFetch(fundCodes, { name: `${ft}`, verbose: true })
  // log.lineInfo('开始获取招商数据')
  // const zhaoshang = await ZSfetch.defaultFetch(fundCodes, { name: `${ft}`, verbose: true })

  // log.success(`获取数据用时:${(Date.now() - startTime) / 1000}s`)

  list = list.filter(listFilter)
  list = list.filter((item) => {
    if (tiantian[item['基金编码']] && zhaoshang[item['基金编码']]) {
      item['基金类型'] = tiantian[item['基金编码']].payload.baseInfo['基金类型']
      return true
    }
    return false
  })
  log.info(`经条件过滤后，剩余${list.length}条`)
  if (list.length === 0) {
    return
  }

  if (ft !== 'zq') {
    const valuation = await ZSfetch.valuationFetch(list.map((item) => item['基金编码']), { name: `${ft}估值` })
    list = list.filter((item) => valuation[item['基金编码']])
    log.info(`经估值过滤后，剩余${list.length}条`)
    if (list.length === 0) {
      return
    }
  }

  log.success(`筛选完成用时:${(Date.now() - startTime) / 1000}s`)

  log.table(list)

  excel.addSheet({ sheetName: '筛选后的基金列表', rows: list })
  excel.done()

  writeToMd(list)
}

if (getExecFileFullPath().includes('launch/run')) {
  run()
}

export default run
