<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="页面名称" prop="pageName">
        <el-input v-model="queryParams.pageName" placeholder="请输入页面名称" clearable style="width: 180px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
          <el-option v-for="dict in jonlink_enable_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['wx:h5Page:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['wx:h5Page:remove']">删除</el-button>
      </el-col>
      <el-col :span="8">
        <span style="font-size: 12px; color: #8a94a6;">H5 页面为模板消息跳转目标，url_rule 中 {ticket} 推送时自动替换为 24h 防伪凭证</span>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="h5PageList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="45" align="center" />
      <el-table-column label="页面名称" align="center" prop="pageName" show-overflow-tooltip min-width="120" />
      <el-table-column label="页面编码" align="center" prop="pageCode" show-overflow-tooltip min-width="120" />
      <el-table-column label="访问路径" align="center" prop="pagePath" show-overflow-tooltip min-width="180">
        <template #default="scope">
          <el-link type="primary" :href="'http://' + locationHost + scope.row.pagePath + '?ticket=preview'" target="_blank" @click.prevent="openPreview(scope.row)">{{ scope.row.pagePath }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="说明" align="center" prop="pageDesc" show-overflow-tooltip min-width="200" />
      <el-table-column label="状态" align="center" prop="status" width="80">
        <template #default="scope">
          <dict-tag :options="jonlink_enable_disable" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="230">
        <template #default="scope">
          <el-button link type="primary" icon="Link" @click="handleTicket(scope.row)" v-hasPermi="['wx:h5Page:query']">链接</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['wx:h5Page:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['wx:h5Page:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加/修改对话框 -->
    <el-dialog :title="title" v-model="open" width="640px" append-to-body>
      <el-form ref="h5PageRef" :model="form" :rules="rules" label-width="90px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="页面编码" prop="pageCode">
              <el-input v-model="form.pageCode" placeholder="如 order_dashboard" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="页面名称" prop="pageName">
              <el-input v-model="form.pageName" placeholder="请输入页面名称" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="访问路径" prop="pagePath">
              <el-input v-model="form.pagePath" placeholder="如 /h5/order-dashboard.html" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="页面说明">
              <el-input v-model="form.pageDesc" type="textarea" placeholder="页面用途说明" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in jonlink_enable_disable" :key="dict.value" :value="dict.value">{{ dict.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sortOrder">
              <el-input-number v-model="form.sortOrder" :min="0" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="form.remark" type="textarea" placeholder="备注" />
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

    <!-- 生成链接对话框 -->
    <el-dialog title="生成 H5 访问链接" v-model="ticketOpen" width="560px" append-to-body>
      <el-form label-width="90px">
        <el-form-item label="页面">
          <el-input :model-value="ticketForm.pageName" disabled />
        </el-form-item>
        <el-form-item label="openid">
          <el-select v-model="ticketForm.openid" filterable placeholder="选择粉丝（或手动输入）" allow-create style="width: 100%">
            <el-option v-for="f in fanList" :key="f.openid" :label="(f.nickname || f.phone || f.openid)" :value="f.openid" />
          </el-select>
        </el-form-item>
        <el-form-item label="访问链接">
          <el-input v-model="ticketForm.url" type="textarea" :rows="3" placeholder="选择粉丝后自动生成" readonly />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="copyTicket">复制链接</el-button>
          <el-button @click="ticketOpen = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="H5Page">
import { listH5Page, getH5Page, delH5Page, addH5Page, updateH5Page, genTicket } from "@/api/wx/h5Page"
import request from "@/utils/request"

const { proxy } = getCurrentInstance()
const { jonlink_enable_disable } = useDict('jonlink_enable_disable')

const h5PageList = ref<any[]>([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref<number[]>([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")
const fanList = ref<any[]>([])
const ticketOpen = ref(false)
const ticketForm = reactive({ pageName: "", pagePath: "/h5/order-dashboard.html", openid: "", url: "" })
const locationHost = ref(window.location.host)

const data = reactive({
  form: {} as any,
  queryParams: { pageNum: 1, pageSize: 10, pageName: undefined, status: undefined },
  rules: {
    pageCode: [{ required: true, message: "页面编码不能为空", trigger: "blur" }],
    pageName: [{ required: true, message: "页面名称不能为空", trigger: "blur" }],
    pagePath: [{ required: true, message: "访问路径不能为空", trigger: "blur" }]
  }
})

const { queryParams, form, rules } = toRefs(data)

function getList() {
  loading.value = true
  listH5Page(queryParams.value).then((response: any) => {
    h5PageList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

function cancel() {
  open.value = false
  reset()
}

function reset() {
  form.value = { pageCode: null, pageName: null, pagePath: null, pageDesc: null, status: "1", sortOrder: 0, remark: null }
  proxy.resetForm("h5PageRef")
}

function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

function handleSelectionChange(selection: any[]) {
  ids.value = selection.map((item: any) => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

function handleAdd() {
  reset()
  open.value = true
  title.value = "添加 H5 页面"
}

function handleUpdate(row: any) {
  reset()
  const _id = (row && row.id) || ids.value[0]
  getH5Page(_id).then((response: any) => {
    form.value = response.data
    open.value = true
    title.value = "修改 H5 页面"
  })
}

function submitForm() {
  proxy.$refs["h5PageRef"].validate((valid: boolean) => {
    if (valid) {
      if (form.value.id != null) {
        updateH5Page(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addH5Page(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

function handleDelete(row: any) {
  const _ids = (row && row.id) || ids.value
  proxy.$modal.confirm('是否确认删除H5页面编号为"' + _ids + '"的数据项？').then(() => {
    return delH5Page(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功") }).catch((e: any) => { if (e && e.message && e.message !== "cancel") { proxy.$modal.msgError(e.message || "操作失败"); } })
}

/** 打开预览（ticket 缺失时提示） */
function openPreview(row: any) {
  proxy.$modal.msgWarning("请先点「链接」生成带 ticket 的访问链接")
}

/** 生成 ticket 链接 */
function handleTicket(row: any) {
  ticketForm.pageName = (row && row.pageName) || ''
  ticketForm.pagePath = (row && row.pagePath) || ''
  ticketForm.openid = ""
  ticketForm.url = ""
  if (fanList.value.length === 0) {
    request({ url: "/wx/user/list", method: "get", params: { pageNum: 1, pageSize: 200 } }).then((res: any) => {
      fanList.value = res.rows || []
      ticketOpen.value = true
    })
  } else {
    ticketOpen.value = true
  }
}

/** 生成并复制链接 */
function copyTicket() {
  if (!ticketForm.openid) {
    proxy.$modal.msgWarning("请选择粉丝")
    return
  }
  genTicket({ openid: ticketForm.openid, pagePath: ticketForm.pagePath }).then((res: any) => {
    ticketForm.url = res.data.url
    proxy.$modal.msgSuccess("链接已生成（24h 有效）")
  })
}

getList()
</script>
