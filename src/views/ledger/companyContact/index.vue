<template>
  <div class="app-container">
    <el-form :model="quejlParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="公司ID" prop="companyId">
        <el-input
          v-model="quejlParams.companyId"
          placeholder="请输入公司ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="联系人ID" prop="contactId">
        <el-input
          v-model="quejlParams.contactId"
          placeholder="请输入联系人ID"
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
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['ledger:companyContact:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['ledger:companyContact:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['ledger:companyContact:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['ledger:companyContact:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="companyContactList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键" align="center" prop="id" show-overflow-tooltip min-width="100" />
      <el-table-column label="公司ID" align="center" prop="companyId" show-overflow-tooltip min-width="100" />
      <el-table-column label="联系人ID" align="center" prop="contactId" show-overflow-tooltip min-width="100" />
      <el-table-column label="是否主联系人" align="center" prop="isPrimary" show-overflow-tooltip min-width="110">
        <template #default="scope">
          <dict-tag :options="led_yes_no" :value="scope.row.isPrimary"/>
        </template>
      </el-table-column>
      <el-table-column label="关系状态" align="center" prop="status" show-overflow-tooltip min-width="100" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="170">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['ledger:companyContact:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['ledger:companyContact:remove']">删除</el-button>
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

    <!-- 添加或修改公司联系人对话框 -->
    <el-dialog :title="title" v-model="open" width="760px" append-to-body>
      <el-form ref="companyContactRef" :model="form" :rules="rules" label-width="110px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="公司ID" prop="companyId">
              <el-input v-model="form.companyId" placeholder="请输入公司ID" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系人ID" prop="contactId">
              <el-input v-model="form.contactId" placeholder="请输入联系人ID" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否主联系人" prop="isPrimary">
              <el-input v-model="form.isPrimary" placeholder="请输入是否主联系人 0否 1是" />
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

<script setup lang="ts" name="CompanyContact">
import type { JonlinkCompanyContact, CompanyContactQuejlParams } from "@/types/api/ledger/companyContact"
import { listCompanyContact, getCompanyContact, delCompanyContact, addCompanyContact, updateCompanyContact } from "@/api/ledger/companyContact"

const { proxy } = getCurrentInstance()

const companyContactList = ref<JonlinkCompanyContact[]>([])
const open = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const ids = ref<number[]>([])
const single = ref<boolean>(true)
const multiple = ref<boolean>(true)
const total = ref<number>(0)
const title = ref<string>("")

const data = reactive({
  form: {} as JonlinkCompanyContact,
  quejlParams: {
    pageNum: 1,
    pageSize: 10,
    companyId: undefined,
    contactId: undefined,
  } as CompanyContactQuejlParams,
  rules: {
    companyId: [
      { required: true, message: "公司ID不能为空", trigger: "blur" }
    ],
    contactId: [
      { required: true, message: "联系人ID不能为空", trigger: "blur" }
    ],
    isPrimary: [
      { required: true, message: "是否主联系人 0否 1是不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "关系状态 0停用 1启用不能为空", trigger: "change" }
    ],
  }
})

const { quejlParams, form, rules } = toRefs(data)

/** 查询公司联系人列表 */
function getList() {
  loading.value = true
  listCompanyContact(quejlParams.value).then(response => {
    companyContactList.value = response.rows
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
    companyId: null,
    contactId: null,
    isPrimary: null,
    status: null,
    createTime: null,
    createBy: null
  }
  proxy.resetForm("companyContactRef")
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
function handleSelectionChange(selection: JonlinkCompanyContact[]) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加公司联系人"
}

/** 修改按钮操作 */
function handleUpdate(row: JonlinkCompanyContact) {
  reset()
  const _id = row.id || ids.value[0]
  getCompanyContact(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改公司联系人"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["companyContactRef"].validate((valid: boolean) => {
    if (valid) {
      if (form.value.id != null) {
        updateCompanyContact(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addCompanyContact(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row: JonlinkCompanyContact) {
  const _ids = row.id || ids.value
  proxy.$modal.confirm('是否确认删除公司联系人编号为"' + _ids + '"的数据项？').then(function() {
    return delCompanyContact(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('ledger/companyContact/export', {
    ...quejlParams.value
  }, `companyContact_${new Date().getTime()}.xlsx`)
}

getList()
</script>
