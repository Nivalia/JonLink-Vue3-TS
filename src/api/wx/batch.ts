import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, BatchQuejlParams, WxMpSendBatch } from '@/types'

// 查询发送批次列表
export function listBatch(query: BatchQuejlParams): Promise<TableDataInfo<WxMpSendBatch[]>> {
  return request({
    url: '/wx/batch/list',
    method: 'get',
    params: query
  })
}

// 查询发送批次详细
export function getBatch(id: number): Promise<AjaxResult<WxMpSendBatch>> {
  return request({
    url: '/wx/batch/' + id,
    method: 'get'
  })
}

// 新增发送批次
export function addBatch(data: WxMpSendBatch): Promise<AjaxResult> {
  return request({
    url: '/wx/batch',
    method: 'post',
    data: data
  })
}

// 修改发送批次
export function updateBatch(data: WxMpSendBatch): Promise<AjaxResult> {
  return request({
    url: '/wx/batch',
    method: 'put',
    data: data
  })
}

// 删除发送批次
export function delBatch(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/wx/batch/' + id,
    method: 'delete'
  })
}

// 下载 Excel 导入模板 (README §5.2 #9)
export function downloadBatchTemplate(templateId: string) {
  return request({
    url: '/wx/mp/send/template',
    method: 'get',
    params: { templateId },
    responseType: 'blob',
    timeout: 30000
  })
}

// 上传 Excel 导入批次 (README §5.2 #10)
export function importBatch(data: FormData): Promise<AjaxResult> {
  return request({
    url: '/wx/mp/send/import',
    method: 'post',
    data: data,
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000
  })
}

// 批次重推失败/待发行 (README §5.2 #11)
export function retryBatch(batchNo: string): Promise<AjaxResult> {
  return request({
    url: '/wx/mp/send/retry/' + batchNo,
    method: 'post'
  })
}



