<template>
  <div class="app-container">
    <el-form :model="quejlParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="报销单号" prop="expenseNo">
        <el-input v-model="quejlParams.expenseNo" placeholder="请输入报销单号" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="申请人" prop="applicant">
        <el-input v-model="quejlParams.applicant" placeholder="请输入申请人" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery()">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery()">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="openApply()" v-hasPermi="['finance:expense:add']">申请报销</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['finance:expense:remove']">删除</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="expenseList" @selection-change="handleSelectionChange" stripe border>
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column label="单号" align="center" prop="expenseNo" min-width="220" show-overflow-tooltip />
      <el-table-column label="申请人" align="center" prop="applicant" min-width="100" />
      <el-table-column label="部门" align="center" prop="deptName" min-width="120" />
      <el-table-column label="总额" align="right" prop="totalAmount" min-width="140">
        <template #default="scope">
          <b class="money">¥ {{ Number(scope.row.totalAmount || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</b>
        </template>
      </el-table-column>
      <el-table-column label="明细数" prop="itemCount" width="80" align="center">
        <template #default="scope">
          <el-tag :type="(scope.row.itemCount || 0) > 0 ? 'success' : 'info'" disable-transitions>{{ scope.row.itemCount || 0 }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center" prop="expenseType">
        <template #default="scope">
          <el-tag :type="finDictItem(scope.row.expenseType, 'expense_type').type" disable-transitions>
            {{ finDict(scope.row.expenseType, 'expense_type') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <el-tag :type="finDictItem(scope.row.status, 'expense_status').type" disable-transitions>
            {{ finDict(scope.row.status, 'expense_status') }}
          </el-tag>
        </template>
      </el-table-column>
            <el-table-column label="凭证" align="center" prop="voucherNo" min-width="160" show-overflow-tooltip>
        <template #default="scope">
          <span v-if="scope.row.voucherNo">{{ scope.row.voucherNo }}</span>
          <span v-else class="text-muted">未关联</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="120">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="viewItems(scope.row)">明细</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['finance:expense:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="quejlParams.pageNum" v-model:limit="quejlParams.pageSize" @pagination="getList" />

    <!-- 申请报销对话框 -->
    <el-dialog title="申请报销" v-model="applyOpen" width="780px" append-to-body>
      <el-form :model="applyForm" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="申请人" required>
              <el-input v-model="applyForm.applicant" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门">
              <el-input v-model="applyForm.deptName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="类型">
              <el-select v-model="applyForm.expenseType" placeholder="请选择" style="width:100%">
                <el-option v-for="dict in expense_type" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider content-position="left">费用明细</el-divider>
        <el-button type="primary" plain icon="Plus" @click="addItem()" size="small">添加明细</el-button>
        <el-table :data="applyForm.items" style="margin-top: 10px" border>
          <el-table-column label="项目" align="center">
            <template #default="scope">
              <el-input v-model="scope.row.itemName" size="small" />
            </template>
          </el-table-column>
          <el-table-column label="金额" align="center" width="160">
            <template #default="scope">
              <el-input-number v-model="scope.row.amount" :min="0" :precision="2" size="small" style="width:100%" @change="recalcTotal()" />
            </template>
          </el-table-column>
          <el-table-column label="备注" align="center">
            <template #default="scope">
              <el-input v-model="scope.row.remark" size="small" />
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="80">
            <template #default="scope">
              <el-button link type="danger" @click="removeItem(scope.$index)">删</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div style="margin-top: 12px; text-align: right; font-size: 16px;">
          合计: <span style="color: #409eff; font-weight: bold;">¥ {{ totalDisplay }}</span>
          <el-tag v-if="budgetWarning" type="danger" size="small" style="margin-left: 8px">{{ budgetWarning }}</el-tag>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="applyOpen = false">取消</el-button>
        <el-button type="primary" @click="submitApply()">提交</el-button>
      </template>
    </el-dialog>

    <!-- 明细查看 -->
    <el-dialog title="费用明细" v-model="viewOpen" width="600px">
      <el-descriptions :column="1" border size="small">
        <el-descriptions-item label="单号">{{ viewData.expenseNo }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ viewData.applicant }} / {{ viewData.deptName }}</el-descriptions-item>
        <el-descriptions-item label="总额">¥ {{ Number(viewData.totalAmount || 0).toFixed(2) }}</el-descriptions-item>
      </el-descriptions>
      <el-table :data="itemRows" border style="margin-top: 12px">
        <el-table-column label="#" align="center" prop="sortOrder" width="60" />
        <el-table-column label="项目" align="center" prop="itemName" />
        <el-table-column label="金额" align="center" prop="amount">
          <template #default="scope">¥ {{ Number(scope.row.amount || 0).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="发票" align="center" prop="invoiceNo" min-width="180" show-overflow-tooltip>
          <template #default="scope">
            <span v-if="scope.row.invoiceNo">{{ scope.row.invoiceNo }}</span>
            <span v-else class="text-muted">未关联</span>
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center" prop="remark" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="Expense">
import { ref, computed, watch } from 'vue'
import { getCurrentInstance } from 'vue'
import { listExpense, getExpense, delExpense, addExpenseWithItems } from '@/api/finance/expense'
import { finDict, finDictItem } from '@/utils/financeDict'

const { expense_type, expense_status } = useDict('expense_type', 'expense_status')

const { proxy } = getCurrentInstance() as any

const quejlParams = ref<any>({ pageNum: 1, pageSize: 10, expenseNo: null, applicant: null })
const expenseList = ref<any[]>([])
const total = ref(0)
const loading = ref(false)
const showSearch = ref(true)
const ids = ref<number[]>([])
const multiple = ref(true)

const applyOpen = ref(false)
const applyForm = ref<any>({ applicant: '', deptName: '', expenseType: '0', items: [] as any[] })
const totalDisplay = computed(() => applyForm.value.items.reduce((s, x) => s + Number(x.amount || 0), 0).toFixed(2))

// 费用类型对应的默认明细项目
const expenseTypeItems: Record<string, string[]> = {
  '0': ['办公用品', '交通费', '餐饮费', '其他'],  // 日常报销
  '1': ['交通费', '住宿费', '餐饮费', '通讯费', '其他']  // 差旅报销
}

// 监听费用类型变化，自动填充默认明细
watch(() => applyForm.value.expenseType, (newType) => {
  if (newType && expenseTypeItems[newType]) {
    const defaultItems = expenseTypeItems[newType].map(name => ({
      itemName: name,
      amount: 0,
      remark: ''
    }))
    applyForm.value.items = defaultItems
  }
})

// 预算预警阈值（元）
const budgetWarningThreshold = 5000

// 计算是否超出预算预警
const budgetWarning = computed(() => {
  const total = Number(totalDisplay.value)
  if (total > budgetWarningThreshold) {
    return `合计金额 ¥${total.toFixed(2)} 已超出预算预警阈值 ¥${budgetWarningThreshold.toFixed(2)}`
  }
  return ''
})

const viewOpen = ref(false)
const viewData = ref<any>({})
const itemRows = ref<any[]>([])

function getList() {
  loading.value = true
  listExpense(quejlParams.value).then((res: any) => {
    expenseList.value = res.rows
    total.value = res.total
    loading.value = false
  })
}

function handleQuery() { quejlParams.value.pageNum = 1; getList() }
function resetQuery() {
  quejlParams.value = { pageNum: 1, pageSize: 10, expenseNo: null, applicant: null }
  getList()
}
function handleSelectionChange(sel: any[]) {
  ids.value = sel.map(x => x.id)
  multiple.value = sel.length === 0
}

function openApply() {
  applyForm.value = { applicant: '', deptName: '', expenseType: '0', items: [{ itemName: '', amount: 0, remark: '' }] }
  applyOpen.value = true
}
function addItem() {
  applyForm.value.items.push({ itemName: '', amount: 0, remark: '' })
}
function removeItem(i: number) {
  applyForm.value.items.splice(i, 1)
}
function recalcTotal() { /* trigger computed */ }

function submitApply() {
  if (!applyForm.value.applicant) return proxy.$modal.msgError('请输入申请人')
  if (applyForm.value.items.length === 0) return proxy.$modal.msgError('至少添加一条明细')
  for (const it of applyForm.value.items) {
    if (!it.itemName) return proxy.$modal.msgError('请填写所有明细项目')
  }
  const totalAmount = Number(totalDisplay.value)
  if (totalAmount <= 0) return proxy.$modal.msgError('合计金额必须大于 0')
  addExpenseWithItems({
    applicant: applyForm.value.applicant,
    deptName: applyForm.value.deptName,
    expenseType: applyForm.value.expenseType,
    totalAmount,
    items: applyForm.value.items.map(x => ({ itemName: x.itemName, amount: x.amount, remark: x.remark, invoiceId: null }))
  }).then(() => {
    proxy.$modal.msgSuccess('申请成功')
    applyOpen.value = false
    getList()
  })
}

function handleDelete(row?: any) {
  const _ids = row ? row.id : ids.value
  if (!_ids || _ids.length === 0) return
  proxy.$modal.confirm('确认删除报销单?').then(() => delExpense(_ids)).then(() => {
    proxy.$modal.msgSuccess('删除成功'); getList()
  }).catch(() => {})
}

function viewItems(row: any) {
  getExpense(row.id).then((res: any) => {
    viewData.value = res.data.expense || {}
    itemRows.value = res.data.items || []
    viewOpen.value = true
  })
}

getList()
</script>

<style scoped>
.app-container { padding: 16px; }
.money { font-variant-numeric: tabular-nums; color: #303133; }
.text-muted { color: #c0c4cc; }
</style>