<template>
  <div class="app-container">
    <el-form :model="quejlParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="类型" prop="ledgerType">
        <el-select v-model="quejlParams.ledgerType" placeholder="请选择类型 1核销 2分销积分 3模板推送 4扫码 5粉丝绑定 6手动调整" clearable>
          <el-option
            v-for="dict in wx_ledger_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input
          v-model="quejlParams.phone"
          placeholder="请输入客户手机号"
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
          v-hasPermi="['ledger:wxLedgerItem:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate()"
          v-hasPermi="['ledger:wxLedgerItem:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete()"
          v-hasPermi="['ledger:wxLedgerItem:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['ledger:wxLedgerItem:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="wxLedgerItemList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键" align="center" prop="id" show-overflow-tooltip min-width="100" />
      <el-table-column label="流水号" align="center" prop="ledgerNo" show-overflow-tooltip min-width="100" />
      <el-table-column label="类型" align="center" prop="ledgerType" show-overflow-tooltip min-width="110">
        <template #default="scope">
          <dict-tag :options="wx_ledger_type" :value="scope.row.ledgerType"/>
        </template>
      </el-table-column>
      <el-table-column label="关联单号" align="center" prop="bizNo" show-overflow-tooltip min-width="100" />
      <el-table-column label="手机号" align="center" prop="phone" show-overflow-tooltip min-width="100" />
      <el-table-column label="openid" align="center" prop="openid" show-overflow-tooltip min-width="100" />
      <el-table-column label="流水金额" align="center" prop="amount" show-overflow-tooltip min-width="100" />
      <el-table-column label="流水分值" align="center" prop="points" show-overflow-tooltip min-width="100" />
      <el-table-column label="方向" align="center" prop="direction" show-overflow-tooltip min-width="100" />
      <el-table-column label="经办人" align="center" prop="bizUser" show-overflow-tooltip min-width="100" />
      <el-table-column label="状态" align="center" prop="status" show-overflow-tooltip min-width="100" />
      <el-table-column label="业务时间" align="center" prop="occurredTime" show-overflow-tooltip min-width="110">
        <template #default="scope">
          <span>{{ parseTime(scope.row.occurredTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" show-overflow-tooltip min-width="100" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="230">
        <template #default="scope">
          <el-button link type="primary" icon="RefreshLeft" @click="handleReverse(scope.row)" v-hasPermi="['ledger:wxLedgerItem:add']">冲正</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['ledger:wxLedgerItem:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['ledger:wxLedgerItem:remove']">删除</el-button>
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

    <!-- 添加或修改电子台账流水对话框 -->
    <el-dialog :title="title" v-model="open" width="900px" append-to-body>
      <el-form ref="wxLedgerItemRef" :model="form" :rules="rules" label-width="110px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="流水号" prop="ledgerNo">
              <el-input v-model="form.ledgerNo" placeholder="请输入台账流水号(唯一)" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="类型" prop="ledgerType">
              <el-select v-model="form.ledgerType" placeholder="请选择类型 1核销 2分销积分 3模板推送 4扫码 5粉丝绑定 6手动调整">
                <el-option
                  v-for="dict in wx_ledger_type"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="关联单号" prop="bizNo">
              <el-input v-model="form.bizNo" placeholder="请输入关联业务单号(订单号/佣金单/批次号/scene)" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入客户手机号" />
              <el-alert v-if="phoneDuplicate" title="该手机号已有流水记录" type="warning" show-icon style="margin-top:4px" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="openid" prop="openid">
              <el-input v-model="form.openid" placeholder="请输入客户openid" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="流水金额" prop="amount">
              <el-input v-model="form.amount" placeholder="请输入流水金额(佣金等)" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="流水分值" prop="points">
              <el-input v-model="form.points" placeholder="请输入流水分值(积分入账=amount)" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="方向" prop="direction">
              <el-select v-model="form.direction" placeholder="请选择方向" style="width:100%">
                <el-option v-for="dict in wx_ledger_direction" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
              <div v-if="directionHint" style="font-size:12px;color:#e6a23c;margin-top:4px">{{ directionHint }}</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="经办人" prop="bizUser">
              <el-input v-model="form.bizUser" placeholder="请输入经办人(手动调整时; 自动=SYSTEM)" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="业务时间" prop="occurredTime">
              <el-date-picker clearable
                v-model="form.occurredTime"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择业务发生时间(核销/发送/扫码时刻)">
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
          <el-button type="primary" :disabled="phoneDuplicate" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="WxLedgerItem">
import { ref, reactive, onMounted, watch } from 'vue'
import type { WxLedgerItem, WxLedgerItemQuejlParams } from "@/types/api/ledger/wxLedgerItem"
import { listWxLedgerItem, getWxLedgerItem, delWxLedgerItem, addWxLedgerItem, updateWxLedgerItem } from "@/api/ledger/wxLedgerItem"
import request from "@/utils/request"
import { finDict } from '@/utils/financeDict'

const { proxy } = getCurrentInstance()
const { wx_ledger_type, wx_ledger_direction } = useDict('wx_ledger_type', 'wx_ledger_direction')

const wxLedgerItemList = ref<WxLedgerItem[]>([])
const open = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const ids = ref<number[]>([])
const single = ref<boolean>(true)
const multiple = ref<boolean>(true)
const total = ref<number>(0)
const title = ref<string>("")

const data = reactive({
  form: {} as WxLedgerItem,
  quejlParams: {
    pageNum: 1,
    pageSize: 10,
    ledgerType: undefined,
    phone: undefined,
  } as WxLedgerItemQuejlParams,
  rules: {
    ledgerNo: [
      { required: true, message: "台账流水号(唯一)不能为空", trigger: "blur" }
    ],
    ledgerType: [
      { required: true, message: "类型 1核销 2分销积分 3模板推送 4扫码 5粉丝绑定 6手动调整不能为空", trigger: "change" }
    ],
    bizNo: [
      { required: true, message: "关联业务单号(订单号/佣金单/批次号/scene)不能为空", trigger: "blur" }
    ],
    amount: [
      { required: true, message: "流水金额(佣金等)不能为空", trigger: "blur" }
    ],
    points: [
      { required: true, message: "流水分值(积分入账=amount)不能为空", trigger: "blur" }
    ],
    direction: [
      { required: true, message: "方向 0流出 1流入 2中性(核销/推送)不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "0作废 1有效不能为空", trigger: "change" }
    ],
    occurredTime: [
      { required: true, message: "业务发生时间(核销/发送/扫码时刻)不能为空", trigger: "blur" }
    ],
  }
})

const { quejlParams, form, rules } = toRefs(data)

// 类型→方向自动推断
const directionHint = computed(() => {
  const typeMap: Record<string, string> = {
    '1': '核销→方向建议中性(2)',
    '2': '分销积分→方向建议流入(1)',
    '3': '模板推送→方向建议中性(2)',
    '4': '扫码→方向建议流入(1)',
    '5': '粉丝绑定→方向建议中性(2)',
    '6': '手动调整→需手动选择方向'
  }
  return typeMap[form.value.ledgerType] || ''
})

// 手机号重复校验
const phoneDuplicate = ref(false)
async function checkPhoneDuplicate() {
  if (!form.value.phone) { phoneDuplicate.value = false; return }
  try {
    const r: any = await request({
      url: '/ledger/wxLedgerItem/list',
      method: 'get',
      params: { phone: form.value.phone, pageNum: 1, pageSize: 100 }
    })
    const exists = (r.rows || []).some((item: any) =>
      item.phone === form.value.phone && item.id !== form.value.id
    )
    phoneDuplicate.value = exists
  } catch { phoneDuplicate.value = false }
}

// 类型变化→自动带出方向、金额符号
watch(() => form.value.ledgerType, (val) => {
  if (val === '1' || val === '3' || val === '5') {
    form.value.direction = '2' // 中性
  } else if (val === '2' || val === '4') {
    form.value.direction = '1' // 流入
  }
  form.value.points = form.value.amount // 积分默认=金额
})

// 手机号变化→校验重复
watch(() => form.value.phone, () => { checkPhoneDuplicate() })

/** 查询电子台账流水列表 */
function getList() {
  loading.value = true
  listWxLedgerItem(quejlParams.value).then(response => {
    wxLedgerItemList.value = response.rows
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
    ledgerNo: null,
    ledgerType: null,
    bizNo: null,
    phone: null,
    openid: null,
    amount: null,
    points: null,
    direction: null,
    bizUser: null,
    status: null,
    occurredTime: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null
  }
  proxy.resetForm("wxLedgerItemRef")
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
function handleSelectionChange(selection: WxLedgerItem[]) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加电子台账流水"
}

/** 修改按钮操作 */
function handleUpdate(row: WxLedgerItem) {
  reset()
  const _id = (row && row.id) || ids.value[0]
  getWxLedgerItem(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改电子台账流水"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["wxLedgerItemRef"].validate((valid: boolean) => {
    if (valid) {
      if (form.value.id != null) {
        updateWxLedgerItem(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addWxLedgerItem(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row: WxLedgerItem) {
  const _ids = (row && row.id) || ids.value
  proxy.$modal.confirm('是否确认删除电子台账流水编号为"' + _ids + '"的数据项？').then(function() {
    return delWxLedgerItem(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功") }).catch((e: any) => { if (e && e.message && e.message !== "cancel") { proxy.$modal.msgError(e.message || "操作失败"); } })
}

/** 冲正: 生成反向流水(类型6) */
function handleReverse(row: WxLedgerItem) {
  proxy.$modal.confirm('确认冲正该流水？将生成一条金额相反的冲正记录(原流水保留)。').then(function() {
    return request({
      url: '/ledger/wxLedgerItem/reverse/' + ((row && row.id) || ''),
      method: 'post'
    })
  }).then((res: any) => {
    if (res.code === 200) {
      proxy.$modal.msgSuccess(res.msg || "冲正成功")
      getList()
    } else {
      proxy.$modal.msgError(res.msg)
    }
  }).catch((e: any) => { if (e && e.message && e.message !== "cancel") { proxy.$modal.msgError(e.message || "操作失败"); } })
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('ledger/wxLedgerItem/export', {
    ...quejlParams.value
  }, `wxLedgerItem_${new Date().getTime()}.xlsx`)
}

getList()
</script>
