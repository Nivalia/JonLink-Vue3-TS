<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="标签名称" prop="tagName">
        <el-input
          v-model="queryParams.tagName"
          placeholder="请输入标签名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="标签状态" clearable>
          <el-option v-for="dict in wx_tag_status" :key="dict.value" :label="dict.label" :value="dict.value" />
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
          v-hasPermi="['wx:tag:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['wx:tag:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['wx:tag:remove']"
        >删除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="tagList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键" align="center" prop="id" show-overflow-tooltip min-width="70" />
      <el-table-column label="标签名称" align="center" prop="tagName" show-overflow-tooltip min-width="120" />
      <el-table-column label="标签说明" align="center" prop="tagDesc" show-overflow-tooltip min-width="180" />
      <el-table-column label="状态" align="center" prop="status" width="90">
        <template #default="scope">
          <dict-tag :options="wx_tag_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="排序" align="center" prop="sortOrder" width="80" />
      <el-table-column label="备注" align="center" prop="remark" show-overflow-tooltip min-width="120" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="130">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['wx:tag:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['wx:tag:remove']">删除</el-button>
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

    <!-- 添加或修改标签对话框 -->
    <el-dialog :title="title" v-model="open" width="560px" append-to-body>
      <el-form ref="tagRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="标签名称" prop="tagName">
              <el-input v-model="form.tagName" placeholder="请输入标签名称(唯一)" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in wx_tag_status"
                  :key="dict.value"
                  :label="dict.value"
                >{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sortOrder">
              <el-input-number v-model="form.sortOrder" :min="0" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="标签说明" prop="tagDesc">
              <el-input v-model="form.tagDesc" type="textarea" placeholder="请输入标签说明" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
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

<script setup lang="ts" name="WxTag">
import { listTag, getTag, delTag, addTag, updateTag } from "@/api/wx/tag"

const { proxy } = getCurrentInstance()
const { wx_tag_status } = useDict('wx_tag_status')

const tagList = ref<any[]>([])
const open = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const ids = ref<number[]>([])
const single = ref<boolean>(true)
const multiple = ref<boolean>(true)
const total = ref<number>(0)
const title = ref<string>("")

const data = reactive({
  form: {} as any,
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    tagName: undefined,
    status: undefined
  },
  rules: {
    tagName: [
      { required: true, message: "标签名称不能为空", trigger: "blur" }
    ]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询标签列表 */
function getList() {
  loading.value = true
  listTag(queryParams.value).then(response => {
    tagList.value = response.rows
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
    tagName: null,
    tagDesc: null,
    status: "1",
    sortOrder: 0,
    remark: null
  }
  proxy.resetForm("tagRef")
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
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加标签"
}

/** 修改按钮操作 */
function handleUpdate(row: any) {
  reset()
  const _id = row.id || ids.value[0]
  getTag(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改标签"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["tagRef"].validate((valid: boolean) => {
    if (valid) {
      if (form.value.id != null) {
        updateTag(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addTag(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row: any) {
  const _ids = row.id || ids.value
  proxy.$modal.confirm('是否确认删除标签编号为"' + _ids + '"的数据项？').then(function() {
    return delTag(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

getList()
</script>
