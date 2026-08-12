<template>
  <div class="app-container">
    <el-form :model="quejlParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="手机号" prop="phone">
        <el-input
          v-model="quejlParams.phone"
          placeholder="请输入手机号(授权回填/手动更换)"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="昵称" prop="nickname">
        <el-input
          v-model="quejlParams.nickname"
          placeholder="请输入昵称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="关注时间" prop="subscribeTime">
        <el-date-picker clearable
          v-model="quejlParams.subscribeTime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择关注时间(重复关注刷新)">
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
          v-hasPermi="['wx:user:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['wx:user:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleSync"
          v-hasPermi="['wx:user:edit']"
        >从公众号获取</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['wx:user:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['wx:user:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键" align="center" prop="id" show-overflow-tooltip min-width="100" />
      <el-table-column label="openid" align="center" prop="openid" show-overflow-tooltip min-width="100" />
      <el-table-column label="手机号" align="center" prop="phone" show-overflow-tooltip min-width="100" />
      <el-table-column label="昵称" align="center" prop="nickname" show-overflow-tooltip min-width="100" />
      <el-table-column label="头像地址" align="center" prop="avatar" show-overflow-tooltip min-width="100" />
      <el-table-column label="性别" align="center" prop="sex" show-overflow-tooltip min-width="100" />
      <el-table-column label="国家" align="center" prop="country" show-overflow-tooltip min-width="100" />
      <el-table-column label="省" align="center" prop="province" show-overflow-tooltip min-width="100" />
      <el-table-column label="市" align="center" prop="city" show-overflow-tooltip min-width="100" />
      <el-table-column label="关注状态" align="center" prop="subscribe" show-overflow-tooltip min-width="100" />
      <el-table-column label="关注时间" align="center" prop="subscribeTime" show-overflow-tooltip min-width="110">
        <template #default="scope">
          <span>{{ parseTime(scope.row.subscribeTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="取关时间" align="center" prop="unsubscribeTime" show-overflow-tooltip min-width="110">
        <template #default="scope">
          <span>{{ parseTime(scope.row.unsubscribeTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最近活跃时间" align="center" prop="lastActivityTime" show-overflow-tooltip min-width="110">
        <template #default="scope">
          <span>{{ parseTime(scope.row.lastActivityTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="互动次数" align="center" prop="activityCount" show-overflow-tooltip min-width="100" />
      <el-table-column label="活跃度" align="center" prop="activityLevel" show-overflow-tooltip min-width="100" />
      <el-table-column label="绑定用户" align="center" prop="userId" show-overflow-tooltip min-width="100" />
      <el-table-column label="备注" align="center" prop="remark" show-overflow-tooltip min-width="100" />
      <el-table-column label="上级分销员" align="center" prop="distributorId" show-overflow-tooltip min-width="100">
        <template #default="scope">
          <span>{{ scope.row.distributorName || scope.row.distributorId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="归属绑定时间" align="center" prop="bindTime" show-overflow-tooltip min-width="110">
        <template #default="scope">
          <span>{{ parseTime(scope.row.bindTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="bindSource" show-overflow-tooltip min-width="100" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="170">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['wx:user:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['wx:user:remove']">删除</el-button>
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

    <!-- 添加或修改粉丝管理对话框 -->
    <el-dialog :title="title" v-model="open" width="900px" append-to-body>
      <el-form ref="userRef" :model="form" :rules="rules" label-width="110px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="openid" prop="openid">
              <el-input v-model="form.openid" placeholder="请输入openid(无感获取)" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入手机号(授权回填/手动更换)" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="form.nickname" placeholder="请输入昵称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="头像地址" prop="avatar">
              <el-input v-model="form.avatar" placeholder="请输入头像地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="国家" prop="country">
              <el-input v-model="form.country" placeholder="请输入国家" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="省" prop="province">
              <el-input v-model="form.province" placeholder="请输入省" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="市" prop="city">
              <el-input v-model="form.city" placeholder="请输入市" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="关注状态" prop="subscribe">
              <el-input v-model="form.subscribe" placeholder="请输入关注状态 0否 1是" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="关注时间" prop="subscribeTime">
              <el-date-picker clearable
                v-model="form.subscribeTime"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择关注时间(重复关注刷新)">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="取关时间" prop="unsubscribeTime">
              <el-date-picker clearable
                v-model="form.unsubscribeTime"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择取关时间">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最近活跃时间" prop="lastActivityTime">
              <el-date-picker clearable
                v-model="form.lastActivityTime"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择最近活跃时间">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="互动次数" prop="activityCount">
              <el-input v-model="form.activityCount" placeholder="请输入互动次数" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="活跃度" prop="activityLevel">
              <el-input v-model="form.activityLevel" placeholder="请输入活跃度 1高 2中 3低(定时任务计算)" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="绑定用户" prop="userId">
              <el-input v-model="form.userId" placeholder="请输入绑定用户(可空)" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="上级分销员" prop="distributorId">
              <el-input v-model="form.distributorId" placeholder="请输入上级分销员(扫码绑定)" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="归属绑定时间" prop="bindTime">
              <el-date-picker clearable
                v-model="form.bindTime"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择归属绑定时间">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="bindSource">
              <el-input v-model="form.bindSource" placeholder="请输入0扫码 1手动 2其它" />
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

<script setup lang="ts" name="User">
import type { WxMpUser, UserQuejlParams } from "@/types/api/wx/user"
import { listUser, getUser, delUser, addUser, updateUser, syncUser } from "@/api/wx/user"

const { proxy } = getCurrentInstance()

const userList = ref<WxMpUser[]>([])
const open = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const ids = ref<number[]>([])
const single = ref<boolean>(true)
const multiple = ref<boolean>(true)
const total = ref<number>(0)
const title = ref<string>("")

const data = reactive({
  form: {} as WxMpUser,
  quejlParams: {
    pageNum: 1,
    pageSize: 10,
    phone: undefined,
    nickname: undefined,
    subscribeTime: undefined,
  } as UserQuejlParams,
  rules: {
    openid: [
      { required: true, message: "openid(无感获取)不能为空", trigger: "blur" }
    ],
    phone: [
      { required: true, message: "手机号(授权回填/手动更换)不能为空", trigger: "blur" }
    ],
    subscribe: [
      { required: true, message: "关注状态 0否 1是不能为空", trigger: "blur" }
    ],
    activityCount: [
      { required: true, message: "互动次数不能为空", trigger: "blur" }
    ],
    activityLevel: [
      { required: true, message: "活跃度 1高 2中 3低(定时任务计算)不能为空", trigger: "blur" }
    ],
  }
})

const { quejlParams, form, rules } = toRefs(data)

/** 查询粉丝管理列表 */
function getList() {
  loading.value = true
  listUser(quejlParams.value).then(response => {
    userList.value = response.rows
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
    openid: null,
    phone: null,
    nickname: null,
    avatar: null,
    sex: null,
    country: null,
    province: null,
    city: null,
    subscribe: null,
    subscribeTime: null,
    unsubscribeTime: null,
    lastActivityTime: null,
    activityCount: null,
    activityLevel: null,
    userId: null,
    remark: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    distributorId: null,
    bindTime: null,
    bindSource: null
  }
  proxy.resetForm("userRef")
}

/** 从公众号同步粉丝 */
function handleSync() {
  proxy.$modal.confirm('确认从公众号同步粉丝？将增量拉取并更新本地粉丝。').then(function() {
    return syncUser()
  }).then((res: any) => {
    if (res.code === 200) {
      proxy.$modal.msgSuccess(res.msg || "同步完成")
      getList()
    } else {
      proxy.$modal.msgError(res.msg)
    }
  }).catch(() => {})
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
function handleSelectionChange(selection: WxMpUser[]) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加粉丝管理"
}

/** 修改按钮操作 */
function handleUpdate(row: WxMpUser) {
  reset()
  const _id = row.id || ids.value[0]
  getUser(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改粉丝管理"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["userRef"].validate((valid: boolean) => {
    if (valid) {
      if (form.value.id != null) {
        updateUser(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addUser(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row: WxMpUser) {
  const _ids = row.id || ids.value
  proxy.$modal.confirm('是否确认删除粉丝管理编号为"' + _ids + '"的数据项？').then(function() {
    return delUser(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('wx/user/export', {
    ...quejlParams.value
  }, `user_${new Date().getTime()}.xlsx`)
}

getList()
</script>
