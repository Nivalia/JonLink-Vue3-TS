<template>
  <div class="app-container">
    <el-form :model="quejlParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="模板编码" prop="templateCode">
        <el-input
          v-model="quejlParams.templateCode"
          placeholder="请输入模板编码"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="模板名称" prop="templateName">
        <el-input
          v-model="quejlParams.templateName"
          placeholder="请输入模板名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="摘要模板" prop="voucherSummary">
        <el-input
          v-model="quejlParams.voucherSummary"
          placeholder="请输入凭证摘要模板"
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
          v-hasPermi="['system:template:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:template:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:template:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['system:template:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="templateList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column label="模板编码" align="center" prop="templateCode" min-width="140" />
      <el-table-column label="模板名称" align="center" prop="templateName" />
      <el-table-column label="摘要模板" align="center" prop="voucherSummary" />
      <el-table-column label="分录结构" align="left" prop="entriesJson" min-width="300">
        <template #default="{ row }">
          <div v-if="parseEntries(row.entriesJson).length > 0" style="font-size: 12px;">
            <div v-for="(entry, idx) in parseEntries(row.entriesJson)" :key="idx" style="margin: 2px 0;">
              <el-tag :type="entry.direction === 'debit' ? 'danger' : 'success'" size="small" style="margin-right: 4px;">
                {{ entry.direction === 'debit' ? '借' : '贷' }}
              </el-tag>
              <span style="color: #606266;">{{ entry.subjectCode }}</span>
              <span style="color: #909399; margin-left: 4px;">{{ entry.summary }}</span>
              <span style="color: #909399; margin-left: 4px;">[{{ entry.amountField }}]</span>
            </div>
          </div>
          <span v-else style="color: #909399;">{{ row.entriesJson }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="状态" align="center" prop="status">
        <template #default="{ row }">
          <el-tag :type="finDictItem(row.status, 'common_status').type" disable-transitions>
            {{ finDict(row.status, 'common_status') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:template:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:template:remove']">删除</el-button>
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

    <!-- 添加或修改凭证模板对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="templateRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="模板编码" prop="templateCode">
              <el-input v-model="form.templateCode" placeholder="请输入模板编码" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="模板名称" prop="templateName">
              <el-input v-model="form.templateName" placeholder="请输入模板名称" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="摘要模板" prop="voucherSummary">
              <el-input v-model="form.voucherSummary" placeholder="请输入凭证摘要模板" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="分录结构" prop="entriesJson">
              <div style="width: 100%;">
                <div v-for="(entry, idx) in editEntries" :key="idx" style="display: flex; align-items: center; margin-bottom: 8px; gap: 8px;">
                  <el-select v-model="entry.direction" style="width: 80px;">
                    <el-option label="借方" value="debit" />
                    <el-option label="贷方" value="credit" />
                  </el-select>
                  <el-select v-model="entry.subjectCode" filterable placeholder="选择科目" style="width: 200px;">
                    <el-option v-for="s in getRecommendedSubjects(entry.direction)" :key="s.id" :label="s.subjectCode + ' ' + s.subjectName" :value="s.subjectCode" />
                  </el-select>
                  <el-input v-model="entry.summary" placeholder="摘要" style="flex: 1;" />
                  <el-input v-model="entry.amountField" placeholder="金额字段" style="width: 120px;" />
                  <el-button type="danger" :icon="Delete" circle size="small" @click="editEntries.splice(idx, 1)" />
                </div>
                <el-button type="primary" plain size="small" @click="editEntries.push({direction: 'debit', subjectCode: '', summary: '', amountField: ''})">
                  + 添加分录
                </el-button>
                <div style="margin-top: 8px; font-size: 12px; color: #909399;">
                  借方: {{ debitCount }} 条 | 贷方: {{ creditCount }} 条
                  <el-tag v-if="isBalanced" type="success" size="small" style="margin-left: 8px;">借贷平衡</el-tag>
                  <el-tag v-else type="warning" size="small" style="margin-left: 8px;">借贷不平衡</el-tag>
                </div>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio label="1">启用</el-radio>
                <el-radio label="0">停用</el-radio>
              </el-radio-group>
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

<script setup lang="ts" name="Template">
import type { FinVoucherTemplate, TemplateQuejlParams } from "@/types/api/system/template"
import { listTemplate, getTemplate, delTemplate, addTemplate, updateTemplate } from '@/api/finance/template'
import { listSubject } from '@/api/finance/subject'
import { finDict, finDictItem } from '@/utils/financeDict'
import { Delete } from '@element-plus/icons-vue'
import { computed } from 'vue'

const { proxy } = getCurrentInstance()

const templateList = ref<FinVoucherTemplate[]>([])
const open = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const ids = ref<number[]>([])
const single = ref<boolean>(true)
const multiple = ref<boolean>(true)
const total = ref<number>(0)
const title = ref<string>("")

const data = reactive({
  form: {} as FinVoucherTemplate,
  quejlParams: {
    pageNum: 1,
    pageSize: 10,
    templateCode: undefined,
    templateName: undefined,
    voucherSummary: undefined,
    entriesJson: undefined,
    status: undefined,
  } as TemplateQuejlParams,
  rules: {
    templateCode: [
      { required: true, message: "模板编码不能为空", trigger: "blur" }
    ],
    templateName: [
      { required: true, message: "模板名称不能为空", trigger: "blur" }
    ],
    entriesJson: [
      { required: true, message: "分录结构JSON不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "状态不能为空", trigger: "change" }
    ],
  }
})

const { quejlParams, form, rules } = toRefs(data)

const editEntries = ref<Array<{direction: string, subjectCode: string, summary: string, amountField: string}>>([])

// 科目列表
const subjectList = ref<any[]>([])

// 加载科目列表
async function loadSubjects() {
  try {
    const r: any = await listSubject({})
    subjectList.value = r.data || []
  } catch (e) {
    subjectList.value = []
  }
}

// 计算借方分录数和贷方分录数
const debitCount = computed(() => editEntries.value.filter(e => e.direction === 'debit').length)
const creditCount = computed(() => editEntries.value.filter(e => e.direction === 'credit').length)

// 检查借贷是否平衡
const isBalanced = computed(() => debitCount.value > 0 && creditCount.value > 0 && debitCount.value === creditCount.value)

// 根据方向推荐科目
function getRecommendedSubjects(direction: string) {
  if (direction === 'debit') {
    // 借方常用科目
    return subjectList.value.filter(s => 
      s.subjectCode?.startsWith('1') || // 资产类
      s.subjectCode?.startsWith('5')    // 损益类（费用）
    )
  } else {
    // 贷方常用科目
    return subjectList.value.filter(s => 
      s.subjectCode?.startsWith('2') || // 负债类
      s.subjectCode?.startsWith('3') || // 权益类
      s.subjectCode?.startsWith('4')    // 损益类（收入）
    )
  }
}

/** 解析分录JSON */
function parseEntries(json: string | null | undefined): Array<{direction: string, subjectCode: string, summary: string, amountField: string}> {
  if (!json) return []
  try {
    const arr = JSON.parse(json)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

/** 同步分录到表单 */
function syncEntriesToForm() {
  const valid = editEntries.value.filter(e => e.subjectCode && e.amountField)
  form.value.entriesJson = JSON.stringify(valid, null, 2)
}

/** 查询凭证模板列表 */
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
    templateCode: null,
    templateName: null,
    voucherSummary: null,
    entriesJson: null,
    remark: null,
    status: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  }
  editEntries.value = []
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
function handleSelectionChange(selection: FinVoucherTemplate[]) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
async function handleAdd() {
  reset()
  await loadSubjects()
  editEntries.value = [{direction: 'debit', subjectCode: '', summary: '', amountField: ''}]
  open.value = true
  title.value = "添加凭证模板"
}

/** 修改按钮操作 */
function handleUpdate(row: FinVoucherTemplate) {
  reset()
  const _id = (row && row.id) || ids.value[0]
  getTemplate(_id).then(response => {
    form.value = response.data
    editEntries.value = parseEntries(response.data.entriesJson)
    open.value = true
    title.value = "修改凭证模板"
  })
}

/** 提交按钮 */
function submitForm() {
  syncEntriesToForm()
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
function handleDelete(row: FinVoucherTemplate) {
  const _ids = (row && row.id) || ids.value
  proxy.$modal.confirm('是否确认删除凭证模板编号为"' + _ids + '"的数据项？').then(function() {
    return delTemplate(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/template/export', {
    ...quejlParams.value
  }, `template_${new Date().getTime()}.xlsx`)
}

getList()
</script>
