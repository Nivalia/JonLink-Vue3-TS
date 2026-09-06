<template>
  <div class="app-container">
    <el-form :model="queryParams" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="模块">
        <el-select v-model="queryParams.module" placeholder="请选择模块" clearable>
          <el-option label="保单管理" value="policy" />
          <el-option label="财务管理" value="finance" />
          <el-option label="费用报销" value="expense" />
          <el-option label="预算管理" value="budget" />
          <el-option label="系统管理" value="system" />
        </el-select>
      </el-form-item>
      <el-form-item label="操作人">
        <el-input v-model="queryParams.operator" placeholder="请输入操作人" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="日期范围">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <el-table
      v-loading="loading"
      :data="dataList"
      stripe
      border
      row-key="id"
      :expand-row-keys="expandedRows"
      @expand-change="handleExpandChange"
    >
      <el-table-column type="expand">
        <template #default="{ row }">
          <div class="expand-content">
            <h4>操作详情 (JSON)</h4>
            <pre class="json-pre">{{ formatJson(row.detail) }}</pre>
          </div>
        </template>
      </el-table-column>
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column label="模块" prop="module" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="getModuleType(row.module)" disable-transitions>
            {{ getModuleLabel(row.module) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" prop="action" width="120" />
      <el-table-column label="目标编号" prop="targetNo" min-width="180" show-overflow-tooltip />
      <el-table-column label="操作人" prop="operator" width="120" />
      <el-table-column label="操作时间" prop="operateTime" width="180" align="center" />
      <el-table-column label="IP地址" prop="ipAddress" width="150" />
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { listAuditLog } from '@/api/finance/auditLog'

const loading = ref(false)
const showSearch = ref(true)
const total = ref(0)
const dataList = ref<any[]>([])
const dateRange = ref<string[]>([])
const expandedRows = ref<number[]>([])

const queryParams = reactive<any>({
  pageNum: 1,
  pageSize: 20,
  module: '',
  operator: '',
  beginDate: '',
  endDate: ''
})

function getModuleType(module: string) {
  const map: Record<string, string> = {
    'policy': 'primary',
    'finance': 'success',
    'expense': 'warning',
    'budget': 'danger',
    'system': 'info'
  }
  return map[module] || 'info'
}

function getModuleLabel(module: string) {
  const map: Record<string, string> = {
    'policy': '保单管理',
    'finance': '财务管理',
    'expense': '费用报销',
    'budget': '预算管理',
    'system': '系统管理'
  }
  return map[module] || module
}

function formatJson(json: any) {
  if (!json) return '{}'
  try {
    const obj = typeof json === 'string' ? JSON.parse(json) : json
    return JSON.stringify(obj, null, 2)
  } catch {
    return json
  }
}

async function getList() {
  loading.value = true
  if (dateRange.value && dateRange.value.length === 2) {
    queryParams.beginDate = dateRange.value[0]
    queryParams.endDate = dateRange.value[1]
  } else {
    queryParams.beginDate = ''
    queryParams.endDate = ''
  }
  try {
    const r: any = await listAuditLog(queryParams)
    dataList.value = r.rows || []
    total.value = r.total || 0
  } finally {
    loading.value = false
  }
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function resetQuery() {
  queryParams.module = ''
  queryParams.operator = ''
  dateRange.value = []
  handleQuery()
}

function handleExpandChange(row: any, expandedRows: any[]) {
  // 展开行逻辑
}

onMounted(getList)
</script>

<style scoped>
.app-container { padding: 16px; }
.expand-content { padding: 16px; background: #f5f7fa; border-radius: 4px; }
.expand-content h4 { margin: 0 0 12px 0; color: #606266; }
.json-pre {
  background: #fff;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  overflow-x: auto;
  font-family: monospace;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
