<template>
  <div class="app-container">
    <el-form :model="queryParams" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="单号"><el-input v-model="queryParams.billNo" clearable @keyup.enter="handleQuery" /></el-form-item>
      <el-form-item label="状态">
        <el-select v-model="queryParams.status" clearable style="width:120px">
          <el-option v-for="dict in fin_receivable_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5"><el-button type="primary" plain icon="Plus" @click="openAdd" v-hasPermi="['finance:receipt:add']">新增收款</el-button></el-col>
      <el-col :span="1.5"><el-button type="success" plain icon="Check" :disabled="single" @click="confirm" v-hasPermi="['finance:receipt:confirm']">确认收款</el-button></el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="dataList" @selection-change="handleChange">
      <el-table-column type="selection" width="50" />
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column label="单号" prop="billNo" min-width="200" show-overflow-tooltip />
      <el-table-column label="往来单位" prop="partnerName" min-width="160" show-overflow-tooltip>
        <template #default="{row}">
          <span>{{ row.partnerName || '' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="收款账户" prop="bankAccountName" min-width="160" show-overflow-tooltip>
        <template #default="{row}">
          <span>{{ row.bankAccountName || '' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="金额" prop="amount" width="140" align="right">
        <template #default="{row}"><b class="money in">{{ fmt(row.amount) }}</b></template>
      </el-table-column>
      <el-table-column label="业务类型" prop="bizTypeLabel" width="140" align="center">
        <template #default="{row}">
          <el-tag size="small" disable-transitions>{{ finDict(row.bizType, 'receipt_biz_type') }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="日期" prop="billDate" width="120" align="center">
        <template #default="{row}">
          <span>{{ row.billDate ? row.billDate.substring(0,10) : '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="status" width="100" align="center">
        <template #default="{row}">
          <el-tag :type="finDictItem(row.status, 'receipt_payment_status').type" disable-transitions>
            {{ finDict(row.status, 'receipt_payment_status') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="备注" prop="remark" min-width="160" show-overflow-tooltip />
    </el-table>
    <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <el-dialog v-model="dialogVisible" title="新增收款单" width="560px" append-to-body destroy-on-close>
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
            <el-form-item label="收款账户">
              <el-select v-model="form.bankAccountName" filterable placeholder="选择收款账户" style="width:100%" @change="matchAccountId">
                <el-option v-for="a in accountList" :key="a.id" :label="a.accountName" :value="a.accountName" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="账户编号">
              <el-input-number v-model="form.bankAccountId" :min="0" controls-position="right" style="width:100%" disabled placeholder="自动匹配" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="金额" required>
              <el-input-number v-model="form.amount" :min="0.01" :precision="2" controls-position="right" style="width:100%" />
            </el-form-item>
          </el-col>
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
        </el-row>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="选填" maxlength="200" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible=false">取 消</el-button>
        <el-button type="primary" @click="submit()">保存(未确认)</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { receiptList, addReceipt, confirmReceipt, activeAccounts } from '@/api/finance/fund'
import { listPartner } from '@/api/finance/partner'
import { finDict, finDictItem } from '@/utils/financeDict'

const { fin_receivable_status } = useDict('fin_receivable_status')

const loading = ref(false); const showSearch = ref(true); const total = ref(0); const dataList = ref<any[]>([])
const single = ref(true); const ids = ref<number[]>([])
const queryParams = reactive<any>({ pageNum: 1, pageSize: 20, billNo: '', status: '' })
const dialogVisible = ref(false)
const form = reactive<any>({ partnerId: null, partnerName: '', bankAccountId: null, bankAccountName: '', amount: 0, bizType: 'CUSTOMER_PREMIUM', remark: '' })

// 往来单位和银行账户列表
const partnerList = ref<any[]>([])
const accountList = ref<any[]>([])

// 加载往来单位列表
async function loadPartners() {
  try {
    const r: any = await listPartner({ pageNum: 1, pageSize: 1000, status: '1' })
    partnerList.value = r.rows || []
  } catch (e) {
    partnerList.value = []
  }
}

// 加载银行账户列表
async function loadAccounts() {
  try {
    const r: any = await activeAccounts()
    accountList.value = r.data || []
  } catch (e) {
    accountList.value = []
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

// 根据银行账户名称自动匹配账户ID
function matchAccountId(name: string) {
  if (!name) {
    form.bankAccountId = null
    return
  }
  const account = accountList.value.find(a => a.accountName === name)
  if (account) {
    form.bankAccountId = account.id
  } else {
    form.bankAccountId = null
  }
}

// 监听往来单位名称变化
watch(() => form.partnerName, (newVal) => {
  matchPartnerId(newVal)
})

// 监听银行账户名称变化
watch(() => form.bankAccountName, (newVal) => {
  matchAccountId(newVal)
})

// 根据业务类型自动设置默认往来单位类型
function setDefaultPartnerType(bizType: string) {
  // 这里可以根据业务类型设置默认的往来单位类型
  // 例如：客户保费收款 -> 客户类型
  // 由于当前表单没有partnerType字段，这里只做提示
  if (bizType === 'CUSTOMER_PREMIUM' || bizType === 'CUSTOMER_RECEIPT') {
    ElMessage.info('建议选择客户类型的往来单位')
  } else if (bizType === 'DOWN_COMMISSION_PAY') {
    ElMessage.info('建议选择下游业务员类型的往来单位')
  } else if (bizType === 'UP_COMMISSION_PAY') {
    ElMessage.info('建议选择上游渠道商类型的往来单位')
  }
}

// 监听业务类型变化
watch(() => form.bizType, (newVal) => {
  setDefaultPartnerType(newVal)
})

async function getList() {
  loading.value = true
  try { const r: any = await receiptList(queryParams); dataList.value = r.rows || []; total.value = r.total || 0 }
  finally { loading.value = false }
}
function handleQuery() { queryParams.pageNum = 1; getList() }
function resetQuery() { queryParams.billNo=''; queryParams.status=''; handleQuery() }
function handleChange(sel: any[]) { ids.value = sel.map(s => s.id); single.value = sel.length !== 1 }
async function openAdd() {
  Object.assign(form, { partnerId: null, partnerName: '', bankAccountId: null, bankAccountName: '', amount: 0, bizType: 'CUSTOMER_PREMIUM', remark: '' })
  await Promise.all([loadPartners(), loadAccounts()])
  dialogVisible.value = true
}
async function submit() {
  if (!form.amount) { ElMessage.error('金额必填'); return }
  await addReceipt(form); ElMessage.success('新增成功,未确认状态'); dialogVisible.value = false; getList()
}
async function confirm() {
  await confirmReceipt(ids.value[0]); ElMessage.success('收款已确认'); getList()
}
function fmt(v?: string | number) { return v ? Number(v).toFixed(2) : '0.00' }
onMounted(getList)
</script>

<style scoped>
.app-container { padding: 16px; }
.money { font-variant-numeric: tabular-nums; }
.money.in { color: #67c23a; }
.el-select { width: 100%; }
</style>