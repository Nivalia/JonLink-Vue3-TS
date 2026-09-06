import request from '@/utils/request'
import type { AjaxResult, TableDataInfo } from '@/types'

export function listAuxiliary(query: any): Promise<TableDataInfo<any[]>> {
  return request({ url: '/finance/auxiliary/list', method: 'get', params: query })
}

export function addAuxiliary(data: any): Promise<AjaxResult<number>> {
  return request({ url: '/finance/auxiliary', method: 'post', data })
}

export function updateAuxiliary(data: any): Promise<AjaxResult> {
  return request({ url: '/finance/auxiliary', method: 'put', data })
}

export function deleteAuxiliary(id: number): Promise<AjaxResult> {
  return request({ url: '/finance/auxiliary/' + id, method: 'delete' })
}

export function getAuxiliaryDetail(id: number): Promise<AjaxResult<any>> {
  return request({ url: '/finance/auxiliary/' + id, method: 'get' })
}

export function listAuxiliaryType(): Promise<AjaxResult<any[]>> {
  return request({ url: '/finance/auxiliary/types', method: 'get' })
}