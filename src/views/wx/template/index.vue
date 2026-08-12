<template>
  <div class="app-container">
    <el-form :model="quejlParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="微信模板ID" prop="templateId">
        <el-input
          v-model="quejlParams.templateId"
          placeholder="请输入微信模板ID(唯一)"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="模板标题" prop="title">
        <el-input
          v-model="quejlParams.title"
          placeholder="请输入模板标题"
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
          v-hasPermi="['wx:template:add']"
        >新增</el-button>
        <el-button
          type="warning"
          plain
          icon="Refresh"
          @click="handleSync"
          v-hasPermi="['wx:template:add']"
        >从微信同步</el-button>
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleCreate"
          v-hasPermi="['wx:template:add']"
        >创建模板</el-button>
        <el-button
          type="warning"
          plain
          icon="Setting"
          @click="handleSetIndustry"
          v-hasPermi="['wx:template:edit']"
        >设置行业</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['wx:template:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['wx:template:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['wx:template:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="templateList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键" align="center" prop="id" show-overflow-tooltip min-width="100" />
      <el-table-column label="微信模板ID" align="center" prop="templateId" show-overflow-tooltip min-width="100" />
      <el-table-column label="模板库短ID" align="center" prop="templateIdShort" show-overflow-tooltip min-width="100" />
      <el-table-column label="模板标题" align="center" prop="title" show-overflow-tooltip min-width="100" />
      <el-table-column label="模板内容" align="center" prop="content" show-overflow-tooltip min-width="100" />
      <el-table-column label="关键词顺序" align="center" prop="keywordOrder" show-overflow-tooltip min-width="100" />
      <el-table-column label="主营行业" align="center" prop="primaryIndustry" show-overflow-tooltip min-width="100" />
      <el-table-column label="副营行业" align="center" prop="deputyIndustry" show-overflow-tooltip min-width="100" />
      <el-table-column label="模板示例" align="center" prop="example" show-overflow-tooltip min-width="100" />
      <el-table-column label="状态" align="center" prop="status" show-overflow-tooltip min-width="100" />
      <el-table-column label="备注" align="center" prop="remark" show-overflow-tooltip min-width="100" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="170">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['wx:template:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['wx:template:remove']">删除</el-button>
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

    <!-- 添加或修改模板管理对话框 -->
    <el-dialog :title="title" v-model="open" width="760px" append-to-body>
      <el-form ref="templateRef" :model="form" :rules="rules" label-width="110px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="微信模板ID" prop="templateId">
              <el-input v-model="form.templateId" placeholder="请输入微信模板ID(唯一)" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模板库短ID" prop="templateIdShort">
              <el-input v-model="form.templateIdShort" placeholder="请输入模板库短ID(创建时用)" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模板标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入模板标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模板内容">
              <editor v-model="form.content" :min-height="192"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="关键词顺序" prop="keywordOrder">
              <el-input v-model="form.keywordOrder" placeholder="请输入关键词顺序(如 keyword1,keyword2..)" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="主营行业" prop="primaryIndustry">
              <el-input v-model="form.primaryIndustry" placeholder="请输入主营行业" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="副营行业" prop="deputyIndustry">
              <el-input v-model="form.deputyIndustry" placeholder="请输入副营行业" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="模板示例" prop="example">
              <el-input v-model="form.example" type="textarea" placeholder="请输入内容" />
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

    <!-- 创建模板对话框 (README §5.2 接口5) -->
    <el-dialog title="创建模板" v-model="createOpen" width="480px" append-to-body>
      <el-form ref="createRef" :model="createForm" label-width="110px">
        <el-form-item label="模板库短ID" prop="templateIdShort">
          <el-input v-model="createForm.templateIdShort" placeholder="如 TM00015 (模板库中查找)" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitCreate">确 定</el-button>
          <el-button @click="createOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 设置行业对话框 (README §5.2 接口6) -->
    <el-dialog title="设置行业" v-model="industryOpen" width="480px" append-to-body>
      <el-form ref="industryRef" :model="industryForm" label-width="110px">
        <el-form-item label="主营行业ID" prop="industryId1">
          <el-input v-model="industryForm.industryId1" placeholder="微信行业编号, 如 1" />
        </el-form-item>
        <el-form-item label="副营行业ID" prop="industryId2">
          <el-input v-model="industryForm.industryId2" placeholder="微信行业编号, 如 2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitIndustry">确 定</el-button>
          <el-button @click="industryOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="Template">
import type { WxMpTemplate, TemplateQuejlParams } from "@/types/api/wx/template"
import { listTemplate, getTemplate, delTemplate, addTemplate, updateTemplate } from "@/api/wx/template"
import request from "@/utils/request"

const { proxy } = getCurrentInstance()

const templateList = ref<WxMpTemplate[]>([])
const open = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const ids = ref<number[]>([])
const single = ref<boolean>(true)
const multiple = ref<boolean>(true)
const total = ref<number>(0)
const title = ref<string>("")

const data = reactive({
  form: {} as WxMpTemplate,
  quejlParams: {
    pageNum: 1,
    pageSize: 10,
    templateId: undefined,
    title: undefined,
  } as TemplateQuejlParams,
  rules: {
    templateId: [
      { required: true, message: "微信模板ID(唯一)不能为空", trigger: "blur" }
    ],
    templateIdShort: [
      { required: true, message: "模板库短ID(创建时用)不能为空", trigger: "blur" }
    ],
    title: [
      { required: true, message: "模板标题不能为空", trigger: "blur" }
    ],
    content: [
      { required: true, message: "模板内容(含{{keywordN.DATA}}占位)不能为空", trigger: "blur" }
    ],
    keywordOrder: [
      { required: true, message: "关键词顺序(如 keyword1,keyword2..)不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "状态 0停用 1启用(本地启停)不能为空", trigger: "change" }
    ],
  }
})

const { quejlParams, form, rules } = toRefs(data)

/** 查询模板管理列表 */
function getList() {
  loading.value = true
  listTemplate(quejlParams.value).then(response => {
    templateList.value = response.rows
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
    templateId: null,
    templateIdShort: null,
    title: null,
    content: null,
    keywordOrder: null,
    primaryIndustry: null,
    deputyIndustry: null,
    example: null,
    status: null,
    remark: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  }
  proxy.resetForm("templateRef")
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
function handleSelectionChange(selection: WxMpTemplate[]) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 从微信同步模板 */
function handleSync() {
  proxy.$modal.confirm('确认从微信同步模板列表？将覆盖本地模板。').then(function() {
    return request({
      url: '/wx/template/sync',
      method: 'post'
    })
  }).then((res: any) => {
    if (res.code === 200) {
      proxy.$modal.msgSuccess(res.msg || "同步完成")
      getList()
    } else {
      proxy.$modal.msgError(res.msg)
    }
  }).catch(() => {})
}

/** 创建模板弹窗 */
const createOpen = ref<boolean>(false)
const createForm = reactive({ templateIdShort: "" as string })

function handleCreate() {
  createForm.templateIdShort = ""
  createOpen.value = true
}

function submitCreate() {
  if (!createForm.templateIdShort) {
    proxy.$modal.msgError("请填写模板库短ID")
    return
  }
  request({
    url: '/wx/template/create',
    method: 'post',
    data: { templateIdShort: createForm.templateIdShort }
  }).then((res: any) => {
    if (res.code === 200) {
      proxy.$modal.msgSuccess(res.msg || "创建成功")
      createOpen.value = false
      getList()
    } else {
      proxy.$modal.msgError(res.msg)
    }
  })
}

/** 设置行业弹窗 */
const industryOpen = ref<boolean>(false)
const industryForm = reactive({ industryId1: "" as string, industryId2: "" as string })

function handleSetIndustry() {
  industryForm.industryId1 = ""
  industryForm.industryId2 = ""
  industryOpen.value = true
}

function submitIndustry() {
  if (!industryForm.industryId1 || !industryForm.industryId2) {
    proxy.$modal.msgError("请填写主营与副营行业ID")
    return
  }
  request({
    url: '/wx/template/setIndustry',
    method: 'post',
    data: { industryId1: industryForm.industryId1, industryId2: industryForm.industryId2 }
  }).then((res: any) => {
    if (res.code === 200) {
      proxy.$modal.msgSuccess(res.msg || "设置成功")
      industryOpen.value = false
    } else {
      proxy.$modal.msgError(res.msg)
    }
  })
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加模板管理"
}

/** 修改按钮操作 */
function handleUpdate(row: WxMpTemplate) {
  reset()
  const _id = row.id || ids.value[0]
  getTemplate(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改模板管理"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["templateRef"].validate((valid: boolean) => {
    if (valid) {
      if (form.value.id != null) {
        updateTemplate(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addTemplate(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row: WxMpTemplate) {
  const _ids = row.id || ids.value
  proxy.$modal.confirm('是否确认删除模板管理编号为"' + _ids + '"的数据项？').then(function() {
    return delTemplate(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('wx/template/export', {
    ...quejlParams.value
  }, `template_${new Date().getTime()}.xlsx`)
}

getList()
</script>
