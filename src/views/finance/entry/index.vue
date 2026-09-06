<template>
  <div class="app-container">
    <el-form :model="quejlParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="凭证号" prop="voucherNo"><el-input v-model="quejlParams.voucherNo" placeholder="如 PZ-202608-001" clearable @keyup.enter="handleQuery" /></el-form-item>
      <el-form-item label="科目编码" prop="subjectCode"><el-input v-model="quejlParams.subjectCode" placeholder="如 1001" clearable @keyup.enter="handleQuery" /></el-form-item>
      <el-form-item label="摘要" prop="summary"><el-input v-model="quejlParams.summary" placeholder="请输入摘要" clearable @keyup.enter="handleQuery" /></el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5"><el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['finance:entry:add']">新增</el-button></el-col>
      <el-col :span="1.5"><el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate" v-hasPermi="['finance:entry:edit']">修改</el-button></el-col>
      <el-col :span="1.5"><el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['finance:entry:remove']">删除</el-button></el-col>
      <el-col :span="1.5"><el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['finance:entry:export']">导出</el-button></el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="entryList" @selection-change="handleSelectionChange" stripe border>
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column label="凭证号" align="center" prop="voucherNo" min-width="180" show-overflow-tooltip>
        <template #default="{row}"><span>{{ row.voucherNo || '' }}</span></template>
      </el-table-column>
      <el-table-column label="科目编码" align="center" prop="subjectCode" width="120">
        <template #default="{row}"><span class="subject-code">{{ row.subjectCode || '' }}</span></template>
      </el-table-column>
      <el-table-column label="科目名称" align="center" prop="subjectName" min-width="160" show-overflow-tooltip>
        <template #default="{row}"><span>{{ row.subjectName || '-' }}</span></template>
      </el-table-column>
      <el-table-column label="摘要" align="center" prop="summary" min-width="200" show-overflow-tooltip />
      <el-table-column label="借方金额" align="right" prop="debitAmount" min-width="130">
        <template #default="{row}"><span class="money debit">{{ fmt(row.debitAmount) }}</span></template>
      </el-table-column>
      <el-table-column label="贷方金额" align="right" prop="creditAmount" min-width="130">
        <template #default="{row}"><span class="money credit">{{ fmt(row.creditAmount) }}</span></template>
      </el-table-column>
      <el-table-column label="往来单位" align="center" prop="partnerName" min-width="160" show-overflow-tooltip>
        <template #default="{row}"><span>{{ row.partnerName || '' }}</span></template>
      </el-table-column>
      <el-table-column label="银行账户" align="center" prop="bankAccountName" min-width="160" show-overflow-tooltip>
        <template #default="{row}"><span>{{ row.bankAccountName || '' }}</span></template>
      </el-table-column>
      <el-table-column label="排序" align="center" prop="sortOrder" width="80" />
      <el-table-column label="操作" align="center" width="180" fixed="right">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['finance:entry:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['finance:entry:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" v-model:page="quejlParams.pageNum" v-model:limit="quejlParams.pageSize" @pagination="getList" />

    <el-dialog :title="title" v-model="open" width="640px" append-to-body destroy-on-close>
      <el-form ref="entryRef" :model="form" :rules="rules" label-width="100px" label-position="right">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="凭证号" prop="voucherNo">
              <el-input v-model="form.voucherNo" placeholder="如 PZ-202608-001" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="凭证编号" prop="voucherId">
              <el-input-number v-model="form.voucherId" :min="0" controls-position="right" style="width:100%" placeholder="可选" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="科目编码" prop="subjectCode">
              <el-select v-model="form.subjectCode" filterable placeholder="请选择科目" style="width: 100%">
                <el-option v-for="s in subjectList" :key="s.id" :label="s.subjectCode + ' ' + s.subjectName" :value="s.subjectCode" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="科目编号" prop="subjectId">
              <el-input-number v-model="form.subjectId" :min="0" controls-position="right" style="width:100%" disabled placeholder="自动填充" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="摘要" prop="summary">
          <el-input v-model="form.summary" placeholder="请输入摘要" maxlength="200" show-word-limit />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="借方金额" prop="debitAmount">
              <el-input-number v-model="form.debitAmount" :precision="2" :min="0" controls-position="right" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="贷方金额" prop="creditAmount">
              <el-input-number v-model="form.creditAmount" :precision="2" :min="0" controls-position="right" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-alert v-if="amountWarning" :title="amountWarning" type="warning" :closable="false" show-icon style="margin-bottom: 16px" />
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="往来单位" prop="partnerName">
              <el-input v-model="form.partnerName" placeholder="输入往来单位名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="伙伴编号" prop="partnerId">
              <el-input-number v-model="form.partnerId" :min="0" controls-position="right" style="width:100%" placeholder="可选" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="银行账户" prop="bankAccountName">
              <el-input v-model="form.bankAccountName" placeholder="输入银行账户名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="账户编号" prop="bankAccountId">
              <el-input-number v-model="form.bankAccountId" :min="0" controls-position="right" style="width:100%" placeholder="可选" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" controls-position="right" style="width:100%" />
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

<script setup lang="ts" name="Entry">
import type { FinVoucherEntry, EntryQuejlParams } from "@/types/api/system/entry"
import { listEntry, getEntry, delEntry, addEntry, updateEntry } from '@/api/finance/entry'
import { listSubject } from '@/api/finance/subject'
import { watch } from 'vue'

const { proxy } = getCurrentInstance()

const entryList = ref<FinVoucherEntry[]>([])
const open = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const ids = ref<number[]>([])
const single = ref<boolean>(true)
const multiple = ref<boolean>(true)
const total = ref<number>(0)
const title = ref<string>("")

function fmt(v?: string | number) { return v ? Number(v).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00' }

const data = reactive({
  form: {} as FinVoucherEntry,
  quejlParams: {
    pageNum: 1, pageSize: 10,
    voucherNo: undefined, subjectCode: undefined, summary: undefined
  } as EntryQuejlParams,
  rules: {
    voucherNo: [{ required: true, message: "请输入凭证号", trigger: "blur" }],
    subjectCode: [{ required: true, message: "请输入科目编码", trigger: "blur" }],
    debitAmount: [{ required: true, message: "借方金额不能为空", trigger: "blur" }],
    creditAmount: [{ required: true, message: "贷方金额不能为空", trigger: "blur" }],
  }
})

const { quejlParams, form, rules } = toRefs(data)

// 科目列表
const subjectList = ref<any[]>([])

// 加载科目列表
async function loadSubjects() {
  try {
    const r: any = await listSubject({})
    subjectList.value = r.data || []
  } catch (e) {
    subjectList.value = []
  }
}

// 监听科目编码变化，自动填充科目名称和科目ID
watch(() => form.value.subjectCode, (newCode) => {
  if (newCode) {
    const subject = subjectList.value.find(s => s.subjectCode === newCode)
    if (subject) {
      form.value.subjectName = subject.subjectName
      form.value.subjectId = subject.id
    } else {
      form.value.subjectName = ''
      form.value.subjectId = null
    }
  } else {
    form.value.subjectName = ''
    form.value.subjectId = null
  }
})

// 借方/贷方互斥校验
const amountWarning = computed(() => {
  const debit = form.value.debitAmount || 0
  const credit = form.value.creditAmount || 0
  if (debit > 0 && credit > 0) {
    return '借方和贷方不能同时有金额'
  }
  return ''
})

function getList() {
  loading.value = true
  listEntry(quejlParams.value).then(response => {
    entryList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}
function cancel() { open.value = false; reset() }
function reset() {
  form.value = {
    id: null, voucherId: null, voucherNo: '',
    subjectId: null, subjectCode: '', subjectName: '',
    summary: '', debitAmount: 0, creditAmount: 0,
    partnerId: null, partnerName: '',
    bankAccountId: null, bankAccountName: '',
    sortOrder: 0
  } as FinVoucherEntry
  proxy.resetForm("entryRef")
}
function handleQuery() { quejlParams.value.pageNum = 1; getList() }
function resetQuery() { proxy.resetForm("queryRef"); handleQuery() }
function handleSelectionChange(selection: FinVoucherEntry[]) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}
async function handleAdd() {
  reset()
  await loadSubjects()
  open.value = true
  title.value = "添加凭证分录"
}
function handleUpdate(row?: FinVoucherEntry) {
  reset()
  const _id = row?.id || ids.value[0]
  if (!_id) { proxy.$modal.msgWarning('请先选择一条数据'); return }
  getEntry(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改凭证分录"
  })
}
function submitForm() {
  proxy.$refs["entryRef"].validate((valid: boolean) => {
    if (valid) {
      // 校验借方/贷方互斥
      const debit = form.value.debitAmount || 0
      const credit = form.value.creditAmount || 0
      if (debit > 0 && credit > 0) {
        proxy.$modal.msgError('借方和贷方不能同时有金额')
        return
      }
      const action = form.value.id != null ? updateEntry(form.value) : addEntry(form.value)
      action.then(() => {
        proxy.$modal.msgSuccess(form.value.id != null ? "修改成功" : "新增成功")
        open.value = false
        getList()
      })
    }
  })
}
function handleDelete(row?: FinVoucherEntry) {
  const _ids = row?.id ? [row.id] : ids.value
  if (_ids.length === 0) { proxy.$modal.msgWarning('请先选择要删除的数据'); return }
  proxy.$modal.confirm('是否确认删除凭证分录编号为"' + _ids + '"的数据项？').then(() => delEntry(_ids)).then(() => {
    getList(); proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}
function handleExport() {
  proxy.download('finance/entry/export', { ...quejlParams.value }, `entry_${new Date().getTime()}.xlsx`)
}

getList()
</script>

<style scoped>
.app-container { padding: 16px; }
.money { font-variant-numeric: tabular-nums; font-weight: 500; }
.money.debit { color: #67c23a; }
.money.credit { color: #f56c6c; }
.subject-code { font-family: 'SF Mono', Consolas, monospace; font-weight: 500; }
</style>