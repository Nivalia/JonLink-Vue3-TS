import request from '@/utils/request'

export interface BookRequest {
  templateCode: string
  ledgerId: number
  policyNo: string
  amountFieldMap: Record<string, number | string>
  periodCode: string
  voucherDate: string
}

export function bookLedger(payload: BookRequest) {
  return request({
    url: '/finance/ledgerBook/book',
    method: 'post',
    data: payload
  })
}

// Aliases for backward compatibility
export const listLedgerBook = listByLedgerId

export function unbookLedger(logId: number) {
  return request({
    url: `/finance/ledgerBook/unbook/${logId}`,
    method: 'post'
  })
}

export function listByLedgerId(ledgerId: number) {
  return request({
    url: `/finance/ledgerBook/list/${ledgerId}`,
    method: 'get'
  })
}

export function listTemplates() {
  // 复用 voucher template 列表接口
  return request({
    url: '/finance/voucherTemplate/list',
    method: 'get',
    params: { status: '1', pageNum: 1, pageSize: 50 }
  })
}