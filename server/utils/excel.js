const XLSX = require('xlsx')
const path = require('node:path')

module.exports = function exportExcel(rows) {
  if (!rows?.length) return

  const worksheet = XLSX.utils.json_to_sheet(rows)

  // https://git.sheetjs.com/sheetjs/sheetjs/src/branch/master/tests/write.js#L21
  const wscols = new Array(Object.keys(rows[0]).length).fill(undefined)
  wscols[1] = { wpx: 200 }
  wscols[wscols.length - 1] = { wpx: 300 }
  worksheet['!cols'] = wscols

  // 指定创建表格的数据范围，附带排序和筛选功能
  worksheet['!autofilter'] = { ref: `A1:${(wscols.length + 9).toString(36).toUpperCase() + rows.length}` }

  const workbook = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(workbook, worksheet, '数据')

  XLSX.writeFile(workbook, path.resolve(__dirname, 'output.xlsx'))
}
