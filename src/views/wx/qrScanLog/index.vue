<template>
  <div class="app-container">
    <el-form :model="quejlParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="状态" prop="bizType">
        <el-select v-model="quejlParams.bizType" placeholder="请选择0分销 1活动 2通知 3公告" clearable>
          <el-option
            v-for="dict in wx_qr_biz_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="openid" prop="openid">
        <el-input
          v-model="quejlParams.openid"
          placeholder="请输入扫码粉丝openid"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="扫码时间" prop="scanTime">
        <el-date-picker clearable
          v-model="quejlParams.scanTime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择扫码时间">
        </el-date-picker>
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
          v-hasPermi="['wx:qrScanLog:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate()"
          v-hasPermi="['wx:qrScanLog:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete()"
          v-hasPermi="['wx:qrScanLog:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['wx:qrScanLog:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="qrScanLogList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键" align="center" prop="id" show-overflow-tooltip min-width="100" />
      <el-table-column label="scene" align="center" prop="sceneId" show-overflow-tooltip min-width="100" />
      <el-table-column label="状态" align="center" prop="bizType" show-overflow-tooltip min-width="110">
        <template #default="scope">
          <dict-tag :options="wx_qr_biz_type" :value="scope.row.bizType"/>
        </template>
      </el-table-column>
      <el-table-column label="场景串" align="center" prop="sceneStr" show-overflow-tooltip min-width="100" />
      <el-table-column label="openid" align="center" prop="openid" show-overflow-tooltip min-width="100" />
      <el-table-column label="新关注" align="center" prop="isNewFollow" show-overflow-tooltip min-width="110">
        <template #default="scope">
          <dict-tag :options="wx_scan_is_new" :value="scope.row.isNewFollow"/>
        </template>
      </el-table-column>
      <el-table-column label="扫码时间" align="center" prop="scanTime" show-overflow-tooltip min-width="110">
        <template #default="scope">
          <span>{{ parseTime(scope.row.scanTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" show-overflow-tooltip min-width="100" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="170">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['wx:qrScanLog:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['wx:qrScanLog:remove']">删除</el-button>
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

    <!-- 添加或修改扫码日志对话框 -->
    <el-dialog :title="title" v-model="open" width="760px" append-to-body>
      <el-form ref="qrScanLogRef" :model="form" :rules="rules" label-width="110px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="scene" prop="sceneId">
              <el-input v-model="form.sceneId" placeholder="请输入scene值" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="bizType">
              <el-select v-model="form.bizType" placeholder="请选择0分销 1活动 2通知 3公告">
                <el-option
                  v-for="dict in wx_qr_biz_type"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="场景串" prop="sceneStr">
              <el-input v-model="form.sceneStr" placeholder="请输入场景串(临时码)" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="openid" prop="openid">
              <el-input v-model="form.openid" placeholder="请输入扫码粉丝openid" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="新关注" prop="isNewFollow">
              <el-select v-model="form.isNewFollow" placeholder="请选择" style="width:100%">
                <el-option v-for="dict in wx_scan_is_new" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="扫码时间" prop="scanTime">
              <el-date-picker clearable
                v-model="form.scanTime"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择扫码时间">
              </el-date-picker>
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

<script setup lang="ts" name="QrScanLog">
import type { WxQrScanLog, QrScanLogQuejlParams } from "@/types/api/wx/qrScanLog"
import { listQrScanLog, getQrScanLog, delQrScanLog, addQrScanLog, updateQrScanLog } from "@/api/wx/qrScanLog"
import { finDict } from '@/utils/financeDict'

const { proxy } = getCurrentInstance()
const { wx_qr_biz_type, wx_scan_is_new } = useDict('wx_qr_biz_type', 'wx_scan_is_new')

const qrScanLogList = ref<WxQrScanLog[]>([])
const open = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const ids = ref<number[]>([])
const single = ref<boolean>(true)
const multiple = ref<boolean>(true)
const total = ref<number>(0)
const title = ref<string>("")

const data = reactive({
  form: {} as WxQrScanLog,
  quejlParams: {
    pageNum: 1,
    pageSize: 10,
    bizType: undefined,
    openid: undefined,
    scanTime: undefined,
  } as QrScanLogQuejlParams,
  rules: {
    sceneId: [
      { required: true, message: "scene值不能为空", trigger: "blur" }
    ],
    bizType: [
      { required: true, message: "0分销 1活动 2通知 3公告不能为空", trigger: "change" }
    ],
    openid: [
      { required: true, message: "扫码粉丝openid不能为空", trigger: "blur" }
    ],
    isNewFollow: [
      { required: true, message: "是否本次扫码新关注 0否 1是不能为空", trigger: "blur" }
    ],
    scanTime: [
      { required: true, message: "扫码时间不能为空", trigger: "blur" }
    ],
  }
})

const { quejlParams, form, rules } = toRefs(data)

/** 查询扫码日志列表 */
function getList() {
  loading.value = true
  listQrScanLog(quejlParams.value).then(response => {
    qrScanLogList.value = response.rows
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
    sceneId: null,
    bizType: null,
    sceneStr: null,
    openid: null,
    isNewFollow: null,
    scanTime: null,
    remark: null
  }
  proxy.resetForm("qrScanLogRef")
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
function handleSelectionChange(selection: WxQrScanLog[]) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加扫码日志"
}

/** 修改按钮操作 */
function handleUpdate(row: WxQrScanLog) {
  reset()
  const _id = (row && row.id) || ids.value[0]
  getQrScanLog(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改扫码日志"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["qrScanLogRef"].validate((valid: boolean) => {
    if (valid) {
      if (form.value.id != null) {
        updateQrScanLog(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addQrScanLog(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row: WxQrScanLog) {
  const _ids = (row && row.id) || ids.value
  proxy.$modal.confirm('是否确认删除扫码日志编号为"' + _ids + '"的数据项？').then(function() {
    return delQrScanLog(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功") }).catch((e: any) => { if (e && e.message && e.message !== "cancel") { proxy.$modal.msgError(e.message || "操作失败"); } })
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('wx/qrScanLog/export', {
    ...quejlParams.value
  }, `qrScanLog_${new Date().getTime()}.xlsx`)
}

getList()
</script>
