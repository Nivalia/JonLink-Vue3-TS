<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="queryParams.phone" placeholder="手机号" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="全部" clearable style="width:120px">
          <el-option v-for="dict in wx_mp_msg_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="业务类型" prop="bizType">
        <el-select v-model="queryParams.bizType" placeholder="全部" clearable style="width:130px">
          <el-option v-for="(v, k) in bizTypeMap" :key="k" :label="v" :value="k" />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker clearable v-model="queryParams.createTime" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="msgList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="手机号" min-width="120" prop="phone" />
      <el-table-column label="模板" min-width="180">
        <template #default="{ row }">
          <span>{{ getTemplateName(row.templateId) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="关键词" min-width="200" show-overflow-tooltip>
        <template #default="{ row }">
          <span class="kw-text">{{ formatKeywords(row.keywords) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === '1' ? 'success' : row.status === '2' ? 'danger' : 'info'" size="small">
            {{ statusMap[row.status] || row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="错误信息" min-width="150" prop="errMsg" show-overflow-tooltip />
      <el-table-column label="来源" width="90" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.source === '1'" size="small" effect="plain">手工</el-tag>
          <el-tag v-else-if="row.source === '2'" size="small" effect="plain" type="warning">批量</el-tag>
          <el-tag v-else size="small" effect="plain" type="info">业务</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="发送时间" min-width="140">
        <template #default="{ row }">{{ formatTime(row.sendTime || row.createTime) }}</template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { listMsg } from '@/api/wx/msg'
import { listTemplate } from '@/api/wx/template'
import { parseTime } from '@/utils/jonlink'

const { wx_mp_msg_status } = useDict('wx_mp_msg_status')
const queryParams = reactive({ pageNum: 1, pageSize: 10, phone: '', status: '', bizType: '', createTime: '' })
const showSearch = ref(true)
const loading = ref(false)
const msgList = ref<any[]>([])
const total = ref(0)
const ids = ref<number[]>([])
const templateMap = ref<Record<string, string>>({})

const bizTypeMap: Record<string, string> = { policy: '出单通知', renewal: '续保提醒', claim: '理赔通知', settle: '结算通知', verify: '核销通知', commission: '佣金通知' }
const statusMap: Record<string, string> = { '0': '待发送', '1': '成功', '2': '失败', '3': '超限', '4': '已放弃', '5': '未找到' }

function getTemplateName(id: string) { return templateMap.value[id] || id || '-' }
function formatTime(t: any) { return parseTime(t, '{y}-{m}-{d} {h}:{i}:{s}') }
function formatKeywords(kw: string) {
  if (!kw) return '-'
  try { const obj = JSON.parse(kw); return Object.entries(obj).map(([k, v]) => `${v}`).join(' | ') } catch { return kw }
}

async function getList() {
  loading.value = true
  try {
    const res = await listMsg(queryParams)
    if (res.code === 200) {
      msgList.value = res.rows || []
      total.value = res.total || 0
    } else {
      ElMessage.error(res.msg || '加载消息列表失败')
    }
  } finally { loading.value = false }
}

function handleQuery() { queryParams.pageNum = 1; getList() }
function resetQuery() { queryParams.phone = ''; queryParams.status = ''; queryParams.bizType = ''; queryParams.createTime = ''; handleQuery() }
function handleSelectionChange(selection: any[]) { ids.value = selection.map(item => item.id) }
function handleExport() {
  ElMessage.info('导出功能开发中')
}

onMounted(async () => {
  getList()
  try {
    const res = await listTemplate({ pageNum: 1, pageSize: 200 })
    if (res.code === 200) {
      for (const t of (res.rows || [])) { templateMap.value[t.templateId] = t.title }
    }
  } catch {}
})
</script>

<style scoped>
.kw-text { color: #606266; font-size: 13px; }
</style>
