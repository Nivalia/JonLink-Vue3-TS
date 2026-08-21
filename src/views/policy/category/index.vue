<template>
   <div class="app-container">
      <el-form :model="quejlParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
         <el-form-item label="分类名称" prop="categoryName">
            <el-input v-model="quejlParams.categoryName" placeholder="请输入分类名称" clearable style="width: 240px" @keyup.enter="handleQuery" />
         </el-form-item>
         <el-form-item label="状态" prop="status">
            <el-select v-model="quejlParams.status" placeholder="状态" clearable style="width: 240px">
               <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
         </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
         <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd(0)" v-hasPermi="['policy:category:add']">新增一级</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['policy:category:edit']">修改</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['policy:category:remove']">删除</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['policy:category:export']">导出</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="categoryList" row-key="id" :tree-props="{ children: 'children', hasChildren: 'hasChildren' }" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="分类名称" prop="categoryName" />
         <el-table-column label="排序" prop="sort" align="center" width="120" />
         <el-table-column label="状态" prop="status" align="center" width="120">
            <template #default="scope">
               <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
            </template>
         </el-table-column>
         <el-table-column label="创建时间" prop="createTime" align="center" width="180" />
         <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="240">
            <template #default="scope">
               <el-button link type="primary" icon="Plus" v-if="(scope.row.parentId === 0 || scope.row.parentId == null)" @click="handleAdd(scope.row.id)" v-hasPermi="['policy:category:add']">新增二级</el-button>
               <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['policy:category:edit']">修改</el-button>
               <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['policy:category:remove']">删除</el-button>
            </template>
         </el-table-column>
      </el-table>

      <!-- 添加或修改对话框 -->
      <el-dialog :title="title" v-model="open" width="560px" append-to-body>
         <el-form ref="categoryRef" :model="form" :rules="rules" label-width="100px">
            <el-form-item label="上级分类" prop="parentId">
               <el-tree-select v-model="form.parentId" :data="categoryOptions" :props="{ value: 'id', label: 'categoryName', children: 'children' }" value-key="id" placeholder="不选即为一" clearable check-strictly style="width: 100%" />
            </el-form-item>
            <el-form-item label="分类名称" prop="categoryName">
               <el-input v-model="form.categoryName" placeholder="请输入分类名称" />
            </el-form-item>
            <el-form-item label="排序" prop="sort">
               <el-input-number v-model="form.sort" :min="0" controls-position="right" />
            </el-form-item>
            <el-form-item label="状态" prop="status">
               <el-radio-group v-model="form.status">
                  <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :value="dict.value">{{ dict.label }}</el-radio>
               </el-radio-group>
            </el-form-item>
            <el-form-item label="备注" prop="remark">
               <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
            </el-form-item>
         </el-form>
         <template #footer>
            <el-button type="primary" @click="submitForm">确 定</el-button>
            <el-button @click="cancel">取 消</el-button>
         </template>
      </el-dialog>
   </div>
</template>

<script setup lang="ts" name="PolicyCategory">
import { ref, reactive, getCurrentInstance, toRefs } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  listPolicyCategory, addPolicyCategory, updatePolicyCategory, delPolicyCategory,
  treePolicyCategory, getPolicyCategory
} from '@/api/policy/category'
import type { PolicyCategory, PolicyCategoryQuejlParams } from '@/types'

const { proxy } = getCurrentInstance() as any
const { sys_normal_disable } = proxy.useDict('sys_normal_disable')

const categoryList = ref<PolicyCategory[]>([])
const categoryOptions = ref<PolicyCategory[]>([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const single = ref(true)
const multiple = ref(true)
const title = ref('')
const ids = ref<number[]>([])

const data = reactive<{
  form: PolicyCategory
  quejlParams: PolicyCategoryQuejlParams
  rules: any
}>({
  form: { status: '1', sort: 0, parentId: 0 } as PolicyCategory,
  quejlParams: { pageNum: 1, pageSize: 10 },
  rules: {
    categoryName: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }]
  }
})
const { form, quejlParams, rules } = toRefs(data)

function getList() {
  loading.value = true
  listPolicyCategory(quejlParams.value).then((res: any) => {
    categoryList.value = res.data?.rows ?? []
    loading.value = false
  })
}

function handleQuery() {
  quejlParams.value.pageNum = 1
  getList()
}

function getTree() {
  treePolicyCategory().then((res: any) => {
    const all = res.data ?? []
    // select 用的根只能是一级
    categoryOptions.value = [{ id: 0, categoryName: '主类目', children: all } as any]
  })
}

function resetQuery() {
  quejlParams.value = { pageNum: 1, pageSize: 10 }
  getList()
}

function handleSelectionChange(sel: PolicyCategory[]) {
  ids.value = sel.map((s) => s.id!).filter(Boolean)
  single.value = sel.length !== 1
  multiple.value = sel.length === 0
}

function reset() {
  form.value = { status: '1', sort: 0, parentId: 0 } as PolicyCategory
  proxy.$refs['categoryRef']?.resetFields()
}

function handleAdd(parentId: number) {
  reset()
  if (parentId && parentId !== 0) form.value.parentId = parentId
  open.value = true
  title.value = '新增政策分类'
  getTree()
}

function handleUpdate(row?: PolicyCategory) {
  const _id = (row && row.id) || ids.value[0]
  if (!_id) { ElMessage.warning('请选择要修改的项'); return }
  reset()
  getPolicyCategory(_id).then((res: any) => {
    if (res.data) form.value = res.data
    open.value = true
    title.value = '修改政策分类'
    getTree()
  })
}

function submitForm() {
  proxy.$refs['categoryRef'].validate((valid: boolean) => {
    if (!valid) return
    const payload = { ...form.value }
    if (payload.id == null) {
      addPolicyCategory(payload).then(() => {
        ElMessage.success('新增成功')
        open.value = false
        getList()
      })
    } else {
      updatePolicyCategory(payload).then(() => {
        ElMessage.success('修改成功')
        open.value = false
        getList()
      })
    }
  })
}

function handleDelete(row?: PolicyCategory) {
  const _ids = (row && (row as any).id) || ids.value
  if (!_ids || (Array.isArray(_ids) && _ids.length === 0)) { ElMessage.warning('请选择要删除的项'); return }
  const target = Array.isArray(_ids) ? _ids.join(',') : String(_ids)
  ElMessageBox.confirm('是否确认删除分类编号为"' + target + '"的数据项?', '提示', { type: 'warning' })
    .then(() => delPolicyCategory(_ids as any))
    .then(() => { getList(); ElMessage.success('删除成功') })
    .catch(() => {})
}

function handleExport() {
  proxy.download('policy/category/export', { ...quejlParams.value }, `policy_category_${Date.now()}.xlsx`)
}

function cancel() { open.value = false; reset() }

getList()
</script>
