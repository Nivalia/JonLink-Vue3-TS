import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, AccountQuejlParams, FinBankAccount } from '@/types'

// 查询银行账户列表
export function listAccount(query: AccountQuejlParams): Promise<TableDataInfo<FinBankAccount[]>> {
  return request({
    url: '/finance/account/list',
    method: 'get',
    params: query
  })
}

// 查询银行账户详细
export function getAccount(id: number): Promise<AjaxResult<FinBankAccount>> {
  return request({
    url: '/finance/account/' + id,
    method: 'get'
  })
}

// 新增银行账户
export function addAccount(data: FinBankAccount): Promise<AjaxResult> {
  return request({
    url: '/finance/account',
    method: 'post',
    data: data
  })
}

// 修改银行账户
export function updateAccount(data: FinBankAccount): Promise<AjaxResult> {
  return request({
    url: '/finance/account',
    method: 'put',
    data: data
  })
}

// 删除银行账户
export function delAccount(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/finance/account/' + id,
    method: 'delete'
  })
}


