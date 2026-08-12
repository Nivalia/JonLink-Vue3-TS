<template>
  <div class="app-container">
    <el-form :model="quejlParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
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
          v-hasPermi="['wx:batch:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['wx:batch:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['wx:batch:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['wx:batch:export']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Upload"
          @click="handleImport"
          v-hasPermi="['wx:batch:add']"
        >Excel导入</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="batchList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键" align="center" prop="id" show-overflow-tooltip min-width="100" />
      <el-table-column label="批次号" align="center" prop="batchNo" show-overflow-tooltip min-width="100" />
      <el-table-column label="模板ID" align="center" prop="templateId" show-overflow-tooltip min-width="100" />
      <el-table-column label="总条数" align="center" prop="total" show-overflow-tooltip min-width="100" />
      <el-table-column label="发送状态" align="center" prop="pending" show-overflow-tooltip min-width="100" />
      <el-table-column label="成功" align="center" prop="success" show-overflow-tooltip min-width="100" />
      <el-table-column label="失败" align="center" prop="fail" show-overflow-tooltip min-width="100" />
      <el-table-column label="逾期放弃" align="center" prop="overdue" show-overflow-tooltip min-width="100" />
      <el-table-column label="状态" align="center" prop="status" show-overflow-tooltip min-width="110">
        <template #default="scope">
          <dict-tag :options="wx_send_batch_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" show-overflow-tooltip min-width="100" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="220">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['wx:batch:edit']">修改</el-button>
          <el-button link type="warning" icon="RefreshRight" @click="handleRetry(scope.row)" v-hasPermi="['wx:batch:edit']">重推</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['wx:batch:remove']">删除</el-button>
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

    <!-- 添加或修改发送批次对话框 -->
    <el-dialog :title="title" v-model="open" width="760px" append-to-body>
      <el-form ref="batchRef" :model="form" :rules="rules" label-width="110px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="批次号" prop="batchNo">
              <el-input v-model="form.batchNo" placeholder="请输入批次号(唯一)" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模板ID" prop="templateId">
              <el-input v-model="form.templateId" placeholder="请输入使用的模板ID" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="总条数" prop="total">
              <el-input v-model="form.total" placeholder="请输入总条数" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发送状态" prop="pending">
              <el-input v-model="form.pending" placeholder="请输入待发/超限待发" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="成功" prop="success">
              <el-input v-model="form.success" placeholder="请输入成功(送达)" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="失败" prop="fail">
              <el-input v-model="form.fail" placeholder="请输入失败" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="逾期放弃" prop="overdue">
              <el-input v-model="form.overdue" placeholder="请输入逾期放弃" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in wx_send_batch_status"
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

    <!-- Excel 导入对话框 -->
    <el-dialog title="Excel 导入发送批次" v-model="importOpen" width="520px" append-to-body>
      <el-form ref="importRef" :model="importForm" :rules="importRules" label-width="100px">
        <el-form-item label="模板" prop="templateId">
          <el-select v-model="importForm.templateId" placeholder="请选择模板(决定Excel表头)" style="width: 100%">
            <el-option
              v-for="t in templateList"
              :key="t.templateId"
              :label="t.title + ' (' + t.templateId + ')'"
              :value="t.templateId"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="importForm.templateId" label="模板文件">
          <el-button link type="primary" icon="Download" @click="handleDownloadTpl">下载导入模板(Excel)</el-button>
        </el-form-item>
        <el-form-item label="Excel文件" prop="file">
          <el-upload
            ref="uploadRef"
            drag
            :limit="1"
            accept=".xlsx,.xls"
            :auto-upload="false"
            :on-change="onFileChange"
            :on-remove="onFileRemove"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <template #tip>
              <div class="el-upload__tip">首列手机号，其余列为模板关键词（keyword1..N）</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitImport">开始导入</el-button>
          <el-button @click="importOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="Batch">
import type { WxMpSendBatch, BatchQuejlParams } from "@/types/api/wx/batch"
import { listBatch, getBatch, delBatch, addBatch, updateBatch, downloadBatchTemplate, importBatch, retryBatch } from "@/api/wx/batch"
import { listTemplate } from "@/api/wx/template"

const { proxy } = getCurrentInstance()
const { wx_send_batch_status } = useDict('wx_send_batch_status')

const batchList = ref<WxMpSendBatch[]>([])
const open = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const ids = ref<number[]>([])
const single = ref<boolean>(true)
const multiple = ref<boolean>(true)
const total = ref<number>(0)
const title = ref<string>("")

