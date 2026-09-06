<template>
  <div class="app-container">
    <el-form :model="quejlParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="往来单ID" prop="docId">
        <el-input
          v-model="quejlParams.docId"
          placeholder="请输入应收/应付单ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="收款单ID" prop="receiptId">
        <el-input
          v-model="quejlParams.receiptId"
          placeholder="请输入收款单ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="付款单ID" prop="paymentId">
        <el-input
          v-model="quejlParams.paymentId"
          placeholder="请输入付款单ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="核销金额" prop="amount">
        <el-input
          v-model="quejlParams.amount"
          placeholder="请输入核销金额"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="核销时间" prop="allocateTime">
        <el-date-picker clearable
          v-model="quejlParams.allocateTime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择核销时间">
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
          v-hasPermi="['system:allocation:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:allocation:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:allocation:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['system:allocation:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="allocationList" @selection-change="handleSelectionChange" stripe border>
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column label="单据类型" align="center" prop="docType" width="100">
        <template #default="{ row }">
          <el-tag :type="finDictItem(row.docType, 'allocation_type').type" disable-transitions>
            {{ finDict(row.docType, 'allocation_type') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="关联单号" align="center" prop="docNo" min-width="200" show-overflow-tooltip>
        <template #default="{ row }">
          <span>{{ row.docNo || '' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="收款单号" align="center" prop="receiptNo" min-width="200" show-overflow-tooltip>
        <template #default="{ row }">
          <span>{{ row.receiptNo || '' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="付款单号" align="center" prop="paymentNo" min-width="200" show-overflow-tooltip>
        <template #default="{ row }">
          <span>{{ row.paymentNo || '' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="核销金额" align="right" prop="amount" min-width="140">
        <template #default="{ row }">
          <b class="money">{{ Number(row.amount || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</b>
        </template>
      </el-table-column>
      <el-table-column label="核销时间" align="center" prop="allocateTime" width="120">
        <template #default="{ row }">
          <span>{{ row.allocateTime ? row.allocateTime.substring(0,10) : '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" min-width="160" show-overflow-tooltip />
      <el-table-column label="操作" align="center" width="160" fixed="right">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['finance:allocation:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['finance:allocation:remove']">删除</el-button>
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

    <!-- 添加或修改核销记录对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="allocationRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="单据类型" prop="docType">
              <el-select v-model="form.docType" placeholder="请选择单据类型" style="width:100%">
                <el-option v-for="dict in allocation_type" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="docTypeHint">
            <el-alert :title="docTypeHint" type="info" :closable="false" show-icon style="margin-bottom: 16px" />
          </el-col>
          <el-col :span="24" v-if="form.docType === '0'">
            <el-form-item label="应收单ID" prop="docId">
              <el-input v-model="form.docId" placeholder="请输入应收单ID" />
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="form.docType === '1'">
            <el-form-item label="应付单ID" prop="docId">
              <el-input v-model="form.docId" placeholder="请输入应付单ID" />
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="form.docType === '0'">
            <el-form-item label="收款单ID" prop="receiptId">
              <el-input v-model="form.receiptId" placeholder="请输入收款单ID" />
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="form.docType === '1'">
            <el-form-item label="付款单ID" prop="paymentId">
              <el-input v-model="form.paymentId" placeholder="请输入付款单ID" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="核销金额" prop="amount">
              <el-input-number v-model="form.amount" :min="0.01" :precision="2" controls-position="right" style="width:100%" placeholder="请输入核销金额" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="核销时间" prop="allocateTime">
              <el-date-picker clearable
                v-model="form.allocateTime"
                type="date"
                value-format="YYYY-MM-DD"
                style="width:100%"
                placeholder="请选择核销时间">
              </el-date-picker>
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

<script setup lang="ts" name="Allocation">
import type { FinAllocation, AllocationQuejlParams } from "@/types/api/system/allocation"
import { listAllocation, getAllocation, delAllocation, addAllocation, updateAllocation } from '@/api/finance/allocation'
import { listReceivable, listPayable } from '@/api/finance/settlement'
import { finDict, finDictItem } from '@/utils/financeDict'
import { computed, watch } from 'vue'

const { allocation_type } = useDict('allocation_type')

const { proxy } = getCurrentInstance()

const allocationList = ref<FinAllocation[]>([])
const open = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const ids = ref<number[]>([])
const single = ref<boolean>(true)
const multiple = ref<boolean>(true)
const total = ref<number>(0)
const title = ref<string>("")

const data = reactive({
  form: {} as FinAllocation,
  quejlParams: {
    pageNum: 1,
    pageSize: 10,
    docType: undefined,
    docId: undefined,
    receiptId: undefined,
    paymentId: undefined,
    amount: undefined,
    allocateTime: undefined,
  } as AllocationQuejlParams,
  rules: {
    docType: [
      { required: true, message: "0应收 1应付不能为空", trigger: "change" }
    ],
    docId: [
      { required: true, message: "应收/应付单ID不能为空", trigger: "blur" }
    ],
    amount: [
      { required: true, message: "核销金额不能为空", trigger: "blur" }
    ],
  }
})

const { quejlParams, form, rules } = toRefs(data)

// 单据类型变化时的提示
const docTypeHint = computed(() => {
  if (form.value.docType === '0') {
    return '应收核销：选择应收单和收款单进行核销'
  } else if (form.value.docType === '1') {
    return '应付核销：选择应付单和付款单进行核销'
  }
  return ''
})

// 监听单据类型变化，清空关联单号
watch(() => form.value.docType, (newVal) => {
  if (newVal === '0') {
    // 应收核销：清空付款单ID
    form.value.paymentId = null
  } else if (newVal === '1') {
    // 应付核销：清空收款单ID
    form.value.receiptId = null
  }
})

// 核销金额不能超过关联单剩余金额的校验（简化版）
const amountRules = computed(() => {
  return [
    { required: true, message: '核销金额不能为空', trigger: 'blur' },
    { 
      validator: (rule: any, value: string, callback: any) => {
        const amount = Number(value || 0)
        if (amount <= 0) {
          callback(new Error('核销金额必须大于0'))
        } else if (amount > 999999999) {
          callback(new Error('核销金额不能超过999,999,999'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

/** 查询核销记录列表 */
function getList() {
  loading.value = true
  listAllocation(quejlParams.value).then(response => {
    allocationList.value = response.rows
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
    docType: null,
    docId: null,
    receiptId: null,
    paymentId: null,
    amount: null,
    allocateTime: null,
    createBy: null,
    createTime: null
  }
  proxy.resetForm("allocationRef")
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
function handleSelectionChange(selection: FinAllocation[]) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加核销记录"
}

/** 修改按钮操作 */
function handleUpdate(row: FinAllocation) {
  reset()
  const _id = (row && row.id) || ids.value[0]
  getAllocation(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改核销记录"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["allocationRef"].validate((valid: boolean) => {
    if (valid) {
      if (form.value.id != null) {
        updateAllocation(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addAllocation(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row: FinAllocation) {
  const _ids = (row && row.id) || ids.value
  proxy.$modal.confirm('是否确认删除核销记录编号为"' + _ids + '"的数据项？').then(function() {
    return delAllocation(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/allocation/export', {
    ...quejlParams.value
  }, `allocation_${new Date().getTime()}.xlsx`)
}

getList()
</script>

<style scoped>
.app-container { padding: 16px; }
.money { font-variant-numeric: tabular-nums; }
</style>
