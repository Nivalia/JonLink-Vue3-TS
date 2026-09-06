<template>
  <div class="app-container jl-page">
    <!-- ===== Dashboard 卡片 ===== -->
    <div class="jl-dashboard">
      <div class="jl-stat-card jl-stat-card--primary">
        <div class="jl-stat-card__head">
          <span class="jl-stat-card__label">本周应收</span>
          <el-icon class="jl-stat-card__icon"><CreditCard /></el-icon>
        </div>
        <div class="jl-stat-card__value">{{ fmt(stats.weekAmount) }}</div>
        <div class="jl-stat-card__sub">共 {{ stats.weekCount }} 笔</div>
      </div>
      <div class="jl-stat-card jl-stat-card--success">
        <div class="jl-stat-card__head">
          <span class="jl-stat-card__label">已收款</span>
          <el-icon class="jl-stat-card__icon"><Wallet /></el-icon>
        </div>
        <div class="jl-stat-card__value">{{ fmt(stats.paidAmount) }}</div>
        <div class="jl-stat-card__sub">回款率 {{ stats.paidRate }}%</div>
      </div>
      <div class="jl-stat-card jl-stat-card--danger">
        <div class="jl-stat-card__head">
          <span class="jl-stat-card__label">逾期</span>
          <el-icon class="jl-stat-card__icon"><Warning /></el-icon>
        </div>
        <div class="jl-stat-card__value">{{ stats.overdueCount }}</div>
        <div class="jl-stat-card__sub">{{ fmt(stats.overdueAmount) }}</div>
      </div>
      <div class="jl-stat-card jl-stat-card--warning">
        <div class="jl-stat-card__head">
          <span class="jl-stat-card__label">未收余额</span>
          <el-icon class="jl-stat-card__icon"><Money /></el-icon>
        </div>
        <div class="jl-stat-card__value">{{ fmt(stats.remainAmount) }}</div>
        <div class="jl-stat-card__sub">共 {{ stats.totalCount }} 笔</div>
      </div>
    </div>

    <!-- ===== 快捷筛选条 ===== -->
    <div class="jl-quickbar">
      <div class="jl-quickbar__label">状态</div>
      <el-radio-group v-model="queryParams.status" size="default" @change="handleQuery">
        <el-radio-button label="">全部</el-radio-button>
        <el-radio-button label="0">未收款</el-radio-button>
        <el-radio-button label="1">部分收</el-radio-button>
        <el-radio-button label="2">已结清</el-radio-button>
      </el-radio-group>
      <el-divider direction="vertical" />
      <div class="jl-quickbar__label">时间</div>
      <el-radio-group v-model="quickDate" size="default" @change="handleQuickDate">
        <el-radio-button label="">全部</el-radio-button>
        <el-radio-button label="week">本周</el-radio-button>
        <el-radio-button label="month">本月</el-radio-button>
      </el-radio-group>
      <div class="jl-quickbar__spacer"></div>
      <el-button text :icon="Search" @click="showFilter = !showFilter">
        {{ showFilter ? '收起筛选' : '高级筛选' }}
      </el-button>
    </div>

    <!-- ===== 高级筛选 ===== -->
    <el-form v-show="showFilter" :model="queryParams" :inline="true" label-width="80px" class="jl-filter">
      <el-form-item label="单号" prop="docNo">
        <el-input v-model="queryParams.docNo" placeholder="请输入单号" clearable @keyup.enter="handleQuery" style="width:180px" />
      </el-form-item>
      <el-form-item label="往来单位" prop="partnerName">
        <el-input v-model="queryParams.partnerName" placeholder="名称模糊搜索" clearable style="width:180px" />
      </el-form-item>
      <el-form-item label="业务类型" prop="bizType">
        <el-select v-model="queryParams.bizType" clearable placeholder="全部" style="width:140px">
          <el-option label="客户保费" value="CUSTOMER_PREMIUM" />
          <el-option label="客户回款" value="CUSTOMER_RECEIPT" />
          <el-option label="下级佣金" value="DOWN_COMMISSION_PAY" />
          <el-option label="上级佣金" value="UP_COMMISSION_PAY" />
          <el-option label="一般收款" value="RECEIPT" />
        </el-select>
      </el-form-item>
      <el-form-item label="来源" prop="sourceType">
        <el-select v-model="queryParams.sourceType" clearable placeholder="全部" style="width:120px">
          <el-option label="台账生成" value="ledger_book" />
          <el-option label="手工录入" value="manual" />
        </el-select>
      </el-form-item>
      <el-form-item label="到期日" prop="dueRange" class="jl-form-item--range">
        <el-date-picker
          v-model="dueRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日"
          end-placeholder="结束日"
          value-format="yyyy-MM-dd"
          style="width:240px"
          unlink-panels
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
        <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- ===== 操作栏 ===== -->
    <div class="jl-toolbar">
      <div class="jl-toolbar__main">
        <el-button type="primary" plain :icon="Plus" @click="onAddOpen">新增应收</el-button>
        <el-button type="danger" plain :icon="Delete" :disabled="multiple" @click="onBatchDelete">批量删除</el-button>
        <el-button type="info" plain :icon="Download" @click="onExport">导出</el-button>
      </div>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </div>

    <!-- ===== 主表 ===== -->
    <el-table
      v-loading="loading"
      :data="dataList"
      @selection-change="handleSelectionChange"
      :row-class-name="rowClassName"
      class="jl-table"
      stripe
    >
      <el-table-column type="selection" width="42" />
      <el-table-column type="index" label="#" width="50" align="center" />
      <el-table-column label="单号" prop="docNo" min-width="180" show-overflow-tooltip>
        <template #default="{ row }">
          <span class="jl-cell-docno">{{ row.docNo || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="往来单位" prop="partnerName" min-width="160" show-overflow-tooltip />
      <el-table-column label="业务" prop="bizType" width="100" align="center">
        <template #default="{ row }">
          <el-tag size="small" effect="light" type="primary">{{ bizTypeText(row.bizType) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="来源" prop="sourceType" width="80" align="center">
        <template #default="{ row }">
          <span class="jl-text-muted">{{ sourceLabel(row.sourceType) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="应收金额" prop="amount" min-width="120" align="right" sortable>
        <template #default="{ row }">
          <span class="jl-money">{{ fmt(row.amount) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="已收" prop="paidAmount" min-width="110" align="right">
        <template #default="{ row }">
          <span class="jl-money jl-money--in">{{ fmt(row.paidAmount) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="未收" prop="remainAmount" min-width="110" align="right">
        <template #default="{ row }">
          <span class="jl-money jl-money--out">{{ fmt(row.remainAmount) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="到期日" prop="dueDate" width="140" align="center">
        <template #default="{ row }">
          <div class="jl-cell-due">
            <span>{{ (row.dueDate || '').substring(0, 10) || '-' }}</span>
            <el-tag v-if="isOverdue(row)" type="danger" size="small" effect="dark">逾期</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="status" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="statusTag(row.status)" size="small" effect="light">
            {{ statusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right" width="140" class-name="small-padding fixed-width">
        <template #default="{ row }">
          <el-button link type="primary" :icon="View" @click="onDetail(row)">详情</el-button>
          <el-button link type="danger" :icon="Delete" @click="onDelete(row)">删除</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <div class="jl-empty">
          <el-icon><DocumentRemove /></el-icon>
          <p>暂无应收记录</p>
        </div>
      </template>
    </el-table>

    <!-- ===== 表脚 ===== -->
    <div class="jl-footer">
      <div class="jl-footer__summary">
        <span>合计: <b class="jl-money">{{ fmt(totalAmount) }}</b></span>
        <el-divider direction="vertical" />
        <span>已收: <b class="jl-money jl-money--in">{{ fmt(totalPaid) }}</b></span>
        <el-divider direction="vertical" />
        <span>未收: <b class="jl-money jl-money--out">{{ fmt(totalRemain) }}</b></span>
      </div>
      <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
      />
    </div>

    <!-- ===== 新增/修改 Dialog (用 v-model) ===== -->
    <el-dialog
      :title="formDialogTitle"
      v-model="formDialogVisible"
      width="560px"
      append-to-body
      destroy-on-close
      class="jl-dialog"
      @closed="onFormDialogClosed"
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-form-item label="单号">
          <el-input :model-value="form.docNo || '保存后自动生成'" disabled />
        </el-form-item>
        <el-form-item label="往来单位" prop="partnerName">
          <el-input v-model="form.partnerName" placeholder="请输入往来单位" />
        </el-form-item>
        <el-form-item label="业务类型" prop="bizType">
          <el-select v-model="form.bizType" placeholder="请选择业务类型" style="width:100%">
            <el-option label="客户保费" value="CUSTOMER_PREMIUM" />
            <el-option label="客户回款" value="CUSTOMER_RECEIPT" />
            <el-option label="下级佣金" value="DOWN_COMMISSION_PAY" />
            <el-option label="上级佣金" value="UP_COMMISSION_PAY" />
            <el-option label="一般收款" value="RECEIPT" />
          </el-select>
        </el-form-item>
        <el-form-item label="来源" prop="sourceType">
          <el-select v-model="form.sourceType" placeholder="请选择来源" style="width:100%">
            <el-option label="台账生成" value="ledger_book" />
            <el-option label="手工录入" value="manual" />
          </el-select>
        </el-form-item>
        <el-form-item label="应收金额" prop="amount">
          <el-input-number v-model="form.amount" :precision="2" :min="0.01" controls-position="right" style="width:100%" />
        </el-form-item>
        <el-form-item label="到期日" prop="dueDate">
          <el-date-picker clearable v-model="form.dueDate" type="date" value-format="yyyy-MM-dd" style="width:100%" placeholder="选择到期日" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="可输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="formDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="onSubmitForm" :loading="formSubmitting">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- ===== 详情 Dialog (只读) ===== -->
    <el-dialog
      title="应收详情"
      v-model="detailDialogVisible"
      width="640px"
      append-to-body
      class="jl-dialog"
    >
      <div v-if="detailRow" class="jl-detail">
        <div class="jl-detail__row"><span class="jl-detail__label">单号</span><span class="jl-detail__value jl-cell-docno">{{ detailRow.docNo }}</span></div>
        <div class="jl-detail__row"><span class="jl-detail__label">往来单位</span><span class="jl-detail__value">{{ detailRow.partnerName || '-' }}</span></div>
        <div class="jl-detail__row"><span class="jl-detail__label">业务类型</span><span class="jl-detail__value">{{ bizTypeText(detailRow.bizType) }}</span></div>
        <div class="jl-detail__row"><span class="jl-detail__label">来源</span><span class="jl-detail__value">{{ sourceLabel(detailRow.sourceType) }}</span></div>
        <div class="jl-detail__row"><span class="jl-detail__label">应收金额</span><span class="jl-detail__value jl-money">{{ fmt(detailRow.amount) }}</span></div>
        <div class="jl-detail__row"><span class="jl-detail__label">已收</span><span class="jl-detail__value jl-money jl-money--in">{{ fmt(detailRow.paidAmount) }}</span></div>
        <div class="jl-detail__row"><span class="jl-detail__label">未收</span><span class="jl-detail__value jl-money jl-money--out">{{ fmt(detailRow.remainAmount) }}</span></div>
        <div class="jl-detail__row"><span class="jl-detail__label">到期日</span><span class="jl-detail__value">{{ (detailRow.dueDate || '').substring(0, 10) || '-' }}</span></div>
        <div class="jl-detail__row"><span class="jl-detail__label">状态</span><span class="jl-detail__value">{{ statusText(detailRow.status) }}</span></div>
        <div class="jl-detail__row"><span class="jl-detail__label">创建时间</span><span class="jl-detail__value">{{ detailRow.createTime }}</span></div>
        <div class="jl-detail__row"><span class="jl-detail__label">备注</span><span class="jl-detail__value">{{ detailRow.remark || '-' }}</span></div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="detailDialogVisible = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import {
  Search, Refresh, Plus, Delete, Download, View,
  CreditCard, Wallet, Warning, Money, DocumentRemove
} from '@element-plus/icons-vue'

export default {
  name: 'FinanceReceivable',
  components: {
    Search, Refresh, Plus, Delete, Download, View,
    CreditCard, Wallet, Warning, Money, DocumentRemove
  },
  data() {
    return {
      loading: false,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      showFilter: false,
      quickDate: '',
      dueRange: [],
      total: 0,
      dataList: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        docNo: '',
        partnerName: '',
        status: '',
        bizType: '',
        sourceType: '',
        dueStart: '',
        dueEnd: ''
      },
      form: {
        id: null, docNo: '', partnerName: '', bizType: null,
        sourceType: 'manual', amount: 0, dueDate: '', remark: ''
      },
      formRules: {
        partnerName: [{ required: true, message: '请输入往来单位', trigger: 'blur' }],
        bizType: [{ required: true, message: '请选择业务类型', trigger: 'change' }],
        amount: [{ required: true, message: '请输入金额', trigger: 'blur' }]
      },
      formDialogVisible: false,
      formDialogTitle: '',
      formSubmitting: false,
      detailDialogVisible: false,
      detailRow: null
    }
  },
  computed: {
    totalAmount() { return this.dataList.reduce((s, r) => s + Number(r.amount || 0), 0) },
    totalPaid() { return this.dataList.reduce((s, r) => s + Number(r.paidAmount || 0), 0) },
    totalRemain() { return this.dataList.reduce((s, r) => s + Number(r.remainAmount || 0), 0) },
    stats() {
      const list = this.dataList || []
      const today = new Date().toISOString().split('T')[0]
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
      const totalAmount = list.reduce((s, r) => s + Number(r.amount || 0), 0)
      const paidAmount = list.reduce((s, r) => s + Number(r.paidAmount || 0), 0)
      const remainAmount = totalAmount - paidAmount
      const overdueList = list.filter(r => this.isOverdue(r))
      const weekList = list.filter(r => {
        const d = (r.createTime || '').substring(0, 10)
        return d >= weekAgo && d <= today
      })
      const paidRate = totalAmount > 0 ? Math.round(paidAmount / totalAmount * 100) : 0
      return {
        weekCount: weekList.length,
        weekAmount: weekList.reduce((s, r) => s + Number(r.amount || 0), 0),
        paidAmount,
        paidRate,
        overdueCount: overdueList.length,
        overdueAmount: overdueList.reduce((s, r) => s + Number(r.remainAmount || 0), 0),
        remainAmount,
        totalCount: list.length
      }
    }
  },
  watch: {
    dueRange(val) {
      if (val && val.length === 2) {
        this.queryParams.dueStart = val[0]
        this.queryParams.dueEnd = val[1]
      } else {
        this.queryParams.dueStart = ''
        this.queryParams.dueEnd = ''
      }
    }
  },
  methods: {
    // ===== API 封装 =====
    apiList(params) {
      return request({ url: '/finance/receivable/list', method: 'get', params })
    },
    apiGet(id) {
      return request({ url: `/finance/receivable/${id}`, method: 'get' })
    },
    apiCreate(body) {
      return request({ url: '/finance/receivable', method: 'post', data: body })
    },
    apiUpdate(body) {
      return request({ url: '/finance/receivable', method: 'put', data: body })
    },
    apiDelete(ids) {
      const idStr = Array.isArray(ids) ? ids.join(',') : ids
      return request({ url: `/finance/receivable/${idStr}`, method: 'delete' })
    },
    apiExport(params) {
      return request({
        url: '/finance/receivable/export',
        method: 'post',
        data: params,
        responseType: 'blob'
      })
    },

    // ===== 工具 =====
    isOverdue(row) {
      if (!row.dueDate || row.status === '2') return false
      return row.dueDate.substring(0, 10) < new Date().toISOString().split('T')[0]
    },
    rowClassName({ row }) {
      if (this.isOverdue(row)) return 'jl-row--overdue'
      if (row.status === '2') return 'jl-row--paid'
      return ''
    },
    fmt(v) {
      return v != null && v !== '' ? Number(v).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'
    },
    bizTypeText(v) {
      return ({
        CUSTOMER_PREMIUM: '客户保费',
        CUSTOMER_RECEIPT: '客户回款',
        DOWN_COMMISSION_PAY: '下级佣金',
        UP_COMMISSION_PAY: '上级佣金',
        RECEIPT: '一般收款',
        PAYMENT: '一般付款'
      })[v] || v || '-'
    },
    sourceLabel(s) {
      return ({ ledger_book: '台账', manual: '手工' })[s] || s || '-'
    },
    statusText(s) {
      return ({ '0': '未收款', '1': '部分收', '2': '已结清' })[s] || s || '-'
    },
    statusTag(s) {
      return ({ '0': 'warning', '1': 'primary', '2': 'success' })[s] || 'info'
    },

    // ===== 查询 =====
    getList() {
      this.loading = true
      this.apiList(this.queryParams).then(response => {
        this.dataList = response.rows || []
        this.total = response.total || 0
        this.loading = false
      }).catch(() => { this.loading = false })
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.dueRange = []
      this.quickDate = ''
      this.queryParams = {
        pageNum: 1, pageSize: this.queryParams.pageSize,
        docNo: '', partnerName: '', status: '', bizType: '', sourceType: '',
        dueStart: '', dueEnd: ''
      }
      this.handleQuery()
    },
    handleQuickDate(period) {
      const today = new Date()
      const fmt = d => d.toISOString().split('T')[0]
      let start, end
      if (period === 'week') {
        start = new Date(today.getTime() - 7 * 86400000)
        end = today
      } else if (period === 'month') {
        start = new Date(today.getFullYear(), today.getMonth(), 1)
        end = today
      } else {
        start = end = null
      }
      if (start && end) {
        this.queryParams.dueStart = fmt(start)
        this.queryParams.dueEnd = fmt(end)
        this.dueRange = [fmt(start), fmt(end)]
      } else {
        this.queryParams.dueStart = ''
        this.queryParams.dueEnd = ''
        this.dueRange = []
      }
      this.handleQuery()
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },

    // ===== 新增 =====
    onAddOpen() {
      this.resetForm()
      this.formDialogTitle = '新增应收'
      this.formDialogVisible = true
    },

    // ===== 详情 (查看) =====
    onDetail(row) {
      this.detailRow = { ...row }
      this.detailDialogVisible = true
    },

    // ===== 删除 (单条) =====
    onDelete(row) {
      this.$modal.confirm('确认删除应收「' + (row.docNo || row.id) + '」?').then(() => {
        return this.apiDelete(row.id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        this.getList()
      }).catch(e => {
        if (e && e !== 'cancel') {
          this.$modal.msgError(e.message || '删除失败')
        }
      })
    },

    // ===== 批量删除 =====
    onBatchDelete() {
      if (this.ids.length === 0) {
        this.$modal.msgWarning('请先选择要删除的应收')
        return
      }
      this.$modal.confirm('确认批量删除 ' + this.ids.length + ' 条应收?').then(() => {
        return this.apiDelete(this.ids)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        this.ids = []
        this.getList()
      }).catch(e => {
        if (e && e !== 'cancel') {
          this.$modal.msgError(e.message || '删除失败')
        }
      })
    },

    // ===== 导出 =====
    onExport() {
      // 走通用 download
      const filename = `应收_${Date.now()}.xlsx`
      const params = { ...this.queryParams, pageNum: 1, pageSize: 10000 }
      // 用 this.$download 走 project 内置下载器 (RuoYi 通用方法)
      this.$download.postUrl('/finance/receivable/export', params, filename)
    },

    // ===== 提交表单 (新增/编辑) =====
    onSubmitForm() {
      this.$refs.formRef.validate(valid => {
        if (!valid) return
        this.formSubmitting = true
        const api = this.form.id ? this.apiUpdate(this.form) : this.apiCreate(this.form)
        api.then(() => {
          this.$modal.msgSuccess(this.form.id ? '修改成功' : '新增成功')
          this.formDialogVisible = false
          this.getList()
        }).catch(e => {
          this.$modal.msgError(e.message || '保存失败')
        }).finally(() => {
          this.formSubmitting = false
        })
      })
    },
    onFormDialogClosed() {
      this.resetForm()
    },
    resetForm() {
      this.form = {
        id: null, docNo: '', partnerName: '', bizType: null,
        sourceType: 'manual', amount: 0, dueDate: '', remark: ''
      }
      // 清除校验状态
      if (this.$refs.formRef) {
        this.$refs.formRef.clearValidate()
      }
    }
  },
  created() {
    this.getList()
  }
}
</script>

<style scoped>
.jl-page { padding: 16px; background: #f5f7fa; min-height: 100%; }

/* Dashboard */
.jl-dashboard {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}
.jl-stat-card {
  position: relative;
  padding: 18px 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  border-left: 3px solid #409eff;
  transition: box-shadow .2s;
  overflow: hidden;
}
.jl-stat-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.jl-stat-card--primary { border-left-color: #409eff; }
.jl-stat-card--success { border-left-color: #67c23a; }
.jl-stat-card--warning { border-left-color: #e6a23c; }
.jl-stat-card--danger { border-left-color: #f56c6c; }
.jl-stat-card__head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.jl-stat-card__label { font-size: 13px; color: #909399; }
.jl-stat-card__icon { font-size: 18px; color: #c0c4cc; }
.jl-stat-card--primary .jl-stat-card__icon { color: #409eff; }
.jl-stat-card--success .jl-stat-card__icon { color: #67c23a; }
.jl-stat-card--warning .jl-stat-card__icon { color: #e6a23c; }
.jl-stat-card--danger .jl-stat-card__icon { color: #f56c6c; }
.jl-stat-card__value {
  font-size: 26px;
  font-weight: 600;
  color: #303133;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}
.jl-stat-card--success .jl-stat-card__value { color: #67c23a; }
.jl-stat-card--danger .jl-stat-card__value { color: #f56c6c; }
.jl-stat-card__sub { margin-top: 6px; font-size: 12px; color: #909399; }

/* 快捷筛选 */
.jl-quickbar {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 12px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  gap: 8px;
  flex-wrap: wrap;
}
.jl-quickbar__label { font-size: 13px; color: #606266; font-weight: 500; margin-right: 4px; }
.jl-quickbar__spacer { flex: 1; }

/* 高级筛选 */
.jl-filter {
  background: #fafbfc;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 14px 16px 0 4px;
  margin-bottom: 12px;
}
.jl-filter .el-form-item { margin-bottom: 14px; }
.jl-form-item--range { margin-right: 0; }

/* 工具栏 */
.jl-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.jl-toolbar__main { display: flex; gap: 8px; }
.jl-toolbar__main .el-button + .el-button { margin-left: 0; }

/* 表格 */
.jl-table {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}
.jl-cell-docno {
  font-family: 'SF Mono', Consolas, Monaco, monospace;
  font-size: 13px;
  color: #303133;
  font-weight: 500;
}
.jl-cell-due {
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: center;
}
.jl-text-muted { color: #909399; font-size: 13px; }

.jl-money { font-variant-numeric: tabular-nums; font-weight: 500; color: #303133; }
.jl-money--in { color: #67c23a; }
.jl-money--out { color: #f56c6c; }

.jl-row--paid { background: #f0f9eb !important; }
.jl-row--paid:hover > td { background: #e1f3d8 !important; }
.jl-row--overdue { background: #fef0f0 !important; }
.jl-row--overdue:hover > td { background: #fde2e2 !important; }

/* 表脚 */
.jl-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding: 14px 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}
.jl-footer__summary {
  display: flex;
  align-items: center;
  gap: 0;
  font-size: 13px;
  color: #606266;
}
.jl-footer__summary b { font-size: 14px; }

/* 空数据 */
.jl-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
  color: #c0c4cc;
}
.jl-empty .el-icon { font-size: 48px; margin-bottom: 8px; }

/* Dialog */
.jl-dialog :deep(.el-dialog__body) { padding: 16px 24px 0; }

/* 详情 */
.jl-detail__row {
  display: flex;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}
.jl-detail__row:last-child { border-bottom: none; }
.jl-detail__label {
  width: 100px;
  color: #909399;
  font-size: 13px;
}
.jl-detail__value {
  flex: 1;
  color: #303133;
  font-size: 14px;
}
</style>
