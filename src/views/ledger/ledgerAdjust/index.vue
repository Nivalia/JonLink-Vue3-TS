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

    <el-table v-loading="loading" :data="ledgerList">
      <el-table-column label="日期" align="center" prop="ledgerDate" width="110">
        <template #default="scope">
          <span>{{ parseTime(scope.row.ledgerDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="保单号" align="center" prop="policyNo" show-overflow-tooltip />
      <el-table-column label="产品名称" align="center" prop="productName" show-overflow-tooltip />
      <el-table-column label="投保人" align="center" prop="applicant" show-overflow-tooltip />
      <el-table-column label="被保人" align="center" prop="insured" show-overflow-tooltip />
      <el-table-column label="保费" align="center" prop="premium" width="100" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200">
        <template #default="scope">
          <el-button link type="success" icon="Plus" @click="handleAdjust(scope.row, '1')" v-hasPermi="['ledger:adjust:edit']">批增</el-button>
          <el-button link type="danger" icon="Minus" @click="handleAdjust(scope.row, '2')" v-hasPermi="['ledger:adjust:edit']">批退</el-button>
          <el-button link type="primary" icon="View" @click="handleViewLog(scope.row)" v-hasPermi="['ledger:adjust:list']">记录</el-button>
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

    <!-- 批增退操作对话框 -->
    <el-dialog :title="adjustTitle" v-model="adjustOpen" width="600px" append-to-body>
      <el-form ref="adjustFormRef" :model="adjustForm" :rules="adjustRules" label-width="110px">
        <el-row :gutter="16">
          <el-col :span="24">
            <el-form-item label="保单号">
              <el-input v-model="adjustForm.policyNo" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="当前保费">
              <el-input v-model="adjustForm.currentPremium" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="调整类型">
              <el-tag :type="adjustForm.adjustType === '1' ? 'success' : 'danger'">
                {{ adjustForm.adjustType === '1' ? '批增' : '批退' }}
              </el-tag>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="调整金额" prop="adjustPremium">
              <el-input v-model="adjustForm.adjustPremium" placeholder="请输入调整金额" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="调整日期" prop="adjustDate">
              <el-date-picker clearable
                v-model="adjustForm.adjustDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择调整日期"
                style="width: 100%">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="调整原因" prop="adjustReason">
              <el-input v-model="adjustForm.adjustReason" type="textarea" placeholder="请输入调整原因" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitAdjust">确 定</el-button>
          <el-button @click="adjustOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 查看批增退记录对话框 -->
    <el-dialog title="批增退记录" v-model="logOpen" width="800px" append-to-body>
      <el-table :data="adjustLogList">
        <el-table-column label="调整类型" align="center" prop="adjustType" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.adjustType === '1' ? 'success' : 'danger'">
              {{ scope.row.adjustType === '1' ? '批增' : '批退' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="调整金额" align="center" prop="adjustPremium" width="120" />
        <el-table-column label="调整日期" align="center" prop="adjustDate" width="120">
          <template #default="scope">
            <span>{{ parseTime(scope.row.adjustDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="调整原因" align="center" prop="adjustReason" show-overflow-tooltip />
        <el-table-column label="调整人" align="center" prop="adjustBy" width="100" />
        <el-table-column label="创建时间" align="center" prop="createTime" width="180" />
      </el-table>
      <div v-if="!adjustLogList.length" style="text-align:center;color:#909399;padding:20px 0;">暂无记录</div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="LedgerAdjust">
import { listLedger } from "@/api/ledger/ledger"
import { listLedgerAdjust, executeAdjust } from "@/api/ledger/ledgerAdjust"
import { parseTime } from "@/utils/jonlink"

const { proxy } = getCurrentInstance()

const ledgerList = ref<any[]>([])
const adjustLogList = ref<any[]>([])
const adjustOpen = ref<boolean>(false)
const logOpen = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const total = ref<number>(0)
const adjustTitle = ref<string>("")

const adjustForm = ref<any>({
  ledgerId: undefined,
  policyNo: '',
  currentPremium: 0,
  adjustType: '1',
  adjustPremium: undefined,
  adjustDate: '',
  adjustReason: ''
})

const adjustRules = {
  adjustPremium: [
    { required: true, message: "调整金额不能为空", trigger: "blur" }
  ],
  adjustDate: [
    { required: true, message: "调整日期不能为空", trigger: "blur" }
  ],
  adjustReason: [
    { required: true, message: "调整原因不能为空", trigger: "blur" }
  ]
}

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  policyNo: undefined,
  applicant: undefined
})

/** 查询台账列表 */
function getList() {
  loading.value = true
  listLedger(queryParams.value).then((response: any) => {
    ledgerList.value = response.rows || []
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

/** 批增/批退操作 */
function handleAdjust(row: any, type: string) {
  adjustForm.value = {
    ledgerId: row.id,
    policyNo: row.policyNo,
    currentPremium: row.premium,
    adjustType: type,
    adjustPremium: undefined,
    adjustDate: new Date().toISOString().slice(0, 10),
    adjustReason: ''
  }
  adjustTitle.value = type === '1' ? '批增保费' : '批退保费'
  adjustOpen.value = true
}

/** 提交批增退 */
function submitAdjust() {
  proxy.$refs["adjustFormRef"].validate((valid: boolean) => {
    if (valid) {
      executeAdjust({
        ledgerId: adjustForm.value.ledgerId,
        adjustType: adjustForm.value.adjustType,
        adjustPremium: Number(adjustForm.value.adjustPremium),
        adjustDate: adjustForm.value.adjustDate,
        adjustReason: adjustForm.value.adjustReason
      }).then((response: any) => {
        proxy.$modal.msgSuccess("操作成功")
        adjustOpen.value = false
        getList()
      })
    }
  })
}

/** 查看记录 */
function handleViewLog(row: any) {
  listLedgerAdjust({ ledgerId: row.id }).then((response: any) => {
    adjustLogList.value = response.rows || []
    logOpen.value = true
  })
}

/** 导出按钮操作 */
function handleExport() {
  proxy.$modal.confirm('是否确认导出台账数据？').then(() => {
    // export functionality
  })
}

onMounted(() => {
  getList()
})
</script>
