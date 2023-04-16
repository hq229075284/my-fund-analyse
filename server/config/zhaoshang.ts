import formatter, { valuationFormatter } from '@/api/zhaoshang/fundDetailFormatter'
import {
  getCachePath, getDateStamp, getFundType,
} from '@/utils/common'
import { LoaderOption } from '@/utils/patch'
import * as myProcess from '@/config/filters/index'
import { FundTypeEnum } from './enum'
import { REMOTE_FILEPATH_PREFIX } from './env'

const stamp = getDateStamp()

const fundType = getFundType()

const prefix = '(招商)'
const name = prefix + FundTypeEnum[fundType]

export const fallback:LoaderOption = {
  name,
  formatter,
  filter: myProcess.default.排名靠前的基金.transactionFilter,
  persistence: true,
  filePath: getCachePath(`${name}数据${stamp}`),
  forceUpdate: false,
  verbose: false,
  remoteFilePath: `${REMOTE_FILEPATH_PREFIX}/uploadData/${name}数据${stamp}.json`,
}

export const valuation:LoaderOption = {
  name,
  formatter: valuationFormatter,
  filter: myProcess.default.排名靠前的基金.valuationFilter,
}

export default {
  default: fallback,
  valuation,
}
