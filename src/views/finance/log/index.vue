<template>
  <div class="app-container">
    <el-form :model="quejlParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="台账行ID" prop="ledgerId">
        <el-input
          v-model="quejlParams.ledgerId"
          placeholder="请输入台账行ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="保单号" prop="ledgerPolicyNo">
        <el-input
          v-model="quejlParams.ledgerPolicyNo"
          placeholder="请输入保单号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="台账保费" prop="ledgerAmount">
        <el-input
          v-model="quejlParams.ledgerAmount"
          placeholder="请输入台账保费"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="凭证ID" prop="voucherId">
        <el-input
          v-model="quejlParams.voucherId"
          placeholder="请输入生成凭证ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="凭证号" prop="voucherNo">
        <el-input
          v-model="quejlParams.voucherNo"
          placeholder="请输入凭证号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="结算ID" prop="settleRecordId">
        <el-input
          v-model="quejlParams.settleRecordId"
          placeholder="请输入结算记录ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="记账人" prop="bookUser">
        <el-input
          v-model="quejlParams.bookUser"
          placeholder="请输入记账人"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="记账时间" prop="bookTime">
        <el-date-picker clearable
          v-model="quejlParams.bookTime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择记账时间">
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
          v-hasPermi="['system:log:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:log:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:log:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['system:log:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="logList" @selection-change="handleSelectionChange" stripe border>
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column label="保单号" align="center" prop="ledgerPolicyNo" min-width="180" show-overflow-tooltip>
        <template #default="{row}"><span>{{ row.ledgerPolicyNo || '' }}</span></template>
      </el-table-column>
      <el-table-column label="台账保费" align="right" prop="ledgerAmount" min-width="140">
        <template #default="{row}"><b class="money">{{ fmt(row.ledgerAmount) }}</b></template>
      </el-table-column>
      <el-table-column label="凭证号" align="center" prop="voucherNo" min-width="160" show-overflow-tooltip>
        <template #default="{row}"><span>{{ row.voucherNo || '' }}</span></template>
      </el-table-column>
      <el-table-column label="记账类型" align="center" prop="bookType" width="120">
        <template #default="{ row }">
          <el-tag :type="finDictItem(row.bookType, 'ledger_book_type').type" disable-transitions>
            {{ finDict(row.bookType, 'ledger_book_type') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="结算记录号" align="center" prop="settleRecordNo" min-width="160" show-overflow-tooltip>
        <template #default="{row}"><span>{{ row.settleRecordNo || '' }}</span></template>
      </el-table-column>
      <el-table-column label="记账人" align="center" prop="bookUser" width="120" />
      <el-table-column label="记账时间" align="center" prop="bookTime" width="180">
        <template #default="{row}">
          <span>{{ row.bookTime ? row.bookTime.substring(0,16) : '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template #default="{ row }">
          <el-tag :type="finDictItem(row.status, 'ledger_log_status').type" disable-transitions>
            {{ finDict(row.status, 'ledger_log_status') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" min-width="160" show-overflow-tooltip />
      <el-table-column label="操作" align="center" width="180" fixed="right">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['finance:log:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['finance:log:remove']">删除</el-button>
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

    <!-- 添加或修改台账记账日志对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="logRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="台账行ID" prop="ledgerId">
              <el-input v-model="form.ledgerId" placeholder="请输入台账行ID" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="保单号" prop="ledgerPolicyNo">
              <el-input v-model="form.ledgerPolicyNo" placeholder="请输入保单号" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="台账保费" prop="ledgerAmount">
              <el-input v-model="form.ledgerAmount" placeholder="请输入台账保费" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="凭证ID" prop="voucherId">
              <el-input v-model="form.voucherId" placeholder="请输入生成凭证ID" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="凭证号" prop="voucherNo">
              <el-input v-model="form.voucherNo" placeholder="请输入凭证号" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="结算ID" prop="settleRecordId">
              <el-input v-model="form.settleRecordId" placeholder="请输入结算记录ID" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="记账人" prop="bookUser">
              <el-input v-model="form.bookUser" placeholder="请输入记账人" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="记账时间" prop="bookTime">
              <el-date-picker clearable
                v-model="form.bookTime"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择记账时间">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
            </el-form-item>
          </el-col>
        </el-row>
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

<script setup lang="ts" name="Log">
import type { FinLedgerVoucherLog, LogQuejlParams } from "@/types/api/system/log"
import { listLog, getLog, delLog, addLog, updateLog } from '@/api/finance/log'
import { finDict, finDictItem } from '@/utils/financeDict'

const { proxy } = getCurrentInstance()

const logList = ref<FinLedgerVoucherLog[]>([])
const open = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const ids = ref<number[]>([])
const single = ref<boolean>(true)
const multiple = ref<boolean>(true)
const total = ref<number>(0)
const title = ref<string>("")

const data = reactive({
  form: {} as FinLedgerVoucherLog,
  quejlParams: {
    pageNum: 1,
    pageSize: 10,
    ledgerId: undefined,
    ledgerPolicyNo: undefined,
    ledgerAmount: undefined,
    voucherId: undefined,
    voucherNo: undefined,
    bookType: undefined,
    settleRecordId: undefined,
    bookUser: undefined,
    bookTime: undefined,
    status: undefined,
  } as LogQuejlParams,
  rules: {
    bookType: [
      { required: true, message: "0台账记账 1上游结算记账 2下游结算记账不能为空", trigger: "change" }
    ],
    status: [
      { required: true, message: "1有效 0已反记账不能为空", trigger: "change" }
    ],
  }
})

const { quejlParams, form, rules } = toRefs(data)

/** 查询台账记账日志列表 */
function getList() {
  loading.value = true
  listLog(quejlParams.value).then(response => {
    logList.value = response.rows
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
    ledgerId: null,
    ledgerPolicyNo: null,
    ledgerAmount: null,
    voucherId: null,
    voucherNo: null,
    bookType: null,
    settleRecordId: null,
    bookUser: null,
    bookTime: null,
    status: null,
    remark: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  }
  proxy.resetForm("logRef")
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
function handleSelectionChange(selection: FinLedgerVoucherLog[]) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加台账记账日志"
}

/** 修改按钮操作 */
function handleUpdate(row: FinLedgerVoucherLog) {
  reset()
  const _id = (row && row.id) || ids.value[0]
  getLog(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改台账记账日志"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["logRef"].validate((valid: boolean) => {
    if (valid) {
      if (form.value.id != null) {
        updateLog(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addLog(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row: FinLedgerVoucherLog) {
  const _ids = (row && row.id) || ids.value
  proxy.$modal.confirm('是否确认删除台账记账日志编号为"' + _ids + '"的数据项？').then(function() {
    return delLog(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('finance/log/export', {
    ...quejlParams.value
  }, `log_${new Date().getTime()}.xlsx`)
}

function fmt(v?: string | number) { return v ? Number(v).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00' }

getList()
</script>

<style scoped>
.app-container { padding: 16px; }
.money { font-variant-numeric: tabular-nums; font-weight: 500; }
</style>
