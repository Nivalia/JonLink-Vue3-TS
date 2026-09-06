<template>
  <div class="app-container">
    <el-form :model="queryParams" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="账户名"><el-input v-model="queryParams.accountName" clearable @keyup.enter="handleQuery" /></el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5"><el-button type="primary" plain icon="Plus" @click="openAdd" v-hasPermi="['finance:account:add']">新增账户</el-button></el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="dataList">
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column label="账户名" prop="accountName" min-width="180" />
      <el-table-column label="账号" prop="accountNo" min-width="200" show-overflow-tooltip />
      <el-table-column label="开户行" prop="bankName" min-width="160" />
      <el-table-column label="初始余额" prop="initBalance" width="130" align="right">
        <template #default="{row}">{{ fmt(row.initBalance) }}</template>
      </el-table-column>
      <el-table-column label="当前余额" prop="currentBalance" width="130" align="right">
        <template #default="{row}"><b style="color:#67c23a">{{ fmt(row.currentBalance) }}</b></template>
      </el-table-column>
      <el-table-column label="状态" prop="status" width="90" align="center">
        <template #default="{row}">
          <el-tag :type="finDictItem(row.status, 'common_status').type" disable-transitions>
            {{ finDict(row.status, 'common_status') }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <el-dialog v-model="dialogVisible" title="新增账户" width="520px" append-to-body>
      <el-form label-width="90px">
        <el-form-item label="账户名"><el-input v-model="form.accountName" /></el-form-item>
        <el-form-item label="账号"><el-input v-model="form.accountNo" /></el-form-item>
        <el-form-item label="开户行"><el-input v-model="form.bankName" /></el-form-item>
        <el-form-item label="初始余额"><el-input-number v-model="form.initBalance" :min="0" :precision="2" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="submit()">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { accountList, addAccount } from '@/api/finance/fund'
import { finDict, finDictItem } from '@/utils/financeDict'

const loading = ref(false); const showSearch = ref(true); const total = ref(0); const dataList = ref<any[]>([])
const queryParams = reactive<any>({ pageNum: 1, pageSize: 20, accountName: '' })
const dialogVisible = ref(false)
const form = reactive<any>({ accountName: '', accountNo: '', bankName: '', initBalance: 0 })

async function getList() {
  loading.value = true
  try { const r: any = await accountList(queryParams); dataList.value = r.rows || []; total.value = r.total || 0 }
  finally { loading.value = false }
}
function handleQuery() { queryParams.pageNum = 1; getList() }
function resetQuery() { queryParams.accountName = ''; handleQuery() }
function openAdd() { Object.assign(form, { accountName: '', accountNo: '', bankName: '', initBalance: 0 }); dialogVisible.value = true }
async function submit() {
  if (!form.accountName || !form.accountNo) { ElMessage.error('账户名+账号必填'); return }
  await addAccount(form); ElMessage.success('新增成功'); dialogVisible.value = false; getList()
}
function fmt(v?: string | number) { return v ? Number(v).toFixed(2) : '0.00' }
onMounted(getList)
</script>