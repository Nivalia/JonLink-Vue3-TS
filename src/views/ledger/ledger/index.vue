<template>
  <div class="app-container">
    <el-form :model="quejlParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="日期" prop="ledgerDate">
        <el-date-picker clearable
          v-model="quejlParams.ledgerDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="渠道" prop="channelName">
        <el-input
          v-model="quejlParams.channelName"
          placeholder="请输入获客渠道/业务员"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="保单号" prop="policyNo">
        <el-input
          v-model="quejlParams.policyNo"
          placeholder="请输入保单号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="险别" prop="insuranceType">
        <el-select v-model="quejlParams.insuranceType" placeholder="请选择险别" clearable filterable>
          <el-option
            v-for="opt in insuranceTypeOptions"
            :key="opt"
            :label="opt"
            :value="opt"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="上游结费" prop="upSettleStatus">
        <el-select v-model="quejlParams.upSettleStatus" placeholder="请选择上游结费" clearable>
          <el-option
            v-for="dict in led_settle_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
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
          v-hasPermi="['ledger:ledger:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate()"
          v-hasPermi="['ledger:ledger:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete()"
          v-hasPermi="['ledger:ledger:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['ledger:ledger:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="ledgerList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="日期" align="center" prop="ledgerDate" show-overflow-tooltip min-width="110">
      <template #default="scope">
          <span>{{ parseTime(scope.row.ledgerDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
          <el-table-column label="渠道" align="center" prop="channelName" show-overflow-tooltip />
          <el-table-column label="保单号" align="center" prop="policyNo" show-overflow-tooltip />
          <el-table-column label="产品名称" align="center" prop="productName" show-overflow-tooltip />
          <el-table-column label="投保人" align="center" prop="applicant" show-overflow-tooltip />
          <el-table-column label="被保人" align="center" prop="insured" show-overflow-tooltip />
          <el-table-column label="保费" align="center" prop="premium" show-overflow-tooltip />
          <el-table-column label="是否含税" align="center" prop="taxFlag" show-overflow-tooltip />
          <el-table-column label="返利率" align="center" prop="upRate" show-overflow-tooltip />
          <el-table-column label="返利率" align="center" prop="downRate" show-overflow-tooltip />
          <el-table-column label="上游渠道" align="center" prop="upChannel" show-overflow-tooltip />
          <el-table-column label="下游佣金" align="center" prop="downCommission" show-overflow-tooltip />
          <el-table-column label="上游佣金" align="center" prop="upCommission" show-overflow-tooltip />
      <el-table-column label="净费" align="center" prop="netFee" show-overflow-tooltip>
      </el-table-column>
      <el-table-column label="利润" align="center" prop="profit" show-overflow-tooltip>
      </el-table-column>
      <el-table-column label="上游结费" align="center" prop="upSettleStatus" show-overflow-tooltip min-width="110">
      <template #default="scope">
          <dict-tag :options="led_settle_status" :value="scope.row.upSettleStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="下游结费" align="center" prop="downSettleStatus" show-overflow-tooltip min-width="110">
      <template #default="scope">
          <dict-tag :options="led_settle_status" :value="scope.row.downSettleStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="理赔备注" align="center" prop="claimRemark" show-overflow-tooltip />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="280">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['ledger:ledger:edit']">修改</el-button>
          <el-button link type="success" icon="Money" @click="handleSettle(scope.row, '0')" v-hasPermi="['led:settle:do']">上游结算</el-button>
          <el-button link type="warning" icon="Money" @click="handleSettle(scope.row, '1')" v-hasPermi="['led:settle:do']">下游结算</el-button>
          <el-button link type="success" icon="Document" @click="handleBook(scope.row)" v-hasPermi="['finance:ledgerBook:book']">记账</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['ledger:ledger:remove']">删除</el-button>
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

    <!-- 添加或修改保险台账对话框 -->
    <el-dialog :title="title" v-model="open" width="900px" append-to-body>
      <el-form ref="ledgerRef" :model="form" :rules="rules" label-width="110px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item prop="ledgerDate">

            <template #label>

              <el-tooltip content="自动=当日" placement="top">

                <span>日期<span style="color:#e6a23c;margin-left:2px;">!</span></span>

              </el-tooltip>

            </template>

              <el-date-picker clearable
                v-model="form.ledgerDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择日期">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="channelType">

            <template #label>

              <el-tooltip content="0自定义 1公众号粉丝 2系统业务员 3企业微信(预留)" placement="top">

                <span>渠道来源<span style="color:#e6a23c;margin-left:2px;">!</span></span>

              </el-tooltip>

            </template>

              <el-select v-model="form.channelType" placeholder="请选择渠道来源" clearable style="width: 100%" @change="handleChannelTypeChange">
                <el-option v-for="dict in wx_channel_type" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="channelRef">

            <template #label>

              <el-tooltip content="按type指向 wx_mp_user.id / sys_user.user_id" placement="top">

                <span>渠道关联ID<span style="color:#e6a23c;margin-left:2px;">!</span></span>

              </el-tooltip>

            </template>

              <el-select v-if="form.channelType === '1'" v-model="form.channelRef" placeholder="选择粉丝" clearable filterable style="width: 100%" @change="handleChannelRefChange">
                <el-option v-for="f in fanList" :key="f.id" :label="f.nickname || f.phone || f.openid" :value="f.id" />
              </el-select>
              <el-select v-else-if="form.channelType === '2'" v-model="form.channelRef" placeholder="选择渠道/业务员" clearable filterable style="width: 100%" @change="handleChannelRefChange">
                <el-option v-for="u in channelUserList" :key="u.id" :label="u.userName" :value="u.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="channelName">

            <template #label>

              <el-tooltip content="渠道名称自动带出" placement="top">

                <span>获客渠道/业务员<span style="color:#e6a23c;margin-left:2px;">!</span></span>

              </el-tooltip>

            </template>

              <el-input v-model="form.channelName" placeholder="选择渠道后自动带出" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="policyNo">

            <template #label>

              <el-tooltip content="手动填写, 可重复" placement="top">

                <span>保单号<span style="color:#e6a23c;margin-left:2px;">!</span></span>

              </el-tooltip>

            </template>

              <el-input v-model="form.policyNo" placeholder="请输入保单号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="productId">

            <template #label>

              <el-tooltip content="选产品联动带出" placement="top">

                <span>产品<span style="color:#e6a23c;margin-left:2px;">!</span></span>

              </el-tooltip>

            </template>

              <el-select v-model="form.productId" placeholder="请选择产品" clearable filterable style="width: 100%" @change="handleProductChange">
                <el-option v-for="p in productList" :key="p.id" :label="p.productName + ' (' + p.companyName + ' ' + p.typeName + ')'" :value="p.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="productName">

            <template #label>

              <el-tooltip content="产品带出" placement="top">

                <span>产品名称<span style="color:#e6a23c;margin-left:2px;">!</span></span>

              </el-tooltip>

            </template>

              <el-input v-model="form.productName" placeholder="请输入产品名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="insuranceCompany">

            <template #label>

              <el-tooltip content="产品带出" placement="top">

                <span>保险公司<span style="color:#e6a23c;margin-left:2px;">!</span></span>

              </el-tooltip>

            </template>

              <el-input v-model="form.insuranceCompany" placeholder="请输入保险公司" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="applicant">

            <template #label>

              <el-tooltip content="手动填写" placement="top">

                <span>投保人<span style="color:#e6a23c;margin-left:2px;">!</span></span>

              </el-tooltip>

            </template>

              <el-input v-model="form.applicant" placeholder="请输入投保人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="insured">

            <template #label>

              <el-tooltip content="手动填写" placement="top">

                <span>被保人<span style="color:#e6a23c;margin-left:2px;">!</span></span>

              </el-tooltip>

            </template>

              <el-input v-model="form.insured" placeholder="请输入被保人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="premium">

            <template #label>

              <el-tooltip content="手动填写" placement="top">

                <span>保费(¥)<span style="color:#e6a23c;margin-left:2px;">!</span></span>

              </el-tooltip>

            </template>

              <el-input v-model="form.premium" placeholder="请输入保费(¥)" @input="calcPreview" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="taxFlag">

            <template #label>

              <el-tooltip content="0否 1是, 产品带出" placement="top">

                <span>是否含税<span style="color:#e6a23c;margin-left:2px;">!</span></span>

              </el-tooltip>

            </template>

              <el-radio-group v-model="form.taxFlag" @change="calcPreview">
                <el-radio :label="'1'">是</el-radio>
                <el-radio :label="'0'">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="upRate">

            <template #label>

              <el-tooltip content="产品带出" placement="top">

                <span>上游返利%<span style="color:#e6a23c;margin-left:2px;">!</span></span>

              </el-tooltip>

            </template>

              <el-input v-model="form.upRate" placeholder="请输入上游返利%" @input="calcPreview" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="downRate">

            <template #label>

              <el-tooltip content="产品带出" placement="top">

                <span>下游返利%<span style="color:#e6a23c;margin-left:2px;">!</span></span>

              </el-tooltip>

            </template>

              <el-input v-model="form.downRate" placeholder="请输入下游返利%" @input="calcPreview" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="upChannel">

            <template #label>

              <el-tooltip content="产品带出" placement="top">

                <span>上游渠道商<span style="color:#e6a23c;margin-left:2px;">!</span></span>

              </el-tooltip>

            </template>

              <el-input v-model="form.upChannel" placeholder="请输入上游渠道商" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="downCommission">

            <template #label>

              <el-tooltip content="自动算" placement="top">

                <span>下游佣金<span style="color:#e6a23c;margin-left:2px;">!</span></span>

              </el-tooltip>

            </template>

              <el-input v-model="form.downCommission" disabled placeholder="自动计算" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="upCommission">

            <template #label>

              <el-tooltip content="自动算" placement="top">

                <span>上游税后佣金<span style="color:#e6a23c;margin-left:2px;">!</span></span>

              </el-tooltip>

            </template>

              <el-input v-model="form.upCommission" disabled placeholder="自动计算" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="netFee">

            <template #label>

              <el-tooltip content="自动算 = 保费-下游佣金" placement="top">

                <span>净费<span style="color:#e6a23c;margin-left:2px;">!</span></span>

              </el-tooltip>

            </template>

              <el-input v-model="form.netFee" disabled placeholder="自动计算 = 保费-下游佣金" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="profit">

            <template #label>

              <el-tooltip content="自动算 = 上游税后佣金-下游佣金" placement="top">

                <span>利润<span style="color:#e6a23c;margin-left:2px;">!</span></span>

              </el-tooltip>

            </template>

              <el-input v-model="form.profit" disabled placeholder="自动计算 = 上游税后佣金-下游佣金" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="upSettleStatus">

            <template #label>

              <el-tooltip content="0未结算 1已结算" placement="top">

                <span>上游结费<span style="color:#e6a23c;margin-left:2px;">!</span></span>

              </el-tooltip>

            </template>

              <el-radio-group v-model="form.upSettleStatus">
                <el-radio
                  v-for="dict in led_settle_status"
                  :key="dict.value"
                  :label="dict.value"
                >{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="downSettleStatus">

            <template #label>

              <el-tooltip content="0未结算 1已结算" placement="top">

                <span>下游结费<span style="color:#e6a23c;margin-left:2px;">!</span></span>

              </el-tooltip>

            </template>

              <el-radio-group v-model="form.downSettleStatus">
                <el-radio
                  v-for="dict in led_settle_status"
                  :key="dict.value"
                  :label="dict.value"
                >{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="理赔备注" prop="claimRemark">
              <el-input v-model="form.claimRemark" type="textarea" placeholder="请输入理赔备注信息" />
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

<script setup lang="ts" name="Ledger">
import type { JonlinkInsuranceLedger, LedgerQuejlParams } from "@/types/api/ledger/ledger"
import { listLedger, getLedger, delLedger, addLedger, updateLedger } from "@/api/ledger/ledger"
import { bookLedger, listLedgerBook } from "@/api/finance/ledgerBook"
import { listProduct } from "@/api/ledger/product"
import { listChannelUserOptions } from "@/api/ledger/channelUser"
import request from "@/utils/request"
import { parseTime } from "@/utils/jonlink"

const { proxy } = getCurrentInstance()
const { led_settle_status, wx_channel_type } = useDict('led_settle_status', 'wx_channel_type')

const ledgerList = ref<JonlinkInsuranceLedger[]>([])
const productList = ref<any[]>([])
const fanList = ref<any[]>([])
const channelUserList = ref<any[]>([])
// 险别下拉(P2-1):从产品表去重
const insuranceTypeOptions = ref<string[]>([])
const open = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const ids = ref<number[]>([])
const single = ref<boolean>(true)
const multiple = ref<boolean>(true)
const total = ref<number>(0)
const title = ref<string>("")

const data = reactive({
  form: {} as JonlinkInsuranceLedger,
  quejlParams: {
    pageNum: 1,
    pageSize: 10,
    ledgerDate: undefined,
    channelName: undefined,
    policyNo: undefined,
    insuranceType: undefined,
    upSettleStatus: undefined,
  } as LedgerQuejlParams,
  rules: {
    ledgerDate: [
      { required: true, message: "日期不能为空", trigger: "blur" }
    ],
    channelType: [
      { required: true, message: "渠道来源不能为空", trigger: "change" }
    ],
    channelName: [
      { required: true, message: "获客渠道/业务员不能为空", trigger: "blur" }
    ],
    policyNo: [
      { required: true, message: "保单号不能为空", trigger: "blur" }
    ],
    applicant: [
      { required: true, message: "投保人不能为空", trigger: "blur" }
    ],
    insured: [
      { required: true, message: "被保人不能为空", trigger: "blur" }
    ],
    premium: [
      { required: true, message: "保费(¥)不能为空", trigger: "blur" }
    ],
    taxFlag: [
      { required: true, message: "是否含税不能为空", trigger: "blur" }
    ],
    upRate: [
      { required: true, message: "上游返利%不能为空", trigger: "blur" }
    ],
    downRate: [
      { required: true, message: "下游返利%不能为空", trigger: "blur" }
    ],
    upSettleStatus: [
      { required: true, message: "上游结费不能为空", trigger: "change" }
    ],
    downSettleStatus: [
      { required: true, message: "下游结费不能为空", trigger: "change" }
    ],
  }
})

const { quejlParams, form, rules } = toRefs(data)

/** 查询保险台账列表 */
function getList() {
  loading.value = true
  listLedger(quejlParams.value).then(response => {
    ledgerList.value = response.rows
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
    ledgerDate: parseTime(new Date(), '{y}-{m}-{d}'),
    channelType: null,
    channelRef: null,
    channelName: null,
    policyNo: null,
    productId: null,
    productName: null,
    insuranceType: null,
    insuranceCompany: null,
    applicant: null,
    insured: null,
    premium: null,
    taxFlag: null,
    upRate: null,
    downRate: null,
    upChannel: null,
    downCommission: null,
    upCommission: null,
    netFee: null,
    profit: null,
    upSettleStatus: null,
    downSettleStatus: null,
    upSettleNo: null,
    downSettleNo: null,
    remark: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  }
  proxy.resetForm("ledgerRef")
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
function handleSelectionChange(selection: JonlinkInsuranceLedger[]) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加保险台账"
}

/** 修改按钮操作 */
function handleUpdate(row: JonlinkInsuranceLedger) {
  reset()
  const _id = (row && row.id) || ids.value[0]
  getLedger(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改保险台账"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["ledgerRef"].validate((valid: boolean) => {
    if (valid) {
      if (form.value.id != null) {
        updateLedger(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addLedger(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row: JonlinkInsuranceLedger) {
  const _ids = (row && row.id) || ids.value
  proxy.$modal.confirm('是否确认删除保险台账编号为"' + _ids + '"的数据项？').then(function() {
    return delLedger(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功") }).catch((e: any) => { if (e && e.message && e.message !== "cancel") { proxy.$modal.msgError(e.message || "操作失败"); } })
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('ledger/ledger/export', {
    ...quejlParams.value
  }, `ledger_${new Date().getTime()}.xlsx`)
}


/** 加载产品列表(上架中) */
function loadProducts() {
  listProduct({ pageNum: 1, pageSize: 200, shelfStatus: '1' }).then(response => {
    productList.value = response.rows
    // P2-1:从产品表去重险别下拉
    const set = new Set<string>()
    for (const p of (response.rows || [])) {
      if (p.typeName) set.add(p.typeName)
    }
    insuranceTypeOptions.value = Array.from(set)
  })
}

/** 选产品联动带出: 产品名/险别/公司/返利/是否扣税/上游渠道 */
function handleProductChange(productId: number) {
  const p = productList.value.find(item => item.id === productId)
  if (!p) return
  form.value.productName = p.productName
  form.value.insuranceType = p.typeName
  form.value.insuranceCompany = p.companyName
  form.value.taxFlag = p.deductTax
  form.value.upRate = p.upRate
  form.value.downRate = p.downRate
  form.value.upChannel = p.upChannel
  calcPreview()
}

/** 渠道来源切换: 按类型加载粉丝/渠道业务员下拉(type=2 不再有自定义) */
function handleChannelTypeChange(val: any) {
  form.value.channelRef = null
  form.value.channelName = null
  if (val === '1') {
    request({ url: "/wx/user/list", method: "get", params: { pageNum: 1, pageSize: 200 } }).then((res: any) => {
      fanList.value = res.rows || []
    })
  } else if (val === '2') {
    listChannelUserOptions().then((res: any) => {
      channelUserList.value = res.data || res.rows || []
    })
  }
}

/** 渠道关联ID选中: 带出渠道/业务员名称 */
function handleChannelRefChange(val: any) {
  if (form.value.channelType === '1') {
    const f = fanList.value.find((x: any) => x.id === val)
    form.value.channelName = f ? (f.nickname || f.phone || f.openid) : null
  } else if (form.value.channelType === '2') {
    const u = channelUserList.value.find((x: any) => x.id === val)
    form.value.channelName = u ? u.userName : null
  }
}

/** 前端预览自动算(以服务端为准) */
function calcPreview() {
  const premium = Number(form.value.premium) || 0
  const upRate = Number(form.value.upRate) || 0
  const downRate = Number(form.value.downRate) || 0
  const tax = form.value.taxFlag === '1'
  let upCommission = premium * upRate / 100
  if (tax) upCommission = premium / 1.06 * upRate / 100
  const downCommission = premium * downRate / 100
  form.value.upCommission = Math.round(upCommission * 100) / 100
  form.value.downCommission = Math.round(downCommission * 100) / 100
  form.value.netFee = Math.round((premium - downCommission) * 100) / 100
  form.value.profit = Math.round((upCommission - downCommission) * 100) / 100
}

/** 结算(上游/下游) */
function handleSettle(row: JonlinkInsuranceLedger, direction: string) {
  const name = direction === '0' ? '上游' : '下游'
  proxy.$modal.confirm('确认对保单[' + ((row && row.policyNo) || '') + ']进行' + name + '结算？').then(function() {
    const url = direction === '0' ? '/ledger/settle/up' : '/ledger/settle/down'
    return request({
      url: url,
      method: 'post',
      data: { ledgerId: (row && row.id) || '' }
    })
  }).then((res: any) => {
    if (res.code === 200) {
      proxy.$modal.msgSuccess("结算成功: " + res.data.settleNo)
      getList()
    } else {
      proxy.$modal.msgError(res.msg)
    }
  }).catch((e: any) => { if (e && e.message && e.message !== "cancel") { proxy.$modal.msgError(e.message || "操作失败"); } })
}

/** 台账记账 */
function handleBook(row: JonlinkInsuranceLedger) {
  if (!row || !row.id) return
  proxy.$modal.confirm('确认对保单[' + (row.policyNo || '') + ']进行记账？').then(function() {
    const now = new Date()
    const periodCode = now.getFullYear().toString() + String(now.getMonth() + 1).padStart(2, '0')
    return bookLedger({
      templateCode: 'ledger_book',
      ledgerId: row.id,
      policyNo: row.policyNo,
      amountFieldMap: {
        premium: row.premium,
        up_commission: row.upCommission,
        down_commission: row.downCommission,
        net_fee: row.netFee,
        profit: row.profit
      },
      periodCode: periodCode,
      voucherDate: now.toISOString().slice(0, 10)
    })
  }).then((res: any) => {
    if (res.code === 200) {
      proxy.$modal.msgSuccess("记账成功，凭证号: " + (res.data?.voucherNo || ''))
    } else {
      proxy.$modal.msgError(res.msg)
    }
  }).catch((e: any) => { if (e && e.message && e.message !== "cancel") { proxy.$modal.msgError(e.message || "记账失败"); } })
}

loadProducts()
getList()
</script>
