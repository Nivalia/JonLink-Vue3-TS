# JonLink 前端 (JonLink-Vue3-TS)

基于 Vue 3 + TypeScript + Vite + Element Plus 的 JonLink 后台前端,与 [JonLink-Vue](https://github.com/...) 后端配套使用。

## 技术栈

- **框架**: Vue 3 (Composition API)
- **脚本**: TypeScript
- **构建**: Vite
- **UI**: Element Plus
- **状态**: Pinia
- **路由**: Vue Router 4
- **HTTP**: axios(拦截器自动注入 `Authorization: Bearer <token>`)
- **图表**: ECharts
- **3D / 大屏**: three.js(数据大屏模块)

## 模块

| 路径 | 说明 |
|---|---|
| `src/views/login` | 登录页 |
| `src/views/system` | 用户 / 角色 / 菜单 / 部门(基表管理) |
| `src/views/wx` | 公众号管理 / 粉丝 / 模板消息 / 台账 |
| `src/views/fin` | 财务凭证 / 科目 / 报表 |
| `src/views/policy` | 政策展示(2 级分类 + 图片 + 版本历史) |
| `src/views/h5` | 公众号 H5 端(fan 粉丝中心) |
| `src/views/jonlink` | JonLink 专属业务模块 |
| `src/views/dashboard` | 数据大屏(暗色主题,three.js 3D 地图) |

## 启动

```bash
# 开发
npm install
npm run dev   # 默认连 /prod-api → nginx 80 → 后端 8080

# 构建
npm run build # 产物:dist/
```

## 环境变量(开发期)

后端 API base 走 `/prod-api/...` 通过 nginx 反代(见后端 README 的部署章节)。
无需在 `.env` 写具体地址 — 由 nginx 统一处理。

## 关键约定(项目级铁律)

- **顶部"删除按钮"防崩**:`handleDelete(row?: T)` 第一句永远 `(row && row.id) || ids.value` 守护,
  不能 `row.id || ids.value` 直接写。详见 memory。
- **RuoYi-vue-element-plus 默认行为**:弹窗/表单样式沿用项目风格,不强加 Element UI 老习惯。
- **暗色表格**:数据大屏模块 `.dark-table` `:deep(th.el-table__cell)` 强制覆盖 header 颜色。
- **菜单父子路由**:动态路由父子 `path` 严禁同名,`sys_menu.component` 必须带 `/index`。

## 配套项目

- 后端: [JonLink-Vue](https://github.com/...) (SpringBoot 4 + MyBatis)
- 独立政策展示壳: `../policy-view-app/`(Vue 3 简化版,用于微信内置页分享)

---

## 历史

本项目前端初期 fork 自 RuoYi-Vue3-TypeScript;**业务模块(财务/政策/微信/H5/数据大屏)完全自建**,基表管理视图沿用 RuoYi 上游模板。