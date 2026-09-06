<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="类型" prop="type">
        <el-select v-model="queryParams.type" placeholder="请选择类型" clearable style="width: 200px">
          <el-option label="部门" value="department" />
          <el-option label="项目" value="project" />
          <el-option label="客户" value="customer" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="auxiliaryList">
      <el-table-column label="类型" align="center" prop="type">
        <template #default="{ row }">
          {{ typeMap[row.type] }}
        </template>
      </el-table-column>
      <el-table-column label="编码" align="center" prop="code" />
      <el-table-column label="名称" align="center" prop="name" />
      <el-table-column label="状态" align="center" prop="status">
        <template #default="{ row }">
          <el-tag :type="row.status === '0' ? 'success' : 'danger'">
            {{ row.status === '0' ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="{ row }">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(row)">编辑</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="auxiliaryRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择类型" style="width: 100%">
            <el-option label="部门" value="department" />
            <el-option label="项目" value="project" />
            <el-option label="客户" value="customer" />
          </el-select>
        </el-form-item>
        <el-form-item label="编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入编码" />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称" />
        </el-form-item>
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

<script setup lang="ts" name="Auxiliary">
import { ref, reactive, toRefs } from 'vue'
import { listAuxiliary, addAuxiliary, updateAuxiliary, deleteAuxiliary } from '@/api/finance/auxiliary'

const { proxy } = getCurrentInstance() as any

const auxiliaryList = ref<any[]>([])
const open = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const title = ref<string>('')
const total = ref<number>(0)

const typeMap: Record<string, string> = {
  department: '部门',
  project: '项目',
  customer: '客户'
}

interface AuxiliaryForm {
  id?: number
  type?: string
  code?: string
  name?: string
  status?: string
}

const data = reactive({
  form: {} as AuxiliaryForm,
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    type: undefined
  },
  rules: {
    type: [{ required: true, message: '类型不能为空', trigger: 'change' }],
    code: [{ required: true, message: '编码不能为空', trigger: 'blur' }],
    name: [{ required: true, message: '名称不能为空', trigger: 'blur' }]
  }
})

const { queryParams, form, rules } = toRefs(data)

function getList() {
  loading.value = true
  listAuxiliary(queryParams.value).then((response: any) => {
    auxiliaryList.value = response.rows
    total.value = response.total
  }).finally(() => {
    loading.value = false
  })
}

function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

function resetQuery() {
  proxy.resetForm('queryRef')
  handleQuery()
}

function reset() {
  form.value = {
    id: undefined,
    type: undefined,
    code: undefined,
    name: undefined,
    status: '0'
  }
  proxy.resetForm('auxiliaryRef')
}

function handleAdd() {
  reset()
  open.value = true
  title.value = '新增辅助核算'
}

function handleUpdate(row: any) {
  reset()
  form.value = { ...row }
  open.value = true
  title.value = '编辑辅助核算'
}

function submitForm() {
  proxy.$refs['auxiliaryRef'].validate((valid: boolean) => {
    if (valid) {
      if (form.value.id != null) {
        updateAuxiliary(form.value).then(() => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addAuxiliary(form.value).then(() => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
}

function handleDelete(row: any) {
  proxy.$modal.confirm('是否确认删除辅助核算编号为"' + row.code + '"的数据项？').then(() => {
    return deleteAuxiliary(row.id)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  }).catch(() => {})
}

function cancel() {
  open.value = false
  reset()
}

getList()
</script>
