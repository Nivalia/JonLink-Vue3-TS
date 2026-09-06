<template>
  <div class="app-container">
    <!-- ===== 筛选区 ===== -->
    <el-form :model="quejlParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="76px" class="jl-form--query">
      <el-form-item label="手机号" prop="phone">
        <el-input
          v-model="quejlParams.phone"
          placeholder="精确匹配手机号"
          clearable
          style="width: 180px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="昵称" prop="nickname">
        <el-input
          v-model="quejlParams.nickname"
          placeholder="模糊匹配昵称"
          clearable
          style="width: 180px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="订阅" prop="subscribe">
        <el-select v-model="quejlParams.subscribe" placeholder="全部" clearable style="width: 120px">
          <el-option v-for="dict in wx_subscribe_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="活跃度" prop="activityLevel">
        <el-select v-model="quejlParams.activityLevel" placeholder="全部" clearable style="width: 120px">
          <el-option v-for="dict in wx_activity_level" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="绑定来源" prop="bindSource">
        <el-select v-model="quejlParams.bindSource" placeholder="全部" clearable style="width: 140px">
          <el-option v-for="dict in wx_bind_source" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="关注时间" prop="subscribeTimeRange" class="jl-form-item--daterange">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日"
          end-placeholder="结束日"
          value-format="YYYY-MM-DD"
          style="width: 260px"
          unlink-panels
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- ===== 操作按钮区 ===== -->
    <el-row :gutter="10" class="mb8">
      <!-- 主操作 (高频) -->
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['wx:user:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['wx:user:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['wx:user:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="CollectionTag" :disabled="single" @click="handleTag" v-hasPermi="['wx:user:edit']">打标签</el-button>
      </el-col>

      <el-col :span="1.5" class="jl-toolbar__divider"><span class="jl-toolbar__divider-line"/></el-col>

      <!-- 维护操作 (低频运维) -->
      <el-col :span="1.5">
        <el-button type="info" plain icon="Refresh" @click="handleSync" v-hasPermi="['wx:user:edit']">从公众号获取</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="Connection" @click="handleSyncDistFan" v-hasPermi="['wx:user:edit']">业务员↔粉丝同步</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="Download" @click="handleExport" v-hasPermi="['wx:user:export']">导出</el-button>
      </el-col>

      <div class="jl-toolbar__spacer"/>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- ===== 主表 ===== -->
    <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange" :row-class-name="rowClassName">
      <el-table-column type="selection" width="48" align="center" />
      <el-table-column type="index" label="#" width="50" align="center" />
      <el-table-column label="粉丝" min-width="220" show-overflow-tooltip>
        <template #default="scope">
          <div class="jl-cell-fan">
            <el-avatar
              v-if="scope.row.avatar"
              :src="scope.row.avatar"
              :size="36"
              shape="circle"
              class="jl-cell-fan__avatar"
            />
            <el-avatar v-else :size="36" shape="circle" class="jl-cell-fan__avatar jl-cell-fan__avatar--placeholder">
              {{ (scope.row.nickname || scope.row.phone || '?').slice(0, 1) }}
            </el-avatar>
            <div class="jl-cell-fan__meta">
              <div class="jl-cell-fan__name">{{ scope.row.nickname || '-' }}</div>
              <div class="jl-cell-fan__sub">
                <span v-if="scope.row.phone">{{ scope.row.phone }}</span>
                <span v-else class="jl-text-muted">未绑定手机</span>
                <el-tag v-if="scope.row.sex === '1'" size="small" type="primary" effect="plain" class="jl-cell-fan__sex">男</el-tag>
                <el-tag v-else-if="scope.row.sex === '2'" size="small" type="danger" effect="plain" class="jl-cell-fan__sex">女</el-tag>
              </div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="地区" align="center" prop="province" min-width="120" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ [scope.row.province, scope.row.city].filter(Boolean).join(' / ') || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订阅" align="center" prop="subscribe" width="88">
        <template #default="scope">
          <el-tag :type="scope.row.subscribe === '1' ? 'success' : 'info'" size="small" effect="light">
            {{ scope.row.subscribe === '1' ? '已关注' : '未关注' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="活跃度" align="center" prop="activityLevel" min-width="130">
        <template #default="scope">
          <div class="jl-cell-activity">
            <el-tag
              :type="scope.row.activityLevel === '1' ? 'success' : scope.row.activityLevel === '2' ? 'warning' : 'info'"
              size="small"
              effect="light"
            >
              {{ scope.row.activityLevel === '1' ? '高频' : scope.row.activityLevel === '2' ? '中频' : '低频' }}
            </el-tag>
            <span class="jl-cell-activity__count">{{ scope.row.activityCount || 0 }}次</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="上级分销" align="center" prop="distributorName" min-width="120" show-overflow-tooltip>
        <template #default="scope">
          <span v-if="scope.row.distributorName">{{ scope.row.distributorName }}</span>
          <span v-else class="jl-text-muted">未绑定</span>
        </template>
      </el-table-column>
      <el-table-column label="关注日期" align="center" prop="subscribeTime" width="120">
        <template #default="scope">
          <span>{{ parseTime(scope.row.subscribeTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最近活跃" align="center" prop="lastActivityTime" width="120">
        <template #default="scope">
          <span v-if="scope.row.lastActivityTime">{{ relativeTime(scope.row.lastActivityTime) }}</span>
          <span v-else class="jl-text-muted">-</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="200">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['wx:user:edit']">修改</el-button>
          <el-button link type="warning" icon="CollectionTag" @click="handleTag(scope.row)" v-hasPermi="['wx:user:edit']">标签</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['wx:user:remove']">删除</el-button>
        </template>
      </el-table-column>
      <el-table-column type="expand" width="48">
        <template #default="scope">
          <el-descriptions :column="3" border size="small" class="jl-describe">
            <el-descriptions-item label="主键">{{ scope.row.id }}</el-descriptions-item>
            <el-descriptions-item label="openid">
              <el-tooltip :content="scope.row.openid || '-'" placement="top">
                <span class="jl-mono">{{ scope.row.openid || '-' }}</span>
              </el-tooltip>
            </el-descriptions-item>
            <el-descriptions-item label="头像">
              <el-image v-if="scope.row.avatar" :src="scope.row.avatar" :preview-src-list="[scope.row.avatar]" style="width:48px;height:48px;border-radius:50%" />
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="国家">{{ scope.row.country || '-' }}</el-descriptions-item>
            <el-descriptions-item label="关注时间">{{ parseTime(scope.row.subscribeTime, '{y}-{m}-{d} {h}:{i}') }}</el-descriptions-item>
            <el-descriptions-item label="取关时间">{{ parseTime(scope.row.unsubscribeTime, '{y}-{m}-{d} {h}:{i}') || '-' }}</el-descriptions-item>
            <el-descriptions-item label="互动次数">{{ scope.row.activityCount || 0 }}</el-descriptions-item>
            <el-descriptions-item label="绑定用户">{{ scope.row.userId || '-' }}</el-descriptions-item>
            <el-descriptions-item label="绑定来源">
              <dict-tag :options="wx_bind_source" :value="scope.row.bindSource" />
            </el-descriptions-item>
            <el-descriptions-item label="绑定时间">{{ parseTime(scope.row.bindTime, '{y}-{m}-{d}') || '-' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ parseTime(scope.row.createTime) || '-' }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ parseTime(scope.row.updateTime) || '-' }}</el-descriptions-item>
            <el-descriptions-item label="备注" :span="3">{{ scope.row.remark || '-' }}</el-descriptions-item>
          </el-descriptions>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="quejlParams.pageNum"
      v-model:limit="quejlParams.pageSize"
      @pagination="getList"
    />

    <!-- ===== 新增/修改 Dialog (tab 分段) ===== -->
    <el-dialog :title="title" v-model="open" width="820px" append-to-body destroy-on-close>
      <el-tabs v-model="activeTab" class="jl-dialog-tabs">
        <!-- Tab 1: 基础信息 -->
        <el-tab-pane label="基础信息" name="base">
          <el-form ref="userRef" :model="form" :rules="rules" label-width="100px">
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="openid" prop="openid">
                  <el-input v-model="form.openid" placeholder="公众号唯一标识" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="手机号" prop="phone">
                  <el-input v-model="form.phone" placeholder="授权回填或手动更换" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="昵称" prop="nickname">
                  <el-input v-model="form.nickname" placeholder="公众号昵称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="头像" prop="avatar">
                  <el-input v-model="form.avatar" placeholder="头像 URL">
                    <template #append>
                      <el-button @click="previewAvatar" :disabled="!form.avatar">预览</el-button>
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="性别" prop="sex">
                  <el-radio-group v-model="form.sex">
                    <el-radio value="1">男</el-radio>
                    <el-radio value="2">女</el-radio>
                    <el-radio value="0">未知</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="国家" prop="country">
                  <el-input v-model="form.country" placeholder="如:中国" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="省" prop="province">
                  <el-input v-model="form.province" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="市" prop="city">
                  <el-input v-model="form.city" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="订阅状态" prop="subscribe">
                  <el-select v-model="form.subscribe" placeholder="请选择" style="width:100%">
                    <el-option v-for="dict in wx_subscribe_status" :key="dict.value" :label="dict.label" :value="dict.value" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="关注时间" prop="subscribeTime">
                  <el-date-picker clearable v-model="form.subscribeTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="重复关注会刷新" style="width:100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="取关时间" prop="unsubscribeTime">
                  <el-date-picker clearable v-model="form.unsubscribeTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="-" style="width:100%" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-tab-pane>

        <!-- Tab 2: 分销绑定 -->
        <el-tab-pane label="分销绑定" name="dist">
          <el-form ref="distRef" :model="form" :rules="rules" label-width="100px">
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="上级分销员" prop="distributorId">
                  <el-input v-model="form.distributorId" placeholder="扫码绑定的分销员 user_id" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="绑定来源" prop="bindSource">
                  <el-select v-model="form.bindSource" placeholder="请选择" clearable style="width:100%">
                    <el-option v-for="dict in wx_bind_source" :key="dict.value" :label="dict.label" :value="dict.value" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="绑定时间" prop="bindTime">
                  <el-date-picker clearable v-model="form.bindTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="-" style="width:100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="系统用户" prop="userId">
                  <el-input v-model="form.userId" placeholder="可空" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-tab-pane>

        <!-- Tab 3: 活动数据 + 备注 -->
        <el-tab-pane label="活动数据" name="activity">
          <el-form ref="activityRef" :model="form" :rules="rules" label-width="100px">
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="互动次数" prop="activityCount">
                  <el-input-number v-model="form.activityCount" :min="0" controls-position="right" style="width:100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="活跃度" prop="activityLevel">
                  <el-select v-model="form.activityLevel" placeholder="定时任务计算" clearable style="width:100%">
                    <el-option v-for="dict in wx_activity_level" :key="dict.value" :label="dict.label" :value="dict.value" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="最近活跃" prop="lastActivityTime">
                  <el-date-picker clearable v-model="form.lastActivityTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="-" style="width:100%" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="备注" prop="remark">
                  <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="可记录客户偏好/特殊来源" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- ===== 打标签对话框 ===== -->
    <el-dialog title="打标签" v-model="tagOpen" width="520px" append-to-body destroy-on-close>
      <el-form label-width="80px">
        <el-form-item label="粉丝">
          <span>{{ tagUser.nickname || tagUser.phone || '-' }}</span>
        </el-form-item>
        <el-form-item label="当前标签">
          <div v-if="userTags.length" class="jl-tag-list">
            <el-tag
              v-for="tag in userTags"
              :key="tag.tagId"
              closable
              @close="handleRemoveTag(tag)"
              class="jl-tag-list__item"
            >{{ tag.tagName }}</el-tag>
          </div>
          <span v-else class="jl-text-muted">暂无标签</span>
        </el-form-item>
        <el-form-item label="添加标签">
          <el-select v-model="selectedTagId" placeholder="搜索并选择标签" style="width: 100%" filterable>
            <el-option v-for="tag in allTags" :key="tag.id" :label="tag.tagName" :value="tag.id" :disabled="userTags.some((ut: UserTagItem) => ut.tagId === tag.id)" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitTag">确 定</el-button>
          <el-button @click="tagOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="User">
import type { WxMpUser, UserQuejlParams } from "@/types/api/wx/user"
import { listUser, getUser, delUser, addUser, updateUser, syncUser, syncDistFan } from "@/api/wx/user"
import { listTag } from "@/api/wx/tag"
import { getTagsByUserId, saveUserTags } from "@/api/wx/userTag"

const { proxy } = getCurrentInstance()
const { wx_subscribe_status, wx_bind_source, wx_activity_level, common_status } = proxy.useDict('wx_subscribe_status', 'wx_bind_source', 'wx_activity_level', 'common_status')

const userList = ref<WxMpUser[]>([])
const open = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const ids = ref<number[]>([])
const single = ref<boolean>(true)
const multiple = ref<boolean>(true)
const total = ref<number>(0)
const title = ref<string>("")
const activeTab = ref<string>("base")

// 关注时间区间 (daterange)
const dateRange = ref<string[]>([])

// 标签相关
const tagOpen = ref<boolean>(false)
const tagUser = ref<any>({})
interface UserTagItem { tagId: number; tagName: string }
const userTags = ref<UserTagItem[]>([])
const allTags = ref<any[]>([])
const selectedTagId = ref<number | undefined>(undefined)

const data = reactive({
  form: {} as WxMpUser,
  quejlParams: {
    pageNum: 1,
    pageSize: 10,
    phone: undefined,
    nickname: undefined,
    subscribe: undefined,
    activityLevel: undefined,
    bindSource: undefined,
    subscribeTimeBegin: undefined,
    subscribeTimeEnd: undefined,
  } as UserQuejlParams,
  rules: {
    openid: [{ required: true, message: "openid 不能为空", trigger: "blur" }],
    phone: [{ required: true, message: "手机号不能为空", trigger: "blur" }],
    subscribe: [{ required: true, message: "订阅状态不能为空", trigger: "change" }],
    activityCount: [{ required: true, message: "互动次数不能为空", trigger: "blur" }],
    activityLevel: [{ required: true, message: "活跃度不能为空", trigger: "change" }],
  }
})

const { quejlParams, form, rules } = toRefs(data)

// 监听 daterange, 同步到 quejlParams
watch(dateRange, (val: string[] | null) => {
  if (val && val.length === 2) {
    quejlParams.value.subscribeTimeBegin = val[0]
    quejlParams.value.subscribeTimeEnd = val[1]
  } else {
    quejlParams.value.subscribeTimeBegin = undefined
    quejlParams.value.subscribeTimeEnd = undefined
  }
})

/** 查询粉丝列表 */
function getList() {
  loading.value = true
  listUser(quejlParams.value).then(response => {
    userList.value = response.rows
    total.value = response.total
    loading.value = false
    loadUserTags()
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
    id: null, openid: null, phone: null, nickname: null, avatar: null, sex: null,
    country: null, province: null, city: null, subscribe: null,
    subscribeTime: null, unsubscribeTime: null, lastActivityTime: null,
    activityCount: null, activityLevel: null, userId: null, remark: null,
    createBy: null, createTime: null, updateBy: null, updateTime: null,
    distributorId: null, bindTime: null, bindSource: null,
  } as any
  activeTab.value = "base"
  proxy.resetForm("userRef")
}

/** 从公众号同步 */
function handleSync() {
  proxy.$modal.confirm('确认从公众号同步粉丝?将增量拉取并更新本地粉丝。').then(() => {
    return syncUser()
  }).then((res: any) => {
    if (res.code === 200) { proxy.$modal.msgSuccess(res.msg || "同步完成"); getList() }
    else { proxy.$modal.msgError(res.msg) }
  }).catch((e: any) => { if (e && e.message && e.message !== "cancel") { proxy.$modal.msgError(e.message || "操作失败") } })
}

/** 业务员↔粉丝手机号关联同步 */
function handleSyncDistFan() {
  proxy.$modal.confirm('确认同步业务员手机号到粉丝表?将自动匹配手机号关联。').then(() => {
    return syncDistFan()
  }).then((res: any) => {
    if (res.code === 200) { proxy.$modal.msgSuccess(res.msg || "同步完成"); getList() }
    else { proxy.$modal.msgError(res.msg) }
  }).catch((e: any) => { if (e && e.message && e.message !== "cancel") { proxy.$modal.msgError(e.message || "操作失败") } })
}

/** 搜索 */
function handleQuery() {
  quejlParams.value.pageNum = 1
  getList()
}

/** 重置 */
function resetQuery() {
  dateRange.value = []
  proxy.resetForm("queryRef")
  // resetForm 会清掉 reactive 的字段, 但 daterange watcher 会跑, 双保险
  quejlParams.value = {
    pageNum: 1, pageSize: quejlParams.value.pageSize,
    phone: undefined, nickname: undefined,
    subscribe: undefined, activityLevel: undefined, bindSource: undefined,
    subscribeTimeBegin: undefined, subscribeTimeEnd: undefined,
  }
  handleQuery()
}

/** 多选 */
function handleSelectionChange(selection: WxMpUser[]) {
  ids.value = selection.map(item => item.id!)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 未关注行加灰底, 视觉区分 */
function rowClassName({ row }: { row: WxMpUser }) {
  return row.subscribe === '1' ? '' : 'jl-row--unsubscribed'
}

/** 新增 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加粉丝"
}

/** 修改 */
function handleUpdate(row?: WxMpUser) {
  reset()
  const _id = (row && row.id) || ids.value[0]
  getUser(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改粉丝"
  })
}

/** 提交 */
function submitForm() {
  // 任一 tab 校验通过即可提交
  const refs = ['userRef', 'distRef', 'activityRef'] as const
  const validations = refs.map(name => new Promise<boolean>((resolve) => {
    const r = proxy.$refs[name] as any
    if (!r) return resolve(true)
    r.validate((ok: boolean) => resolve(ok))
  }))
  Promise.all(validations).then(results => {
    if (results.every(Boolean)) {
      const op = form.value.id != null ? updateUser(form.value) : addUser(form.value)
      op.then(() => {
        proxy.$modal.msgSuccess(form.value.id ? "修改成功" : "新增成功")
        open.value = false
        getList()
      })
    }
  })
}

/** 删除 */
function handleDelete(row?: WxMpUser) {
  const _ids = (row && row.id) || ids.value
  const msg = row && row.subscribe === '1'
    ? `确认删除粉丝「${row.nickname || row.phone || row.id}」?该粉丝当前已关注, 删除不影响公众号关注状态,但本地记录会被移除。`
    : `是否确认删除粉丝管理编号为 "${_ids}" 的数据项?`
  proxy.$modal.confirm(msg).then(() => delUser(_ids as any))
    .then(() => { getList(); proxy.$modal.msgSuccess("删除成功") })
    .catch((e: any) => { if (e && e.message && e.message !== "cancel") proxy.$modal.msgError(e.message || "操作失败") })
}

/** 导出 */
function handleExport() {
  const params: any = { ...quejlParams.value }
  delete params.pageNum
  delete params.pageSize
  proxy.download('wx/user/export', params, `user_${new Date().getTime()}.xlsx`)
}

/** 打标签 */
function handleTag(row?: any) {
  tagUser.value = row || {}
  userTags.value = ((row && row.tags) || []) as UserTagItem[]
  selectedTagId.value = undefined
  listTag({ pageNum: 1, pageSize: 100 }).then((res: any) => { allTags.value = res.rows || [] })
  tagOpen.value = true
}

/** 移除标签 */
function handleRemoveTag(tag: any) {
  const newTagIds = userTags.value.filter((ut: UserTagItem) => ut.tagId !== tag.tagId).map((ut: UserTagItem) => ut.tagId)
  saveUserTags(tagUser.value.id, newTagIds).then(() => {
    proxy.$modal.msgSuccess("移除标签成功")
    userTags.value = userTags.value.filter((ut: UserTagItem) => ut.tagId !== tag.tagId)
    getList()
  })
}

/** 提交标签 */
function submitTag() {
  if (!selectedTagId.value) { proxy.$modal.msgWarning("请选择标签"); return }
  const newTagIds = [...userTags.value.map((ut: UserTagItem) => ut.tagId), selectedTagId.value]
  saveUserTags(tagUser.value.id, newTagIds).then(() => {
    proxy.$modal.msgSuccess("添加标签成功")
    tagOpen.value = false
    getList()
  })
}

/** 加载粉丝标签 (N+1 已知, 留待后端批量接口优化) */
function loadUserTags() {
  userList.value.forEach((user: any) => {
    getTagsByUserId(user.id).then((res: any) => { user.tags = res.data || [] }).catch(() => {})
  })
}

/** 头像预览 */
function previewAvatar() {
  if (!form.value.avatar) return
  window.open(form.value.avatar, '_blank')
}

/** 相对时间 (最近活跃) */
function relativeTime(date: string | Date): string {
  if (!date) return '-'
  const t = new Date(date).getTime()
  if (isNaN(t)) return '-'
  const diff = Date.now() - t
  const m = Math.floor(diff / 60000)
  if (m < 1) return '刚刚'
  if (m < 60) return `${m}分钟前`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}小时前`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}天前`
  const mo = Math.floor(d / 30)
  if (mo < 12) return `${mo}个月前`
  return `${Math.floor(mo / 12)}年前`
}

getList()
</script>

<style scoped>
/* ===== 筛选区 ===== */
.jl-form--query {
  background: #fafbfc;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  padding: 14px 16px 0 4px;
  margin-bottom: 12px;
}
.jl-form--query .el-form-item { margin-bottom: 14px; }
.jl-form-item--daterange { margin-right: 0; }

/* ===== 按钮区分组 ===== */
.jl-toolbar__divider {
  display: inline-flex;
  align-items: center;
  height: 32px;
}
.jl-toolbar__divider-line {
  display: inline-block;
  width: 1px;
  height: 18px;
  background: #dcdfe6;
  margin: 0 8px;
}
.jl-toolbar__spacer { flex: 1; }

/* ===== 粉丝单元格 ===== */
.jl-cell-fan { display: flex; align-items: center; gap: 10px; padding: 4px 0; }
.jl-cell-fan__avatar { flex-shrink: 0; }
.jl-cell-fan__avatar--placeholder { background: #f0f2f5; color: #909399; font-weight: 500; }
.jl-cell-fan__meta { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.jl-cell-fan__name { font-weight: 500; color: #303133; line-height: 1.2; }
.jl-cell-fan__sub { font-size: 12px; color: #606266; display: flex; align-items: center; gap: 6px; }
.jl-cell-fan__sex { transform: scale(0.85); transform-origin: left center; }

/* ===== 活跃度单元格 ===== */
.jl-cell-activity { display: flex; align-items: center; justify-content: center; gap: 6px; }
.jl-cell-activity__count { font-size: 12px; color: #909399; }

/* ===== 未关注行 ===== */
.jl-row--unsubscribed { background: #fafafa !important; color: #909399; }
.jl-row--unsubscribed:hover > td { background: #f5f7fa !important; }

/* ===== 文本工具 ===== */
.jl-text-muted { color: #c0c4cc; font-size: 12px; }
.jl-mono { font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 12px; }

/* ===== 描述列表 ===== */
.jl-describe { padding: 12px 24px; }
.jl-describe :deep(.el-descriptions__label) { color: #606266; width: 100px; }

/* ===== Dialog Tab ===== */
.jl-dialog-tabs { padding: 0 4px; }
.jl-dialog-tabs :deep(.el-tabs__header) { margin-bottom: 18px; }

/* ===== 标签弹窗 ===== */
.jl-tag-list { display: flex; flex-wrap: wrap; gap: 6px; }
.jl-tag-list__item { margin: 0; }
</style>
