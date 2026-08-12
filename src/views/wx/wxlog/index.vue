<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="消息类型" prop="msgType">
        <el-input
          v-model="queryParams.msgType"
          placeholder="text/event/image"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="事件类型" prop="event">
        <el-input
          v-model="queryParams.event"
          placeholder="subscribe/SCAN..."
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="粉丝openid" prop="fromUser">
        <el-input
          v-model="queryParams.fromUser"
          placeholder="请输入粉丝openid"
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
          type="danger"
          plain
          icon="Delete"
          @click="handleClear"
          v-hasPermi="['wx:log:remove']"
        >清空</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Refresh"
          @click="getList"
        >刷新</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="logList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键" align="center" prop="id" show-overflow-tooltip min-width="70" />
      <el-table-column label="消息类型" align="center" prop="msgType" show-overflow-tooltip min-width="90" />
      <el-table-column label="事件" align="center" prop="event" show-overflow-tooltip min-width="120" />
      <el-table-column label="粉丝openid" align="center" prop="fromUser" show-overflow-tooltip min-width="150" />
      <el-table-column label="接收方" align="center" prop="toUser" show-overflow-tooltip min-width="120" />
      <el-table-column label="消息ID" align="center" prop="msgId" show-overflow-tooltip min-width="110" />
      <el-table-column label="场景值" align="center" prop="scene" show-overflow-tooltip min-width="100" />
      <el-table-column label="载荷摘要" align="center" prop="payload" show-overflow-tooltip min-width="140" />
      <el-table-column label="接收时间" align="center" prop="createTime" width="160">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="130">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleDetail(scope.row)" v-hasPermi="['wx:log:query']">详情</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['wx:log:remove']">删除</el-button>
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

    <!-- 回调详情对话框 -->
    <el-dialog title="回调报文详情" v-model="detailOpen" width="720px" append-to-body>
      <el-descriptions :column="2" border v-if="detail">
        <el-descriptions-item label="主键">{{ detail.id }}</el-descriptions-item>
        <el-descriptions-item label="消息类型">{{ detail.msgType }}</el-descriptions-item>
        <el-descriptions-item label="事件">{{ detail.event }}</el-descriptions-item>
        <el-descriptions-item label="消息ID">{{ detail.msgId }}</el-descriptions-item>
        <el-descriptions-item label="粉丝openid">{{ detail.fromUser }}</el-descriptions-item>
        <el-descriptions-item label="接收方">{{ detail.toUser }}</el-descriptions-item>
        <el-descriptions-item label="场景值">{{ detail.scene }}</el-descriptions-item>
        <el-descriptions-item label="事件Key">{{ detail.eventKey }}</el-descriptions-item>
        <el-descriptions-item label="接收时间" :span="2">{{ detail.createTime }}</el-descriptions-item>
        <el-descriptions-item label="载荷摘要" :span="2">{{ detail.payload }}</el-descriptions-item>
      </el-descriptions>
      <div v-if="detail && detail.rawXml" style="margin-top: 12px;">
        <div class="detail-label">原始报文 XML</div>
        <pre class="xml-pre">{{ detail.rawXml }}</pre>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="detailOpen = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="WxLog">
import { listWxLog, getWxLog, delWxLog, clearWxLog } from "@/api/wx/wxlog"

const { proxy } = getCurrentInstance()

const logList = ref<any[]>([])
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const ids = ref<number[]>([])
const total = ref<number>(0)
const detailOpen = ref<boolean>(false)
const detail = ref<any>(null)

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    msgType: undefined,
    event: undefined,
    fromUser: undefined
  }
})

const { queryParams } = toRefs(data)

/** 查询回调日志列表 */
function getList() {
  loading.value = true
  listWxLog(queryParams.value).then(response => {
    logList.value = response.rows
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

/** 多选框选中数据 */
function handleSelectionChange(selection: any[]) {
  ids.value = selection.map(item => item.id)
}

/** 详情按钮操作 */
function handleDetail(row: any) {
  getWxLog(row.id).then(response => {
    detail.value = response.data
    detailOpen.value = true
  })
}

/** 删除按钮操作 */
function handleDelete(row: any) {
  const _ids = row.id || ids.value
  proxy.$modal.confirm('是否确认删除回调日志编号为"' + _ids + '"的数据项？').then(function() {
    return delWxLog(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 清空按钮操作 */
function handleClear() {
  proxy.$modal.confirm('是否确认清空全部回调日志？').then(function() {
    return clearWxLog()
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("清空成功")
  }).catch(() => {})
}

getList()
</script>

<style scoped>
.detail-label {
  font-weight: 600;
  margin-bottom: 6px;
  color: #606266;
}
.xml-pre {
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 10px;
  max-height: 300px;
  overflow: auto;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
}
</style>
