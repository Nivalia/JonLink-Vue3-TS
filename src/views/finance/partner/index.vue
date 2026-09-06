<template>
  <div class="app-container">
    <el-form :model="queryParams" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="单位名" prop="partnerName"><el-input v-model="queryParams.partnerName" clearable @keyup.enter="handleQuery" /></el-form-item>
      <el-form-item label="类型" prop="partnerType">
        <el-select v-model="queryParams.partnerType" placeholder="全部" clearable style="width:120px">
          <el-option v-for="dict in fin_partner_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item><el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
      <el-button icon="Refresh" @click="resetQuery">重置</el-button></el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5"><el-button type="primary" plain icon="Plus" @click="dialogOpen()" v-hasPermi="['finance:partner:add']">新增</el-button></el-col>
      <el-col :span="1.5"><el-button type="success" plain icon="MagicStick" @click="upsertOpen()" v-hasPermi="['finance:partner:upsert']">自动建档</el-button></el-col>
      <el-col :span="1.5"><el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['finance:partner:remove']">删除</el-button></el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="dataList" @selection-change="handleChange">
      <el-table-column type="selection" width="50" />
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column label="单位名称" prop="partnerName" min-width="180" show-overflow-tooltip />
      <el-table-column label="类型" prop="partnerType" width="90" align="center">
        <template #default="{row}">
          <el-tag :type="typeTag(row.partnerType)" disable-transitions>{{ typeText(row.partnerType) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="关联表" prop="refTable" width="120" />
      <el-table-column label="关联ID" prop="refId" width="80" />
      <el-table-column label="状态" prop="status" width="80" align="center">
        <template #default="{row}">
          <el-tag :type="finDictItem(row.status, 'common_status').type" disable-transitions>
            {{ finDict(row.status, 'common_status') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="备注" prop="remark" show-overflow-tooltip />
      <el-table-column label="创建时间" prop="createTime" width="160" align="center" />
    </el-table>
    <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="520px" append-to-body>
      <el-form ref="formRef" :model="form" label-width="90px">
        <el-form-item label="单位名">
          <el-input v-model="form.partnerName" />
          <el-alert v-if="nameDuplicate" title="该单位名已存在，请修改" type="warning" show-icon style="margin-top:4px" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.partnerType" style="width:100%">
            <el-option v-for="dict in fin_partner_type" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" :disabled="nameDuplicate || !form.partnerName" @click="submitAdd()">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="upsertVisible" title="自动建档" width="520px" append-to-body>
      <el-form label-width="90px">
        <el-form-item label="单位名"><el-input v-model="upsertForm.partnerName" placeholder="客户/上游/下游名称" /></el-form-item>
        <el-form-item label="类型">
          <el-select v-model="upsertForm.partnerType" style="width:100%">
            <el-option v-for="dict in fin_partner_type" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="upsertVisible=false">取消</el-button>
        <el-button type="primary" @click="submitUpsert()">建档 / 已存在则返回</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { listPartner as listP, addPartner as addP, delPartner as delP, upsertPartner } from '@/api/finance/settlement'
import { finDict, finDictItem } from '@/utils/financeDict'

const { fin_partner_type } = useDict('fin_partner_type')

const loading = ref(false); const showSearch = ref(true); const total = ref(0); const dataList = ref<any[]>([]); const multiple = ref(false); const ids = ref<number[]>([])
const queryParams = reactive<any>({ pageNum: 1, pageSize: 20, partnerName: '', partnerType: '' })

const dialogVisible = ref(false); const dialogTitle = ref('新增')
const form = reactive<any>({ partnerName: '', partnerType: '0', remark: '' })

const upsertVisible = ref(false)
const upsertForm = reactive<any>({ partnerName: '', partnerType: '0' })

async function getList() {
  loading.value = true
  try { const r: any = await listP(queryParams); dataList.value = r.rows || []; total.value = r.total || 0 }
  finally { loading.value = false }
}
function handleQuery() { queryParams.pageNum = 1; getList() }
function resetQuery() { queryParams.partnerName = ''; queryParams.partnerType = ''; handleQuery() }
function handleChange(sel: any[]) { ids.value = sel.map((s: any) => s.id); multiple.value = sel.length === 0 }
async function handleDelete() {
  await delP(ids.value); ElMessage.success('删除成功'); getList()
}
function dialogOpen() { Object.assign(form, { partnerName: '', partnerType: '0', remark: '' }); dialogVisible.value = true; dialogTitle.value = '新增' }
async function submitAdd() {
  if (!form.partnerName) { ElMessage.error('单位名必填'); return }
  await addP(form); ElMessage.success('新增成功'); dialogVisible.value = false; getList()
}
function upsertOpen() { Object.assign(upsertForm, { partnerName: '', partnerType: '0' }); upsertVisible.value = true }
async function submitUpsert() {
  if (!upsertForm.partnerName) { ElMessage.error('单位名必填'); return }
  await upsertPartner(upsertForm); ElMessage.success('建档完成'); upsertVisible.value = false; getList()
}
// 名称重复校验
const nameDuplicate = ref(false)
function checkNameDuplicate() {
  if (!form.partnerName) { nameDuplicate.value = false; return }
  const exists = dataList.value.some((item: any) => 
    item.partnerName === form.partnerName && item.id !== form.id
  )
  nameDuplicate.value = exists
}

// 监听单位名变化，自动校验重复和推断类型
watch(() => form.partnerName, (val) => {
  checkNameDuplicate()
  // 名称推断类型
  if (val) {
    const lower = val.toLowerCase()
    if (lower.includes('上游') || lower.includes('供应商')) {
      form.partnerType = '1'
    } else if (lower.includes('下游') || lower.includes('代理')) {
      form.partnerType = '2'
    } else if (lower.includes('客户') || lower.includes('甲方')) {
      form.partnerType = '0'
    }
  }
})

// 监听自动建档的名称变化
watch(() => upsertForm.partnerName, (val) => {
  if (val) {
    const lower = val.toLowerCase()
    if (lower.includes('上游') || lower.includes('供应商')) {
      upsertForm.partnerType = '1'
    } else if (lower.includes('下游') || lower.includes('代理')) {
      upsertForm.partnerType = '2'
    } else if (lower.includes('客户') || lower.includes('甲方')) {
      upsertForm.partnerType = '0'
    }
  }
})

function typeText(s: string) { return finDict(s, 'fin_partner_type') }
function typeTag(s: string): any { return finDictItem(s, 'fin_partner_type').type }

onMounted(getList)
</script>