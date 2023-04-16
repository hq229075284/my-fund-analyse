/* eslint-disable no-continue */

import { IRateAtRedemption } from '@/api/zhaoshang/fundDetailFormatter'

export function isInRedeemRange(targets:IRateAtRedemption[], day:number, ltRate:number) {
  for (let i = 0; i < targets.length; i += 1) {
    const { range, rate } = targets[i]
    if (Number(rate.replace('%', '')) <= ltRate) {
      if (range.ge != null && day < range.ge) {
        continue
      }
      if (range.gt != null && day <= range.gt) {
        continue
      }
      if (range.lt != null && day >= range.lt) {
        continue
      }
      return true
    }
  }

  return false
}
