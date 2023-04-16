import { FundType, getFundList } from '@/api/tiantian/fundList'
import * as TTfetch from '@/api/tiantian/fetch'
import * as ZSfetch from '@/api/zhaoshang/fetch'
import dayjs from 'dayjs'
import path from 'node:path'
import fs from 'node:fs'
import { REMOTE_UPLOAD_URL } from '@/config/env'
import tiantianConfig from '@/config/tiantian'
import zhaoshangConfig from '@/config/zhaoshang'
import FormData from 'form-data'
import log from './log'
import {
  getDateStamp, getCommandLineArgs, getExecFileFullPath, DATE_FORMAT, getCachePath,
} from './common'
import createAjax from './ajax'

export async function removeOutdateCacheFiles() {
  const timeStr = getDateStamp()
  const today = dayjs(timeStr.replace(/\|/g, ':'))
  const retainDays = [] as string[]
  const lastDays = 3
  for (let i = lastDays - 1; i >= 0; i -= 1) {
    retainDays.push(today.clone().subtract(i, 'day').format(DATE_FORMAT))
  }
  const cacheDir = path.resolve(__dirname, '../cache/')
  if (!fs.existsSync(cacheDir)) return
  try {
    const filenames = await fs.promises.readdir(cacheDir)
    for (let i = 0; i < filenames.length; i += 1) {
      if (!retainDays.some((str) => filenames[i].includes(str))) {
        const filePath = path.resolve(cacheDir, filenames[i])
        await fs.promises.unlink(filePath)
        log.success(`删除=>${filePath}`)
      }
    }
  } catch (e) {
    log.error(`removeOutdateCacheFiles:${e.message}`)
  }
}

async function uploadCache() {
  const tiantianFileCachePath = tiantianConfig.default.filePath
  const zhaoshangFileCachePath = zhaoshangConfig.default.filePath
  const formData = new FormData()
  formData.append('uploads', fs.createReadStream(tiantianFileCachePath))
  formData.append('uploads', fs.createReadStream(zhaoshangFileCachePath))
  try {
    await createAjax({
      url: REMOTE_UPLOAD_URL,
      method: 'post',
      headers: formData.getHeaders(),
      data: formData,
      timeout: 10 * 60 * 1000,
    })
    log.success('上传成功')
  } catch (e) {
    log.error(`上传失败=>${e.message}`)
  }
}

export async function syncData() {
  await removeOutdateCacheFiles()

  const startTime = Date.now()

  const ft = (getCommandLineArgs()[0] || process.env.fundType || 'pg') as FundType
  const list = await getFundList({ requestParams: { ft } })
  log.title(`${ft}数据${list.length}条`)

  const fundCodes = list.map((item) => item['基金编码'])

  log.lineInfo('开始获取天天基金、招商数据')
  const [tiantian, zhaoshang] = await Promise.all([
    TTfetch.defaultFetch(fundCodes),
    ZSfetch.defaultFetch(fundCodes),
  ])

  log.debug(`获取数据耗时${(Date.now() - startTime) / 1000}s`)

  if (process.env.NODE_ENV === 'production') {
    await uploadCache()
  }

  return { tiantian, zhaoshang }
}

if (getExecFileFullPath().includes('pullData')) {
  syncData()
}
