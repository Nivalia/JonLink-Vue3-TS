<template>
  <div class="app-container">
    <el-form :model="quejlParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="状态" prop="bizType">
        <el-select v-model="quejlParams.bizType" placeholder="请选择0分销(永久) 1活动 2通知 3公告" clearable>
          <el-option
            v-for="dict in wx_qr_biz_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="过期时间" prop="expireTime">
        <el-date-picker clearable
          v-model="quejlParams.expireTime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择过期时间(临时码30天内)">
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
          v-hasPermi="['wx:qr:add']"
        >新增</el-button>
        <el-button
          type="success"
          plain
          icon="Promotion"
          @click="handleGenDistQr"
          v-hasPermi="['wx:qr:add']"
        >生成分销码</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate()"
          v-hasPermi="['wx:qr:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete()"
          v-hasPermi="['wx:qr:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['wx:qr:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="qrList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="scene" align="center" prop="sceneId" show-overflow-tooltip min-width="100" />
      <el-table-column label="二维码" align="center" width="76">
        <template #default="scope">
          <QrImg v-if="scope.row.qrUrl" :content="scope.row.qrUrl" :size="42" clickable @click="showQrPreview(scope.row)" />
          <span v-else style="color:#c0c4cc">-</span>
        </template>
      </el-table-column>
      <el-table-column label="分销员" align="center" prop="userId" show-overflow-tooltip min-width="100" />
      <el-table-column label="分销员姓名" align="center" prop="userName" show-overflow-tooltip min-width="100" />
      <el-table-column label="码类型" align="center" width="90">
        <template #default="scope">
          <el-tag :type="scope.row.qrType == '0' ? 'primary' : 'warning'" size="small">{{ scope.row.qrType == '0' ? '永久' : '临时' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="ticket" align="center" prop="ticket" show-overflow-tooltip min-width="100" />
      <el-table-column label="二维码链接" align="center" prop="qrUrl" show-overflow-tooltip min-width="140" />
      <el-table-column label="状态" align="center" prop="status" width="80" />
      <el-table-column label="业务类型" align="center" width="90">
        <template #default="scope">
          <dict-tag :options="wx_qr_biz_type" :value="scope.row.bizType" />
        </template>
      </el-table-column>
      <el-table-column label="临时场景串" align="center" prop="sceneStr" show-overflow-tooltip min-width="100" />
      <el-table-column label="过期时间" align="center" prop="expireTime" show-overflow-tooltip min-width="110">
        <template #default="scope">
          <span>{{ parseTime(scope.row.expireTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="落地页地址" align="center" prop="landingUrl" show-overflow-tooltip min-width="100" />
      <el-table-column label="扫码次数" align="center" width="90">
        <template #default="scope">
          <el-tag :type="scope.row.scanCount > 0 ? 'success' : 'info'" size="small">{{ scope.row.scanCount || 0 }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="290">
        <template #default="scope">
          <el-button link type="warning" icon="CircleClose" @click="handleToggleStatus(scope.row)" v-hasPermi="['wx:qr:edit']">{{ scope.row.status == '1' ? '停用' : '启用' }}</el-button>
          <el-button link type="primary" icon="Download" @click="handleDownload(scope.row)" v-if="scope.row.qrUrl" v-hasPermi="['wx:qr:list']">下载</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['wx:qr:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['wx:qr:remove']">删除</el-button>
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

    <!-- 添加或修改二维码管理对话框 -->
    <el-dialog :title="title" v-model="open" width="900px" append-to-body>
      <el-row :gutter="16">
        <el-col :span="15">
          <el-form ref="qrRef" :model="form" :rules="rules" label-width="110px">
            <!-- 自动生成区块(仅新增) -->
            <template v-if="!form.id">
              <el-divider content-position="left">自动生成（调微信接口创建二维码，自动回填）</el-divider>
              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="类型">
                    <el-select v-model="genType" style="width:100%">
                      <el-option v-for="dict in wx_qr_biz_type" :key="dict.value" :label="dict.label" :value="dict.value" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12" v-if="genType == '0'">
                  <el-form-item label="分销员">
                    <el-select v-model="genDistUserId" filterable placeholder="选择分销员" style="width:100%">
                      <el-option v-for="d in distList" :key="d.id" :label="d.userId + ' - ' + (d.userName || '未命名')" :value="d.userId" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <template v-else>
                  <el-col :span="12">
                    <el-form-item label="场景串">
                      <el-input v-model="genSceneStr" :placeholder="'如 ' + genTypePrefix + '1001'" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="有效期">
                      <el-input-number v-model="genExpireDays" :min="1" :max="30" controls-position="right" style="width:100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="24">
                    <el-form-item label="落地页">
                      <el-input v-model="genLandingUrl" placeholder="活动/公告详情页地址(可选)" />
                    </el-form-item>
                  </el-col>
                </template>
                <el-col :span="24">
                  <el-form-item>
                    <el-button type="primary" icon="MagicStick" :loading="genLoading" @click="autoGenerate">生 成</el-button>
                    <span style="font-size:12px;color:#8a94a6;margin-left:10px">分销码为永久码(scene=user_id)；临时码30天内过期</span>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-divider content-position="left">手动填写（或已自动回填，可微调）</el-divider>
            </template>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="scene" prop="sceneId">
                  <el-input v-model="form.sceneId" placeholder="请输入场景值scene(唯一)" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="分销员" prop="userId">
                  <el-input v-model="form.userId" placeholder="分销员(系统用户ID)，分销码自动带出" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="分销员姓名" prop="userName">
                  <el-input v-model="form.userName" placeholder="分销员姓名(冗余)" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="ticket" prop="ticket">
                  <el-input v-model="form.ticket" type="textarea" placeholder="微信API返回ticket，自动生成时自动带出" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="二维码" prop="qrUrl">
                  <el-input v-model="form.qrUrl" type="textarea" placeholder="自动生成时自动带出" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="备注" prop="remark">
                  <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="类型" prop="bizType">
                  <el-select v-model="form.bizType" placeholder="请选择0分销(永久) 1活动 2通知 3公告">
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
                <el-form-item label="临时场景串" prop="sceneStr">
                  <el-input v-model="form.sceneStr" placeholder="临时场景串(act_1001等)" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="过期时间" prop="expireTime">
                  <el-date-picker clearable
                    v-model="form.expireTime"
                    type="date"
                    value-format="YYYY-MM-DD"
                    placeholder="请选择过期时间(临时码30天内)">
                  </el-date-picker>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="落地页地址" prop="landingUrl">
                  <el-input v-model="form.landingUrl" placeholder="落地页地址(活动/公告详情)" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-col>
        <!-- 右侧：二维码预览 -->
        <el-col :span="9">
          <div style="text-align:center;padding-top:26px">
            <div style="font-size:12px;color:#8a94a6;margin-bottom:10px">二维码预览</div>
            <div v-if="form.qrUrl" style="display:inline-block;padding:12px;background:#fff;border:1px solid #ebeef5;border-radius:10px">
              <QrImg :content="form.qrUrl" :size="200" />
            </div>
            <div v-else style="color:#c0c4cc;border:1px dashed #dcdfe6;border-radius:10px;padding:60px 0">生成后显示二维码</div>
          </div>
        </el-col>
      </el-row>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 生成分销码对话框(选分销员) -->
    <el-dialog v-model="distOpen" title="生成分销员永久码" width="500px" append-to-body>
      <el-form ref="distRef" :model="distForm" :rules="distRules" label-width="90px">
        <el-form-item label="分销员" prop="userId">
          <el-select v-model="distForm.userId" filterable placeholder="请选择分销员" style="width:100%">
            <el-option
              v-for="d in distList"
              :key="d.id"
              :label="d.userId + ' - ' + (d.userName || '未命名')"
              :value="d.userId"
            />
          </el-select>
          <div style="font-size:12px;color:#8a94a6;line-height:1.6;margin-top:6px">
            分销码为永久码，scene=分销员user_id；已生成过则直接复用，不会重复创建
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitDistQr" :loading="distLoading">生 成</el-button>
          <el-button @click="distOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 二维码预览/生成结果对话框 -->
    <el-dialog v-model="distResultOpen" title="二维码" width="480px" append-to-body>
      <div style="text-align:center;padding:6px 0">
        <div v-if="qrPreview.qrUrl" style="display:inline-block;padding:10px;background:#fff;border:1px solid #ebeef5;border-radius:8px">
          <QrImg :content="qrPreview.qrUrl" :size="220" />
        </div>
        <div v-else style="color:#c0c4cc;padding:40px 0">该记录无二维码内容</div>
        <el-descriptions :column="1" border style="margin-top:14px;text-align:left">
          <el-descriptions-item label="场景值">{{ qrPreview.sceneId }}</el-descriptions-item>
          <el-descriptions-item label="分销员">{{ qrPreview.userName || qrPreview.userId || '-' }}</el-descriptions-item>
          <el-descriptions-item label="类型">{{ qrPreview.bizType == '0' ? '分销(永久码)' : '临时码' }}</el-descriptions-item>
          <el-descriptions-item label="二维码内容">{{ qrPreview.qrUrl || '-' }}</el-descriptions-item>
        </el-descriptions>
        <el-button v-if="qrPreview.qrUrl" type="primary" icon="Download" style="margin-top:16px" @click="downloadQr(qrPreview)">下载二维码图片</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="Qr">
import type { WxQrScene, QrQuejlParams } from "@/types/api/wx/qr"
import { listQr, getQr, delQr, addQr, updateQr } from "@/api/wx/qr"
import request from "@/utils/request"
import QRCode from "qrcode"
import QrImg from "@/components/QrImg/index.vue"
import { ref, reactive, toRefs, getCurrentInstance, computed } from "vue"

const { proxy } = getCurrentInstance()
const { wx_qr_biz_type } = useDict('wx_qr_biz_type')

const qrList = ref<WxQrScene[]>([])
const open = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const ids = ref<number[]>([])
const single = ref<boolean>(true)
const multiple = ref<boolean>(true)
const total = ref<number>(0)
const title = ref<string>("")
const distOpen = ref<boolean>(false)
const distResultOpen = ref<boolean>(false)
const distLoading = ref<boolean>(false)
const distList = ref<any[]>([])
const qrPreview = ref<any>({})
const distForm = ref<any>({ userId: undefined })
const distRules = {
  userId: [{ required: true, message: "请选择分销员", trigger: "change" }]
}
const genType = ref<string>("1")
const genDistUserId = ref<number | undefined>(undefined)
const genSceneStr = ref<string>("")
const genExpireDays = ref<number>(30)
const genLandingUrl = ref<string>("")
const genLoading = ref<boolean>(false)
const genTypePrefix = computed(() => {
  const map: any = { "0": "", "1": "act_", "2": "notify_", "3": "notice_" }
  return map[genType.value] || "act_"
})

const data = reactive({
  form: {} as WxQrScene,
  quejlParams: {
    pageNum: 1,
    pageSize: 10,
    bizType: undefined,
    expireTime: undefined,
  } as QrQuejlParams,
  rules: {
    sceneId: [
      { required: true, message: "场景值scene(唯一)不能为空", trigger: "blur" }
    ],
    userId: [
      { required: true, message: "分销员(系统用户ID)不能为空", trigger: "blur" }
    ],
    qrType: [
      { required: true, message: "0永久 1临时不能为空", trigger: "change" }
    ],
    status: [
      { required: true, message: "0停用 1启用不能为空", trigger: "change" }
    ],
    bizType: [
      { required: true, message: "0分销(永久) 1活动 2通知 3公告不能为空", trigger: "change" }
    ],
  }
})

const { quejlParams, form, rules } = toRefs(data)

/** 查询二维码管理列表 */
function getList() {
  loading.value = true
  listQr(quejlParams.value).then(response => {
    qrList.value = response.rows
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
    userId: null,
    userName: null,
    qrType: null,
    ticket: null,
    qrUrl: null,
    status: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null,
    bizType: null,
    sceneStr: null,
    expireTime: null,
    landingUrl: null
  }
  proxy.resetForm("qrRef")
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
function handleSelectionChange(selection: WxQrScene[]) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 停用/启用二维码 (R6) */
function handleToggleStatus(row: any) {
  const target = ((row && row.status) || '0') == '1' ? '0' : '1'
  const action = target == '0' ? '停用' : '启用'
  proxy.$modal.confirm('确认' + action + '该二维码？' + (target == '0' ? '停用后扫码将失效' : '')).then(() => {
    return request({ url: '/wx/qr/status/' + ((row && row.id) || ''), method: 'put', data: { status: target } })
  }).then((res: any) => {
    if (res && res.code === 200) {
      proxy.$modal.msgSuccess(action + "成功")
      getList()
    } else {
      proxy.$modal.msgError((res && res.msg) || action + "失败")
    }
  }).catch((e: any) => { if (e && e.message && e.message !== "cancel") { proxy.$modal.msgError(e.message || "操作失败"); } })
}

/** 下载二维码图片(本地生成PNG) */
function handleDownload(row: any) {
  downloadQr(row)
}

/** 生成分销员永久码(选择分销员) */
function handleGenDistQr() {
  distForm.value = { userId: undefined }
  loadDistList()
  distOpen.value = true
}

/** 加载分销员档案列表 */
function loadDistList() {
  request({
    url: '/wx/distMember/list',
    method: 'get',
    params: { pageNum: 1, pageSize: 100 }
  }).then((res: any) => {
    distList.value = (res.rows || []).map((d: any) => ({ id: d.id, userId: d.userId, userName: d.userName }))
  })
}

/** 提交生成分销码 */
function submitDistQr() {
  proxy.$refs["distRef"].validate((valid: boolean) => {
    if (!valid) return
    distLoading.value = true
    request({
      url: '/wx/qr/createDist',
      method: 'post',
      data: { userId: Number(distForm.value.userId) }
    }).then((res: any) => {
      if (res && res.code === 200) {
        qrPreview.value = res.data
        distOpen.value = false
        distResultOpen.value = true
        proxy.$modal.msgSuccess("分销码已生成(scene=" + res.data.sceneId + ")")
        getList()
      } else {
        proxy.$modal.msgError((res && res.msg) || "生成失败")
      }
    }).finally(() => { distLoading.value = false })
  })
}

/** 点击列表二维码预览大图 */
function showQrPreview(row: any) {
  qrPreview.value = row
  distResultOpen.value = true
}

/** 下载二维码图片(本地生成PNG，不依赖微信域名) */
async function downloadQr(row: any) {
  if (!row.qrUrl) {
    proxy.$modal.msgWarning("该记录无二维码内容")
    return
  }
  try {
    const url = await QRCode.toDataURL(row.qrUrl, { width: 512, margin: 2 })
    const a = document.createElement('a')
    a.href = url
    a.download = 'qr_' + (row.sceneId || row.id || 'code') + '.png'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    proxy.$modal.msgSuccess("二维码图片已下载")
  } catch (e) {
    proxy.$modal.msgError("二维码生成失败")
  }
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  genType.value = "1"
  genDistUserId.value = undefined
  genSceneStr.value = "act_" + Date.now().toString().slice(-6)
  genExpireDays.value = 30
  genLandingUrl.value = ""
  loadDistList()
  open.value = true
  title.value = "添加二维码管理"
}

/** 自动生成：分销永久码 / 临时码(活动/通知/公告) */
async function autoGenerate() {
  if (genType.value === "0") {
    if (!genDistUserId.value) {
      proxy.$modal.msgWarning("请选择分销员")
      return
    }
  } else if (!genSceneStr.value) {
    proxy.$modal.msgWarning("请填写场景串")
    return
  }
  genLoading.value = true
  try {
    let res: any
    if (genType.value === "0") {
      res = await request({
        url: "/wx/qr/createDist",
        method: "post",
        data: { userId: Number(genDistUserId.value) }
      })
    } else {
      res = await request({
        url: "/wx/qr/createTemp",
        method: "post",
        data: {
          bizType: genType.value,
          sceneStr: genSceneStr.value,
          expireSeconds: genExpireDays.value * 86400,
          landingUrl: genLandingUrl.value || null
        }
      })
    }
    if (res && res.code === 200) {
      // 后端已入库：直接关闭并刷新，避免「确 定」再次提交造成重复记录
      proxy.$modal.msgSuccess("二维码已生成(scene=" + res.data.sceneId + ")，可到列表下载/修改")
      open.value = false
      getList()
    } else {
      proxy.$modal.msgError((res && res.msg) || "生成失败")
    }
  } finally {
    genLoading.value = false
  }
}

/** 修改按钮操作 */
function handleUpdate(row: WxQrScene) {
  reset()
  const _id = (row && row.id) || ids.value[0]
  getQr(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改二维码管理"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["qrRef"].validate((valid: boolean) => {
    if (valid) {
      if (form.value.id != null) {
        updateQr(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addQr(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row: WxQrScene) {
  const _ids = (row && row.id) || ids.value
  proxy.$modal.confirm('是否确认删除二维码管理编号为"' + _ids + '"的数据项？').then(function() {
    return delQr(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功") }).catch((e: any) => { if (e && e.message && e.message !== "cancel") { proxy.$modal.msgError(e.message || "操作失败"); } })
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('wx/qr/export', {
    ...quejlParams.value
  }, `qr_${new Date().getTime()}.xlsx`)
}

getList()
</script>
