<template>
  <div class="app-container">
    <el-form :model="queryParams" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="期间编码">
        <el-select v-model="queryParams.periodCode" placeholder="请选择期间" clearable>
          <el-option v-for="item in periodOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="openAdd" v-hasPermi="['finance:budget:add']">新增预算</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Document" @click="openReport" v-hasPermi="['finance:budget:report']">预算执行报告</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="dataList" stripe border>
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column label="科目编码" prop="subjectCode" width="140" />
      <el-table-column label="科目名称" prop="subjectName" min-width="160" />
      <el-table-column label="期间" prop="periodCode" width="120" align="center" />
      <el-table-column label="预算额" prop="budgetAmount" width="130" align="right">
        <template #default="{ row }">
          <b class="money">¥ {{ fmt(row.budgetAmount) }}</b>
        </template>
      </el-table-column>
      <el-table-column label="实际额" prop="actualAmount" width="130" align="right">
        <template #default="{ row }">
          <span class="money">¥ {{ fmt(row.actualAmount) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="使用率" width="180" align="center">
        <template #default="{ row }">
          <el-progress
            :percentage="getUsagePercent(row)"
            :color="getProgressColor(row)"
            :stroke-width="16"
            :text-inside="true"
          />
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getWarningType(row)" disable-transitions>
            {{ getWarningLabel(row) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150">
        <template #default="{ row }">
          <el-button link type="primary" icon="Edit" @click="openEdit(row)" v-hasPermi="['finance:budget:edit']">编辑</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(row)" v-hasPermi="['finance:budget:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="520px" append-to-body>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="科目编码" prop="subjectCode">
          <el-select v-model="form.subjectCode" filterable placeholder="请选择科目" style="width: 100%" @change="onSubjectChange">
            <el-option v-for="s in subjectList" :key="s.id" :label="s.subjectCode + ' ' + s.subjectName" :value="s.subjectCode" />
          </el-select>
        </el-form-item>
        <el-form-item label="科目名称" prop="subjectName">
          <el-input v-model="form.subjectName" disabled placeholder="自动填充" />
        </el-form-item>
        <el-form-item label="期间" prop="periodCode">
          <el-select v-model="form.periodCode" placeholder="请选择期间" style="width: 100%">
            <el-option v-for="item in periodOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="预算额" prop="budgetAmount">
          <el-input-number v-model="form.budgetAmount" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="预警阈值" prop="warningThreshold">
          <el-input-number v-model="form.warningThreshold" :min="0" :max="100" :step="1" style="width: 100%" />
          <div class="form-tip">预算使用率达到此百分比时触发预警</div>
        </el-form-item>
        <el-form-item label="预警状态" v-if="form.id">
          <el-tag :type="currentWarningStatus.type" size="large">{{ currentWarningStatus.text }}</el-tag>
          <span style="margin-left: 8px; color: #909399;">使用率: {{ currentUsagePercent }}%</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确认</el-button>
      </template>
    </el-dialog>

    <!-- 预算执行报告弹窗 -->
    <el-dialog v-model="reportVisible" title="预算执行报告" width="900px" append-to-body>
      <div class="report-content">
        <el-table :data="reportData" border>
          <el-table-column label="科目编码" prop="subjectCode" width="120" />
          <el-table-column label="科目名称" prop="subjectName" min-width="140" />
          <el-table-column label="预算额" prop="budgetAmount" width="120" align="right">
            <template #default="{ row }">¥ {{ fmt(row.budgetAmount) }}</template>
          </el-table-column>
          <el-table-column label="实际额" prop="actualAmount" width="120" align="right">
            <template #default="{ row }">¥ {{ fmt(row.actualAmount) }}</template>
          </el-table-column>
          <el-table-column label="使用率" width="120" align="center">
            <template #default="{ row }">{{ getUsagePercent(row) }}%</template>
          </el-table-column>
          <el-table-column label="差异额" width="120" align="right">
            <template #default="{ row }">
              <span :class="{ 'text-danger': row.budgetAmount - row.actualAmount < 0 }">
                ¥ {{ fmt(row.budgetAmount - row.actualAmount) }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <el-button @click="reportVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listBudget, addBudget, updateBudget, delBudget, checkBudget } from '@/api/finance/budget'
import { listSubject } from '@/api/finance/subject'

const loading = ref(false)
const showSearch = ref(true)
const total = ref(0)
const dataList = ref<any[]>([])
const periodOptions = ref<any[]>([])

const queryParams = reactive<any>({
  pageNum: 1,
  pageSize: 20,
  periodCode: ''
})

const dialogVisible = ref(false)
const dialogTitle = computed(() => (form.id ? '编辑预算' : '新增预算'))
const formRef = ref()

const form = reactive<any>({
  id: null,
  subjectCode: '',
  subjectName: '',
  periodCode: '',
  budgetAmount: 0,
  warningThreshold: 80
})

const rules = {
  subjectCode: [{ required: true, message: '请输入科目编码', trigger: 'blur' }],
  subjectName: [{ required: true, message: '请输入科目名称', trigger: 'blur' }],
  periodCode: [{ required: true, message: '请选择期间', trigger: 'change' }],
  budgetAmount: [{ required: true, message: '请输入预算额', trigger: 'blur' }],
  warningThreshold: [{ required: true, message: '请输入预警阈值', trigger: 'blur' }]
}

const reportVisible = ref(false)
const reportData = ref<any[]>([])

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

// 监听科目编码变化，自动填充科目名称
watch(() => form.subjectCode, (newCode) => {
  if (newCode) {
    const subject = subjectList.value.find(s => s.subjectCode === newCode)
    if (subject) {
      form.subjectName = subject.subjectName
    } else {
      form.subjectName = ''
    }
  } else {
    form.subjectName = ''
  }
})

// 计算当前预算的使用率
const currentUsagePercent = computed(() => {
  if (!form.budgetAmount || form.budgetAmount === 0) return 0
  const actual = form.actualAmount || 0
  const percent = (actual / form.budgetAmount) * 100
  return Math.min(Math.round(percent), 100)
})

// 计算当前预算的预警状态
const currentWarningStatus = computed(() => {
  const percent = currentUsagePercent.value
  const threshold = form.warningThreshold || 80
  if (percent >= threshold) return { type: 'danger', text: '超支预警' }
  if (percent >= threshold * 0.75) return { type: 'warning', text: '接近预警' }
  return { type: 'success', text: '正常' }
})

// 科目选择变化
function onSubjectChange(code: string) {
  const subject = subjectList.value.find(s => s.subjectCode === code)
  if (subject) {
    form.subjectName = subject.subjectName
  } else {
    form.subjectName = ''
  }
}

function fmt(v?: string | number) {
  return v ? Number(v).toFixed(2) : '0.00'
}

function getUsagePercent(row: any) {
  if (!row.budgetAmount || row.budgetAmount === 0) return 0
  const percent = (row.actualAmount / row.budgetAmount) * 100
  return Math.min(Math.round(percent), 100)
}

function getProgressColor(row: any) {
  const percent = getUsagePercent(row)
  if (percent >= 90) return '#f56c6c'
  if (percent >= 70) return '#e6a23c'
  return '#67c23a'
}

function getWarningType(row: any) {
  const percent = getUsagePercent(row)
  const threshold = row.warningThreshold || 80
  if (percent >= threshold) return 'danger'
  if (percent >= threshold * 0.75) return 'warning'
  return 'success'
}

function getWarningLabel(row: any) {
  const percent = getUsagePercent(row)
  const threshold = row.warningThreshold || 80
  if (percent >= threshold) return '超支预警'
  if (percent >= threshold * 0.75) return '接近预警'
  return '正常'
}

async function getList() {
  loading.value = true
  try {
    const r: any = await listBudget(queryParams)
    dataList.value = r.rows || []
    total.value = r.total || 0
    periodOptions.value = (r.periods || []).map((p: any) => ({ label: p.periodCode, value: p.periodCode }))
  } finally {
    loading.value = false
  }
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function resetQuery() {
  queryParams.periodCode = ''
  handleQuery()
}

async function openAdd() {
  await loadSubjects()
  Object.assign(form, { id: null, subjectCode: '', subjectName: '', periodCode: '', budgetAmount: 0, warningThreshold: 80 })
  dialogVisible.value = true
}

function openEdit(row: any) {
  Object.assign(form, { ...row })
  dialogVisible.value = true
}

async function submitForm() {
  await formRef.value?.validate()
  try {
    await checkBudget(form)
  } catch (error) {
    ElMessage.error('预算检查失败，请确认数据')
    return
  }
  if (form.id) {
    await updateBudget(form)
    ElMessage.success('更新成功')
  } else {
    await addBudget(form)
    ElMessage.success('新增成功')
  }
  dialogVisible.value = false
  getList()
}

async function handleDelete(row: any) {
  await ElMessageBox.confirm(`确认删除科目【${row.subjectName}】的预算？`, '确认操作', { type: 'warning' })
  await delBudget(row.id)
  ElMessage.success('删除成功')
  getList()
}

async function openReport() {
  try {
    const r: any = await getBudgetReport({ periodCode: queryParams.periodCode })
    reportData.value = r.data || []
    reportVisible.value = true
  } catch {
    ElMessage.error('获取报告失败')
  }
}

onMounted(getList)
</script>

<style scoped>
.app-container { padding: 16px; }
.money { font-variant-numeric: tabular-nums; color: #303133; }
.text-danger { color: #f56c6c; font-weight: bold; }
.report-content { padding: 10px 0; }
.form-tip { font-size: 12px; color: #909399; margin-top: 4px; }
</style>
