<template>
  <div class="app-container">
    <el-form :model="quejlParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="产品名称" prop="productName">
        <el-input
          v-model="quejlParams.productName"
          placeholder="请输入产品名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="险别ID" prop="typeId">
        <el-input
          v-model="quejlParams.typeId"
          placeholder="请输入险别ID(引用)"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="上下架" prop="shelfStatus">
        <el-select v-model="quejlParams.shelfStatus" placeholder="请选择上下架 0下架 1上架" clearable>
          <el-option
            v-for="dict in led_shelf_status"
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
          v-hasPermi="['ledger:product:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate()"
          v-hasPermi="['ledger:product:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete()"
          v-hasPermi="['ledger:product:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['ledger:product:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="productList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="产品名称" align="center" prop="productName" show-overflow-tooltip min-width="180" />
      <el-table-column label="保险公司" align="center" prop="companyName" show-overflow-tooltip min-width="100" />
      <el-table-column label="负责人" align="center" prop="contactName" show-overflow-tooltip min-width="100" />
      <el-table-column label="联系电话" align="center" prop="contactPhone" show-overflow-tooltip min-width="110" />
      <el-table-column label="险别" align="center" prop="typeName" show-overflow-tooltip min-width="100" />
      <el-table-column label="上游渠道" align="center" prop="upChannel" show-overflow-tooltip min-width="100" />
      <el-table-column label="返利率" align="center" prop="upRate" show-overflow-tooltip min-width="100" />
      <el-table-column label="返利率" align="center" prop="downRate" show-overflow-tooltip min-width="100" />
      <el-table-column label="政策类型" align="center" prop="policyType" show-overflow-tooltip min-width="100">
        <template #default="scope">
          <span>{{ scope.row.policyType === '0' ? '上游政策' : scope.row.policyType === '1' ? '下游政策' : scope.row.policyType }}</span>
        </template>
      </el-table-column>
      <el-table-column label="是否扣税" align="center" prop="deductTax" show-overflow-tooltip min-width="110">
        <template #default="scope">
          <dict-tag :options="led_yes_no" :value="scope.row.deductTax"/>
        </template>
      </el-table-column>
      <el-table-column label="上下架" align="center" prop="shelfStatus" show-overflow-tooltip min-width="110">
        <template #default="scope">
          <dict-tag :options="led_shelf_status" :value="scope.row.shelfStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" show-overflow-tooltip min-width="320" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="280">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['ledger:product:edit']">修改</el-button>
          <el-button link type="success" icon="Top" @click="handleShelf(scope.row, '1')" v-if="scope.row.shelfStatus === '0'" v-hasPermi="['ledger:product:shelf']">上架</el-button>
          <el-button link type="warning" icon="Bottom" @click="handleShelf(scope.row, '0')" v-if="scope.row.shelfStatus === '1'" v-hasPermi="['ledger:product:shelf']">下架</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['ledger:product:remove']">删除</el-button>
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

    <!-- 添加或修改产品管理对话框 -->
    <el-dialog :title="title" v-model="open" width="820px" append-to-body>
      <el-form ref="productRef" :model="form" :rules="rules" label-width="110px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="产品名称" prop="productName">
              <el-input v-model="form.productName" placeholder="请输入产品名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="保险公司" prop="companyId">
              <el-select v-model="form.companyId" placeholder="请选择保险公司" clearable filterable style="width: 100%" @change="handleCompanyChange">
                <el-option v-for="c in companyList" :key="c.id" :label="c.companyName" :value="c.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="险别" prop="typeId">
              <el-select v-model="form.typeId" placeholder="请选择险别" clearable filterable style="width: 100%" @change="handleTypeChange">
                <el-option v-for="t in typeList" :key="t.id" :label="t.typeName" :value="t.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人" prop="contactId">
              <el-select v-model="form.contactId" placeholder="请选择联系人" clearable filterable style="width: 100%" @change="handleContactChange">
                <el-option v-for="c in contactList" :key="c.id" :label="c.contactName" :value="c.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="contactPhone">
              <el-input v-model="form.contactPhone" placeholder="联系人带出" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="上游渠道" prop="channelId">
              <el-select v-model="form.channelId" placeholder="请选择上游渠道商" clearable filterable style="width: 100%" @change="handleChannelChange">
                <el-option v-for="ch in channelOptions" :key="ch.id" :label="ch.channelName" :value="ch.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="返利率" prop="upRate">
              <el-input v-model="form.upRate" placeholder="请输入上游专属返利%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="返利率" prop="downRate">
              <el-input v-model="form.downRate" placeholder="请输入下游专属返利%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="政策类型" prop="policyType">
              <el-radio-group v-model="form.policyType">
                <el-radio label="0">上游政策</el-radio>
                <el-radio label="1">下游政策</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否扣税" prop="deductTax">
              <el-radio-group v-model="form.deductTax">
                <el-radio v-for="dict in led_yes_no" :key="dict.value" :label="dict.value">{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="上下架" prop="shelfStatus">
              <el-radio-group v-model="form.shelfStatus">
                <el-radio v-for="dict in led_shelf_status" :key="dict.value" :label="dict.value">{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input v-model="form.sort" placeholder="请输入排序" />
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

<script setup lang="ts" name="Product">
import type { JonlinkProduct, ProductQuejlParams } from "@/types/api/ledger/product"
import { listProduct, getProduct, delProduct, addProduct, updateProduct } from "@/api/ledger/product"
import { listChannelOptions } from "@/api/ledger/channel"
import request from "@/utils/request"

const { proxy } = getCurrentInstance()
const { led_shelf_status, led_yes_no } = useDict('led_shelf_status', 'led_yes_no')

const productList = ref<JonlinkProduct[]>([])
const companyList = ref<any[]>([])
const typeList = ref<any[]>([])
const contactList = ref<any[]>([])
const channelOptions = ref<any[]>([])
const open = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const ids = ref<number[]>([])
const single = ref<boolean>(true)
const multiple = ref<boolean>(true)
const total = ref<number>(0)
const title = ref<string>("")

const data = reactive({
  form: {} as JonlinkProduct,
  quejlParams: {
    pageNum: 1,
    pageSize: 10,
    productName: undefined,
    typeId: undefined,
    shelfStatus: undefined,
  } as ProductQuejlParams,
  rules: {
    productName: [
      { required: true, message: "产品名称不能为空", trigger: "blur" }
    ],
    companyId: [
      { required: true, message: "保险公司ID(引用)不能为空", trigger: "blur" }
    ],
    upRate: [
      { required: true, message: "上游专属返利%不能为空", trigger: "blur" }
    ],
    downRate: [
      { required: true, message: "下游专属返利%不能为空", trigger: "blur" }
    ],
    policyType: [
      { required: true, message: "政策类型不能为空", trigger: "change" }
    ],
    deductTax: [
      { required: true, message: "是否扣税 0否 1是(保费/1.06计算)不能为空", trigger: "blur" }
    ],
    shelfStatus: [
      { required: true, message: "上下架 0下架 1上架不能为空", trigger: "change" }
    ],
    sort: [
      { required: true, message: "排序不能为空", trigger: "blur" }
    ],
  }
})

const { quejlParams, form, rules } = toRefs(data)

/** 查询产品管理列表 */
function getList() {
  loading.value = true
  listProduct(quejlParams.value).then(response => {
    productList.value = response.rows
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
    productName: null,
    companyId: null,
    companyName: null,
    contactId: null,
    contactName: null,
    contactPhone: null,
    typeId: null,
    typeName: null,
    channelId: null,
    channelName: null,
    upChannel: null,
    upRate: null,
    downRate: null,
    policyType: "0",
    deductTax: null,
    shelfStatus: null,
    sort: null,
    remark: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  }
  proxy.resetForm("productRef")
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
function handleSelectionChange(selection: JonlinkProduct[]) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  loadSelectData()
  open.value = true
  title.value = "添加产品管理"
}

/** 修改按钮操作 */
function handleUpdate(row: JonlinkProduct) {
  reset()
  loadSelectData()
  const _id = (row && row.id) || ids.value[0]
  getProduct(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改产品管理"
  })
}

/** 加载弹窗下拉数据源：保险公司/险别/联系人 */
function loadSelectData() {
  request({ url: "/ledger/company/list", method: "get", params: { pageNum: 1, pageSize: 200 } }).then((res: any) => {
    companyList.value = res.rows || []
  })
  request({ url: "/ledger/insuranceType/list", method: "get", params: { pageNum: 1, pageSize: 200 } }).then((res: any) => {
    typeList.value = res.rows || []
  })
  request({ url: "/ledger/contact/list", method: "get", params: { pageNum: 1, pageSize: 200 } }).then((res: any) => {
    contactList.value = res.rows || []
  })
}

/** 保险公司联动：带出名称 */
function handleCompanyChange(val: any) {
  const c = companyList.value.find((x: any) => x.id === val)
  form.value.companyName = c ? c.companyName : null
}

/** 险别联动：带出名称 */
function handleTypeChange(val: any) {
  const t = typeList.value.find((x: any) => x.id === val)
  form.value.typeName = t ? t.typeName : null
}

/** 联系人联动：带出姓名+电话 */
function handleContactChange(val: any) {
  const c = contactList.value.find((x: any) => x.id === val)
  form.value.contactName = c ? c.contactName : null
  form.value.contactPhone = c ? c.phone : null
}

/** 上游渠道商联动：带出名称 + 写入冗余 upChannel 文本 */
function handleChannelChange(val: any) {
  const ch = channelOptions.value.find((x: any) => x.id === val)
  form.value.channelName = ch ? ch.channelName : null
  form.value.upChannel = ch ? ch.channelName : null
}

/** 加载启用的渠道商（下拉用） */
function loadChannelOptions() {
  listChannelOptions().then((res: any) => {
    channelOptions.value = res.data || res.rows || []
  }).catch(() => {
    channelOptions.value = []
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["productRef"].validate((valid: boolean) => {
    if (valid) {
      if (form.value.id != null) {
        updateProduct(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addProduct(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row: JonlinkProduct) {
  const _ids = (row && row.id) || ids.value
  proxy.$modal.confirm('是否确认删除产品管理编号为"' + _ids + '"的数据项？').then(function() {
    return delProduct(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功") }).catch((e: any) => { if (e && e.message && e.message !== "cancel") { proxy.$modal.msgError(e.message || "操作失败"); } })
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('ledger/product/export', {
    ...quejlParams.value
  }, `product_${new Date().getTime()}.xlsx`)
}

/** 上架/下架 */
function handleShelf(row: JonlinkProduct, status: string) {
  const text = status === '1' ? '上架' : '下架'
  proxy.$modal.confirm('确认' + text + '产品【' + ((row && row.productName) || '') + '】？').then(function() {
    return request({
      url: '/ledger/product/shelf',
      method: 'put',
      data: { id: (row && row.id) || '', shelfStatus: status }
    })
  }).then((res: any) => {
    if (res.code === 200) {
      proxy.$modal.msgSuccess(text + "成功")
      getList()
    } else {
      proxy.$modal.msgError(res.msg)
    }
  }).catch((e: any) => { if (e && e.message && e.message !== "cancel") { proxy.$modal.msgError(e.message || "操作失败"); } })
}

getList()
loadChannelOptions()
</script>
