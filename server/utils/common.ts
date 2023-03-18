import dayjs from 'dayjs'
import { mkdirp } from 'mkdirp'
import path from 'node:path'
import fs from 'node:fs'
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

export async function useCache<T = any>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  cacheFn:(...arg:any[])=> T,
  {
    cacheName = dayjs().format('YYYY-MM-DD HH:mm:ss'),
    cachePath = path.resolve(__dirname, `../cache/${cacheName}.json`),
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
  log.info('使用缓存')
  const result = JSON.parse(fs.readFileSync(cachePath, { encoding: 'utf-8' }))
  return result
}
