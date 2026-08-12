<template>
  <div class="app-container">
    <el-form :model="quejlParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="批次号" prop="batchNo">
        <el-input
          v-model="quejlParams.batchNo"
          placeholder="请输入批次号(手工/导入)"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input
          v-model="quejlParams.phone"
          placeholder="请输入手机号(冗余冗余,便于查询)"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="quejlParams.status" placeholder="请选择0待发 1成功 2失败 3超限待发(次日补) 4逾期放弃 5未找到粉丝" clearable>
          <el-option
            v-for="dict in wx_mp_msg_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker clearable
          v-model="quejlParams.createTime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择创建时间">
        </el-date-picker>
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
          v-hasPermi="['wx:msg:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['wx:msg:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['wx:msg:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['wx:msg:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="msgList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键" align="center" prop="id" show-overflow-tooltip min-width="100" />
      <el-table-column label="批次号" align="center" prop="batchNo" show-overflow-tooltip min-width="100" />
      <el-table-column label="业务流水号" align="center" prop="transposeNo" show-overflow-tooltip min-width="100" />
      <el-table-column label="openid" align="center" prop="openid" show-overflow-tooltip min-width="100" />
      <el-table-column label="手机号" align="center" prop="phone" show-overflow-tooltip min-width="100" />
      <el-table-column label="模板ID" align="center" prop="templateId" show-overflow-tooltip min-width="100" />
      <el-table-column label="点击跳转链接" align="center" prop="url" show-overflow-tooltip min-width="100" />
      <el-table-column label="关键词值" align="center" prop="keywords" show-overflow-tooltip min-width="100" />
      <el-table-column label="msgid" align="center" prop="msgId" show-overflow-tooltip min-width="100" />
      <el-table-column label="状态" align="center" prop="status" show-overflow-tooltip min-width="110">
        <template #default="scope">
          <dict-tag :options="wx_mp_msg_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="错误信息" align="center" prop="errMsg" show-overflow-tooltip min-width="100" />
      <el-table-column label="状态" align="center" prop="source" show-overflow-tooltip min-width="100" />
      <el-table-column label="业务类型" align="center" prop="bizType" show-overflow-tooltip min-width="100" />
      <el-table-column label="业务单号" align="center" prop="bizId" show-overflow-tooltip min-width="100" />
      <el-table-column label="批次内行号" align="center" prop="rowNo" show-overflow-tooltip min-width="100" />
      <el-table-column label="合并组ID" align="center" prop="groupId" show-overflow-tooltip min-width="100" />
      <el-table-column label="实际发送时间" align="center" prop="sendTime" show-overflow-tooltip min-width="110">
        <template #default="scope">
          <span>{{ parseTime(scope.row.sendTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="170">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['wx:msg:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['wx:msg:remove']">删除</el-button>
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

    <!-- 添加或修改发送记录对话框 -->
    <el-dialog :title="title" v-model="open" width="900px" append-to-body>
      <el-form ref="msgRef" :model="form" :rules="rules" label-width="110px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="批次号" prop="batchNo">
              <el-input v-model="form.batchNo" placeholder="请输入批次号(手工/导入)" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="业务流水号" prop="transposeNo">
              <el-input v-model="form.transposeNo" placeholder="请输入业务流水号(幂等,去重)" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="openid" prop="openid">
              <el-input v-model="form.openid" placeholder="请输入接收openid" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入手机号(冗余冗余,便于查询)" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模板ID" prop="templateId">
              <el-input v-model="form.templateId" placeholder="请输入模板ID" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="点击跳转链接" prop="url">
              <el-input v-model="form.url" placeholder="请输入点击跳转链接" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="关键词值" prop="keywords">
              <el-input v-model="form.keywords" type="textarea" placeholder="请输入内容" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="msgid" prop="msgId">
              <el-input v-model="form.msgId" placeholder="请输入msgid" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in wx_mp_msg_status"
                  :key="dict.value"
                  :label="dict.value"
                >{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="错误信息" prop="errMsg">
              <el-input v-model="form.errMsg" type="textarea" placeholder="请输入内容" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="source">
              <el-input v-model="form.source" placeholder="请输入0业务触发 1手工/导入 2合并汇总" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="业务单号" prop="bizId">
              <el-input v-model="form.bizId" placeholder="请输入业务单号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="批次内行号" prop="rowNo">
              <el-input v-model="form.rowNo" placeholder="请输入批次内行号(定位失败行)" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="合并组ID" prop="groupId">
              <el-input v-model="form.groupId" placeholder="请输入合并组ID(多条合并为1条时的关联)" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="实际发送时间" prop="sendTime">
              <el-date-picker clearable
                v-model="form.sendTime"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择实际发送时间">
              </el-date-picker>
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

<script setup lang="ts" name="Msg">
import type { WxMpTemplateMsg, MsgQuejlParams } from "@/types/api/wx/msg"
import { listMsg, getMsg, delMsg, addMsg, updateMsg } from "@/api/wx/msg"

const { proxy } = getCurrentInstance()
const { wx_mp_msg_status } = useDict('wx_mp_msg_status')

const msgList = ref<WxMpTemplateMsg[]>([])
const open = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const ids = ref<number[]>([])
const single = ref<boolean>(true)
const multiple = ref<boolean>(true)
const total = ref<number>(0)
const title = ref<string>("")

const data = reactive({
  form: {} as WxMpTemplateMsg,
  quejlParams: {
    pageNum: 1,
    pageSize: 10,
    batchNo: undefined,
    phone: undefined,
    status: undefined,
    createTime: undefined,
  } as MsgQuejlParams,
  rules: {
    openid: [
      { required: true, message: "接收openid不能为空", trigger: "blur" }
    ],
    templateId: [
      { required: true, message: "模板ID不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "0待发 1成功 2失败 3超限待发(次日补) 4逾期放弃 5未找到粉丝不能为空", trigger: "change" }
    ],
    source: [
      { required: true, message: "0业务触发 1手工/导入 2合并汇总不能为空", trigger: "blur" }
    ],
  }
})

const { quejlParams, form, rules } = toRefs(data)

/** 查询发送记录列表 */
function getList() {
  loading.value = true
  listMsg(quejlParams.value).then(response => {
    msgList.value = response.rows
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
    batchNo: null,
    transposeNo: null,
    openid: null,
    phone: null,
    templateId: null,
    url: null,
    keywords: null,
    msgId: null,
    status: null,
    errMsg: null,
    source: null,
    bizType: null,
    bizId: null,
    rowNo: null,
    groupId: null,
    sendTime: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  }
  proxy.resetForm("msgRef")
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
function handleSelectionChange(selection: WxMpTemplateMsg[]) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加发送记录"
}

/** 修改按钮操作 */
function handleUpdate(row: WxMpTemplateMsg) {
  reset()
  const _id = row.id || ids.value[0]
  getMsg(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改发送记录"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["msgRef"].validate((valid: boolean) => {
    if (valid) {
      if (form.value.id != null) {
        updateMsg(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addMsg(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row: WxMpTemplateMsg) {
  const _ids = row.id || ids.value
  proxy.$modal.confirm('是否确认删除发送记录编号为"' + _ids + '"的数据项？').then(function() {
    return delMsg(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('wx/msg/export', {
    ...quejlParams.value
  }, `msg_${new Date().getTime()}.xlsx`)
}

getList()
</script>
