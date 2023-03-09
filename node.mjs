const axios = require('axios');

function Row(itemStr) {
  const [
    code,
    name,
    simpleSpell,
    currentTime,
    unitValue,
    addUpValue,
    dayIncrease,
    lastWeek,
    lastMonth,
    last3Month,
    last6Month,
    lastYear,
    last2Year,
    last3Year,
    fromCurrentYear,
    ignore1,
    ignore2,
    ignore3,
    ignore4,
    serviceCharge,
    ignore5,
    ignore6,
    ignore7,
    ignore8,
  ] = itemStr.split('|');
  this['基金编码'] = code;
  this['基金名称'] = name;
  this['统计日期'] = currentTime;
  this['单位净值'] = unitValue;
  this['日增长(%)'] = dayIncrease;
  this['近1周(%)'] = lastWeek;
  this['近1月(%)'] = lastMonth;
  this['近3月(%)'] = last3Month;
  this['近6月(%)'] = last6Month;
  this['近1年(%)'] = lastYear;
  this['手续费'] = serviceCharge?.replace('%', '');
}

axios({
  method: 'get',
  // url: "http://fund.eastmoney.com/data/rankhandler.aspx?op=ph&dt=kf&ft=zq&rs=&gs=0&sc=1nzf&st=desc&sd=2022-03-08&ed=2023-03-08&qdii=|&tabSubtype=,,,,,&pi=1&pn=10000&dx=1&v=0.47491264273411504",
  url: 'https://fundapi.eastmoney.com/fundtradenew.aspx?ft=zq&sc=1n&st=desc&pi=1&pn=100&cp=&ct=&cd=&ms=&fr=041&plevel=&fst=&ftype=&fr1=&fl=0&isab=1',
  headers: {
    Referer: 'http://fund.eastmoney.com/',
    // Referer: "http://fund.eastmoney.com/data/fundranking.html",
  },
}).then((response) => {
  eval(`var message=${response.data.match(/{.*}/)[0]}`);
  console.log(message);
  rows = message.datas
    .map((item) => new Row(item));
  // .filter(row=>(
  //   // row['近1月(%)']<0||row['近3月(%)']<0/* ||row['近6月(%)']<0 */)
  //   row['近1月(%)']<0)
  //   && row['近1周(%)']>=0.02
  //   && row['手续费']<=0.06
  //   && row['日增长(%)']>=0
  //   )
  // .slice(0,100);
  console.table(rows);
});
