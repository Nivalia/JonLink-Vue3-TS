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
          v-hasPermi="['wx:account:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['wx:account:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['wx:account:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['wx:account:export']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Connection"
          @click="handleCheck"
          v-hasPermi="['wx:account:edit']"
        >测试验证</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="accountList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键" align="center" prop="id" show-overflow-tooltip min-width="100" />
      <el-table-column label="AppID" align="center" prop="appId" show-overflow-tooltip min-width="100" />
      <el-table-column label="AppSecret" align="center" prop="appSecret" show-overflow-tooltip min-width="100" />
      <el-table-column label="公众号名称" align="center" prop="name" show-overflow-tooltip min-width="100" />
      <el-table-column label="配置Token" align="center" prop="token" show-overflow-tooltip min-width="100" />
      <el-table-column label="消息加密密钥" align="center" prop="encodingAesKey" show-overflow-tooltip min-width="100" />
      <el-table-column label="加密模式" align="center" prop="encryptMode" show-overflow-tooltip min-width="100" />
      <el-table-column label="access_token" align="center" prop="accessToken" show-overflow-tooltip min-width="100" />
      <el-table-column label="token过期时间" align="center" prop="tokenExpireTime" show-overflow-tooltip min-width="110">
        <template #default="scope">
          <span>{{ parseTime(scope.row.tokenExpireTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" show-overflow-tooltip min-width="100" />
      <el-table-column label="备注" align="center" prop="remark" show-overflow-tooltip min-width="100" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="170">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['wx:account:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['wx:account:remove']">删除</el-button>
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

    <!-- 添加或修改账号配置对话框 -->
    <el-dialog :title="title" v-model="open" width="760px" append-to-body>
      <el-form ref="accountRef" :model="form" :rules="rules" label-width="110px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="AppID" prop="appId">
              <el-input v-model="form.appId" placeholder="请输入公众号 AppID" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="AppSecret" prop="appSecret">
              <el-input v-model="form.appSecret" placeholder="请输入AppSecret(加密存储)" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="公众号名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入公众号名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="配置Token" prop="token">
              <el-input v-model="form.token" placeholder="请输入服务器配置Token(验签)" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="消息加密密钥" prop="encodingAesKey">
              <el-input v-model="form.encodingAesKey" placeholder="请输入消息加密密钥(可空)" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="加密模式" prop="encryptMode">
              <el-input v-model="form.encryptMode" placeholder="请输入加密模式 0明文 1加密" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="access_token" prop="accessToken">
              <el-input v-model="form.accessToken" type="textarea" placeholder="请输入内容" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="token过期时间" prop="tokenExpireTime">
              <el-date-picker clearable
                v-model="form.tokenExpireTime"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择token过期时间">
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

<script setup lang="ts" name="Account">
import type { WxMpAccount, AccountQuejlParams } from "@/types/api/wx/account"
import { listAccount, getAccount, delAccount, addAccount, updateAccount } from "@/api/wx/account"
import request from "@/utils/request"

const { proxy } = getCurrentInstance()

const accountList = ref<WxMpAccount[]>([])
const open = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const ids = ref<number[]>([])
const single = ref<boolean>(true)
const multiple = ref<boolean>(true)
const total = ref<number>(0)
const title = ref<string>("")

const data = reactive({
  form: {} as WxMpAccount,
  quejlParams: {
    pageNum: 1,
    pageSize: 10,
  } as AccountQuejlParams,
  rules: {
    appId: [
      { required: true, message: "公众号 AppID不能为空", trigger: "blur" }
    ],
    appSecret: [
      { required: true, message: "AppSecret(加密存储)不能为空", trigger: "blur" }
    ],
    name: [
      { required: true, message: "公众号名称不能为空", trigger: "blur" }
    ],
    token: [
      { required: true, message: "服务器配置Token(验签)不能为空", trigger: "blur" }
    ],
    encodingAesKey: [
      { required: true, message: "消息加密密钥(可空)不能为空", trigger: "blur" }
    ],
    encryptMode: [
      { required: true, message: "加密模式 0明文 1加密不能为空", trigger: "blur" }
    ],
    accessToken: [
      { required: true, message: "access_token不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "状态 0停用 1启用不能为空", trigger: "change" }
    ],
  }
})

const { quejlParams, form, rules } = toRefs(data)

/** 查询账号配置列表 */
function getList() {
  loading.value = true
  listAccount(quejlParams.value).then(response => {
    accountList.value = response.rows
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
    appId: null,
    appSecret: null,
    name: null,
    token: null,
    encodingAesKey: null,
    encryptMode: null,
    accessToken: null,
    tokenExpireTime: null,
    status: null,
    remark: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  }
  proxy.resetForm("accountRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  quejlParams.value.pageNum = 1
  getList()
}

/** 测试验证: 回调接口在线性 + Token 配置 (README §5.2 接口3) */
function handleCheck() {
  request({ url: '/wx/mp/check', method: 'get' }).then((res: any) => {
    if (res.code === 200) {
      proxy.$modal.msgSuccess(res.msg || "接口正常")
    } else {
      proxy.$modal.msgError(res.msg || "接口异常")
    }
  }).catch(() => {
    proxy.$modal.msgError("接口不可达")
  })
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

/** 多选框选中数据 */
function handleSelectionChange(selection: WxMpAccount[]) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加账号配置"
}

/** 修改按钮操作 */
function handleUpdate(row: WxMpAccount) {
  reset()
  const _id = row.id || ids.value[0]
  getAccount(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改账号配置"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["accountRef"].validate((valid: boolean) => {
    if (valid) {
      if (form.value.id != null) {
        updateAccount(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addAccount(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row: WxMpAccount) {
  const _ids = row.id || ids.value
  proxy.$modal.confirm('是否确认删除账号配置编号为"' + _ids + '"的数据项？').then(function() {
    return delAccount(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('wx/account/export', {
    ...quejlParams.value
  }, `account_${new Date().getTime()}.xlsx`)
}

getList()
</script>
