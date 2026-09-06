<template>
  <div class="app-container">
    <el-form :model="quejlParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="方向" prop="direction">
        <el-select v-model="quejlParams.direction" placeholder="请选择方向" clearable>
          <el-option v-for="dict in fin_direction" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="关联台账" prop="ledgerId">
        <el-input
          v-model="quejlParams.ledgerId"
          placeholder="请输入关联台账行(单笔结算)"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="结算时间" prop="settleDate">
        <el-date-picker clearable
          v-model="quejlParams.settleDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择结算时间">
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
          v-hasPermi="['ledger:settleRecord:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate()"
          v-hasPermi="['ledger:settleRecord:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete()"
          v-hasPermi="['ledger:settleRecord:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['ledger:settleRecord:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="settleRecordList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键" align="center" prop="id" show-overflow-tooltip min-width="100" />
      <el-table-column label="结算单号" align="center" prop="settleNo" show-overflow-tooltip min-width="100" />
      <el-table-column label="方向" align="center" prop="direction" show-overflow-tooltip min-width="110">
        <template #default="scope">
          <dict-tag :options="led_settle_direction" :value="scope.row.direction"/>
        </template>
      </el-table-column>
      <el-table-column label="关联台账" align="center" prop="ledgerId" show-overflow-tooltip min-width="100" />
      <el-table-column label="保单号" align="center" prop="policyNo" show-overflow-tooltip min-width="100" />
      <el-table-column label="结算金额" align="center" prop="amount" show-overflow-tooltip min-width="100" />
      <el-table-column label="状态" align="center" prop="settleStatus" show-overflow-tooltip min-width="100" />
      <el-table-column label="经手人" align="center" prop="opUser" show-overflow-tooltip min-width="100" />
      <el-table-column label="结算时间" align="center" prop="settleDate" show-overflow-tooltip min-width="110">
        <template #default="scope">
          <span>{{ parseTime(scope.row.settleDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" show-overflow-tooltip min-width="100" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="170">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['ledger:settleRecord:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['ledger:settleRecord:remove']">删除</el-button>
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

    <!-- 添加或修改结算记录对话框 -->
    <el-dialog :title="title" v-model="open" width="900px" append-to-body>
      <el-form ref="settleRecordRef" :model="form" :rules="rules" label-width="110px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="结算单号" prop="settleNo">
              <el-input v-model="form.settleNo" placeholder="请输入结算单号(唯一)" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="方向" prop="direction">
              <el-select v-model="form.direction" placeholder="请选择方向" style="width:100%">
                <el-option v-for="dict in fin_direction" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="关联台账" prop="ledgerId">
              <el-input v-model="form.ledgerId" placeholder="请输入关联台账行(单笔结算)" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="保单号" prop="policyNo">
              <el-input v-model="form.policyNo" placeholder="请输入保单号(冗余)" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结算金额" prop="amount">
              <el-input v-model="form.amount" placeholder="请输入结算金额" />
              <div v-if="amountHint" style="font-size:12px;color:#e6a23c;margin-top:4px">{{ amountHint }}</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="经手人" prop="opUser">
              <el-input v-model="form.opUser" placeholder="请输入经手人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结算时间" prop="settleDate">
              <el-date-picker clearable
                v-model="form.settleDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择结算时间">
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

<script setup lang="ts" name="SettleRecord">
import { ref, reactive, onMounted, computed } from 'vue'
import type { JonlinkSettleRecord, SettleRecordQuejlParams } from "@/types/api/ledger/settleRecord"
import { listSettleRecord, getSettleRecord, delSettleRecord, addSettleRecord, updateSettleRecord } from "@/api/ledger/settleRecord"
import { parseTime } from "@/utils/jonlink"
import { finDict } from '@/utils/financeDict'

const { fin_direction } = useDict('fin_direction')

const { proxy } = getCurrentInstance()

const settleRecordList = ref<JonlinkSettleRecord[]>([])
const open = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const ids = ref<number[]>([])
const single = ref<boolean>(true)
const multiple = ref<boolean>(true)
const total = ref<number>(0)
const title = ref<string>("")

const data = reactive({
  form: {} as JonlinkSettleRecord,
  quejlParams: {
    pageNum: 1,
    pageSize: 10,
    direction: undefined,
    ledgerId: undefined,
    settleDate: undefined,
  } as SettleRecordQuejlParams,
  rules: {
    settleNo: [
      { required: true, message: "结算单号(唯一)不能为空", trigger: "blur" }
    ],
    direction: [
      { required: true, message: "方向不能为空", trigger: "change" }
    ],
    ledgerId: [
      { required: true, message: "关联台账行(单笔结算)不能为空", trigger: "blur" }
    ],
    amount: [
      { required: true, message: "结算金额(如上游=上游税后佣金, 下游=下游佣金)不能为空", trigger: "blur" }
    ],
    settleStatus: [
      { required: true, message: "状态 0作废 1已结算不能为空", trigger: "change" }
    ],
    settleDate: [
      { required: true, message: "结算时间不能为空", trigger: "blur" }
    ],
  }
})

const { quejlParams, form, rules } = toRefs(data)

// 方向→金额提示
const amountHint = computed(() => {
  const hints: Record<string, string> = {
    '0': '上游结算=上游税后佣金（收入）',
    '1': '下游结算=下游佣金（支出）'
  }
  return hints[form.value.direction] || ''
})

/** 查询结算记录列表 */
function getList() {
  loading.value = true
  listSettleRecord(quejlParams.value).then(response => {
    settleRecordList.value = response.rows
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
    settleNo: null,
    direction: null,
    ledgerId: null,
    policyNo: null,
    amount: null,
    settleStatus: null,
    opUser: null,
    settleDate: null,
    remark: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  }
  proxy.resetForm("settleRecordRef")
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
function handleSelectionChange(selection: JonlinkSettleRecord[]) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加结算记录"
}

/** 修改按钮操作 */
function handleUpdate(row: JonlinkSettleRecord) {
  reset()
  const _id = (row && row.id) || ids.value[0]
  getSettleRecord(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改结算记录"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["settleRecordRef"].validate((valid: boolean) => {
    if (valid) {
      if (form.value.id != null) {
        updateSettleRecord(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addSettleRecord(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row: JonlinkSettleRecord) {
  const _ids = (row && row.id) || ids.value
  proxy.$modal.confirm('是否确认删除结算记录编号为"' + _ids + '"的数据项？').then(function() {
    return delSettleRecord(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功") }).catch((e: any) => { if (e && e.message && e.message !== "cancel") { proxy.$modal.msgError(e.message || "操作失败"); } })
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('ledger/settleRecord/export', {
    ...quejlParams.value
  }, `settleRecord_${new Date().getTime()}.xlsx`)
}

getList()
</script>
