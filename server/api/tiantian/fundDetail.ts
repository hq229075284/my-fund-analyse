/* eslint-disable no-loop-func */
import createAjax from '@/utils/ajax'
import dayjs from 'dayjs'
import log from '@/utils/log'

export interface ResponseData {
  fundCode:string
  /**
   * 持股行业
   */
  JJCC?:{
    Datas?:{
      InverstPosition:{
        fundStocks:{
          /**
           * 股票简称
           */
          // GPJC:'电子'|'医药生物'|'电力设备'|'计算机'|'通信'|'轻工制造'|'机械设备'|'国防军工'|'钢铁'|'汽车'|'建筑装饰'|'基础化工'|'公共事业'|'非银金融'|'银行'|'房地产'|'有色金属'|'传媒'|'社会服务'|'食品饮料'|'美容护理'|'家用电器'|'农林牧鱼'|'综合'|''
          GPJC:string
          /**
           * 行业
           */
          INDEXNAME:string
        }[]
      }
    }
  }
  /**
   * 排名
   */
  JDZF?:{
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
      title: 'Z'|'Y'|'3Y'|'6Y'|'1N'|'2N'|'3N'|'5N'|'JN'|'LN'
    }[]
  }
  /**
   * 基金信息
   */
  JJXQ?:{
    Datas:{
      /**
       * 基金名称
       */
      SHORTNAME:string
      /**
       * 基金类型
       */
      // FTYPE:'混合型-偏股'|'混合型-偏债'|'混合型-灵活'|'股票型'|'指数型-股票'|'债券型-混合债'|'债券型-可转债'
      FTYPE:string
      /**
       * 申购状态，'开放申购'
       */
      SGZT:string
      /**
       * 申购状态，'开放赎回'
       */
      SHZT:string
      // return RISKLEVEL === '--'
      // ? '低风险'
      // : `${['低', '中低', '中', '中高', '高'][RISKLEVEL - 1]}风险`;
      // RISKLEVEL：4 => 中高风险
      /**
       * 风险等级
       *  -- 低,
       *  1  低,
       *  2  中低,
       *  3  中,
       *  4  中高,
       *  5  高
       */
      RISKLEVEL: '1'|'2'|'3'|'4'|'5'|'--'
    }
  }
  /**
   * 净值、日涨幅变化趋势
   */
  trend:{
    /**
     * 日期时间，正序，格式：2023-04-07
     */
    FSRQ:string
    /**
     * 单位净值
     */
    DWJZ:string
    /**
     * 日涨幅，百分比
     */
    JZZZL:string
  }[]
}

/**
 * 获取基金排名、股票行业、基础信息、净值or日涨幅变化趋势数据
 * @param fundCode 基金编码
 */
export async function getData(fundCode:string):Promise<ResponseData> {
  let error:Error|undefined
  const p1 = createAjax({
    url: `https://j5.fund.eastmoney.com/sc/tfs/qt/v2.0.1/${fundCode}.json`,
    headers: {
      Referer: 'https://h5.1234567.com.cn/',
    },
  }).then((res) => res.data)

  const p2 = createAjax({
    url: 'https://uni-fundts.1234567.com.cn/dataapi/fund/FundNetDiagram2',
    params: {
      CODE: fundCode,
      RANGE: 'ln',
    },
  }).then(
    (response) => response.data.data,
    (e) => { error = new Error('接口FundNetDiagram2出错') },
  )

  // let JJCC; let JDZF; let JJXQ; let trend;
  const { JJCC, JDZF, JJXQ } = await p1
  const trend = await p2

  if (error) {
    throw error
  }

  return {
    JJCC,
    JDZF,
    JJXQ,
    trend,
    fundCode,
  }
}
