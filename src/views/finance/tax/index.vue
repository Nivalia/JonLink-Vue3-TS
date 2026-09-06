<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="期间编码" prop="periodCode">
        <el-input
          v-model="queryParams.periodCode"
          placeholder="请输入期间编码"
          clearable
          @keyup.enter="handleQuery"
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="box-card" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span>增值税</span>
            </div>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="进项税额">{{ vatData.inputTax }}</el-descriptions-item>
            <el-descriptions-item label="销项税额">{{ vatData.outputTax }}</el-descriptions-item>
            <el-descriptions-item label="应纳税额">{{ vatData.taxPayable }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="box-card" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span>所得税</span>
            </div>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="应纳税所得额">{{ incomeData.taxableIncome }}</el-descriptions-item>
            <el-descriptions-item label="税率">{{ incomeData.taxRate }}</el-descriptions-item>
            <el-descriptions-item label="应纳税额">{{ incomeData.taxPayable }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="box-card" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span>税务汇总</span>
            </div>
          </template>
          <el-table :data="summaryData" border size="small">
            <el-table-column prop="taxType" label="税种" />
            <el-table-column prop="amount" label="金额" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts" name="Tax">
import { ref, reactive, toRefs } from 'vue'
import { listTax } from '@/api/finance/tax'

const { proxy } = getCurrentInstance() as any

const showSearch = ref<boolean>(true)
const loading = ref<boolean>(false)

const vatData = reactive({
  inputTax: 0,
  outputTax: 0,
  taxPayable: 0
})

const incomeData = reactive({
  taxableIncome: 0,
  taxRate: '0%',
  taxPayable: 0
})

const summaryData = ref<any[]>([])

const data = reactive({
  queryParams: {
    periodCode: undefined
  }
})

const { queryParams } = toRefs(data)

function getList() {
  loading.value = true
  listTax(queryParams.value).then((response: any) => {
    const rows = response.rows || []
    if (rows.length > 0) {
      const vatItem = rows.find((item: any) => item.taxType === 'vat') || {}
      vatData.inputTax = vatItem.inputTax || 0
      vatData.outputTax = vatItem.outputTax || 0
      vatData.taxPayable = vatItem.taxPayable || 0

      const incomeItem = rows.find((item: any) => item.taxType === 'income') || {}
      incomeData.taxableIncome = incomeItem.taxableIncome || 0
      incomeData.taxRate = incomeItem.taxRate || '0%'
      incomeData.taxPayable = incomeItem.taxPayable || 0

      summaryData.value = rows.map((item: any) => ({
        taxType: item.taxTypeName,
        amount: item.taxPayable
      }))
    }
  }).finally(() => {
    loading.value = false
  })
}

function handleQuery() {
  getList()
}

function resetQuery() {
  proxy.resetForm('queryRef')
  handleQuery()
}

getList()
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.box-card {
  width: 100%;
}
</style>
