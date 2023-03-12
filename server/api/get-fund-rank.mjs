import axios from 'axios'

axios({
  url: 'https://j5.fund.eastmoney.com/sc/tfs/qt/v2.0.1/630003.json',
  method: 'get',
  params: {},
  headers: {
    Referer: 'https://h5.1234567.com.cn/',
  },
}).then((response) => {
  const rankData = response.data.JDZF.Datas.reduce((prev, item) => {
    const nameMap = {
      Z: '近1周',
      Y: '近1月',
      '3Y': '近3月',
      '6Y': '近6月',
      '1N': '近1年',
      '2N': '近2年',
      '3N': '近3年',
      '5N': '近5年',
      JN: '今年以来',
      LN: '成立以来',
    }
    prev[nameMap[item.title]] = {
      类别: nameMap[item.title],
      排名: item.rank,
      总数: item.sc,
      前百分之: Number.isNaN((item.rank / item.sc) * 100) ? '' : (item.rank / item.sc) * 100,
    }
    return prev
  }, {})

  console.log(rankData)
})
