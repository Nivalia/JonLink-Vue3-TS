<template>
  <div class="app-container">
    <el-form :model="queryParams" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="单号" prop="docNo"><el-input v-model="queryParams.docNo" clearable @keyup.enter="handleQuery" /></el-form-item>
      <el-form-item label="往来单位" prop="partnerName"><el-input v-model="queryParams.partnerName" clearable placeholder="名称模糊搜索" /></el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" clearable style="width:140px">
          <el-option v-for="dict in fin_receivable_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item><el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
      <el-button icon="Refresh" @click="resetQuery">重置</el-button></el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5"><el-button type="primary" plain icon="Plus" @click="addOpen" v-hasPermi="['finance:payable:add']">新增应付</el-button></el-col>
      <el-col :span="1.5"><el-button type="warning" plain icon="RefreshLeft" :disabled="single" @click="cancelOpen" v-hasPermi="['finance:settlement:cancel']">核销</el-button></el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="dataList" @selection-change="handleChange" stripe border>
      <el-table-column type="selection" width="50" />
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column label="单号" prop="docNo" min-width="200" show-overflow-tooltip />
      <el-table-column label="往来单位" prop="partnerName" min-width="160" show-overflow-tooltip>
        <template #default="{row}">
          <span>{{ row.partnerName || '' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="业务类型" prop="bizType" width="160">
        <template #default="{row}">
          <el-tag size="small" disable-transitions>{{ finDict(row.bizType, 'receipt_biz_type') }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="来源" prop="sourceType" width="120">
        <template #default="{row}">
          <span class="source">{{ sourceLabel(row.sourceType) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="金额" prop="amount" min-width="130" align="right">
        <template #default="{row}"><b class="money">{{ fmt(row.amount) }}</b></template>
      </el-table-column>
      <el-table-column label="已付" prop="paidAmount" min-width="120" align="right">
        <template #default="{row}"><span class="money in">{{ fmt(row.paidAmount) }}</span></template>
      </el-table-column>
      <el-table-column label="未付" prop="remainAmount" min-width="120" align="right">
        <template #default="{row}"><span class="money out">{{ fmt(row.remainAmount) }}</span></template>
      </el-table-column>
      <el-table-column label="状态" prop="status" width="100" align="center">
        <template #default="{row}"><el-tag :type="statusTag(row.status)" disable-transitions>{{ statusText(row.status) }}</el-tag></template>
      </el-table-column>
      <el-table-column label="到期日" prop="dueDate" width="120" align="center">
        <template #default="{row}">
          <div>
            <span>{{ row.dueDate ? row.dueDate.substring(0,10) : '-' }}</span>
            <el-tag v-if="getOverdueStatus(row)" type="danger" size="small" style="margin-left:4px">逾期</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" width="160" align="center">
        <template #default="{row}"><span>{{ row.createTime ? row.createTime.substring(0,16) : '-' }}</span></template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <el-dialog v-model="dialogVisible" title="新增应付" width="560px" append-to-body destroy-on-close>
      <el-form label-width="100px" label-position="right">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="往来单位">
              <el-select v-model="form.partnerName" filterable placeholder="选择往来单位" style="width:100%" @change="matchPartnerId">
                <el-option v-for="p in partnerList" :key="p.id" :label="p.partnerName" :value="p.partnerName" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="伙伴编号">
              <el-input-number v-model="form.partnerId" :min="0" controls-position="right" style="width:100%" disabled placeholder="自动匹配" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="业务类型">
              <el-select v-model="form.bizType" style="width:100%" placeholder="选择业务类型">
                <el-option label="客户保费收款" value="CUSTOMER_PREMIUM" />
                <el-option label="客户回款" value="CUSTOMER_RECEIPT" />
                <el-option label="下级佣金付款" value="DOWN_COMMISSION_PAY" />
                <el-option label="上级佣金收款" value="UP_COMMISSION_PAY" />
                <el-option label="一般收款" value="RECEIPT" />
                <el-option label="一般付款" value="PAYMENT" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="来源">
              <el-select v-model="form.sourceType" style="width:100%" placeholder="选择来源">
                <el-option label="台账生成" value="ledger_book" />
                <el-option label="手工录入" value="manual" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="金额" required>
          <el-input-number v-model="form.amount" :min="0.01" :precision="2" controls-position="right" style="width:100%" />
        </el-form-item>
        <el-form-item label="到期日">
          <el-date-picker clearable v-model="form.dueDate" type="date" value-format="YYYY-MM-DD" style="width:100%" placeholder="选填" />
        </el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible=false">取 消</el-button>
      <el-button type="primary" @click="submitAdd()">确 认</el-button></template>
    </el-dialog>

    <el-dialog v-model="cancelVisible" title="核销应付" width="460px" append-to-body destroy-on-close>
      <el-form label-width="100px" label-position="right">
        <el-form-item label="单号">{{ currentRow?.docNo }}</el-form-item>
        <el-form-item label="未付金额"><span class="money out">{{ fmt(currentRow?.remainAmount) }}</span></el-form-item>
        <el-form-item label="本次核销" required>
          <el-input-number v-model="cancelAmount" :min="0.01" :max="currentRow?.remainAmount || 0" :precision="2" controls-position="right" style="width:100%" />
        </el-form-item>
        <el-form-item label="核销后剩余">
          <span class="money" :class="remainAfterCancel > 0 ? 'out' : 'in'">{{ fmt(remainAfterCancel) }}</span>
        </el-form-item>
      </el-form>
      <template #footer><el-button @click="cancelVisible=false">取 消</el-button>
      <el-button type="primary" @click="submitCancel()">确认核销</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { listPayable, addPayable, cancelPayable } from '@/api/finance/settlement'
import { listPartner } from '@/api/finance/partner'
import { finDict, finDictItem } from '@/utils/financeDict'

const { fin_receivable_status } = useDict('fin_receivable_status')

const loading = ref(false); const showSearch = ref(true); const total = ref(0); const dataList = ref<any[]>([])
const single = ref(true); const ids = ref<number[]>([])
const queryParams = reactive<any>({ pageNum: 1, pageSize: 20, docNo: '', partnerName: '', status: '' })

const dialogVisible = ref(false)
const form = reactive<any>({ partnerId: null, partnerName: '', bizType: 'CUSTOMER_PREMIUM', amount: 0, sourceType: 'manual', dueDate: '' })

const cancelVisible = ref(false); const currentRow = ref<any>(null); const cancelAmount = ref(0)

// 往来单位列表
const partnerList = ref<any[]>([])

// 加载往来单位列表
async function loadPartners() {
  try {
    const r: any = await listPartner({ pageNum: 1, pageSize: 1000, status: '1' })
    partnerList.value = r.rows || []
  } catch (e) {
    partnerList.value = []
  }
}

// 根据往来单位名称自动匹配伙伴ID
function matchPartnerId(name: string) {
  if (!name) {
    form.partnerId = null
    return
  }
  const partner = partnerList.value.find(p => p.partnerName === name)
  if (partner) {
    form.partnerId = partner.id
  } else {
    form.partnerId = null
  }
}

// 监听往来单位名称变化
watch(() => form.partnerName, (newVal) => {
  matchPartnerId(newVal)
})

// 计算核销后剩余金额
const remainAfterCancel = computed(() => {
  const remain = Number(currentRow.value?.remainAmount || 0)
  const cancel = Number(cancelAmount.value || 0)
  return remain - cancel
})

// 判断是否逾期
function isOverdue(dueDate: string): boolean {
  if (!dueDate) return false
  const today = new Date().toISOString().split('T')[0]
  return dueDate < today
}

// 获取逾期状态
function getOverdueStatus(row: any): string {
  if (row.status === '2') return '' // 已付不显示
  if (row.dueDate && isOverdue(row.dueDate)) {
    return '已逾期'
  }
  return ''
}

async function getList() {
  loading.value = true
  try { const r: any = await listPayable(queryParams); dataList.value = r.rows || []; total.value = r.total || 0 }
  finally { loading.value = false }
}
function handleQuery() { queryParams.pageNum = 1; getList() }
function resetQuery() { queryParams.docNo=''; queryParams.partnerName=''; queryParams.status=''; handleQuery() }
function handleChange(sel: any[]) { ids.value = sel.map(s => s.id); single.value = sel.length !== 1 }

async function addOpen() {
  Object.assign(form, { partnerId: null, partnerName: '', bizType: 'CUSTOMER_PREMIUM', amount: 0, sourceType: 'manual', dueDate: '' })
  await loadPartners()
  dialogVisible.value = true
}
async function submitAdd() {
  if (!form.amount) { ElMessage.error('金额必填'); return }
  await addPayable(form); ElMessage.success('新增成功'); dialogVisible.value = false; getList()
}

function cancelOpen() {
  currentRow.value = dataList.value.find(x => x.id === ids.value[0])
  cancelAmount.value = currentRow.value?.remainAmount || 0
  cancelVisible.value = true
}
async function submitCancel() {
  await cancelPayable(currentRow.value.id, cancelAmount.value)
  ElMessage.success('核销成功'); cancelVisible.value = false; getList()
}

function fmt(v?: string | number) { return v ? Number(v).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00' }
function statusText(s: string) { return finDict(s, 'fin_receivable_status') }
function statusTag(s: string): any { return finDictItem(s, 'fin_receivable_status').type }
function sourceLabel(s: string) { return ({ 'ledger_book':'台账生成','manual':'手工录入' } as any)[s] || s }

onMounted(getList)
</script>

<style scoped>
.app-container { padding: 16px; }
.money { font-variant-numeric: tabular-nums; font-weight: 500; }
.money.in { color: #67c23a; }
.money.out { color: #f56c6c; }
.source { color: #909399; font-size: 13px; }
</style>