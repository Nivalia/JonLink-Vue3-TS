<template>
  <div class="app-container">
    <el-form :model="quejlParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="字段名" prop="fieldKey">
        <el-input v-model="quejlParams.fieldKey" placeholder="请输入字段名" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="显示标签" prop="fieldLabel">
        <el-input v-model="quejlParams.fieldLabel" placeholder="请输入显示标签" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="业务分类" prop="sourceType">
        <el-select v-model="quejlParams.sourceType" placeholder="请选择业务分类" clearable>
          <el-option v-for="dict in wx_fc_source_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['wx:fcConfig:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['wx:fcConfig:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['wx:fcConfig:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['wx:fcConfig:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="fcConfigList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键" align="center" prop="id" show-overflow-tooltip min-width="80" />
      <el-table-column label="字段名" align="center" prop="fieldKey" show-overflow-tooltip min-width="100" />
      <el-table-column label="显示标签" align="center" prop="fieldLabel" show-overflow-tooltip min-width="100" />
      <el-table-column label="字段类型" align="center" prop="fieldType" show-overflow-tooltip min-width="80">
        <template #default="scope">
          <dict-tag :options="wx_fc_field_type" :value="scope.row.fieldType" />
        </template>
      </el-table-column>
      <el-table-column label="业务分类" align="center" prop="sourceType" show-overflow-tooltip min-width="80">
        <template #default="scope">
          <dict-tag :options="wx_fc_source_type" :value="scope.row.sourceType" />
        </template>
      </el-table-column>
      <el-table-column label="数据源" align="center" prop="dataSource" show-overflow-tooltip min-width="80">
        <template #default="scope">
          <dict-tag :options="wx_fc_data_source" :value="scope.row.dataSource" />
        </template>
      </el-table-column>
      <el-table-column label="排序" align="center" prop="sortNo" show-overflow-tooltip min-width="60" />
      <el-table-column label="可见" align="center" prop="visible" show-overflow-tooltip min-width="60">
        <template #default="scope">
          <el-tag :type="scope.row.visible === '1' ? 'success' : 'info'">{{ scope.row.visible === '1' ? '显示' : '隐藏' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="必填" align="center" prop="required" show-overflow-tooltip min-width="60">
        <template #default="scope">
          <el-tag :type="scope.row.required === '1' ? 'danger' : 'info'">{{ scope.row.required === '1' ? '必填' : '可选' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="170">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['wx:fcConfig:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['wx:fcConfig:remove']">删除</el-button>
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

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" v-model="open" width="680px" append-to-body>
      <el-form ref="fcConfigRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="字段名" prop="fieldKey">
              <el-input v-model="form.fieldKey" placeholder="英文/驼峰,程序内识别" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示标签" prop="fieldLabel">
              <el-input v-model="form.fieldLabel" placeholder="中文,渲染用" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="字段类型" prop="fieldType">
              <el-select v-model="form.fieldType" placeholder="请选择字段类型">
                <el-option v-for="dict in wx_fc_field_type" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="业务分类" prop="sourceType">
              <el-select v-model="form.sourceType" placeholder="请选择业务分类">
                <el-option v-for="dict in wx_fc_source_type" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数据源" prop="dataSource">
              <el-select v-model="form.dataSource" placeholder="请选择数据源">
                <el-option v-for="dict in wx_fc_data_source" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sortNo">
              <el-input-number v-model="form.sortNo" :min="0" :step="1" controls-position="right" placeholder="升序,值越小越靠前" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否可见" prop="visible">
              <el-select v-model="form.visible" placeholder="请选择">
                <el-option v-for="dict in wx_visible" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否必填" prop="required">
              <el-select v-model="form.required" placeholder="请选择">
                <el-option v-for="dict in wx_required" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
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

<script setup lang="ts" name="FcConfig">
import type { WxFcConfig, FcConfigQuejlParams } from "@/types/api/wx/fcConfig"
import { listFcConfig, getFcConfig, delFcConfig, addFcConfig, updateFcConfig } from "@/api/wx/fcConfig"
import { finDict } from '@/utils/financeDict'

const { proxy } = getCurrentInstance() as any
const { wx_fc_field_type, wx_fc_data_source, wx_fc_source_type, wx_visible, wx_required } = proxy.useDict('wx_fc_field_type', 'wx_fc_data_source', 'wx_fc_source_type', 'wx_visible', 'wx_required')

const fcConfigList = ref<WxFcConfig[]>([])
const open = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const ids = ref<number[]>([])
const single = ref<boolean>(true)
const multiple = ref<boolean>(true)
const total = ref<number>(0)
const title = ref<string>("")

const data = reactive({
  form: {} as WxFcConfig,
  quejlParams: {
    pageNum: 1,
    pageSize: 10,
  } as FcConfigQuejlParams,
  rules: {
    fieldKey: [{ required: true, message: "字段名不能为空", trigger: "blur" }],
    fieldLabel: [{ required: true, message: "显示标签不能为空", trigger: "blur" }],
    fieldType: [{ required: true, message: "字段类型不能为空", trigger: "change" }],
    sourceType: [{ required: true, message: "业务分类不能为空", trigger: "change" }],
    dataSource: [{ required: true, message: "数据源不能为空", trigger: "change" }],
    visible: [{ required: true, message: "是否可见不能为空", trigger: "change" }],
    required: [{ required: true, message: "是否必填不能为空", trigger: "change" }],
    sortNo: [{ required: true, message: "排序不能为空", trigger: "blur" }],
  }
})

const { quejlParams, form, rules } = toRefs(data)

function getList() {
  loading.value = true
  listFcConfig(quejlParams.value).then(response => {
    fcConfigList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

function cancel() {
  open.value = false
  reset()
}

function reset() {
  form.value = {
    id: null,
    fieldKey: null,
    fieldLabel: null,
    fieldType: null,
    sourceType: null,
    dataSource: null,
    visible: '1',
    sortNo: 0,
    required: '0',
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  }
  proxy.resetForm("fcConfigRef")
}

function handleQuery() {
  quejlParams.value.pageNum = 1
  getList()
}

function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

function handleSelectionChange(selection: WxFcConfig[]) {
  ids.value = selection.map(item => item.id!)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

function handleAdd() {
  reset()
  open.value = true
  title.value = "添加字段配置"
}

function handleUpdate(row: WxFcConfig) {
  reset()
  const _id = (row && row.id) || ids.value[0]
  getFcConfig(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改字段配置"
  })
}

function submitForm() {
  proxy.$refs["fcConfigRef"].validate((valid: boolean) => {
    if (valid) {
      if (form.value.id != null) {
        updateFcConfig(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addFcConfig(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

function handleDelete(row: WxFcConfig) {
  const _ids = (row && row.id) || ids.value
  const _fieldKey = (row && row.fieldKey) || ''
  proxy.$modal.confirm('是否确认删除字段"' + _fieldKey + '"?').then(() => {
    return delFcConfig(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功") }).catch((e: any) => { if (e && e.message && e.message !== "cancel") { proxy.$modal.msgError(e.message || "操作失败"); } })
}

function handleExport() {
  proxy.download('wx/fcConfig/export', { ...quejlParams.value }, `字段配置_${new Date().getTime()}.xlsx`)
}

getList()
</script>
