<template>
  <div class="app-container">
    <el-form :model="quejlParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="发票号码" prop="invoiceNo">
        <el-input
          v-model="quejlParams.invoiceNo"
          placeholder="请输入发票号码"
          clearable
          style="width: 180px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="开票单位" prop="partnerName">
        <el-input
          v-model="quejlParams.partnerName"
          placeholder="请输入开票单位名称"
          clearable
          style="width: 180px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="方向" prop="direction">
        <el-select v-model="quejlParams.direction" placeholder="请选择方向" clearable style="width: 140px">
          <el-option v-for="dict in invoice_direction" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="发票类型" prop="invoiceType">
        <el-select v-model="quejlParams.invoiceType" placeholder="请选择类型" clearable style="width: 140px">
          <el-option v-for="dict in invoice_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="核销状态" prop="status">
        <el-select v-model="quejlParams.status" placeholder="请选择状态" clearable style="width: 140px">
          <el-option v-for="dict in invoice_settle" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="开票日期" prop="invoiceDate">
        <el-date-picker clearable
          v-model="quejlParams.invoiceDate"
          type="date"
          value-format="YYYY-MM-DD"
          style="width: 180px"
          placeholder="请选择开票日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['finance:invoice:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['finance:invoice:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['finance:invoice:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['finance:invoice:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="invoiceList" @selection-change="handleSelectionChange" stripe border>
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" align="center" width="60" />
      <el-table-column label="发票号码" align="center" prop="invoiceNo" min-width="180" show-overflow-tooltip />
      <el-table-column label="发票类型" align="center" prop="invoiceType" min-width="120">
        <template #default="{ row }">
          <el-tag :type="finDictItem(row.invoiceType, 'invoice_type').type" disable-transitions>
            {{ finDict(row.invoiceType, 'invoice_type') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="往来单位" align="center" prop="partnerName" min-width="160" show-overflow-tooltip />
      <el-table-column label="方向" align="center" prop="direction" min-width="100">
        <template #default="{ row }">
          <el-tag :type="finDictItem(row.direction, 'invoice_direction').type" disable-transitions>
            {{ finDict(row.direction, 'invoice_direction') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="金额" align="right" prop="amount" min-width="120">
        <template #default="{ row }">
          <span class="money">{{ formatMoney(row.amount) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="税额" align="right" prop="taxAmount" min-width="110">
        <template #default="{ row }">
          <span class="money tax">{{ formatMoney(row.taxAmount) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="价税合计" align="right" min-width="130">
        <template #default="{ row }">
          <span class="money total">{{ formatMoney(Number(row.amount || 0) + Number(row.taxAmount || 0)) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="开票日期" align="center" prop="invoiceDate" width="120">
        <template #default="{ row }">
          <span>{{ parseTime(row.invoiceDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="关联业务" align="center" min-width="180" show-overflow-tooltip>
        <template #default="{ row }">
          <span v-if="row.relateType">{{ row.relateType }} / {{ row.relateBizNo || '' }}</span>
          <span v-else class="text-muted">—</span>
        </template>
      </el-table-column>
      <el-table-column label="核销状态" align="center" prop="status" min-width="100">
        <template #default="{ row }">
          <el-tag :type="finDictItem(row.status, 'invoice_settle').type" disable-transitions>
            {{ finDict(row.status, 'invoice_settle') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" min-width="160" show-overflow-tooltip />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="220" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(row)" v-hasPermi="['finance:invoice:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(row)" v-hasPermi="['finance:invoice:remove']">删除</el-button>
          <el-button v-if="row.status !== '1'" link type="success" icon="CircleCheck" @click="handleVerify(row)" v-hasPermi="['finance:invoice:verify']">核验</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="quejlParams.pageNum"
      v-model:limit="quejlParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改发票对话框 -->
    <el-dialog :title="title" v-model="open" width="640px" append-to-body destroy-on-close class="invoice-form-dialog">
      <el-form ref="invoiceRef" :model="form" :rules="rules" label-width="100px" label-position="right">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发票号码" prop="invoiceNo">
              <el-input v-model="form.invoiceNo" placeholder="请输入发票号码" maxlength="64" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开票日期" prop="invoiceDate">
              <el-date-picker clearable
                v-model="form.invoiceDate"
                type="date"
                value-format="YYYY-MM-DD"
                style="width: 100%"
                placeholder="请选择开票日期">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发票类型" prop="invoiceType">
              <el-select v-model="form.invoiceType" placeholder="请选择发票类型" style="width: 100%">
                <el-option v-for="dict in invoice_type" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="方向" prop="direction">
              <el-select v-model="form.direction" placeholder="请选择方向" style="width: 100%">
                <el-option v-for="dict in invoice_direction" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开票单位" prop="partnerName">
              <el-input v-model="form.partnerName" placeholder="请输入开票/收票单位名称" maxlength="120" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="核销状态" prop="status">
              <el-select v-model="form.status" placeholder="请选择核销状态" style="width: 100%">
                <el-option v-for="dict in invoice_settle" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="金额" prop="amount">
              <el-input-number v-model="form.amount" :precision="2" :step="100" :min="0" style="width: 100%" placeholder="请输入金额" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="税额" prop="taxAmount">
              <el-input-number v-model="form.taxAmount" :precision="2" :step="100" :min="0" style="width: 100%" placeholder="请输入税额" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="价税合计">
              <el-input :model-value="totalAmount.toFixed(2)" disabled style="width: 100%">
                <template #prefix>¥</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="税率">
              <el-input :model-value="calculatedTaxRate + '%'" disabled style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="taxRateHint">
          <el-col :span="24">
            <el-alert :title="taxRateHint" type="info" :closable="false" show-icon style="margin-bottom: 16px" />
          </el-col>
        </el-row>
        <el-form-item label="关联业务" prop="relateType">
          <el-input v-model="form.relateType" placeholder="业务类型(应收/付款单/凭证等)" maxlength="32" />
        </el-form-item>
        <el-form-item label="关联单号" prop="relateBizNo">
          <el-input v-model="form.relateBizNo" placeholder="业务单号(选填)" maxlength="64" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注信息" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="Invoice">
import type { FinInvoice, InvoiceQuejlParams } from "@/types/api/system/invoice"
import { listInvoice, getInvoice, delInvoice, addInvoice, updateInvoice, verifyInvoice } from '@/api/finance/invoice'
import { finDict, finDictItem } from '@/utils/financeDict'
import { computed, watch } from 'vue'

const { invoice_direction, invoice_type, invoice_settle } = useDict('invoice_direction', 'invoice_type', 'invoice_settle')

const { proxy } = getCurrentInstance()

const invoiceList = ref<FinInvoice[]>([])
const open = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const ids = ref<number[]>([])
const single = ref<boolean>(true)
const multiple = ref<boolean>(true)
const total = ref<number>(0)
const title = ref<string>("")

function formatMoney(n: number | string | null | undefined) {
  if (n === null || n === undefined || n === '') return '-'
  const v = Number(n)
  if (Number.isNaN(v)) return '-'
  return v.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const data = reactive({
  form: {} as FinInvoice,
  quejlParams: {
    pageNum: 1,
    pageSize: 10,
    invoiceNo: undefined,
    invoiceType: undefined,
    partnerName: undefined,
    direction: undefined,
    status: undefined,
    invoiceDate: undefined,
  } as InvoiceQuejlParams,
  rules: {
    invoiceNo: [
      { required: true, message: "请输入发票号码", trigger: "blur" }
    ],
    invoiceType: [
      { required: true, message: "请选择发票类型", trigger: "change" }
    ],
    direction: [
      { required: true, message: "请选择方向", trigger: "change" }
    ],
    partnerName: [
      { required: true, message: "请输入开票/收票单位", trigger: "blur" }
    ],
    amount: [
      { required: true, message: "请输入金额", trigger: "blur" }
    ],
    taxAmount: [
      { required: true, message: "请输入税额", trigger: "blur" }
    ],
    status: [
      { required: true, message: "请选择核销状态", trigger: "change" }
    ],
  }
})

const { quejlParams, form, rules } = toRefs(data)

// 计算价税合计
const totalAmount = computed(() => {
  const amount = Number(form.value.amount || 0)
  const taxAmount = Number(form.value.taxAmount || 0)
  return amount + taxAmount
})

// 根据税额反算税率
const calculatedTaxRate = computed(() => {
  const amount = Number(form.value.amount || 0)
  const taxAmount = Number(form.value.taxAmount || 0)
  if (amount <= 0) return 0
  const rate = (taxAmount / amount) * 100
  return Number(rate.toFixed(2))
})

// 发票类型对应的默认税率提示
const taxRateHint = computed(() => {
  if (form.value.invoiceType === '0') {
    return '增值税专票常见税率: 13%, 9%, 6%'
  } else if (form.value.invoiceType === '1') {
    return '普通发票税率: 0% (免税) 或 3%, 1% 等'
  }
  return ''
})

// 监听金额或税额变化，自动更新价税合计
watch([() => form.value.amount, () => form.value.taxAmount], () => {
  // 触发响应式更新
})

/** 查询发票列表 */
function getList() {
  loading.value = true
  listInvoice(quejlParams.value).then(response => {
    invoiceList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}

/** 表单重置 */
function reset() {
  form.value = {
    id: null,
    invoiceNo: null,
    invoiceType: null,
    partnerId: null,
    partnerName: null,
    direction: null,
    amount: null,
    taxAmount: null,
    invoiceDate: null,
    relateType: null,
    relateId: null,
    relateBizNo: null,
    status: '0',
    remark: null,
  } as FinInvoice
  proxy.resetForm("invoiceRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  quejlParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

/** 多选框选中数据 */
function handleSelectionChange(selection: FinInvoice[]) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加发票"
}

/** 修改按钮操作 */
function handleUpdate(row?: FinInvoice) {
  reset()
  const _id = row?.id || ids.value[0]
  if (!_id) {
    proxy.$modal.msgWarning('请先选择一条数据')
    return
  }
  getInvoice(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改发票"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["invoiceRef"].validate((valid: boolean) => {
    if (valid) {
      if (form.value.id != null) {
        updateInvoice(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addInvoice(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row?: FinInvoice) {
  const _ids = row?.id ? [row.id] : ids.value
  if (_ids.length === 0) {
    proxy.$modal.msgWarning('请先选择要删除的数据')
    return
  }
  proxy.$modal.confirm('是否确认删除发票编号为"' + _ids + '"的数据项？').then(function() {
    return delInvoice(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  })
}

/** 核验按钮 */
function handleVerify(row: FinInvoice) {
  proxy.$modal.confirm('是否核验发票 "' + row.invoiceNo + '" ?').then(function() {
    return verifyInvoice(row.id)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("核验成功")
  })
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('finance/invoice/export', {
    ...quejlParams.value
  }, `invoice_${new Date().getTime()}.xlsx`)
}

getList()
</script>

<style scoped>
.app-container {
  padding: 16px;
}
.money {
  font-variant-numeric: tabular-nums;
  font-weight: 500;
}
.money.tax {
  color: #909399;
}
.money.total {
  color: #303133;
  font-weight: 600;
}
.text-muted {
  color: #c0c4cc;
}
.invoice-form-dialog :deep(.el-dialog__body) {
  padding: 20px 24px;
}
.invoice-form-dialog :deep(.el-form-item__label) {
  font-weight: 500;
}
</style>