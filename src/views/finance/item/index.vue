<template>
  <div class="app-container">
    <el-form :model="quejlParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="报销单号" prop="expenseNo">
        <el-input v-model="quejlParams.expenseNo" placeholder="请输入报销单号" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="费用项目" prop="itemName">
        <el-input v-model="quejlParams.itemName" placeholder="请输入费用项目" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="金额" prop="amount">
        <el-input v-model="quejlParams.amount" placeholder="请输入金额" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['finance:item:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate" v-hasPermi="['finance:item:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['finance:item:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['finance:item:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="itemList" @selection-change="handleSelectionChange" stripe border>
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column label="报销单号" align="center" prop="expenseNo" min-width="200" show-overflow-tooltip>
        <template #default="{row}">
          <span>{{ row.expenseNo || '' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="费用项目" align="center" prop="itemName" min-width="160" show-overflow-tooltip />
      <el-table-column label="金额" align="right" prop="amount" min-width="130">
        <template #default="{row}">
          <b class="money">{{ Number(row.amount || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</b>
        </template>
      </el-table-column>
      <el-table-column label="发票号码" align="center" prop="invoiceNo" min-width="180" show-overflow-tooltip>
        <template #default="{row}">
          <span>{{ row.invoiceNo || '' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" min-width="180" show-overflow-tooltip />
      <el-table-column label="排序" align="center" prop="sortOrder" width="80" />
      <el-table-column label="操作" align="center" width="180" fixed="right">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['finance:item:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['finance:item:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" v-model:page="quejlParams.pageNum" v-model:limit="quejlParams.pageSize" @pagination="getList" />

    <el-dialog :title="title" v-model="open" width="560px" append-to-body destroy-on-close>
      <el-form ref="itemRef" :model="form" :rules="rules" label-width="100px" label-position="right">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="报销单号" prop="expenseNo">
              <el-input v-model="form.expenseNo" placeholder="如 EXP-202608-001" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="报销单编号" prop="expenseId">
              <el-input-number v-model="form.expenseId" :min="0" controls-position="right" style="width:100%" placeholder="可选" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="发票号码" prop="invoiceNo">
              <el-input v-model="form.invoiceNo" placeholder="关联的发票号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发票编号" prop="invoiceId">
              <el-input-number v-model="form.invoiceId" :min="0" controls-position="right" style="width:100%" placeholder="可选" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="费用项目" prop="itemName">
          <el-input v-model="form.itemName" placeholder="请输入费用项目" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="金额" prop="amount">
              <el-input-number v-model="form.amount" :precision="2" :min="0" controls-position="right" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sortOrder">
              <el-input-number v-model="form.sortOrder" :min="0" controls-position="right" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="2" maxlength="200" show-word-limit placeholder="选填" />
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

<script setup lang="ts" name="Item">
import type { FinExpenseItem, ItemQuejlParams } from "@/types/api/system/item"
import { listItem, getItem, delItem, addItem, updateItem } from '@/api/finance/item'

const { proxy } = getCurrentInstance()

const itemList = ref<FinExpenseItem[]>([])
const open = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const ids = ref<number[]>([])
const single = ref<boolean>(true)
const multiple = ref<boolean>(true)
const total = ref<number>(0)
const title = ref<string>("")

const data = reactive({
  form: {} as FinExpenseItem,
  quejlParams: {
    pageNum: 1,
    pageSize: 10,
    expenseNo: undefined,
    itemName: undefined,
    amount: undefined,
  } as ItemQuejlParams,
  rules: {
    expenseNo: [{ required: true, message: "请输入报销单号", trigger: "blur" }],
    itemName: [{ required: true, message: "请输入费用项目", trigger: "blur" }],
    amount: [{ required: true, message: "金额不能为空", trigger: "blur" }],
  }
})

const { quejlParams, form, rules } = toRefs(data)

function getList() {
  loading.value = true
  listItem(quejlParams.value).then(response => {
    itemList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

function cancel() { open.value = false; reset() }

function reset() {
  form.value = {
    id: null, expenseId: null, expenseNo: '',
    itemName: '', amount: 0,
    invoiceId: null, invoiceNo: '',
    remark: '', sortOrder: 0
  } as FinExpenseItem
  proxy.resetForm("itemRef")
}

function handleQuery() { quejlParams.value.pageNum = 1; getList() }
function resetQuery() { proxy.resetForm("queryRef"); handleQuery() }
function handleSelectionChange(selection: FinExpenseItem[]) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}
function handleAdd() { reset(); open.value = true; title.value = "添加报销明细" }
function handleUpdate(row?: FinExpenseItem) {
  reset()
  const _id = row?.id || ids.value[0]
  if (!_id) { proxy.$modal.msgWarning('请先选择一条数据'); return }
  getItem(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改报销明细"
  })
}
function submitForm() {
  proxy.$refs["itemRef"].validate((valid: boolean) => {
    if (valid) {
      const action = form.value.id != null ? updateItem(form.value) : addItem(form.value)
      action.then(() => {
        proxy.$modal.msgSuccess(form.value.id != null ? "修改成功" : "新增成功")
        open.value = false
        getList()
      })
    }
  })
}
function handleDelete(row?: FinExpenseItem) {
  const _ids = row?.id ? [row.id] : ids.value
  if (_ids.length === 0) { proxy.$modal.msgWarning('请先选择要删除的数据'); return }
  proxy.$modal.confirm('是否确认删除报销明细编号为"' + _ids + '"的数据项？').then(() => delItem(_ids)).then(() => {
    getList(); proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}
function handleExport() {
  proxy.download('finance/item/export', { ...quejlParams.value }, `item_${new Date().getTime()}.xlsx`)
}

getList()
</script>

<style scoped>
.app-container { padding: 16px; }
.money { font-variant-numeric: tabular-nums; color: #303133; }
</style>