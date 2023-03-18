import axios from 'axios'
import log from '../utils/log'

export async function getDetail({ fundid, cpdm }) {
  try {
    const content = await axios({
      url: 'https://xtrade.newone.com.cn/lc/api/getData',
      method: 'get',
      params: {
        method: 'querycpxqv4',
        fundid,
        zqdm: cpdm,
      },
      headers: {
        Referer: 'https://xtrade.newone.com.cn/lc4/pclc/',
        Host: 'xtrade.newone.com.cn',
      },
    }).then((response) => response.data.content)
    return content as {isBuyAble:string}
  } catch (e) {
    log.error(`招商基金详情获取失败，基金编码：${cpdm}，fundid：${fundid}`)
  }
}
