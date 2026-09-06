import request from '@/utils/request'
import type { AjaxResult } from '@/types'

export function listClosingPreview(periodCode: string): Promise<AjaxResult<any>> {
  return request({ url: '/finance/closing/preview/' + periodCode, method: 'get' })
}

export function executeClosing(periodCode: string): Promise<AjaxResult<number>> {
  return request({ url: '/finance/closing/' + periodCode, method: 'post' })
}

export function reverseClosing(periodCode: string): Promise<AjaxResult> {
  return request({ url: '/finance/closing/' + periodCode, method: 'delete' })
}
