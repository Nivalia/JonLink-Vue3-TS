import request from "@/utils/request";
import type { PageDomain, BaseEntity } from "../common";

/** 台账批增退记录分页查询参数 */
export interface LedgerAdjustQueParams extends PageDomain {
  /** 台账ID */
  ledgerId?: number;
  /** 调整类型 1批增 2批退 */
  adjustType?: string;
  /** 调整日期 */
  adjustDate?: string;
}

/** 台账批增退记录信息 */
export interface JonlinkLedgerAdjust extends BaseEntity {
  /** 主键ID */
  id?: number;
  /** 台账ID */
  ledgerId?: number;
  /** 调整类型 1批增 2批退 */
  adjustType?: string;
  /** 调整保费金额 */
  adjustPremium?: number;
  /** 调整原因 */
  adjustReason?: string;
  /** 调整日期 */
  adjustDate?: string;
  /** 调整人 */
  adjustBy?: string;
  /** 备注 */
  remark?: string;
}

/** 查询台账批增退记录列表 */
export function listLedgerAdjust(params: LedgerAdjustQueParams) {
  return request({ url: "/ledger/adjust/list", method: "get", params });
}

/** 查询台账批增退记录详细 */
export function getLedgerAdjust(id: number) {
  return request({ url: "/ledger/adjust/" + id, method: "get" });
}

/** 新增台账批增退记录 */
export function addLedgerAdjust(data: JonlinkLedgerAdjust) {
  return request({ url: "/ledger/adjust", method: "post", data });
}

/** 修改台账批增退记录 */
export function updateLedgerAdjust(data: JonlinkLedgerAdjust) {
  return request({ url: "/ledger/adjust", method: "put", data });
}

/** 删除台账批增退记录 */
export function delLedgerAdjust(ids: number | number[]) {
  return request({ url: "/ledger/adjust/" + ids, method: "delete" });
}

/** 执行批增/批退操作 */
export function executeAdjust(data: JonlinkLedgerAdjust) {
  return request({ url: "/ledger/adjust/execute", method: "post", data });
}
