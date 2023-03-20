import dayjs from 'dayjs'
import { mkdirp } from 'mkdirp'
import path from 'node:path'
import fs from 'node:fs'
import axios from 'axios'
import log from './log'

export async function sleep(t = 1000) {
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(undefined)
    }, t)
  })
}

type useCacheParams={
  cacheName?:string
  cachePath?:string
  force?:boolean
}

export function getCachePath(cacheName:string) {
  return path.resolve(__dirname, `../cache/${cacheName}.json`)
}

export async function useCache<T = any>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  cacheFn:(...arg:any[])=> T,
  {
    cacheName = dayjs().format('YYYY-MM-DD HH:mm:ss'),
    cachePath = getCachePath(cacheName),
    force = false,
  }:useCacheParams = {},
):Promise<Awaited<T>> {
  mkdirp.sync(path.dirname(cachePath))
  const hasCached = fs.existsSync(cachePath)
  if (!hasCached || force) {
    log.info('读取新数据')
    /* rend new */
    const result = await cacheFn()
    const wStream = fs.createWriteStream(cachePath)
    wStream.write(JSON.stringify(result, null, 2))
    return result
  }
  /* use cache */
  log.info(`使用缓存=>${cachePath}`)
  const result = JSON.parse(fs.readFileSync(cachePath, { encoding: 'utf-8' }))
  return result
}

type retryOption={
  tryCount?:number
  tryId?:string
  defaultValue?:any
  interval?:number
}
export async function retry<T = any>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  cacheFn:(...arg:any[])=> T,
  {
    tryCount = 5, tryId, defaultValue = null, interval = 0,
  }:retryOption = {},
):Promise<Awaited<T>> {
  let time = 1
  while (time <= tryCount) {
    if (time > 1 && interval > 0) {
      await sleep(interval)
    }
    try {
      return await cacheFn()
    } catch (e) {
      /*  */
    }
    time += 1
  }
  if (tryId) {
    log.error(`retry fail,${tryId}`)
  }
  return defaultValue
}

export function getDateStamp() {
  const now = dayjs()
  const format = 'YYYY-MM-DD 21-00-00'
  const useYesterday = now.isBefore(dayjs().hour(21).minute(0).second(0).millisecond(0))
  if (useYesterday) {
    return now.subtract(1, 'day').format(format)
  }
  return now.format(format)
}

export async function readDataFromFile(
  type:`${'排行'|'详情'|'赎回'}数据`,
  filePath:string,
  writeCache:(filePath:string)=>any,
  refresh = false,
) {
  const linkReg = /^https?:\/\//
  const isRemote = linkReg.test(filePath)
  let remotePath
  let localPath
  if (isRemote) {
    remotePath = filePath
    localPath = getCachePath(filePath.split('/').pop()!.split('.')[0])
  } else {
    localPath = filePath
  }
  log.lineInfo(`start ${type}`)
  if (fs.existsSync(localPath) && !refresh) {
    log.info(`使用本地缓存数据=>${localPath}`)
    const data = await fs.promises.readFile(localPath, { encoding: 'utf8' })
    log.lineInfo(`end ${type}`)
    return JSON.parse(data)
  }
  log.info('本地缓存不存在，开始读取新数据')
  if (isRemote) {
    try {
      log.info(`读取服务器数据=>${remotePath}`)
      const { data } = await axios({
        method: 'get',
        url: filePath,
        responseType: 'json',
      })
      fs.promises.writeFile(localPath, JSON.stringify(data))
      log.lineInfo(`end ${type}`)
      return data
    } catch {
      log.error('服务器数据获取失败')
    }
  }
  log.info('读取origin服务器数据')
  await writeCache(localPath)
  log.info(`已写入本地缓存=>${localPath}`)
  const data = await fs.promises.readFile(localPath, { encoding: 'utf8' })
  log.lineInfo(`end ${type}`)
  return JSON.parse(data)
}
