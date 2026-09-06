<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="保单号" prop="policyNo">
        <el-input
          v-model="queryParams.policyNo"
          placeholder="请输入保单号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="投保人" prop="applicant">
        <el-input
          v-model="queryParams.applicant"
          placeholder="请输入投保人"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="理赔备注" prop="claimRemark">
        <el-input
          v-model="queryParams.claimRemark"
          placeholder="请输入理赔备注"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['ledger:ledger:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="claimList">
      <el-table-column label="日期" align="center" prop="ledgerDate" width="110">
        <template #default="scope">
          <span>{{ parseTime(scope.row.ledgerDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="保单号" align="center" prop="policyNo" show-overflow-tooltip />
      <el-table-column label="产品名称" align="center" prop="productName" show-overflow-tooltip />
      <el-table-column label="投保人" align="center" prop="applicant" show-overflow-tooltip />
      <el-table-column label="被保人" align="center" prop="insured" show-overflow-tooltip />
      <el-table-column label="保险公司" align="center" prop="insuranceCompany" show-overflow-tooltip />
      <el-table-column label="保费" align="center" prop="premium" width="100" />
      <el-table-column label="理赔备注" align="center" prop="claimRemark" show-overflow-tooltip min-width="200">
        <template #default="scope">
          <span v-if="scope.row.claimRemark" style="color: #e6a23c;">{{ scope.row.claimRemark }}</span>
          <span v-else style="color: #909399;">-</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="120">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleClaim(scope.row)" v-hasPermi="['ledger:ledger:edit']">登记理赔</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 理赔登记对话框 -->
    <el-dialog title="理赔登记" v-model="claimOpen" width="600px" append-to-body>
      <el-form ref="claimFormRef" :model="claimForm" :rules="claimRules" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="24">
            <el-form-item label="保单号">
              <el-input v-model="claimForm.policyNo" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="投保人">
              <el-input v-model="claimForm.applicant" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="被保人">
              <el-input v-model="claimForm.insured" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="理赔备注" prop="claimRemark">
              <el-input v-model="claimForm.claimRemark" type="textarea" :rows="4" placeholder="请输入理赔备注信息" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitClaim">保 存</el-button>
          <el-button @click="claimOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="Claim">
import { listLedger, updateLedger } from "@/api/ledger/ledger"
import { parseTime } from "@/utils/jonlink"

const { proxy } = getCurrentInstance()

const claimList = ref<any[]>([])
const claimOpen = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const total = ref<number>(0)

const claimForm = ref<any>({
  id: undefined,
  policyNo: '',
  applicant: '',
  insured: '',
  claimRemark: ''
})

const claimRules = {
  claimRemark: [
    { required: true, message: "理赔备注不能为空", trigger: "blur" }
  ]
}

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  policyNo: undefined,
  applicant: undefined,
  claimRemark: undefined
})

/** 查询台账列表 */
function getList() {
  loading.value = true
  listLedger(queryParams.value).then((response: any) => {
    claimList.value = response.rows || []
    total.value = response.total
    loading.value = false
  })
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

/** 登记理赔按钮操作 */
function handleClaim(row: any) {
  claimForm.value = {
    id: row.id,
    policyNo: row.policyNo,
    applicant: row.applicant,
    insured: row.insured,
    claimRemark: row.claimRemark || ''
  }
  claimOpen.value = true
}

/** 提交理赔登记 */
function submitClaim() {
  proxy.$refs["claimFormRef"].validate((valid: boolean) => {
    if (valid) {
      updateLedger({
        id: claimForm.value.id,
        claimRemark: claimForm.value.claimRemark
      }).then((response: any) => {
        proxy.$modal.msgSuccess("理赔登记成功")
        claimOpen.value = false
        getList()
      })
    }
  })
}

/** 导出按钮操作 */
function handleExport() {
  proxy.$modal.confirm('是否确认导出理赔数据项？').then(() => {
    // export functionality
  })
}

onMounted(() => {
  getList()
})
</script>
