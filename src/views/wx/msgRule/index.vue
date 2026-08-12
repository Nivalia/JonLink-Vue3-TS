<template>
  <div class="app-container">
    <el-form :model="quejlParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="规则编码" prop="ruleCode">
        <el-input
          v-model="quejlParams.ruleCode"
          placeholder="请输入规则编码"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="是否启用" prop="enabled">
        <el-input
          v-model="quejlParams.enabled"
          placeholder="请输入是否启用"
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
          v-hasPermi="['wx:msgRule:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['wx:msgRule:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['wx:msgRule:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['wx:msgRule:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="msgRuleList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="规则ID" align="center" prop="id" show-overflow-tooltip min-width="100" />
      <el-table-column label="规则编码" align="center" prop="ruleCode" show-overflow-tooltip min-width="100" />
      <el-table-column label="规则名称" align="center" prop="ruleName" show-overflow-tooltip min-width="100" />
      <el-table-column label="业务事件类型" align="center" prop="bizType" show-overflow-tooltip min-width="100" />
      <el-table-column label="模板ID" align="center" prop="templateId" show-overflow-tooltip min-width="100" />
      <el-table-column align="center" prop="contentRule" show-overflow-tooltip min-width="140">
            <template #header>
              <el-tooltip content='keyword占位符映射JSON：如 {"policyNo":"{保单号}","amount":"{金额}"}' placement="top">
                <span>内容规则<span style="color:#e6a23c;margin-left:2px;">!</span></span>
              </el-tooltip>
            </template>
          </el-table-column>
      <el-table-column align="center" prop="urlRule" show-overflow-tooltip min-width="140">
            <template #header>
              <el-tooltip content="跳转地址模板，可空；{ticket} 推送时自动替换为防伪凭证" placement="top">
                <span>跳转地址<span style="color:#e6a23c;margin-left:2px;">!</span></span>
              </el-tooltip>
            </template>
          </el-table-column>
      <el-table-column align="center" prop="audienceRule" show-overflow-tooltip min-width="140">
            <template #header>
              <el-tooltip content='受众JSON：如 {"source":"channel_phone"} 取台账渠道手机号；或 fans_openid 直接推' placement="top">
                <span>受众规则<span style="color:#e6a23c;margin-left:2px;">!</span></span>
              </el-tooltip>
            </template>
          </el-table-column>
      <el-table-column label="是否启用" align="center" prop="enabled" show-overflow-tooltip min-width="110">
        <template #default="scope">
          <dict-tag :options="jonlink_enable_disable" :value="scope.row.enabled"/>
        </template>
      </el-table-column>
      <el-table-column label="排序" align="center" prop="sortOrder" show-overflow-tooltip min-width="100" />
      <el-table-column label="备注" align="center" prop="remark" show-overflow-tooltip min-width="100" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="170">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['wx:msgRule:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['wx:msgRule:remove']">删除</el-button>
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

    <!-- 添加或修改推送规则对话框 -->
    <el-dialog :title="title" v-model="open" width="760px" append-to-body>
      <el-form ref="msgRuleRef" :model="form" :rules="rules" label-width="110px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="规则编码" prop="ruleCode">
              <el-input v-model="form.ruleCode" placeholder="请输入规则编码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="规则名称" prop="ruleName">
              <el-input v-model="form.ruleName" placeholder="请输入规则名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模板ID" prop="templateId">
              <el-input v-model="form.templateId" placeholder="请输入模板ID" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item prop="contentRule">
              <template #label>
                <el-tooltip content='keyword占位符映射JSON：如 {"policyNo":"{保单号}","amount":"{金额}"}' placement="top">
                  <span>内容规则<span style="color:#e6a23c;margin-left:2px;">!</span></span>
                </el-tooltip>
              </template>
              <el-input v-model="form.contentRule" type="textarea" placeholder="请输入内容" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item prop="urlRule">
              <template #label>
                <el-tooltip content="跳转地址模板，可空；{ticket} 推送时自动替换为防伪凭证" placement="top">
                  <span>跳转地址<span style="color:#e6a23c;margin-left:2px;">!</span></span>
                </el-tooltip>
              </template>
              <el-input v-model="form.urlRule" type="textarea" placeholder="请输入内容" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="audienceRule">
              <template #label>
                <el-tooltip content='受众JSON：如 {"source":"channel_phone"} 取台账渠道手机号；或 fans_openid 直接推' placement="top">
                  <span>受众规则<span style="color:#e6a23c;margin-left:2px;">!</span></span>
                </el-tooltip>
              </template>
              <el-input v-model="form.audienceRule" placeholder='如 {"source":"channel_phone"} 取台账渠道手机号' />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否启用" prop="enabled">
              <el-input v-model="form.enabled" placeholder="请输入是否启用" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sortOrder">
              <el-input v-model="form.sortOrder" placeholder="请输入排序" />
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

<script setup lang="ts" name="MsgRule">
import type { WxMsgRule, MsgRuleQuejlParams } from "@/types/api/wx/msgRule"
import { listMsgRule, getMsgRule, delMsgRule, addMsgRule, updateMsgRule } from "@/api/wx/msgRule"

const { proxy } = getCurrentInstance()

const msgRuleList = ref<WxMsgRule[]>([])
const open = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const ids = ref<number[]>([])
const single = ref<boolean>(true)
const multiple = ref<boolean>(true)
const total = ref<number>(0)
const title = ref<string>("")

const data = reactive({
  form: {} as WxMsgRule,
  quejlParams: {
    pageNum: 1,
    pageSize: 10,
    ruleCode: undefined,
    bizType: undefined,
    enabled: undefined,
  } as MsgRuleQuejlParams,
  rules: {
    ruleCode: [
      { required: true, message: "规则编码不能为空", trigger: "blur" }
    ],
    ruleName: [
      { required: true, message: "规则名称不能为空", trigger: "blur" }
    ],
    bizType: [
      { required: true, message: "业务事件类型不能为空", trigger: "change" }
    ],
    templateId: [
      { required: true, message: "模板ID不能为空", trigger: "blur" }
    ],
    contentRule: [
      { required: true, message: "内容组装规则(JSON)：keyword占位符映射，如 {\"policyNo\":\"{保单号}\",\"amount\":\"{金额}\"}不能为空", trigger: "blur" }
    ],
    audienceRule: [
      { required: true, message: "受众规则(JSON)：如 {\"source\":\"channel_phone\"} 取台账渠道手机号；支持 fans_openid 直接推不能为空", trigger: "blur" }
    ],
  }
})

const { quejlParams, form, rules } = toRefs(data)

/** 查询推送规则列表 */
function getList() {
  loading.value = true
  listMsgRule(quejlParams.value).then(response => {
    msgRuleList.value = response.rows
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
    ruleCode: null,
    ruleName: null,
    bizType: null,
    templateId: null,
    contentRule: null,
    urlRule: null,
    audienceRule: null,
    enabled: null,
    sortOrder: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null
  }
  proxy.resetForm("msgRuleRef")
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
function handleSelectionChange(selection: WxMsgRule[]) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加推送规则"
}

/** 修改按钮操作 */
function handleUpdate(row: WxMsgRule) {
  reset()
  const _id = row.id || ids.value[0]
  getMsgRule(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改推送规则"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["msgRuleRef"].validate((valid: boolean) => {
    if (valid) {
      if (form.value.id != null) {
        updateMsgRule(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addMsgRule(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row: WxMsgRule) {
  const _ids = row.id || ids.value
  proxy.$modal.confirm('是否确认删除推送规则编号为"' + _ids + '"的数据项？').then(function() {
    return delMsgRule(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('wx/msgRule/export', {
    ...quejlParams.value
  }, `msgRule_${new Date().getTime()}.xlsx`)
}

getList()
</script>
