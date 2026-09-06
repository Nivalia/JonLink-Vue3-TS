import type { PageDomain, BaseEntity } from "../common";

/** 发票配置分页查询参数 */
export interface InvoiceQuejlParams extends PageDomain {
  /** 发票号码（唯一） */
  invoiceNo?: string;
  /** 0增值税专票 1普票 */
  invoiceType?: string;
  /** 开票/收票单位 */
  partnerId?: number;
  /** 0进项 1销项 */
  direction?: string;
  /** 金额 */
  amount?: string;
  /** 税额 */
  taxAmount?: string;
  /** 开票日期 */
  invoiceDate?: string;
  /** 关联业务类型 */
  relateType?: string;
  /** 关联业务ID */
  relateId?: number;
  /** 0未核销 1已核销 */
  status?: string;
}

/** 发票配置信息 */
export interface FinInvoice extends BaseEntity {
  /** 发票ID */
  id?: number;
  /** 发票号码（唯一） */
  invoiceNo?: string;
  /** 0增值税专票 1普票 */
  invoiceType?: string;
  /** 开票/收票单位 */
  partnerId?: number;
  /** 0进项 1销项 */
  direction?: string;
  /** 金额 */
  amount?: string;
  /** 税额 */
  taxAmount?: string;
  /** 开票日期 */
  invoiceDate?: string;
  /** 关联业务类型 */
  relateType?: string;
  /** 关联业务ID */
  relateId?: number;
  /** 0未核销 1已核销 */
  status?: string;
  /** 备注 */
  remark?: string;
  /** 创建者 */
  createBy?: string;
  /** 创建时间 */
  createTime?: string;
  /** 更新者 */
  updateBy?: string;
  /** 更新时间 */
  updateTime?: string;
}
