/* eslint-disable no-loop-func */
import createAjax from '@/utils/ajax'
// import dayjs from 'dayjs'

interface ResponseData {
  JJCC:{
    Datas:{
      InverstPosition:{
        fundStocks:{
          /**
           * 股票简称
           */
          GPJC:string
          /**
           * 行业
           */
          INDEXNAME:string
        }[]
      }
    }
  }
  JDZF:{
    Datas:{
      /**
       * 排名
       */
      rank:string
      /**
       * 总数
       */
      sc:string
      /**
       * 涨跌幅
       */
      syl:string
      /**
       * 周期
       */
      title: string
    }[]
  }
  JJXQ:{
    Datas:{
      /**
       * 基金类型
       */
      FTYPE:string,
      /**
       * 申购状态，开放申购
       */
      SGZT:string
      // return RISKLEVEL === '--'
      // ? '低风险'
      // : `${['低', '中低', '中', '中高', '高'][RISKLEVEL - 1]}风险`;
      // RISKLEVEL：4 => 中高风险
      /**
       * 风险等级
       */
      RISKLEVEL: '1'|'2'|'3'|'4'|'5'|'--'
    }
  }
}

/**
 * 获取基金排名、股票行业数据
 * @param fundCode 基金编码
 */
export async function getData(fundCode:string) {
  const { JJCC, JDZF, JJXQ }:ResponseData = await createAjax({
    url: `https://j5.fund.eastmoney.com/sc/tfs/qt/v2.0.1/${fundCode}.json`,
    headers: {
      Referer: 'https://h5.1234567.com.cn/',
    },
  }).then((res) => res.data)

  return {
    JJCC,
    JDZF,
    JJXQ,
  }
}
