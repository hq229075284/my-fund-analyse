import formatter from '@/api/tiantian/fundDetailFormatter'
import * as myProcess from '@/config/process2'
import { getCachePath, getCommandLineArgs, getDateStamp } from '@/utils/common'
import { FundType } from '@/api/tiantian/fundList'
import { LoaderOption } from '@/utils/patch'
import { FundTypeEnum } from './enum'
import { REMOTE_FILEPATH_PREFIX } from './env'

const stamp = getDateStamp()

const fundType = (getCommandLineArgs()[0] || 'pg') as FundType

const name = FundTypeEnum[fundType]
const prefix = '(天天基金)'

export const fallback:LoaderOption = {
  name,
  formatter,
  filter: myProcess.tiantianFilter.defaultFilter,
  persistence: true,
  filePath: getCachePath(`${prefix}${name}数据${stamp}`),
  forceUpdate: false,
  verbose: false,
  remoteFilePath: `${REMOTE_FILEPATH_PREFIX}/uploadData/${prefix}${name}数据${stamp}.json`,
}

export default {
  default: fallback,
}
