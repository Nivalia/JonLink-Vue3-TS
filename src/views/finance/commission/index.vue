<template>
  <div class="app-container">
    <!-- 顶部筛选 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="保单号" prop="policyNo">
        <el-input v-model="queryParams.policyNo" placeholder="请输入保单号" clearable @keyup.enter="handleQuery" style="width:180px" />
      </el-form-item>
      <el-form-item label="保险公司" prop="insuranceCompany">
        <el-select v-model="queryParams.insuranceCompany" placeholder="选择保险公司" clearable style="width:180px">
          <el-option v-for="item in insuranceCompanyList" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="状态" clearable style="width:120px">
          <el-option v-for="dict in fin_settle_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleBatchAdd" v-hasPermi="['finance:commission:add']">批量创建</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <!-- 列表 -->
    <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange" show-summary :summary-method="summaryTable">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column label="保单号" prop="policyNo" min-width="160" show-overflow-tooltip />
      <el-table-column label="保险公司" prop="insuranceCompany" min-width="150" show-overflow-tooltip />
      <el-table-column label="被保险人" prop="insuredName" min-width="120" show-overflow-tooltip />
      <el-table-column label="保费" prop="premium" width="110" align="right">
        <template #default="{ row }">
          <span>{{ formatAmount(row.premium) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="佣金比例" prop="commissionRate" width="100" align="center">
        <template #default="{ row }">
          <span>{{ row.commissionRate }}%</span>
        </template>
      </el-table-column>
      <el-table-column label="佣金金额" prop="commissionAmount" width="110" align="right">
        <template #default="{ row }">
          <span style="color:#67c23a;font-weight:bold">{{ formatAmount(row.commissionAmount) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="status" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="statusTag(row.status)" disable-transitions>{{ statusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="保单起期" prop="policyStartDate" width="110" align="center" />
      <el-table-column label="保单止期" prop="policyEndDate" width="110" align="center" />
      <el-table-column label="操作" width="180" align="center" fixed="right" class-name="small-padding fixed-width">
        <template #default="{ row }">
          <template v-if="row.status === '0'">
            <el-button link type="success" @click="handleConfirm(row)" v-hasPermi="['finance:commission:confirm']">确认</el-button>
            <el-button link type="danger" @click="handleCancel(row)" v-hasPermi="['finance:commission:cancel']">取消</el-button>
          </template>
          <template v-else-if="row.status === '1'">
            <el-button link type="primary" @click="handleMarkPaid(row)" v-hasPermi="['finance:commission:pay']">标记已支付</el-button>
            <el-button link type="info" @click="handleDetail(row)">详情</el-button>
          </template>
          <template v-else-if="row.status === '2'">
            <el-button link type="info" @click="handleDetail(row)">详情</el-button>
          </template>
          <template v-else>
            <span style="color:#909399">已取消</span>
          </template>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 批量创建对话框 -->
    <el-dialog title="批量创建佣金结算" v-model="dialogVisible" width="900px" append-to-body>
      <el-form ref="formRef" :model="form" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="保险公司" prop="insuranceCompany" :rules="[{ required: true, message: '请选择保险公司', trigger: 'change' }]">
              <el-select v-model="form.insuranceCompany" placeholder="选择保险公司" style="width:100%">
                <el-option v-for="item in insuranceCompanyList" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="佣金比例" prop="commissionRate" :rules="[{ required: true, message: '请输入佣金比例', trigger: 'blur' }]">
              <el-input-number v-model="form.commissionRate" :min="0" :max="100" :precision="2" :step="0.5" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="含税">
              <el-switch v-model="form.taxFlag" active-value="1" inactive-value="0" />
              <span style="margin-left:8px;color:#909399;font-size:12px">开启: 基数=保费/1.06</span>
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 保单列表 -->
        <el-divider content-position="left">
          保单列表 <el-button link type="primary" @click="addPolicy">+ 添加保单</el-button>
        </el-divider>
        <el-table :data="form.policies" border style="width:100%" show-summary :summary-method="summaryPolicies">
          <el-table-column label="#" type="index" width="50" align="center" />
          <el-table-column label="保单号" min-width="160">
            <template #default="{ row: p }">
              <el-input v-model="p.policyNo" placeholder="保单号" />
            </template>
          </el-table-column>
          <el-table-column label="被保险人" min-width="120">
            <template #default="{ row: p }">
              <el-input v-model="p.insuredName" placeholder="被保险人" />
            </template>
          </el-table-column>
          <el-table-column label="保费" width="140">
            <template #default="{ row: p }">
              <el-input-number v-model="p.premium" :min="0" :precision="2" :step="100" :controls="false" style="width:100%" />
            </template>
          </el-table-column>
          <el-table-column label="预计佣金" width="120" align="right">
            <template #default="{ row: p }">
              <span style="color:#67c23a;font-weight:bold">{{ formatAmount(calcCommissionAmount(p.premium)) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="保单起期" width="150">
            <template #default="{ row: p }">
              <el-date-picker v-model="p.policyStartDate" type="date" value-format="YYYY-MM-DD" placeholder="起期" style="width:100%" />
            </template>
          </el-table-column>
          <el-table-column label="保单止期" width="150">
            <template #default="{ row: p }">
              <el-date-picker v-model="p.policyEndDate" type="date" value-format="YYYY-MM-DD" placeholder="止期" style="width:100%" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="70" align="center">
            <template #default="{ $index }">
              <el-button link type="danger" @click="form.policies.splice($index, 1)">删</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form>
      <div style="margin-top: 16px; text-align: right; font-size: 14px;">
        预计佣金总额: <span style="color: #67c23a; font-weight: bold;">¥ {{ formatAmount(totalEstimatedCommission) }}</span>
        <span v-if="form.taxFlag === '1'" style="margin-left: 8px; color: #909399; font-size: 12px">(含税模式: 基数=保费/1.06)</span>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitLoading">批量创建</el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog title="佣金结算详情" v-model="detailVisible" width="700px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="保单号">{{ detailData.policyNo }}</el-descriptions-item>
        <el-descriptions-item label="保险公司">{{ detailData.insuranceCompany }}</el-descriptions-item>
        <el-descriptions-item label="被保险人">{{ detailData.insuredName }}</el-descriptions-item>
        <el-descriptions-item label="保费">{{ formatAmount(detailData.premium) }}</el-descriptions-item>
        <el-descriptions-item label="佣金比例">{{ detailData.commissionRate }}%</el-descriptions-item>
        <el-descriptions-item label="佣金金额">{{ formatAmount(detailData.commissionAmount) }}</el-descriptions-item>
        <el-descriptions-item label="保单起期">{{ detailData.policyStartDate }}</el-descriptions-item>
        <el-descriptions-item label="保单止期">{{ detailData.policyEndDate }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusTag(detailData.status)">{{ statusText(detailData.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailData.createTime }}</el-descriptions-item>
        <el-descriptions-item label="确认时间" :span="2">{{ detailData.confirmTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="支付时间" :span="2">{{ detailData.payTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detailData.remark || '-' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  listCommission, addCommission, confirmCommission, markPaidCommission, cancelCommission
} from '@/api/finance/commission'
import { finDict, finDictItem } from '@/utils/financeDict'

const { fin_settle_status, fin_tax_flag } = useDict('fin_settle_status', 'fin_tax_flag')

interface CommissionItem {
  id: number
  policyNo: string
  insuranceCompany: string
  insuredName: string
  premium: number
  commissionRate: number
  commissionAmount: number
  status: string
  policyStartDate: string
  policyEndDate: string
  createTime: string
  confirmTime: string
  payTime: string
  remark: string
}

interface PolicyItem {
  policyNo: string
  insuredName: string
  premium: number
  policyStartDate: string
  policyEndDate: string
}

const loading = ref(false)
const showSearch = ref(true)
const total = ref(0)
const dataList = ref<CommissionItem[]>([])
const ids = ref<number[]>([])
const multiple = ref(false)
const submitLoading = ref(false)

const queryParams = reactive<any>({
  pageNum: 1,
  pageSize: 20,
  policyNo: '',
  insuranceCompany: '',
  status: ''
})

const insuranceCompanyList = ref<string[]>([
  '中国人寿', '中国平安', '中国太平洋', '中国太平', '新华保险',
  '泰康人寿', '人保寿险', '阳光保险', '华夏保险', '其他'
])

// ===== 对话框 =====
const dialogVisible = ref(false)
const formRef = ref()
const form = reactive({
  insuranceCompany: '',
  commissionRate: 10,
  taxFlag: '0',
  policies: [] as PolicyItem[]
})

// 计算单行预计佣金金额
function calcCommissionAmount(premium: number): number {
  if (!premium || premium <= 0) return 0
  const base = form.taxFlag === '1' ? premium / 1.06 : premium
  return Number((base * form.commissionRate / 100).toFixed(2))
}

// 计算所有保单的预计佣金总额
const totalEstimatedCommission = computed(() => {
  return form.policies.reduce((sum, p) => sum + calcCommissionAmount(p.premium), 0)
})

// 监听含税开关变化，实时更新预览
watch(() => form.taxFlag, () => {
  // 触发响应式更新
})

// 监听佣金比例变化，实时更新预览
watch(() => form.commissionRate, () => {
  // 触发响应式更新
})

// ===== 详情 =====
const detailVisible = ref(false)
const detailData = ref<CommissionItem>({} as CommissionItem)

// ===== 列表查询 =====
async function getList() {
  loading.value = true
  try {
    const r: any = await listCommission(queryParams)
    dataList.value = r.rows || []
    total.value = r.total || 0
  } finally {
    loading.value = false
  }
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function resetQuery() {
  Object.assign(queryParams, {
    pageNum: 1,
    pageSize: 20,
    policyNo: '',
    insuranceCompany: '',
    status: ''
  })
  getList()
}

function handleSelectionChange(s: CommissionItem[]) {
  ids.value = s.map(x => x.id).filter(Boolean)
  multiple.value = s.length === 0
}

// ===== 批量创建 =====
function handleBatchAdd() {
  dialogTitle.value = '批量创建佣金结算'
  Object.assign(form, {
    insuranceCompany: '',
    commissionRate: 10,
    taxFlag: '0',
    policies: []
  })
  addPolicy()
  dialogVisible.value = true
}

function addPolicy() {
  form.policies.push({
    policyNo: '',
    insuredName: '',
    premium: 0,
    policyStartDate: '',
    policyEndDate: ''
  })
}

const dialogTitle = ref('批量创建佣金结算')

async function submitForm() {
  if (!form.insuranceCompany) {
    ElMessage.error('请选择保险公司')
    return
  }
  if (!form.commissionRate || form.commissionRate <= 0) {
    ElMessage.error('请输入佣金比例')
    return
  }
  if (!form.policies || form.policies.length === 0) {
    ElMessage.error('请至少添加一条保单')
    return
  }
  for (const [i, p] of form.policies.entries()) {
    if (!p.policyNo) {
      ElMessage.error(`第 ${i + 1} 行保单号不能为空`)
      return
    }
    if (!p.premium || p.premium <= 0) {
      ElMessage.error(`第 ${i + 1} 行保费必须大于0`)
      return
    }
  }
  submitLoading.value = true
  try {
    const payload = form.policies.map(p => {
      // v4规则: 含税则基数=保费/1.06
      const base = form.taxFlag === '1' ? p.premium / 1.06 : p.premium
      return {
        ...p,
        insuranceCompany: form.insuranceCompany,
        commissionRate: form.commissionRate,
        taxFlag: form.taxFlag,
        commissionAmount: Number((base * form.commissionRate / 100).toFixed(2))
      }
    })
    await addCommission(payload)
    ElMessage.success('批量创建成功')
    dialogVisible.value = false
    getList()
  } catch (e: any) {
    ElMessage.error(e?.msg || '创建失败')
  } finally {
    submitLoading.value = false
  }
}

// ===== 确认 =====
async function handleConfirm(row: CommissionItem) {
  try {
    await ElMessageBox.confirm(
      `确认保单 ${row.policyNo} 的佣金结算？`,
      '提示',
      { type: 'warning' }
    )
    await confirmCommission(row.id)
    ElMessage.success('已确认')
    getList()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error(e?.msg || '确认失败')
  }
}

// ===== 标记已支付 =====
async function handleMarkPaid(row: CommissionItem) {
  try {
    await ElMessageBox.confirm(
      `确认保单 ${row.policyNo} 的佣金已支付？`,
      '提示',
      { type: 'warning' }
    )
    await markPaidCommission(row.id)
    ElMessage.success('已标记为已支付')
    getList()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error(e?.msg || '操作失败')
  }
}

// ===== 取消 =====
async function handleCancel(row: CommissionItem) {
  try {
    await ElMessageBox.confirm(
      `确认取消保单 ${row.policyNo} 的佣金结算？`,
      '提示',
      { type: 'warning' }
    )
    await cancelCommission(row.id)
    ElMessage.success('已取消')
    getList()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error(e?.msg || '取消失败')
  }
}

// ===== 详情 =====
function handleDetail(row: CommissionItem) {
  detailData.value = { ...row }
  detailVisible.value = true
}

// ===== 表格汇总 =====
function summaryTable({ columns, data }: any) {
  const sums: string[] = []
  columns.forEach((col: any, idx: number) => {
    if (idx === 0) {
      sums[idx] = '合计'
    } else if (col.label === '保费') {
      sums[idx] = formatAmount(data.reduce((s: number, item: CommissionItem) => s + (item.premium || 0), 0))
    } else if (col.label === '佣金金额') {
      sums[idx] = formatAmount(data.reduce((s: number, item: CommissionItem) => s + (item.commissionAmount || 0), 0))
    } else {
      sums[idx] = ''
    }
  })
  return sums
}

// 保单列表合计
function summaryPolicies({ columns, data }: any) {
  const sums: string[] = []
  columns.forEach((col: any, idx: number) => {
    if (idx === 0) {
      sums[idx] = '合计'
    } else if (col.label === '保费') {
      sums[idx] = formatAmount(data.reduce((s: number, item: PolicyItem) => s + (item.premium || 0), 0))
    } else if (col.label === '预计佣金') {
      sums[idx] = formatAmount(totalEstimatedCommission.value)
    } else {
      sums[idx] = ''
    }
  })
  return sums
}

// ===== 工具函数 =====
function formatAmount(v?: string | number): string {
  if (v === undefined || v === null || v === '') return '0.00'
  return Number(v).toFixed(2)
}

function statusText(s: string) { return finDict(s, 'fin_settle_status') }
function statusTag(s: string) { return finDictItem(s, 'fin_settle_status').type }

onMounted(() => {
  getList()
})
</script>

<style scoped>
.mt8 { margin-top: 8px; }
</style>
