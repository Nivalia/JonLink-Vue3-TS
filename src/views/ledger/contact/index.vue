<template>
  <div class="app-container">
    <el-form :model="quejlParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="联系人姓名" prop="contactName">
        <el-input
          v-model="quejlParams.contactName"
          placeholder="请输入联系人姓名"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="联系电话" prop="phone">
        <el-input
          v-model="quejlParams.phone"
          placeholder="请输入联系电话"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="quejlParams.status" placeholder="请选择状态 0停用 1启用" clearable>
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
          v-hasPermi="['ledger:contact:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['ledger:contact:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['ledger:contact:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['ledger:contact:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="contactList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键" align="center" prop="id" show-overflow-tooltip min-width="100" />
      <el-table-column label="联系人姓名" align="center" prop="contactName" show-overflow-tooltip min-width="100" />
      <el-table-column label="联系电话" align="center" prop="phone" show-overflow-tooltip min-width="100" />
      <el-table-column label="微信号" align="center" prop="wechat" show-overflow-tooltip min-width="100" />
      <el-table-column label="邮箱" align="center" prop="email" show-overflow-tooltip min-width="100" />
      <el-table-column label="职务" align="center" prop="title" show-overflow-tooltip min-width="100" />
      <el-table-column label="状态" align="center" prop="status" show-overflow-tooltip min-width="110">
        <template #default="scope">
          <dict-tag :options="jonlink_enable_disable" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" show-overflow-tooltip min-width="100" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="170">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['ledger:contact:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['ledger:contact:remove']">删除</el-button>
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

    <!-- 添加或修改联系人管理对话框 -->
    <el-dialog :title="title" v-model="open" width="760px" append-to-body>
      <el-form ref="contactRef" :model="form" :rules="rules" label-width="110px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="联系人姓名" prop="contactName">
              <el-input v-model="form.contactName" placeholder="请输入联系人姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="微信号" prop="wechat">
              <el-input v-model="form.wechat" placeholder="请输入微信号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="职务" prop="title">
              <el-input v-model="form.title" placeholder="请输入职务" />
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

<script setup lang="ts" name="Contact">
import type { JonlinkContactPerson, ContactQuejlParams } from "@/types/api/ledger/contact"
import { listContact, getContact, delContact, addContact, updateContact } from "@/api/ledger/contact"

const { proxy } = getCurrentInstance()
const { jonlink_enable_disable } = useDict('jonlink_enable_disable')

const contactList = ref<JonlinkContactPerson[]>([])
const open = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const ids = ref<number[]>([])
const single = ref<boolean>(true)
const multiple = ref<boolean>(true)
const total = ref<number>(0)
const title = ref<string>("")

const data = reactive({
  form: {} as JonlinkContactPerson,
  quejlParams: {
    pageNum: 1,
    pageSize: 10,
    contactName: undefined,
    phone: undefined,
    status: undefined,
  } as ContactQuejlParams,
  rules: {
    contactName: [
      { required: true, message: "联系人姓名不能为空", trigger: "blur" }
    ],
    phone: [
      { required: true, message: "联系电话不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "状态 0停用 1启用不能为空", trigger: "change" }
    ],
  }
})

const { quejlParams, form, rules } = toRefs(data)

/** 查询联系人管理列表 */
function getList() {
  loading.value = true
  listContact(quejlParams.value).then(response => {
    contactList.value = response.rows
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
    contactName: null,
    phone: null,
    wechat: null,
    email: null,
    title: null,
    status: null,
    remark: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  }
  proxy.resetForm("contactRef")
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
function handleSelectionChange(selection: JonlinkContactPerson[]) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加联系人管理"
}

/** 修改按钮操作 */
function handleUpdate(row: JonlinkContactPerson) {
  reset()
  const _id = row.id || ids.value[0]
  getContact(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改联系人管理"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["contactRef"].validate((valid: boolean) => {
    if (valid) {
      if (form.value.id != null) {
        updateContact(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addContact(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row: JonlinkContactPerson) {
  const _ids = row.id || ids.value
  proxy.$modal.confirm('是否确认删除联系人管理编号为"' + _ids + '"的数据项？').then(function() {
    return delContact(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('ledger/contact/export', {
    ...quejlParams.value
  }, `contact_${new Date().getTime()}.xlsx`)
}

getList()
</script>
