import { getDetail } from '../api/fundDetail'

test('获取基金详情', async () => {
  const detail = await getDetail('160217')
  expect(detail).not.toBe(undefined)
})
