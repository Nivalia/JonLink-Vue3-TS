import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, MsgQuejlParams, WxMpTemplateMsg } from '@/types'

// 查询发送记录列表
export function listMsg(query: MsgQuejlParams): Promise<TableDataInfo<WxMpTemplateMsg[]>> {
  return request({
    url: '/wx/msg/list',
    method: 'get',
    params: query
  })
}

// 查询发送记录详细
export function getMsg(id: number): Promise<AjaxResult<WxMpTemplateMsg>> {
  return request({
    url: '/wx/msg/' + id,
    method: 'get'
  })
}

// 新增发送记录
export function addMsg(data: WxMpTemplateMsg): Promise<AjaxResult> {
  return request({
    url: '/wx/msg',
    method: 'post',
    data: data
  })
}

// 修改发送记录
export function updateMsg(data: WxMpTemplateMsg): Promise<AjaxResult> {
  return request({
    url: '/wx/msg',
    method: 'put',
    data: data
  })
}

// 删除发送记录
export function delMsg(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/wx/msg/' + id,
    method: 'delete'
  })
}


