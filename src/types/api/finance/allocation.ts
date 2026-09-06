import type { PageDomain, BaseEntity } from "../common";

/** 核销记录配置分页查询参数 */
export interface AllocationQuejlParams extends PageDomain {
  /** 0应收 1应付 */
  docType?: string;
  /** 应收/应付单ID */
  docId?: number;
  /** 收款单ID（doc_type=0 时） */
  receiptId?: number;
  /** 付款单ID（doc_type=1 时） */
  paymentId?: number;
  /** 核销金额 */
  amount?: string;
  /** 核销时间 */
  allocateTime?: string;
}

/** 核销记录配置信息 */
export interface FinAllocation extends BaseEntity {
  /** 核销ID */
  id?: number;
  /** 0应收 1应付 */
  docType?: string;
  /** 应收/应付单ID */
  docId?: number;
  /** 收款单ID（doc_type=0 时） */
  receiptId?: number;
  /** 付款单ID（doc_type=1 时） */
  paymentId?: number;
  /** 核销金额 */
  amount?: string;
  /** 核销时间 */
  allocateTime?: string;
  /** 创建者 */
  createBy?: string;
  /** 创建时间 */
  createTime?: string;
}
