<template>
  <div class="app-container">
    <el-form :model="quejlParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="父科目ID" prop="parentId">
        <el-input
          v-model="quejlParams.parentId"
          placeholder="请输入父科目ID，0=根"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="科目编码" prop="subjectCode">
        <el-input
          v-model="quejlParams.subjectCode"
          placeholder="请输入科目编码"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="科目名称" prop="subjectName">
        <el-input
          v-model="quejlParams.subjectName"
          placeholder="请输入科目名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="余额方向" prop="balanceDirection">
        <el-select v-model="quejlParams.balanceDirection" placeholder="请选择" clearable style="width:100%">
          <el-option label="借" value="0" />
          <el-option label="贷" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item label="是否末级" prop="isLeaf">
        <el-select v-model="quejlParams.isLeaf" placeholder="请选择" clearable style="width:100%">
          <el-option label="否" value="0" />
          <el-option label="是" value="1" />
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
          v-hasPermi="['system:subject:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="Sort"
          @click="toggleExpandAll"
        >展开/折叠</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table
      v-if="refreshTable"
      v-loading="loading"
      :data="subjectList"
      row-key="id"
      :default-expand-all="isExpandAll"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column label="父科目编码" align="center" prop="parentCode" width="160">
        <template #default="{ row }">
          <span>{{ row.parentCode || '' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="科目编码" align="center" prop="subjectCode" />
      <el-table-column label="科目名称" align="center" prop="subjectName" />
      <el-table-column label="科目类别" align="center" prop="subjectType">
        <template #default="{ row }">
          <el-tag :type="finDictItem(row.subjectType, 'subject_type').type" disable-transitions>
            {{ finDict(row.subjectType, 'subject_type') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="余额方向" align="center" prop="balanceDirection">
        <template #default="{ row }">
          {{ finDict(row.balanceDirection, 'balance_direction') }}
        </template>
      </el-table-column>
      <el-table-column label="是否末级" align="center" prop="isLeaf">
        <template #default="{ row }">
          <el-tag :type="finDictItem(row.isLeaf, 'yes_no').type" disable-transitions>
            {{ finDict(row.isLeaf, 'yes_no') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template #default="{ row }">
          <el-tag :type="finDictItem(row.status, 'common_status').type" disable-transitions>
            {{ finDict(row.status, 'common_status') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:subject:edit']">修改</el-button>
          <el-button link type="primary" icon="Plus" @click="handleAdd(scope.row)" v-hasPermi="['system:subject:add']">新增</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:subject:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改会计科目对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="subjectRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="父科目ID" prop="parentId">
              <el-tree-select
                v-model="form.parentId"
                :data="subjectOptions"
                :props="{ value: 'id', label: 'subjectName', children: 'children' }"
                value-key="id"
                placeholder="请选择父科目ID，0=根"
                check-strictly
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="科目编码" prop="subjectCode">
              <el-input v-model="form.subjectCode" placeholder="请输入科目编码" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="科目名称" prop="subjectName">
              <el-input v-model="form.subjectName" placeholder="请输入科目名称" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="余额方向" prop="balanceDirection">
              <el-select v-model="form.balanceDirection" placeholder="请选择" style="width:100%">
                <el-option label="借" value="0" />
                <el-option label="贷" value="1" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="是否末级" prop="isLeaf">
              <el-select v-model="form.isLeaf" placeholder="请选择" style="width:100%">
                <el-option label="否" value="0" />
                <el-option label="是" value="1" />
              </el-select>
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

<script setup lang="ts" name="Subject">
import { listSubject, getSubject, delSubject, addSubject, updateSubject } from '@/api/finance/subject'
import { finDict, finDictItem } from '@/utils/financeDict'
import type { FinSubject, SubjectQuejlParams } from "@/types/api/system/subject"
import type { TreeSelect } from '@/types/api/common'
import { watch } from 'vue'

const { proxy } = getCurrentInstance()

const subjectList = ref<any[]>([])
const subjectOptions = ref<TreeSelect[]>([])
const open = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const title = ref<string>("")
const isExpandAll = ref<boolean>(true)
const refreshTable = ref<boolean>(true)

const data = reactive({
  form: {} as FinSubject,
  quejlParams: {
    parentId: undefined,
    subjectCode: undefined,
    subjectName: undefined,
    subjectType: undefined,
    balanceDirection: undefined,
    isLeaf: undefined,
    status: undefined,
  } as SubjectQuejlParams,
  rules: {
    parentId: [
      { required: true, message: "父科目ID，0=根不能为空", trigger: "blur" }
    ],
    subjectCode: [
      { required: true, message: "科目编码不能为空", trigger: "blur" }
    ],
    subjectName: [
      { required: true, message: "科目名称不能为空", trigger: "blur" }
    ],
    subjectType: [
      { required: true, message: "科目类别不能为空", trigger: "change" }
    ],
    balanceDirection: [
      { required: true, message: "余额方向不能为空", trigger: "change" }
    ],
    isLeaf: [
      { required: true, message: "是否末级不能为空", trigger: "change" }
    ],
    status: [
      { required: true, message: "状态不能为空", trigger: "change" }
    ],
  }
})

const { quejlParams, form, rules } = toRefs(data)

// 所有科目列表（用于查找父科目信息）
const allSubjectList = ref<FinSubject[]>([])

// 加载所有科目
async function loadAllSubjects() {
  try {
    const response = await listSubject({})
    allSubjectList.value = response.data || []
  } catch (e) {
    allSubjectList.value = []
  }
}

// 监听父科目ID变化，自动继承余额方向
watch(() => form.value.parentId, (newParentId) => {
  if (newParentId && newParentId !== 0) {
    const parentSubject = allSubjectList.value.find(s => s.id === newParentId)
    if (parentSubject) {
      // 继承父科目的余额方向
      form.value.balanceDirection = parentSubject.balanceDirection
      // 如果父科目有子科目，则当前科目不能标记为末级
      const hasChildren = allSubjectList.value.some(s => s.parentId === newParentId)
      if (hasChildren) {
        form.value.isLeaf = '0'
      }
    }
  }
})

/** 查询会计科目列表 */
function getList() {
  loading.value = true
  listSubject(quejlParams.value).then(response => {
    subjectList.value = proxy.handleTree(response.data, "id", "parentId")
    loading.value = false
  })
}

/** 查询会计科目下拉树结构 */
function getTreeselect() {
  listSubject().then(response => {
    subjectOptions.value = []
    const data = { id: 0, subjectName: '顶级节点', children: [] }
    data.children = proxy.handleTree(response.data, "id", "parentId")
    subjectOptions.value.push(data)
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
    parentId: null,
    subjectCode: null,
    subjectName: null,
    subjectType: null,
    balanceDirection: null,
    isLeaf: null,
    status: null,
    remark: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  }
  proxy.resetForm("subjectRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

/** 新增按钮操作 */
async function handleAdd(row: FinSubject) {
  reset()
  await Promise.all([getTreeselect(), loadAllSubjects()])
  if (row != null && row.id) {
    form.value.parentId = row.id
  } else {
    form.value.parentId = 0
  }
  open.value = true
  title.value = "添加会计科目"
}

/** 展开/折叠操作 */
function toggleExpandAll() {
  refreshTable.value = false
  isExpandAll.value = !isExpandAll.value
  nextTick(() => {
    refreshTable.value = true
  })
}

/** 修改按钮操作 */
async function handleUpdate(row?: FinSubject) {
  reset()
  await getTreeselect()
  const _id = (row && row.id) || ids.value[0]
  if (!_id) return
  if (row != null) {
    form.value.parentId = row.parentId
  }
  getSubject(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改会计科目"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["subjectRef"].validate((valid: boolean) => {
    if (valid) {
      if (form.value.id != null) {
        updateSubject(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addSubject(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row?: FinSubject) {
  const _id = (row && row.id) || ids.value[0]
  if (!_id) return
  proxy.$modal.confirm('是否确认删除会计科目编号为"' + _id + '"的数据项？').then(function() {
    return delSubject(_id as number)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

getList()
</script>
