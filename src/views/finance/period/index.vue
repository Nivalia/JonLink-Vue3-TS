<template>
  <div class="app-container">
    <el-form :model="quejlParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="期间编码" prop="periodCode">
        <el-input
          v-model="quejlParams.periodCode"
          placeholder="请输入期间编码"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="期间名称" prop="periodName">
        <el-input
          v-model="quejlParams.periodName"
          placeholder="请输入期间名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="开始日期" prop="startDate">
        <el-date-picker clearable
          v-model="quejlParams.startDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择开始日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="结束日期" prop="endDate">
        <el-date-picker clearable
          v-model="quejlParams.endDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择结束日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="结账人" prop="closeUser">
        <el-input
          v-model="quejlParams.closeUser"
          placeholder="请输入结账人"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="结账时间" prop="closeTime">
        <el-date-picker clearable
          v-model="quejlParams.closeTime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择结账时间">
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
          v-hasPermi="['system:period:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:period:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:period:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['system:period:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="periodList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column label="期间编码" align="center" prop="periodCode" />
      <el-table-column label="期间名称" align="center" prop="periodName" />
      <el-table-column label="开始日期" align="center" prop="startDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.startDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束日期" align="center" prop="endDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.endDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结账状态" align="center" prop="status">
        <template #default="{ row }">
          <el-tag :type="finDictItem(row.status, 'period_status').type" disable-transitions>
            {{ finDict(row.status, 'period_status') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="结账人" align="center" prop="closeUser" />
      <el-table-column label="结账时间" align="center" prop="closeTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.closeTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:period:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:period:remove']">删除</el-button>
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

    <!-- 添加或修改会计期间对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="periodRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="期间编码" prop="periodCode">
              <el-input v-model="form.periodCode" placeholder="请输入期间编码" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="期间名称" prop="periodName">
              <el-input v-model="form.periodName" placeholder="请输入期间名称" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="开始日期" prop="startDate">
              <el-date-picker clearable
                v-model="form.startDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择开始日期">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="结束日期" prop="endDate">
              <el-date-picker clearable
                v-model="form.endDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择结束日期">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="结账人" prop="closeUser">
              <el-input v-model="form.closeUser" placeholder="请输入结账人" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="结账时间" prop="closeTime">
              <el-date-picker clearable
                v-model="form.closeTime"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择结账时间">
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
          <el-alert v-if="!dateRangeValid.valid" :title="dateRangeValid.msg" type="error" show-icon style="margin-right:12px" />
          <el-button type="primary" :disabled="!dateRangeValid.valid" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="Period">
import type { FinPeriod, PeriodQuejlParams } from "@/types/api/system/period"
import { listPeriod, getPeriod, delPeriod, addPeriod, updatePeriod } from '@/api/finance/period'
import { finDict, finDictItem } from '@/utils/financeDict'
import { computed, watch } from 'vue'

const { proxy } = getCurrentInstance()

const periodList = ref<FinPeriod[]>([])
const open = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const ids = ref<number[]>([])
const single = ref<boolean>(true)
const multiple = ref<boolean>(true)
const total = ref<number>(0)
const title = ref<string>("")

const data = reactive({
  form: {} as FinPeriod,
  quejlParams: {
    pageNum: 1,
    pageSize: 10,
    periodCode: undefined,
    periodName: undefined,
    startDate: undefined,
    endDate: undefined,
    status: undefined,
    closeUser: undefined,
    closeTime: undefined,
  } as PeriodQuejlParams,
  rules: {
    periodCode: [
      { required: true, message: "期间编码不能为空", trigger: "blur" }
    ],
    periodName: [
      { required: true, message: "期间名称不能为空", trigger: "blur" }
    ],
    startDate: [
      { required: true, message: "开始日期不能为空", trigger: "blur" }
    ],
    endDate: [
      { required: true, message: "结束日期不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "0未结账 1已结账不能为空", trigger: "change" }
    ],
  }
})

const { quejlParams, form, rules } = toRefs(data)

// 日期互斥校验
const dateRangeValid = computed(() => {
  if (!form.value.startDate || !form.value.endDate) return { valid: true, msg: '' }
  const start = new Date(form.value.startDate)
  const end = new Date(form.value.endDate)
  return { valid: start < end, msg: '结束日期不能早于开始日期' }
})

// 期间编码自动建议（自动生成下一个期间）
function suggestPeriodCode() {
  if (periodList.value.length === 0) {
    const now = new Date()
    form.value.periodCode = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
    return
  }
  const lastPeriod = periodList.value[0]
  if (lastPeriod && lastPeriod.periodCode) {
    const lastCode = lastPeriod.periodCode
    const year = parseInt(lastCode.substring(0, 4))
    const month = parseInt(lastCode.substring(4, 6))
    if (month === 12) {
      form.value.periodCode = `${year + 1}01`
    } else {
      form.value.periodCode = `${year}${String(month + 1).padStart(2, '0')}`
    }
  }
}

// 监听开始日期变化，自动带出结束日期（同月）
watch(() => form.value.startDate, (val) => {
  if (val && !form.value.endDate) {
    const start = new Date(val)
    const year = start.getFullYear()
    const month = start.getMonth() + 1
    const lastDay = new Date(year, month, 0).getDate()
    form.value.endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  }
})

// 监听期间编码变化，自动生成期间名称
watch(() => form.value.periodCode, (val) => {
  if (val && val.length === 6) {
    const year = val.substring(0, 4)
    const month = parseInt(val.substring(4, 6))
    const monthNames = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月']
    form.value.periodName = `${year}年${monthNames[month - 1] || ''}`
  }
})

/** 查询会计期间列表 */
function getList() {
  loading.value = true
  listPeriod(quejlParams.value).then(response => {
    periodList.value = response.rows
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
    periodCode: null,
    periodName: null,
    startDate: null,
    endDate: null,
    status: null,
    closeUser: null,
    closeTime: null,
    remark: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  }
  proxy.resetForm("periodRef")
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
function handleSelectionChange(selection: FinPeriod[]) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  suggestPeriodCode() // 自动生成期间编码
  open.value = true
  title.value = "添加会计期间"
}

/** 修改按钮操作 */
function handleUpdate(row: FinPeriod) {
  reset()
  const _id = (row && row.id) || ids.value[0]
  getPeriod(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改会计期间"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["periodRef"].validate((valid: boolean) => {
    if (valid) {
      if (form.value.id != null) {
        updatePeriod(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addPeriod(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row: FinPeriod) {
  const _ids = (row && row.id) || ids.value
  proxy.$modal.confirm('是否确认删除会计期间编号为"' + _ids + '"的数据项？').then(function() {
    return delPeriod(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/period/export', {
    ...quejlParams.value
  }, `period_${new Date().getTime()}.xlsx`)
}

getList()
</script>
