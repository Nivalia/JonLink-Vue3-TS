import type { PageDomain, BaseEntity } from "../common";

/** 费用报销单配置分页查询参数 */
export interface ExpenseQuejlParams extends PageDomain {
  /** 单号（BX+日期+流水） */
  expenseNo?: string;
  /** 申请人 */
  applicant?: string;
  /** 部门 */
  deptName?: string;
  /** 报销总额 */
  totalAmount?: string;
  /** 0管理费用 1销售费用 */
  expenseType?: string;
  /** 0草稿 1待审 2已审 3已付款 4驳回 */
  status?: string;
  /** 审批人 */
  approver?: string;
  /** 审批时间 */
  approveTime?: string;
  /** 驳回原因 */
  rejectReason?: string;
  /** 付款单ID */
  paymentId?: number;
  /** 凭证ID */
  voucherId?: number;
}

/** 费用报销单配置信息 */
export interface FinExpense extends BaseEntity {
  /** 报销单ID */
  id?: number;
  /** 单号（BX+日期+流水） */
  expenseNo?: string;
  /** 申请人 */
  applicant?: string;
  /** 部门 */
  deptName?: string;
  /** 报销总额 */
  totalAmount?: string;
  /** 0管理费用 1销售费用 */
  expenseType?: string;
  /** 0草稿 1待审 2已审 3已付款 4驳回 */
  status?: string;
  /** 审批人 */
  approver?: string;
  /** 审批时间 */
  approveTime?: string;
  /** 驳回原因 */
  rejectReason?: string;
  /** 付款单ID */
  paymentId?: number;
  /** 凭证ID */
  voucherId?: number;
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
