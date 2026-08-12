import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, MsgRuleQuejlParams, WxMsgRule } from '@/types'

// 查询推送规则列表
export function listMsgRule(query: MsgRuleQuejlParams): Promise<TableDataInfo<WxMsgRule[]>> {
  return request({
    url: '/wx/msgRule/list',
    method: 'get',
    params: query
  })
}

// 查询推送规则详细
export function getMsgRule(id: number): Promise<AjaxResult<WxMsgRule>> {
  return request({
    url: '/wx/msgRule/' + id,
    method: 'get'
  })
}

// 新增推送规则
export function addMsgRule(data: WxMsgRule): Promise<AjaxResult> {
  return request({
    url: '/wx/msgRule',
    method: 'post',
    data: data
  })
}

// 修改推送规则
export function updateMsgRule(data: WxMsgRule): Promise<AjaxResult> {
  return request({
    url: '/wx/msgRule',
    method: 'put',
    data: data
  })
}

// 删除推送规则
export function delMsgRule(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/wx/msgRule/' + id,
    method: 'delete'
  })
}


