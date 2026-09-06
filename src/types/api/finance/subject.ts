import type { PageDomain, BaseEntity } from "../common";

/** 会计科目配置分页查询参数 */
export interface SubjectQuejlParams extends PageDomain {
  /** 父科目ID，0=根 */
  parentId?: number;
  /** 科目编码（如 1002） */
  subjectCode?: string;
  /** 科目名称 */
  subjectName?: string;
  /** 1资产 2负债 3权益 4成本 5损益 */
  subjectType?: string;
  /** 余额方向 0借 1贷 */
  balanceDirection?: string;
  /** 0非末级 1末级 */
  isLeaf?: string;
  /** 0停用 1启用 */
  status?: string;
}

/** 会计科目配置信息 */
export interface FinSubject extends BaseEntity {
  /** 科目ID */
  id?: number;
  /** 父科目ID，0=根 */
  parentId?: number;
  /** 科目编码（如 1002） */
  subjectCode?: string;
  /** 科目名称 */
  subjectName?: string;
  /** 1资产 2负债 3权益 4成本 5损益 */
  subjectType?: string;
  /** 余额方向 0借 1贷 */
  balanceDirection?: string;
  /** 0非末级 1末级 */
  isLeaf?: string;
  /** 0停用 1启用 */
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
