<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Upload" @click="handleImport">导入</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="balanceList" show-summary :summary-method="getSummary">
      <el-table-column label="科目编码" align="center" prop="subjectCode" />
      <el-table-column label="科目名称" align="center" prop="subjectName" />
      <el-table-column label="期初借方" align="center" prop="beginDebit">
        <template #default="{ row }">
          <el-input-number
            v-if="row.editing"
            v-model="row.beginDebit"
            :min="0"
            :precision="2"
            size="small"
            controls-position="right"
          />
          <span v-else>{{ row.beginDebit?.toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="期初贷方" align="center" prop="beginCredit">
        <template #default="{ row }">
          <el-input-number
            v-if="row.editing"
            v-model="row.beginCredit"
            :min="0"
            :precision="2"
            size="small"
            controls-position="right"
          />
          <span v-else>{{ row.beginCredit?.toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="{ row }">
          <el-button v-if="!row.editing" link type="primary" icon="Edit" @click="handleEdit(row)">编辑</el-button>
          <template v-else>
            <el-button link type="primary" icon="Check" @click="handleSave(row)">保存</el-button>
            <el-button link type="primary" icon="Close" @click="handleCancel(row)">取消</el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>

    <div v-if="balanceList.length > 0" class="balance-summary">
      <el-divider />
      <el-row :gutter="20">
        <el-col :span="12">
          <strong>借方合计：</strong>{{ totalDebit.toFixed(2) }}
        </el-col>
        <el-col :span="12">
          <strong>贷方合计：</strong>{{ totalCredit.toFixed(2) }}
        </el-col>
      </el-row>
      <div v-if="!isBalanced" class="balance-warning">
        <el-alert title="借贷不平衡，请检查数据" type="error" show-icon :closable="false" />
      </div>
    </div>

    <el-dialog title="导入期初余额" v-model="importOpen" width="400px" append-to-body>
      <el-upload
        ref="uploadRef"
        :auto-upload="false"
        :limit="1"
        accept=".xlsx,.xls"
        :on-change="handleFileChange"
        :on-exceed="handleExceed"
      >
        <template #trigger>
          <el-button type="primary">选择文件</el-button>
        </template>
        <template #tip>
          <div class="el-upload__tip">仅支持 .xlsx, .xls 格式文件</div>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitImport">确 定</el-button>
          <el-button @click="importOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="InitBalance">
import { ref, reactive, toRefs, computed } from 'vue'
import type { UploadFile, UploadInstance } from 'element-plus'
import { listInitBalance, saveInitBalance, importInitBalance } from '@/api/finance/initBalance'

const { proxy } = getCurrentInstance() as any

const balanceList = ref<any[]>([])
const importOpen = ref<boolean>(false)
const loading = ref<boolean>(false)
const uploadRef = ref<UploadInstance>()
const fileList = ref<UploadFile[]>([])

interface BalanceItem {
  id?: number
  subjectCode: string
  subjectName: string
  beginDebit: number
  beginCredit: number
  editing?: boolean
  originalData?: any
}

const totalDebit = computed(() => {
  return balanceList.value.reduce((sum, item) => sum + (item.beginDebit || 0), 0)
})

const totalCredit = computed(() => {
  return balanceList.value.reduce((sum, item) => sum + (item.beginCredit || 0), 0)
})

const isBalanced = computed(() => {
  return Math.abs(totalDebit.value - totalCredit.value) < 0.01
})

const data = reactive({
  queryParams: {}
})

const { queryParams } = toRefs(data)

function getList() {
  loading.value = true
  listInitBalance(queryParams.value).then((response: any) => {
    balanceList.value = (response.rows || []).map((item: any) => ({
      ...item,
      editing: false,
      originalData: null
    }))
  }).finally(() => {
    loading.value = false
  })
}

function getSummary({ columns, data }: { columns: any[]; data: any[] }) {
  const sums: string[] = []
  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = '合计'
      return
    }
    if (index === 1 || index === 2) {
      sums[index] = ''
      return
    }
    const values = data.map(item => Number(item[column.property]))
    if (!values.every(value => isNaN(value))) {
      const v = values.reduce((prev, curr) => {
        const value = Number(curr)
        if (!isNaN(value)) {
          return prev + curr
        } else {
          return prev
        }
      }, 0)
      sums[index] = v.toFixed(2)
    } else {
      sums[index] = ''
    }
  })
  return sums
}

function handleImport() {
  fileList.value = []
  importOpen.value = true
}

function handleFileChange(file: UploadFile) {
  fileList.value = [file]
}

function handleExceed() {
  proxy.$modal.msgWarning('只能选择一个文件')
}

function submitImport() {
  if (fileList.value.length === 0) {
    proxy.$modal.msgWarning('请选择要导入的文件')
    return
  }
  const file = fileList.value[0].raw
  if (!file) return

  loading.value = true
  importInitBalance(file).then(() => {
    proxy.$modal.msgSuccess('导入成功')
    importOpen.value = false
    getList()
  }).finally(() => {
    loading.value = false
  })
}

function handleEdit(row: any) {
  row.originalData = { ...row }
  row.editing = true
}

function handleSave(row: any) {
  // 校验借贷互斥：一行只能填借方或贷方，不能同时有值
  if ((row.beginDebit || 0) > 0 && (row.beginCredit || 0) > 0) {
    proxy.$modal.msgError('期初余额一行只能填借方或贷方，不能同时有值')
    return
  }
  
  // 校验保存后是否平衡
  const tempDebit = totalDebit.value - (row.originalData?.beginDebit || 0) + (row.beginDebit || 0)
  const tempCredit = totalCredit.value - (row.originalData?.beginCredit || 0) + (row.beginCredit || 0)
  if (Math.abs(tempDebit - tempCredit) > 0.01) {
    proxy.$modal.msgWarning('保存后借贷将不平衡，请检查数据')
  }
  
  row.editing = false
  saveInitBalance([row]).then(() => {
    proxy.$modal.msgSuccess('保存成功')
  })
}

function handleCancel(row: any) {
  if (row.originalData) {
    Object.assign(row, row.originalData)
  }
  row.editing = false
}

getList()
</script>

<style scoped>
.balance-summary {
  margin-top: 20px;
  text-align: right;
}
.balance-warning {
  margin-top: 10px;
}
</style>
