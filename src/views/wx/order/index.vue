<template>
  <div class="app-container">
    <el-form :model="quejlParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="手机号" prop="phone">
        <el-input
          v-model="quejlParams.phone"
          placeholder="请输入手机号(与粉丝表关联,索引)"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="结算状态" prop="status">
        <el-select v-model="quejlParams.status" placeholder="请选择结算状态 0未结算 1已结算" clearable>
          <el-option
            v-for="dict in wx_biz_order_status"
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
          v-hasPermi="['wx:order:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['wx:order:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['wx:order:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['wx:order:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="orderList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键" align="center" prop="id" show-overflow-tooltip min-width="100" />
      <el-table-column label="订单号" align="center" prop="orderNo" show-overflow-tooltip min-width="100" />
      <el-table-column label="手机号" align="center" prop="phone" show-overflow-tooltip min-width="100" />
      <el-table-column label="客户名称" align="center" prop="customerName" show-overflow-tooltip min-width="100" />
      <el-table-column label="项目类型" align="center" prop="serviceType" show-overflow-tooltip min-width="100" />
      <el-table-column label="车牌号" align="center" prop="carNo" show-overflow-tooltip min-width="100" />
      <el-table-column label="佣金/金额" align="center" prop="amount" show-overflow-tooltip min-width="100" />
      <el-table-column label="类型" align="center" prop="orderType" show-overflow-tooltip min-width="100" />
      <el-table-column label="结算状态" align="center" prop="status" show-overflow-tooltip min-width="110">
        <template #default="scope">
          <dict-tag :options="wx_biz_order_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="核销状态" align="center" prop="verifyStatus" show-overflow-tooltip min-width="100" />
      <el-table-column label="核销时间" align="center" prop="verifyTime" show-overflow-tooltip min-width="110">
        <template #default="scope">
          <span>{{ parseTime(scope.row.verifyTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="核销结果" align="center" prop="verifyMsg" show-overflow-tooltip min-width="100" />
      <el-table-column label="扩展字段" align="center" prop="extJson" show-overflow-tooltip min-width="100" />
      <el-table-column label="备注" align="center" prop="remark" show-overflow-tooltip min-width="100" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="220">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['wx:order:edit']">修改</el-button>
          <el-button link type="success" icon="CircleCheck" @click="handleVerify(scope.row)" v-hasPermi="['wx:order:verify']">核销</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['wx:order:remove']">删除</el-button>
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

    <!-- 添加或修改核销管理对话框 -->
    <el-dialog :title="title" v-model="open" width="760px" append-to-body>
      <el-form ref="orderRef" :model="form" :rules="rules" label-width="110px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="订单号" prop="orderNo">
              <el-input v-model="form.orderNo" placeholder="请输入订单号(唯一)" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入手机号(与粉丝表关联,索引)" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户名称" prop="customerName">
              <el-input v-model="form.customerName" placeholder="请输入客户名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="车牌号" prop="carNo">
              <el-input v-model="form.carNo" placeholder="请输入车牌号(核销要素)" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="佣金/金额" prop="amount">
              <el-input v-model="form.amount" placeholder="请输入佣金/金额(核销要素)" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结算状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in wx_biz_order_status"
                  :key="dict.value"
                  :label="dict.value"
                >{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="核销时间" prop="verifyTime">
              <el-date-picker clearable
                v-model="form.verifyTime"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择核销时间">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="核销结果" prop="verifyMsg">
              <el-input v-model="form.verifyMsg" type="textarea" placeholder="请输入内容" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="扩展字段" prop="extJson">
              <el-input v-model="form.extJson" type="textarea" placeholder="请输入内容" />
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

    <!-- 订单核销对话框 -->
    <el-dialog title="订单核销" v-model="verifyOpen" width="480px" append-to-body>
      <el-form ref="verifyRef" :model="verifyForm" :rules="verifyRules" label-width="110px">
        <el-form-item label="订单号" prop="orderNo">
          <el-input v-model="verifyForm.orderNo" disabled placeholder="订单号(核销要素)" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="verifyForm.phone" placeholder="手机号(与粉丝表匹配)" />
        </el-form-item>
        <el-form-item label="车牌号" prop="carNo">
          <el-input v-model="verifyForm.carNo" placeholder="车牌号(核销要素)" />
        </el-form-item>
        <el-form-item label="金额" prop="amount">
          <el-input v-model="verifyForm.amount" placeholder="金额(核销要素)" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitVerify">确认核销</el-button>
          <el-button @click="verifyOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="Order">
import type { WxBizOrder, OrderQuejlParams } from "@/types/api/wx/order"
import { listOrder, getOrder, delOrder, addOrder, updateOrder, verifyOrder } from "@/api/wx/order"

const { proxy } = getCurrentInstance()
const { wx_biz_order_status } = useDict('wx_biz_order_status')

const orderList = ref<WxBizOrder[]>([])
const open = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const ids = ref<number[]>([])
const single = ref<boolean>(true)
const multiple = ref<boolean>(true)
const total = ref<number>(0)
const title = ref<string>("")
const verifyOpen = ref<boolean>(false)
const verifyForm = ref({
  orderNo: null as string | null,
  phone: null as string | null,
  carNo: null as string | null,
  amount: null as number | null
})
const verifyRules = {
  orderNo: [
    { required: true, message: "订单号不能为空", trigger: "blur" }
  ]
}

const data = reactive({
  form: {} as WxBizOrder,
  quejlParams: {
    pageNum: 1,
    pageSize: 10,
    phone: undefined,
    status: undefined,
  } as OrderQuejlParams,
  rules: {
    orderNo: [
      { required: true, message: "订单号(唯一)不能为空", trigger: "blur" }
    ],
    phone: [
      { required: true, message: "手机号(与粉丝表关联,索引)不能为空", trigger: "blur" }
    ],
    amount: [
      { required: true, message: "佣金/金额(核销要素)不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "结算状态 0未结算 1已结算不能为空", trigger: "change" }
    ],
    verifyStatus: [
      { required: true, message: "核销状态(模板推送校验) 0未核销 1已核销不能为空", trigger: "change" }
    ],
  }
})

const { quejlParams, form, rules } = toRefs(data)

/** 查询核销管理列表 */
function getList() {
  loading.value = true
  listOrder(quejlParams.value).then(response => {
    orderList.value = response.rows
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
    orderNo: null,
    phone: null,
    customerName: null,
    serviceType: null,
    carNo: null,
    amount: null,
    orderType: null,
    status: null,
    verifyStatus: null,
    verifyTime: null,
    verifyMsg: null,
    extJson: null,
    remark: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  }
  proxy.resetForm("orderRef")
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
function handleSelectionChange(selection: WxBizOrder[]) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加核销管理"
}

/** 修改按钮操作 */
function handleUpdate(row: WxBizOrder) {
  reset()
  const _id = row.id || ids.value[0]
  getOrder(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改核销管理"
  })
}

/** 核销按钮操作 */
function handleVerify(row: WxBizOrder) {
  verifyForm.value = {
    orderNo: row.orderNo || null,
    phone: row.phone || null,
    carNo: row.carNo || null,
    amount: row.amount != null ? row.amount : null
  }
  verifyOpen.value = true
}

/** 确认核销 */
function submitVerify() {
  proxy.$refs["verifyRef"].validate((valid: boolean) => {
    if (valid) {
      proxy.$modal.confirm('确认对订单 "' + verifyForm.value.orderNo + '" 执行核销？').then(function() {
        return verifyOrder(verifyForm.value)
      }).then(res => {
        if (res.code === 200) {
          proxy.$modal.msgSuccess("核销成功")
          verifyOpen.value = false
          getList()
        } else {
          proxy.$modal.msgError(res.msg || "核销失败")
        }
      }).catch(() => {})
    }
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["orderRef"].validate((valid: boolean) => {
    if (valid) {
      if (form.value.id != null) {
        updateOrder(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addOrder(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row: WxBizOrder) {
  const _ids = row.id || ids.value
  proxy.$modal.confirm('是否确认删除核销管理编号为"' + _ids + '"的数据项？').then(function() {
    return delOrder(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('wx/order/export', {
    ...quejlParams.value
  }, `order_${new Date().getTime()}.xlsx`)
}

getList()
</script>
