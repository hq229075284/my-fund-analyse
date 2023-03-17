import { getFundList } from '../api/fundListForZhaoShang'

test('获取招商基金列表', async () => {
  const list = await getFundList({ requestParams: { tlph: '1' } })
  console.log(list.length)
  expect(list.length).toBeGreaterThan(0)
}, 30 * 1000)
