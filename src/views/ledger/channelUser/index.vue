<template>
  <div class="app-container">
    <el-form :model="quejlParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="姓名" prop="userName">
        <el-input
          v-model="quejlParams.userName"
          placeholder="请输入姓名/名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input
          v-model="quejlParams.phone"
          placeholder="请输入手机号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="类型" prop="userType">
        <el-select v-model="quejlParams.userType" placeholder="请选择类型" clearable>
          <el-option
            v-for="dict in led_channel_user_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
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
          v-hasPermi="['ledger:channelUser:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate()"
          v-hasPermi="['ledger:channelUser:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete()"
          v-hasPermi="['ledger:channelUser:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['ledger:channelUser:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="channelUserList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="姓名" align="center" prop="userName" show-overflow-tooltip min-width="140" />
      <el-table-column label="手机号" align="center" prop="phone" show-overflow-tooltip min-width="120" />
      <el-table-column label="类型" align="center" prop="userType" show-overflow-tooltip min-width="120">
        <template #default="scope">
          <dict-tag :options="led_channel_user_type" :value="scope.row.userType"/>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" show-overflow-tooltip min-width="80">
        <template #default="scope">
          <dict-tag :options="jonlink_enable_disable" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" show-overflow-tooltip min-width="160" />
      <el-table-column label="创建者" align="center" prop="createBy" show-overflow-tooltip min-width="100" />
      <el-table-column label="创建时间" align="center" prop="createTime" show-overflow-tooltip min-width="160" />
      <el-table-column label="更新者" align="center" prop="updateBy" show-overflow-tooltip min-width="100" />
      <el-table-column label="更新时间" align="center" prop="updateTime" show-overflow-tooltip min-width="160" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="170">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['ledger:channelUser:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['ledger:channelUser:remove']">删除</el-button>
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

    <!-- 添加或修改渠道/业务员对话框 -->
    <el-dialog :title="title" v-model="open" width="640px" append-to-body>
      <el-form ref="channelUserRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="姓名" prop="userName">
              <el-input v-model="form.userName" placeholder="请输入姓名/名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入手机号" />
              <el-alert v-if="phoneDuplicate" title="该手机号已被其他业务员使用" type="warning" show-icon style="margin-top:4px" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="类型" prop="userType">
              <el-radio-group v-model="form.userType">
                <el-radio
                  v-for="dict in led_channel_user_type"
                  :key="dict.value"
                  :label="dict.value"
                >{{dict.label}}</el-radio>
              </el-radio-group>
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
          <el-button type="primary" :disabled="phoneDuplicate" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="ChannelUser">
import { ref, reactive, onMounted, watch } from 'vue'
import request from '@/utils/request'
import type { JonlinkChannelUser, ChannelUserQuejlParams } from "@/types/api/ledger/channelUser"
import { listChannelUser, getChannelUser, delChannelUser, addChannelUser, updateChannelUser } from "@/api/ledger/channelUser"

const { proxy } = getCurrentInstance()
const { led_channel_user_type, jonlink_enable_disable } = useDict('led_channel_user_type', 'jonlink_enable_disable')

const channelUserList = ref<JonlinkChannelUser[]>([])
const open = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const ids = ref<number[]>([])
const single = ref<boolean>(true)
const multiple = ref<boolean>(true)
const total = ref<number>(0)
const title = ref<string>("")

const data = reactive({
  form: {} as JonlinkChannelUser,
  quejlParams: {
    pageNum: 1,
    pageSize: 10,
    userName: undefined,
    phone: undefined,
    userType: undefined,
    status: undefined,
  } as ChannelUserQuejlParams,
  rules: {
    userName: [
      { required: true, message: "姓名/名称不能为空", trigger: "blur" }
    ],
    userType: [
      { required: true, message: "类型不能为空", trigger: "change" }
    ],
    status: [
      { required: true, message: "状态不能为空", trigger: "change" }
    ],
  }
})

const { quejlParams, form, rules } = toRefs(data)

// 手机号重复校验
const phoneDuplicate = ref(false)
async function checkPhoneDuplicate() {
  if (!form.value.phone) { phoneDuplicate.value = false; return }
  try {
    const r: any = await listChannelUser({ pageNum: 1, pageSize: 200, phone: form.value.phone })
    const exists = (r.rows || []).some((item: any) =>
      item.phone === form.value.phone && item.id !== form.value.id
    )
    phoneDuplicate.value = exists
  } catch { phoneDuplicate.value = false }
}

watch(() => form.value.phone, () => { checkPhoneDuplicate() })

/** 查询渠道/业务员列表 */
function getList() {
  loading.value = true
  listChannelUser(quejlParams.value).then(response => {
    channelUserList.value = response.rows
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
    userName: null,
    phone: null,
    userType: '1',
    status: '1',
    remark: null,
  }
  proxy.resetForm("channelUserRef")
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
function handleSelectionChange(selection: JonlinkChannelUser[]) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加渠道/业务员"
}

/** 修改按钮操作 */
function handleUpdate(row: JonlinkChannelUser) {
  reset()
  const _id = (row && row.id) || ids.value[0]
  getChannelUser(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改渠道/业务员"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["channelUserRef"].validate((valid: boolean) => {
    if (valid) {
      if (form.value.id != null) {
        updateChannelUser(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addChannelUser(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row: JonlinkChannelUser) {
  const _ids = (row && row.id) || ids.value
  proxy.$modal.confirm('是否确认删除渠道/业务员编号为"' + _ids + '"的数据项？').then(function() {
    return delChannelUser(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功") }).catch((e: any) => { if (e && e.message && e.message !== "cancel") { proxy.$modal.msgError(e.message || "操作失败"); } })
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('ledger/channelUser/export', {
    ...quejlParams.value
  }, `channelUser_${new Date().getTime()}.xlsx`)
}

getList()
</script>
