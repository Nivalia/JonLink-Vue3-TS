<template>
  <div class="app-container">
    <el-form :model="quejlParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="台账类型" prop="ledgerType">
        <el-select v-model="quejlParams.ledgerType" placeholder="请选择台账类型" clearable>
          <el-option
            v-for="dict in wx_ledger_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
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
          v-hasPermi="['ledger:wxLedgerSummary:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['ledger:wxLedgerSummary:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['ledger:wxLedgerSummary:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['ledger:wxLedgerSummary:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="wxLedgerSummaryList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键" align="center" prop="id" show-overflow-tooltip min-width="100" />
      <el-table-column label="统计日期" align="center" prop="statDate" show-overflow-tooltip min-width="110">
        <template #default="scope">
          <span>{{ parseTime(scope.row.statDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="台账类型" align="center" prop="ledgerType" show-overflow-tooltip min-width="110">
        <template #default="scope">
          <dict-tag :options="wx_ledger_type" :value="scope.row.ledgerType"/>
        </template>
      </el-table-column>
      <el-table-column label="当日笔数" align="center" prop="totalCount" show-overflow-tooltip min-width="100" />
      <el-table-column label="当日金额合计" align="center" prop="totalAmount" show-overflow-tooltip min-width="100" />
      <el-table-column label="当日积分合计" align="center" prop="totalPoints" show-overflow-tooltip min-width="100" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="170">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['ledger:wxLedgerSummary:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['ledger:wxLedgerSummary:remove']">删除</el-button>
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

    <!-- 添加或修改台账日汇总对话框 -->
    <el-dialog :title="title" v-model="open" width="760px" append-to-body>
      <el-form ref="wxLedgerSummaryRef" :model="form" :rules="rules" label-width="110px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="统计日期" prop="statDate">
              <el-date-picker clearable
                v-model="form.statDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择统计日期">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="台账类型" prop="ledgerType">
              <el-select v-model="form.ledgerType" placeholder="请选择台账类型">
                <el-option
                  v-for="dict in wx_ledger_type"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="当日笔数" prop="totalCount">
              <el-input v-model="form.totalCount" placeholder="请输入当日笔数" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="当日金额合计" prop="totalAmount">
              <el-input v-model="form.totalAmount" placeholder="请输入当日金额合计" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="当日积分合计" prop="totalPoints">
              <el-input v-model="form.totalPoints" placeholder="请输入当日积分合计" />
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

<script setup lang="ts" name="WxLedgerSummary">
import type { WxLedgerSummary, WxLedgerSummaryQuejlParams } from "@/types/api/ledger/wxLedgerSummary"
import { listWxLedgerSummary, getWxLedgerSummary, delWxLedgerSummary, addWxLedgerSummary, updateWxLedgerSummary } from "@/api/ledger/wxLedgerSummary"

const { proxy } = getCurrentInstance()
const { wx_ledger_type } = useDict('wx_ledger_type')

const wxLedgerSummaryList = ref<WxLedgerSummary[]>([])
const open = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const ids = ref<number[]>([])
const single = ref<boolean>(true)
const multiple = ref<boolean>(true)
const total = ref<number>(0)
const title = ref<string>("")

const data = reactive({
  form: {} as WxLedgerSummary,
  quejlParams: {
    pageNum: 1,
    pageSize: 10,
    ledgerType: undefined,
  } as WxLedgerSummaryQuejlParams,
  rules: {
    statDate: [
      { required: true, message: "统计日期不能为空", trigger: "blur" }
    ],
    ledgerType: [
      { required: true, message: "台账类型不能为空", trigger: "change" }
    ],
    totalCount: [
      { required: true, message: "当日笔数不能为空", trigger: "blur" }
    ],
    totalAmount: [
      { required: true, message: "当日金额合计不能为空", trigger: "blur" }
    ],
    totalPoints: [
      { required: true, message: "当日积分合计不能为空", trigger: "blur" }
    ]
  }
})

const { quejlParams, form, rules } = toRefs(data)

/** 查询台账日汇总列表 */
function getList() {
  loading.value = true
  listWxLedgerSummary(quejlParams.value).then(response => {
    wxLedgerSummaryList.value = response.rows
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
    statDate: null,
    ledgerType: null,
    totalCount: null,
    totalAmount: null,
    totalPoints: null
  }
  proxy.resetForm("wxLedgerSummaryRef")
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
function handleSelectionChange(selection: WxLedgerSummary[]) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加台账日汇总"
}

/** 修改按钮操作 */
function handleUpdate(row: WxLedgerSummary) {
  reset()
  const _id = row.id || ids.value[0]
  getWxLedgerSummary(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改台账日汇总"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["wxLedgerSummaryRef"].validate((valid: boolean) => {
    if (valid) {
      if (form.value.id != null) {
        updateWxLedgerSummary(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addWxLedgerSummary(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row: WxLedgerSummary) {
  const _ids = row.id || ids.value
  proxy.$modal.confirm('是否确认删除台账日汇总编号为"' + _ids + '"的数据项？').then(function() {
    return delWxLedgerSummary(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('ledger/wxLedgerSummary/export', {
    ...quejlParams.value
  }, `wxLedgerSummary_${new Date().getTime()}.xlsx`)
}

getList()
</script>
