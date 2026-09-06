<template>
  <div class="app-container">
    <!-- 顶部筛选 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="凭证号" prop="voucherNo">
        <el-input v-model="queryParams.voucherNo" placeholder="请输入凭证号" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="期间编码" prop="periodCode">
        <el-input v-model="queryParams.periodCode" placeholder="如 202608" clearable @keyup.enter="handleQuery" style="width:140px" />
      </el-form-item>
      <el-form-item label="凭证日期" prop="voucherDate">
        <el-date-picker clearable v-model="queryParams.voucherDate" type="date" value-format="YYYY-MM-DD" placeholder="凭证日期" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="全部" clearable style="width:120px">
          <el-option v-for="dict in fin_voucher_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['finance:voucher:add']">新增凭证</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['finance:voucher:remove']">删除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <!-- 列表 -->
    <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column label="凭证号" prop="voucherNo" min-width="160" show-overflow-tooltip />
      <el-table-column label="期间" prop="periodCode" width="90" align="center" />
      <el-table-column label="凭证日期" prop="voucherDate" width="110" align="center" />
      <el-table-column label="摘要" prop="summary" min-width="200" show-overflow-tooltip />
      <el-table-column label="借方" prop="totalDebit" width="110" align="right">
        <template #default="{ row }">
          <span style="color:#67c23a">{{ formatAmount(row.totalDebit) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="贷方" prop="totalCredit" width="110" align="right">
        <template #default="{ row }">
          <span style="color:#f56c6c">{{ formatAmount(row.totalCredit) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="status" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="statusTag(row.status)" disable-transitions>{{ statusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="制单人" prop="voucherMaker" width="100" align="center" />
      <el-table-column label="审核" width="140" align="center">
        <template #default="{ row }">
          <span v-if="row.auditor">{{ row.auditor }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280" align="center" fixed="right" class-name="small-padding fixed-width">
        <template #default="{ row }">
          <!-- 草稿: 编辑 / 审核 / 删除 -->
          <template v-if="row.status === '0'">
            <el-button link type="primary" @click="handleEdit(row)" v-hasPermi="['finance:voucher:edit']">编辑</el-button>
            <el-button link type="success" @click="handleAudit(row)" v-hasPermi="['finance:voucher:audit']">审核</el-button>
            <el-button link type="danger" @click="handleDelete([row.id])" v-hasPermi="['finance:voucher:remove']">删除</el-button>
          </template>
          <!-- 已审核: 反审核 / 过账 -->
          <template v-else-if="row.status === '1'">
            <el-button link type="warning" @click="handleCancelAudit(row)" v-hasPermi="['finance:voucher:audit']">反审核</el-button>
            <el-button link type="success" @click="handlePost(row)" v-hasPermi="['finance:voucher:post']">过账</el-button>
          </template>
          <!-- 已过账: 反过账 / 作废 -->
          <template v-else-if="row.status === '2'">
            <el-button link type="warning" @click="handleUnpost(row)" v-hasPermi="['finance:voucher:post']">反过账</el-button>
            <el-button link type="danger" @click="handleVoid(row)" v-hasPermi="['finance:voucher:void']">作废</el-button>
          </template>
          <!-- 已作废: 只读 -->
          <template v-else>
            <span style="color:#909399">已作废</span>
          </template>
          <el-button link type="info" @click="handlePreview(row)">打印</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 录入/编辑对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="1080px" append-to-body @close="onDialogClose">
      <el-form ref="formRef" :model="form" label-width="100px">
        <el-row>
          <el-col :span="8">
            <el-form-item label="期间" prop="periodCode">
              <el-input v-model="form.periodCode" placeholder="如 202608" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="凭证日期" prop="voucherDate">
              <el-date-picker v-model="form.voucherDate" type="date" value-format="YYYY-MM-DD" style="width:100%" placeholder="凭证日期" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="凭证号">
              <el-input v-model="form.voucherNo" disabled placeholder="保存后自动生成" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="摘要" prop="summary">
              <el-input v-model="form.summary" placeholder="凭证摘要" />
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 分录表 -->
        <el-divider content-position="left">
          分录 <el-button link type="primary" @click="addEntry">+ 添加分录</el-button>
        </el-divider>
        <el-table :data="form.entries" border style="width:100%" :show-summary="true" :summary-method="summaryEntries">
          <el-table-column label="#" type="index" width="50" align="center" />
          <el-table-column label="科目" min-width="280">
            <template #default="{ row: e }">
              <el-select v-model="e.subjectId" filterable placeholder="输入编码或名称搜索"
                         @change="(v: number) => onSubjectChange(e, v)" style="width:100%">
                <el-option v-for="s in leafSubjects" :key="s.id"
                           :label="`${s.subjectCode} ${s.subjectName}`" :value="s.id" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="摘要" min-width="200">
            <template #default="{ row: e }">
              <el-input v-model="e.summary" placeholder="分录摘要" />
            </template>
          </el-table-column>
          <el-table-column label="借方" width="140">
            <template #default="{ row: e }">
              <el-input-number v-model="e.debitAmount" :min="0" :precision="2" :step="0.01" :controls="false" style="width:100%"
                               @change="() => onAmountChange(e)" />
            </template>
          </el-table-column>
          <el-table-column label="贷方" width="140">
            <template #default="{ row: e }">
              <el-input-number v-model="e.creditAmount" :min="0" :precision="2" :step="0.01" :controls="false" style="width:100%"
                               @change="() => onAmountChange(e)" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="70" align="center">
            <template #default="{ $index }">
              <el-button link type="danger" @click="form.entries.splice($index, 1)">删</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-row class="mt8">
          <el-col :span="12">
            <el-alert v-if="balanceWarning" :title="balanceWarning" type="warning" :closable="false" show-icon />
            <el-alert v-else type="success" :closable="false" show-icon>
              <template #title>借贷平衡 ✓  借:{{ formatAmount(totalDebit) }}  贷:{{ formatAmount(totalCredit) }}</template>
            </el-alert>
            <div v-if="!balanceWarning && totalDebit > 0" class="amount-chinese">
              大写: {{ totalDebitChinese }}
            </div>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备注">
              <el-input v-model="form.remark" type="textarea" rows="2" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitLoading">保存</el-button>
      </template>
    </el-dialog>

    <!-- 打印预览对话框 -->
    <el-dialog title="凭证打印预览" v-model="previewVisible" width="820px" append-to-body>
      <div id="voucher-print" class="voucher-print">
        <h2 style="text-align:center;margin:0 0 12px 0">记 账 凭 证</h2>
        <el-descriptions :column="3" border size="small">
          <el-descriptions-item label="凭证号">{{ previewData.voucher?.voucherNo }}</el-descriptions-item>
          <el-descriptions-item label="期间">{{ previewData.voucher?.periodCode }}</el-descriptions-item>
          <el-descriptions-item label="日期">{{ previewData.voucher?.voucherDate }}</el-descriptions-item>
          <el-descriptions-item label="摘要" :span="3">{{ previewData.voucher?.summary }}</el-descriptions-item>
        </el-descriptions>
        <table class="print-table" style="width:100%;margin-top:8px;border-collapse:collapse">
          <thead>
            <tr>
              <th style="width:60px">序号</th>
              <th>摘要</th>
              <th style="width:140px">科目编码 / 名称</th>
              <th style="width:120px">借方金额</th>
              <th style="width:120px">贷方金额</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(e, i) in previewData.entries" :key="e.id">
              <td align="center">{{ i + 1 }}</td>
              <td>{{ e.summary }}</td>
              <td>{{ subjectNameById(e.subjectId) }}</td>
              <td align="right">{{ formatAmount(e.debitAmount) }}</td>
              <td align="right">{{ formatAmount(e.creditAmount) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" align="right"><b>合计</b></td>
              <td align="right"><b>{{ formatAmount(previewData.voucher?.totalDebit) }}</b></td>
              <td align="right"><b>{{ formatAmount(previewData.voucher?.totalCredit) }}</b></td>
            </tr>
          </tfoot>
        </table>
        <el-row style="margin-top:16px" :gutter="20">
          <el-col :span="8">制单人: {{ previewData.voucher?.voucherMaker }}</el-col>
          <el-col :span="8">审核人: {{ previewData.voucher?.auditor || '-' }}</el-col>
          <el-col :span="8">过账人: {{ previewData.voucher?.poster || '-' }}</el-col>
        </el-row>
      </div>
      <template #footer>
        <el-button @click="previewVisible = false">关闭</el-button>
        <el-button type="primary" icon="Printer" @click="doPrint">打印</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  listVoucher, getVoucher, addVoucher, updateVoucher, delVoucher,
  auditVoucher, cancelAuditVoucher, postVoucher, unpostVoucher, voidVoucher,
  getFullVoucher, nextVoucherNo
} from '@/api/finance/voucher'
import { listSubject, type FinSubject } from '@/api/finance/subject'
import { listPeriod, type FinPeriod } from '@/api/finance/period'
import type { FinVoucher, FinVoucherEntry } from '@/types'
import { finDict, finDictItem } from '@/utils/financeDict'

const { fin_voucher_status, fin_balance_direction } = useDict('fin_voucher_status', 'fin_balance_direction')

const loading = ref(false)
const showSearch = ref(true)
const total = ref(0)
const dataList = ref<FinVoucher[]>([])
const ids = ref<number[]>([])
const multiple = ref(false)
const submitLoading = ref(false)

const queryParams = reactive<any>({
  pageNum: 1, pageSize: 20,
  voucherNo: '', periodCode: '', voucherDate: '', status: ''
})

// ===== Dialog =====
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref()
const form = reactive<FinVoucher>({
  id: undefined,
  periodCode: '', voucherDate: '', voucherNo: '',
  summary: '', remark: '', sourceType: 'manual',
  entries: []
})
const rules = {
  periodCode: [{ required: true, message: '期间不能为空', trigger: 'blur' }],
  voucherDate: [{ required: true, message: '凭证日期不能为空', trigger: 'change' }],
  summary: [{ required: true, message: '摘要不能为空', trigger: 'blur' }]
}

// ===== 科目下拉(仅末级) =====
const allSubjects = ref<FinSubject[]>([])
const leafSubjects = computed(() => allSubjects.value.filter(s => s.isLeaf === '1' && s.status === '1'))

// ===== 期间状态校验 =====
const periodStatus = ref<string>('')
const periodClosed = computed(() => periodStatus.value === '1')

async function checkPeriodStatus(periodCode: string) {
  if (!periodCode) {
    periodStatus.value = ''
    return
  }
  try {
    const r: any = await listPeriod({ periodCode, pageNum: 1, pageSize: 1 })
    const periods = r.rows || []
    if (periods.length > 0) {
      periodStatus.value = periods[0].status || ''
      if (periodStatus.value === '1') {
        ElMessage.warning('该期间已结账，无法保存凭证')
      }
    } else {
      periodStatus.value = ''
      ElMessage.warning('期间不存在，请检查期间编码')
    }
  } catch (e) {
    periodStatus.value = ''
  }
}

async function loadSubjects() {
  const r: any = await listSubject({})
  allSubjects.value = r.data || []
}
function subjectNameById(id?: number): string {
  const s = allSubjects.value.find(x => x.id === id)
  return s ? `${s.subjectCode} ${s.subjectName}` : ''
}

// ===== 分录辅助 =====
function addEntry() {
  form.entries!.push({ subjectId: undefined, summary: '', debitAmount: 0, creditAmount: 0, sortOrder: form.entries!.length + 1 })
}
function onSubjectChange(e: FinVoucherEntry, v: number) {
  const s = allSubjects.value.find(x => x.id === v)
  if (s) {
    // 自动填充分录摘要（如果为空）
    if (!e.summary) e.summary = form.summary || ''
    
    // 根据科目余额方向自动建议借方或贷方
    // balanceDirection: '0' = 借方, '1' = 贷方
    if (s.balanceDirection === '0') {
      // 借方余额科目：建议填入借方，清空贷方
      if ((e.creditAmount ?? 0) > 0) {
        ElMessage.info(`科目 ${s.subjectName} 为借方余额科目，建议填入借方`)
      }
    } else if (s.balanceDirection === '1') {
      // 贷方余额科目：建议填入贷方，清空借方
      if ((e.debitAmount ?? 0) > 0) {
        ElMessage.info(`科目 ${s.subjectName} 为贷方余额科目，建议填入贷方`)
      }
    }
  }
}
function onAmountChange(e: FinVoucherEntry) {
  // 同时只允许借/贷二选一(否则后端拒)
  if ((e.debitAmount ?? 0) > 0 && (e.creditAmount ?? 0) > 0) {
    ElMessage.warning('分录借贷不能同时有金额')
  }
}
const totalDebit = computed(() => (form.entries || []).reduce((s, e) => s + (e.debitAmount ?? 0), 0))
const totalCredit = computed(() => (form.entries || []).reduce((s, e) => s + (e.creditAmount ?? 0), 0))
const balanceWarning = computed(() => {
  const d = totalDebit.value, c = totalCredit.value
  if ((form.entries?.length ?? 0) < 2) return '至少需要两条分录'
  if (d === 0 && c === 0) return ''
  if (d !== c) return `借贷不平衡: 借=${d.toFixed(2)} 贷=${c.toFixed(2)}`
  return ''
})

// 监听期间编码变化，自动校验期间状态
watch(() => form.periodCode, (newVal) => {
  checkPeriodStatus(newVal)
})

// el-table summary
function summaryEntries({ columns, data }: any) {
  const sums: string[] = []
  columns.forEach((col: any, idx: number) => {
    if (idx === 0) sums[idx] = '合计'
    else if (col.label === '借方') sums[idx] = formatAmount(totalDebit.value)
    else if (col.label === '贷方') sums[idx] = formatAmount(totalCredit.value)
    else sums[idx] = ''
  })
  return sums
}

// ===== CRUD =====
async function getList() {
  loading.value = true
  try {
    const r: any = await listVoucher(queryParams)
    dataList.value = r.rows || []
    total.value = r.total || 0
  } finally { loading.value = false }
}

function handleQuery() { queryParams.pageNum = 1; getList() }
function resetQuery() {
  Object.assign(queryParams, { pageNum: 1, pageSize: 20, voucherNo: '', periodCode: '', voucherDate: '', status: '' })
  getList()
}
function handleSelectionChange(s: FinVoucher[]) {
  ids.value = s.map(x => x.id!).filter(Boolean)
  multiple.value = s.length === 0
}

async function handleAdd() {
  dialogTitle.value = '新增凭证'
  Object.assign(form, {
    id: undefined, periodCode: '', voucherDate: new Date().toISOString().slice(0, 10),
    voucherNo: '', summary: '', remark: '', sourceType: 'manual',
    entries: []
  })
  addEntry(); addEntry()  // 默认 2 条空分录
  await loadSubjects()
  dialogVisible.value = true
}

async function handleEdit(row?: FinVoucher) {
  const _id = (row && row.id) || ids.value[0]
  if (!_id) return
  dialogTitle.value = '编辑凭证(草稿)'
  const r: any = await getFullVoucher(_id as number)
  Object.assign(form, r.data.voucher)
  form.entries = r.data.entries || []
  await loadSubjects()
  dialogVisible.value = true
}

async function submitForm() {
  // 客户端预校验 (绕过 el-form validate 兼容问题)
  if (!form.periodCode) { ElMessage.error('请输入期间'); return }
  if (!form.voucherDate) { ElMessage.error('请选择凭证日期'); return }
  if (!form.summary) { ElMessage.error('请输入摘要'); return }
  if (!form.entries || form.entries.length < 2) {
    ElMessage.error('至少需要两条分录'); return
  }
  if (balanceWarning.value) {
    ElMessage.error(balanceWarning.value); return
  }
  
  // 校验期间状态
  if (periodClosed.value) {
    ElMessage.error('该期间已结账，无法保存凭证')
    return
  }
  
  for (const [i, e] of form.entries.entries()) {
    if (!e.subjectId) { ElMessage.error(`第 ${i + 1} 行未选科目`); return }
    if (!e.summary) { ElMessage.error(`第 ${i + 1} 行未填摘要`); return }
    if ((e.debitAmount ?? 0) > 0 && (e.creditAmount ?? 0) > 0) {
      ElMessage.error(`第 ${i + 1} 行借贷不能同时有金额`); return
    }
  }
  // 构造 payload(后端要 entries 内含 sortOrder)
  const payload = {
    ...form,
    entries: form.entries.map((e: any, i: number) => ({ ...e, sortOrder: i + 1 }))
  }
  submitLoading.value = true
  try {
    if (form.id) {
      await updateVoucher(payload)
      ElMessage.success('修改成功')
    } else {
      const r: any = await addVoucher(payload)
      const newId = r.data
      const nx: any = await nextVoucherNo(form.periodCode!)
      form.id = newId
      form.voucherNo = nx.data
      ElMessage.success('保存成功,凭证号 ' + form.voucherNo)
    }
    dialogVisible.value = false
    getList()
  } catch (e: any) {
    ElMessage.error(e?.msg || e?.message || '保存失败')
  } finally { submitLoading.value = false }
}

async function handleDelete(idsArr: number[]) {
  try {
    await ElMessageBox.confirm(`确认删除凭证 [${idsArr.join(',')}] ?`, '提示', { type: 'warning' })
    await delVoucher(idsArr)
    ElMessage.success('删除成功')
    getList()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error(e?.msg || '删除失败')
  }
}

async function handleAudit(row?: FinVoucher) {
  const _id = (row && row.id) || ids.value[0]
  if (!_id) return
  try {
    await ElMessageBox.confirm(`确认审核凭证 ${row?.voucherNo || ''} ?`, '提示', { type: 'warning' })
    await auditVoucher(_id as number)
    ElMessage.success('已审核')
    getList()
  } catch (e: any) { if (e !== 'cancel') ElMessage.error(e?.msg || '审核失败') }
}
async function handleCancelAudit(row?: FinVoucher) {
  const _id = (row && row.id) || ids.value[0]
  if (!_id) return
  try {
    await ElMessageBox.confirm(`反审核 ${row?.voucherNo || ''} ?`, '提示', { type: 'warning' })
    await cancelAuditVoucher(_id as number)
    ElMessage.success('已反审核')
    getList()
  } catch (e: any) { if (e !== 'cancel') ElMessage.error(e?.msg || '操作失败') }
}
async function handlePost(row?: FinVoucher) {
  const _id = (row && row.id) || ids.value[0]
  if (!_id) return
  try {
    await ElMessageBox.confirm(`确认过账 ${row?.voucherNo || ''} ?  过账后凭证正式生效`, '提示', { type: 'warning' })
    await postVoucher(_id as number)
    ElMessage.success('已过账')
    getList()
  } catch (e: any) { if (e !== 'cancel') ElMessage.error(e?.msg || '过账失败') }
}
async function handleUnpost(row?: FinVoucher) {
  const _id = (row && row.id) || ids.value[0]
  if (!_id) return
  try {
    await ElMessageBox.confirm(`反过账 ${row?.voucherNo || ''} ?`, '提示', { type: 'warning' })
    await unpostVoucher(_id as number)
    ElMessage.success('已反过账')
    getList()
  } catch (e: any) { if (e !== 'cancel') ElMessage.error(e?.msg || '操作失败') }
}
async function handleVoid(row?: FinVoucher) {
  const _id = (row && row.id) || ids.value[0]
  if (!_id) return
  try {
    const { value: reason } = await ElMessageBox.prompt('请输入作废原因', '作废凭证', { inputPlaceholder: '原因(可选)', confirmButtonText: '确认作废', cancelButtonText: '取消' })
    await voidVoucher(_id as number, reason)
    ElMessage.success('已作废')
    getList()
  } catch (e: any) {
    if (e !== 'cancel' && e?.type !== 'cancel') ElMessage.error(e?.msg || '作废失败')
  }
}

// ===== 打印预览 =====
const previewVisible = ref(false)
const previewData = ref<{ voucher: FinVoucher | null, entries: FinVoucherEntry[] }>({ voucher: null, entries: [] })
async function handlePreview(row?: FinVoucher) {
  const _id = (row && row.id) || ids.value[0]
  if (!_id) return
  await loadSubjects()
  const r: any = await getFullVoucher(_id as number)
  previewData.value = r.data
  previewVisible.value = true
}
function doPrint() {
  const w = window.open('', '_blank')
  if (!w) { ElMessage.warning('请允许弹窗'); return }
  const html = `<!DOCTYPE html><html><head><title>${previewData.value.voucher?.voucherNo}</title>
    <style>body{font-family:"Microsoft YaHei";padding:20px}
    table{border-collapse:collapse;width:100%}th,td{border:1px solid #000;padding:6px}
    h2{text-align:center} .row{display:flex;justify-content:space-between;margin-top:24px}
    </style></head><body>${(document.getElementById('voucher-print') as HTMLElement).innerHTML}
    <script>window.print()<\/script></body></html>`
  w.document.write(html)
  w.document.close()
}

// ===== 工具 =====
function formatAmount(v?: string | number): string {
  if (v === undefined || v === null || v === '') return ''
  return Number(v).toFixed(2)
}

// 数字转大写金额
function amountToChinese(amount: number): string {
  if (amount === 0) return '零元整'
  
  const digitChar = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
  const unitChar = ['', '拾', '佰', '仟']
  const sectionChar = ['', '万', '亿', '兆']
  
  // 处理小数部分
  const parts = amount.toFixed(2).split('.')
  const intPart = parseInt(parts[0])
  const decPart = parseInt(parts[1])
  
  let result = ''
  
  // 处理整数部分
  if (intPart > 0) {
    const intStr = intPart.toString()
    const groups: string[] = []
    
    // 按4位分组
    for (let i = intStr.length; i > 0; i -= 4) {
      groups.unshift(intStr.slice(Math.max(0, i - 4), i))
    }
    
    groups.forEach((group, groupIndex) => {
      let groupResult = ''
      const digits = group.split('').map(Number)
      
      digits.forEach((digit, digitIndex) => {
        if (digit !== 0) {
          groupResult += digitChar[digit] + unitChar[digits.length - digitIndex - 1]
        } else if (groupResult && !groupResult.endsWith('零')) {
          groupResult += '零'
        }
      })
      
      // 移除末尾的零
      groupResult = groupResult.replace(/零+$/, '')
      
      if (groupResult) {
        result += groupResult + sectionChar[groups.length - groupIndex - 1]
      }
    })
    
    result += '元'
  }
  
  // 处理小数部分
  if (decPart > 0) {
    const jiao = Math.floor(decPart / 10)
    const fen = decPart % 10
    
    if (jiao > 0) {
      result += digitChar[jiao] + '角'
    }
    if (fen > 0) {
      result += digitChar[fen] + '分'
    }
  } else {
    result += '整'
  }
  
  return result
}

// 计算借贷合计的大写金额
const totalDebitChinese = computed(() => amountToChinese(totalDebit.value))
const totalCreditChinese = computed(() => amountToChinese(totalCredit.value))
function statusText(s: string) { return finDict(s, 'fin_voucher_status') }
function statusTag(s: string) { return finDictItem(s, 'fin_voucher_status').type }

function onDialogClose() {
  form.entries = []
}

onMounted(() => { getList() })
</script>

<style scoped>
.voucher-print .print-table th { background:#fafafa; }
.voucher-print .el-descriptions { margin-bottom:8px; }
.mt8 { margin-top: 8px; }
.amount-chinese {
  margin-top: 8px;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  font-size: 14px;
  color: #606266;
}
</style>