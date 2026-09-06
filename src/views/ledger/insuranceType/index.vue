<template>
  <div class="app-container">
    <el-form :model="quejlParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="险别名称" prop="typeName">
        <el-input
          v-model="quejlParams.typeName"
          placeholder="请输入险别名称"
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
          v-hasPermi="['ledger:insuranceType:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate()"
          v-hasPermi="['ledger:insuranceType:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete()"
          v-hasPermi="['ledger:insuranceType:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['ledger:insuranceType:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="insuranceTypeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键" align="center" prop="id" show-overflow-tooltip min-width="100" />
      <el-table-column label="险别名称" align="center" prop="typeName" show-overflow-tooltip min-width="100" />
      <el-table-column label="险别编码" align="center" prop="typeCode" show-overflow-tooltip min-width="100" />
      <el-table-column label="显示顺序" align="center" prop="sort" show-overflow-tooltip min-width="100" />
      <el-table-column label="状态" align="center" prop="status" show-overflow-tooltip min-width="110">
        <template #default="scope">
          <dict-tag :options="jonlink_enable_disable" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" show-overflow-tooltip min-width="100" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="170">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['ledger:insuranceType:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['ledger:insuranceType:remove']">删除</el-button>
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

    <!-- 添加或修改险种管理对话框 -->
    <el-dialog :title="title" v-model="open" width="760px" append-to-body>
      <el-form ref="insuranceTypeRef" :model="form" :rules="rules" label-width="110px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="险别名称" prop="typeName">
              <el-input v-model="form.typeName" placeholder="请输入险别名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="险别编码" prop="typeCode">
              <el-input v-model="form.typeCode" placeholder="请输入险别编码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示顺序" prop="sort">
              <el-input v-model="form.sort" placeholder="请输入显示顺序" />
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

<script setup lang="ts" name="InsuranceType">
import type { JonlinkInsuranceType, InsuranceTypeQuejlParams } from "@/types/api/ledger/insuranceType"
import { listInsuranceType, getInsuranceType, delInsuranceType, addInsuranceType, updateInsuranceType } from "@/api/ledger/insuranceType"

const { proxy } = getCurrentInstance()
const { jonlink_enable_disable } = useDict('jonlink_enable_disable')

const insuranceTypeList = ref<JonlinkInsuranceType[]>([])
const open = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const ids = ref<number[]>([])
const single = ref<boolean>(true)
const multiple = ref<boolean>(true)
const total = ref<number>(0)
const title = ref<string>("")

const data = reactive({
  form: {} as JonlinkInsuranceType,
  quejlParams: {
    pageNum: 1,
    pageSize: 10,
    typeName: undefined,
    status: undefined,
  } as InsuranceTypeQuejlParams,
  rules: {
    typeName: [
      { required: true, message: "险别名称不能为空", trigger: "blur" }
    ],
    typeCode: [
      { required: true, message: "险别编码不能为空", trigger: "blur" }
    ],
    sort: [
      { required: true, message: "显示顺序不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "状态 0停用 1启用不能为空", trigger: "change" }
    ],
  }
})

const { quejlParams, form, rules } = toRefs(data)

/** 查询险种管理列表 */
function getList() {
  loading.value = true
  listInsuranceType(quejlParams.value).then(response => {
    insuranceTypeList.value = response.rows
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
    typeName: null,
    typeCode: null,
    sort: null,
    status: null,
    remark: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  }
  proxy.resetForm("insuranceTypeRef")
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
function handleSelectionChange(selection: JonlinkInsuranceType[]) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加险种管理"
}

/** 修改按钮操作 */
function handleUpdate(row: JonlinkInsuranceType) {
  reset()
  const _id = (row && row.id) || ids.value[0]
  getInsuranceType(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改险种管理"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["insuranceTypeRef"].validate((valid: boolean) => {
    if (valid) {
      if (form.value.id != null) {
        updateInsuranceType(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addInsuranceType(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row: JonlinkInsuranceType) {
  const _ids = (row && row.id) || ids.value
  proxy.$modal.confirm('是否确认删除险种管理编号为"' + _ids + '"的数据项？').then(function() {
    return delInsuranceType(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功") }).catch((e: any) => { if (e && e.message && e.message !== "cancel") { proxy.$modal.msgError(e.message || "操作失败"); } })
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('ledger/insuranceType/export', {
    ...quejlParams.value
  }, `insuranceType_${new Date().getTime()}.xlsx`)
}

getList()
</script>