// Excel 导入状态
const importOpen = ref<boolean>(false)
const importForm = ref({ templateId: null as string | null, file: null as any })
const importRules = {
  templateId: [
    { required: true, message: "请选择模板", trigger: "change" }
  ]
}
const templateList = ref<any[]>([])
const uploadRef = ref<any>(null)

function onFileChange(file: any) {
  importForm.value.file = file.raw
}
function onFileRemove() {
  importForm.value.file = null
}

/** 打开 Excel 导入对话框 */
function handleImport() {
  importForm.value = { templateId: null, file: null }
  listTemplate({ pageNum: 1, pageSize: 100 } as any).then(res => {
    templateList.value = res.rows || []
  })
  importOpen.value = true
}

/** 下载导入模板 */
function handleDownloadTpl() {
  if (!importForm.value.templateId) return
  downloadBatchTemplate(importForm.value.templateId).then((res: any) => {
    const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'wx_send_template.xlsx'
    a.click()
    window.URL.revokeObjectURL(url)
  })
}

/** 提交导入 */
function submitImport() {
  if (!importForm.value.templateId) {
    proxy.$modal.msgWarning("请选择模板")
    return
  }
  if (!importForm.value.file) {
    proxy.$modal.msgWarning("请上传 Excel 文件")
    return
  }
  const fd = new FormData()
  fd.append('file', importForm.value.file)
  fd.append('templateId', importForm.value.templateId)
  proxy.$modal.loading("导入中...")
  importBatch(fd).then(res => {
    proxy.$modal.closeLoading()
    if (res.code === 200) {
      const d = res.data || {}
      proxy.$modal.msgSuccess("导入成功：批次 " + d.batchNo + "，共 " + d.total + " 条")
      importOpen.value = false
      getList()
    } else {
      proxy.$modal.msgError(res.msg || "导入失败")
    }
  }).catch(() => {
    proxy.$modal.closeLoading()
  })
}

/** 批次重推 */
function handleRetry(row: WxMpSendBatch) {
  proxy.$modal.confirm('确认重推批次 "' + row.batchNo + '" 的失败/待发行？').then(function() {
    return retryBatch(row.batchNo)
  }).then(res => {
    if (res.code === 200) {
      const d = res.data || {}
      proxy.$modal.msgSuccess("重推完成：处理 " + d.retried + " 条，成功 " + d.ok + " 条")
      getList()
    } else {
      proxy.$modal.msgError(res.msg || "重推失败")
    }
  }).catch(() => {})
}

const data = reactive({
  form: {} as WxMpSendBatch,
  quejlParams: {
    pageNum: 1,
    pageSize: 10,
  } as BatchQuejlParams,
  rules: {
    batchNo: [
      { required: true, message: "批次号(唯一)不能为空", trigger: "blur" }
    ],
    templateId: [
      { required: true, message: "使用的模板ID不能为空", trigger: "blur" }
    ],
    total: [
      { required: true, message: "总条数不能为空", trigger: "blur" }
    ],
    pending: [
      { required: true, message: "待发/超限待发不能为空", trigger: "blur" }
    ],
    success: [
      { required: true, message: "成功(送达)不能为空", trigger: "blur" }
    ],
    fail: [
      { required: true, message: "失败不能为空", trigger: "blur" }
    ],
    overdue: [
      { required: true, message: "逾期放弃不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "0处理中 1已完成不能为空", trigger: "change" }
    ],
  }
})

const { quejlParams, form, rules } = toRefs(data)

/** 查询发送批次列表 */
function getList() {
  loading.value = true
  listBatch(quejlParams.value).then(response => {
    batchList.value = response.rows
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
    templateId: null,
    total: null,
    pending: null,
    success: null,
    fail: null,
    overdue: null,
    status: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null
  }
  proxy.resetForm("batchRef")
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
function handleSelectionChange(selection: WxMpSendBatch[]) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加发送批次"
}

/** 修改按钮操作 */
function handleUpdate(row: WxMpSendBatch) {
  reset()
  const _id = row.id || ids.value[0]
  getBatch(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改发送批次"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["batchRef"].validate((valid: boolean) => {
    if (valid) {
      if (form.value.id != null) {
        updateBatch(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addBatch(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row: WxMpSendBatch) {
  const _ids = row.id || ids.value
  proxy.$modal.confirm('是否确认删除发送批次编号为"' + _ids + '"的数据项？').then(function() {
    return delBatch(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('wx/batch/export', {
    ...quejlParams.value
  }, `batch_${new Date().getTime()}.xlsx`)
}

getList()
</script>
