<template>
  <div class="app-container">
    <el-form :model="quejlParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="渠道名称" prop="channelName">
        <el-input
          v-model="quejlParams.channelName"
          placeholder="请输入渠道商名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="联系人" prop="contactId">
        <el-select
          v-model="quejlParams.contactId"
          placeholder="请选择联系人"
          clearable
          filterable
          @change="handleQueryContact"
          @keyup.enter="handleQuery"
        >
          <el-option
            v-for="c in contactList"
            :key="c.id"
            :label="c.contactName"
            :value="c.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="quejlParams.status" placeholder="请选择状态" clearable>
          <el-option
            v-for="dict in jonlink_enable_disable"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['ledger:channel:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate()"
          v-hasPermi="['ledger:channel:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete()"
          v-hasPermi="['ledger:channel:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['ledger:channel:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="channelList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="渠道名称" align="center" prop="channelName" show-overflow-tooltip min-width="160" />
      <el-table-column label="联系人" align="center" prop="contactPerson" show-overflow-tooltip min-width="100" />
      <el-table-column label="联系电话" align="center" prop="phone" show-overflow-tooltip min-width="120" />
      <el-table-column label="微信号" align="center" prop="wechat" show-overflow-tooltip min-width="120" />
      <el-table-column label="结算周期" align="center" prop="settleCycle" show-overflow-tooltip min-width="100" />
      <el-table-column label="状态" align="center" prop="status" show-overflow-tooltip min-width="80">
        <template #default="scope">
          <dict-tag :options="jonlink_enable_disable" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" show-overflow-tooltip min-width="120" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="170">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['ledger:channel:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['ledger:channel:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="quejlParams.pageNum"
      v-model:limit="quejlParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改上游渠道商对话框 -->
    <el-dialog :title="title" v-model="open" width="760px" append-to-body>
      <el-form ref="channelRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="渠道名称" prop="channelName">
              <el-input v-model="form.channelName" placeholder="请输入渠道商名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系人" prop="contactId">
              <el-select v-model="form.contactId" placeholder="请选择联系人" clearable filterable style="width: 100%" @change="handleContactChange">
                <el-option v-for="c in contactList" :key="c.id" :label="c.contactName" :value="c.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="联系人带出" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="微信号" prop="wechat">
              <el-input v-model="form.wechat" placeholder="联系人带出" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结算周期" prop="settleCycle">
              <el-input v-model="form.settleCycle" placeholder="如:月结/季结" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in jonlink_enable_disable"
                  :key="dict.value"
                  :label="dict.value"
                >{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="Channel">
import type { JonlinkChannel, ChannelQuejlParams } from "@/types/api/ledger/channel"
import { listChannel, getChannel, delChannel, addChannel, updateChannel } from "@/api/ledger/channel"
import request from "@/utils/request"

const { proxy } = getCurrentInstance()
const { jonlink_enable_disable } = useDict('jonlink_enable_disable')

const channelList = ref<JonlinkChannel[]>([])
const contactList = ref<any[]>([])
const open = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const ids = ref<number[]>([])
const single = ref<boolean>(true)
const multiple = ref<boolean>(true)
const total = ref<number>(0)
const title = ref<string>("")

const data = reactive({
  form: {} as JonlinkChannel,
  quejlParams: {
    pageNum: 1,
    pageSize: 10,
    channelName: undefined,
    contactId: undefined,
    status: undefined,
  } as ChannelQuejlParams,
  rules: {
    channelName: [
      { required: true, message: "渠道商名称不能为空", trigger: "blur" }
    ],
    contactId: [
      { required: true, message: "请选择联系人", trigger: "change" }
    ],
    status: [
      { required: true, message: "状态不能为空", trigger: "change" }
    ],
  }
})

const { quejlParams, form, rules } = toRefs(data)

/** 查询上游渠道商列表 */
function getList() {
  loading.value = true
  listChannel(quejlParams.value).then(response => {
    channelList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}

/** 表单重置 */
function reset() {
  form.value = {
    id: null,
    channelName: null,
    contactId: null,
    contactPerson: null,
    phone: null,
    wechat: null,
    settleCycle: null,
    status: '1',
    remark: null,
  }
  proxy.resetForm("channelRef")
}

/** 加载联系人下拉 */
function loadContactList() {
  request({ url: "/ledger/contact/list", method: "get", params: { pageNum: 1, pageSize: 200 } }).then((res: any) => {
    contactList.value = res.rows || []
  })
}

/** 表单联系人联动：选中后自动带出姓名 + 电话 + 微信 */
function handleContactChange(val: any) {
  const c = contactList.value.find((x: any) => x.id === val)
  form.value.contactPerson = c ? c.contactName : null
  form.value.phone = c ? c.phone : null
  form.value.wechat = c ? c.wechat : null
}

/** 搜索栏：选完联系人后立刻刷列表 */
function handleQueryContact() {
  quejlParams.value.pageNum = 1
  getList()
}

/** 搜索按钮操作 */
function handleQuery() {
  quejlParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

/** 多选框选中数据 */
function handleSelectionChange(selection: JonlinkChannel[]) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加上游渠道商"
}

/** 修改按钮操作 */
function handleUpdate(row: JonlinkChannel) {
  reset()
  const _id = (row && row.id) || ids.value[0]
  getChannel(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改上游渠道商"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["channelRef"].validate((valid: boolean) => {
    if (valid) {
      if (form.value.id != null) {
        updateChannel(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addChannel(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row: JonlinkChannel) {
  const _ids = (row && row.id) || ids.value
  proxy.$modal.confirm('是否确认删除渠道商编号为"' + _ids + '"的数据项？').then(function() {
    return delChannel(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功") }).catch((e: any) => { if (e && e.message && e.message !== "cancel") { proxy.$modal.msgError(e.message || "操作失败"); } })
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('ledger/channel/export', {
    ...quejlParams.value
  }, `channel_${new Date().getTime()}.xlsx`)
}

getList()
loadContactList()
</script>
