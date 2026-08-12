<template>
  <div class="jl-login">
    <!-- 背景层 -->
    <div class="jl-bg">
      <div class="aurora a1"></div>
      <div class="aurora a2"></div>
      <div class="aurora a3"></div>
      <div class="jl-grid"></div>
      <canvas ref="particleCanvas"></canvas>
    </div>

    <div class="jl-wrap">
      <!-- 左侧品牌区 -->
      <div class="jl-brand">
        <div class="jl-logo">
          <div class="mark">知</div>
          <span>先知·智源</span>
        </div>
        <h1>洞见未来<br>赋能数字时代</h1>
        <p>统一身份认证入口，安全、高效、智能。<br>一次登录，直达您的数字化工作空间。</p>
        <div class="tags"><i>AI 智能</i><i>安全加密</i><i>多端适配</i></div>
        <div class="stats">
          <div><b>99.99%</b><span>服务可用性</span></div>
          <div><b>256-bit</b><span>企业级加密</span></div>
          <div><b>7 × 24</b><span>实时保障</span></div>
        </div>
      </div>

      <!-- 登录卡片 -->
      <div class="jl-card-wrap">
        <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="jl-form" size="large">
          <div class="jl-head">
            <h2>欢 迎 登 录</h2>
            <div class="sub">WELCOME BACK · SECURE ACCESS</div>
          </div>

          <el-form-item prop="username">
            <div class="jl-label">账 号</div>
            <el-input v-model="loginForm.username" type="text" auto-complete="off" placeholder="请输入账号">
              <template #prefix><svg-icon icon-class="user" /></template>
            </el-input>
          </el-form-item>

          <el-form-item prop="password">
            <div class="jl-label">密 码</div>
            <el-input v-model="loginForm.password" type="password" auto-complete="off" placeholder="请输入密码" @keyup.enter="handleLogin">
              <template #prefix><svg-icon icon-class="password" /></template>
            </el-input>
          </el-form-item>

          <el-form-item prop="code" v-if="captchaEnabled">
            <div class="jl-label">验 证 码</div>
            <el-input v-model="loginForm.code" auto-complete="off" placeholder="请输入验证码" @keyup.enter="handleLogin">
              <template #prefix><svg-icon icon-class="validCode" /></template>
              <template #suffix>
                <img :src="codeUrl" @click="getCode" class="jl-code-img" title="点击刷新" />
              </template>
            </el-input>
          </el-form-item>

          <div class="jl-row">
            <el-checkbox v-model="loginForm.rememberMe">记住密码</el-checkbox>
            <router-link class="link-type" :to="'/register'" v-if="register">立即注册</router-link>
          </div>

          <el-button class="jl-btn" :loading="loading" type="primary" size="large" @click.prevent="handleLogin">
            <span v-if="!loading">登 录</span>
            <span v-else>登 录 中...</span>
          </el-button>
        </el-form>
      </div>
    </div>

    <!-- 底部 -->
    <div class="el-login-footer">
      <span>{{ footerContent }}</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { getCodeImg } from "@/api/login"
import Cookies from "js-cookie"
import { encrypt, decrypt } from "@/utils/jsencrypt"
import useUserStore from '@/store/modules/user'
import defaultSettings from '@/settings'
import type { CaptchaInfoResult } from '@/types/api/login'
import type { LoginForm } from '@/types/api/login'

const title = import.meta.env.VITE_APP_TITLE
const footerContent = defaultSettings.footerContent
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const { proxy } = getCurrentInstance()

const loginForm = ref<LoginForm>({
  username: "admin",
  password: "admin123",
  rememberMe: false,
  code: "",
  uuid: ""
})

const loginRules = {
  username: [{ required: true, trigger: "blur", message: "请输入您的账号" }],
  password: [{ required: true, trigger: "blur", message: "请输入您的密码" }],
  code: [{ required: true, trigger: "change", message: "请输入验证码" }]
}

const codeUrl = ref("")
const loading = ref(false)
// 验证码开关
const captchaEnabled = ref(true)
// 注册开关
const register = ref(false)
const redirect = ref<string | undefined>(undefined)

watch(route, (newRoute: any) => {
    redirect.value = (newRoute.query && newRoute.query.redirect) as string | undefined
}, { immediate: true })

function handleLogin(): void {
  proxy.$refs.loginRef.validate((valid: boolean) => {
    if (valid) {
      loading.value = true
      // 勾选了需要记住密码设置在 cookie 中设置记住用户名和密码
      if (loginForm.value.rememberMe) {
        Cookies.set("username", loginForm.value.username, { expires: 30 })
        Cookies.set("password", encrypt(loginForm.value.password), { expires: 30 })
        Cookies.set("rememberMe", loginForm.value.rememberMe, { expires: 30 })
      } else {
        // 否则移除
        Cookies.remove("username")
        Cookies.remove("password")
        Cookies.remove("rememberMe")
      }
      // 调用action的登录方法
      userStore.login(loginForm.value).then(() => {
        const query = route.query
        const otherQuejlParams = Object.keys(query).reduce((acc: Record<string, any>, cur) => {
          if (cur !== "redirect") {
            acc[cur] = query[cur]
          }
          return acc
        }, {})
        router.push({ path: redirect.value || "/", query: otherQuejlParams })
      }).catch(() => {
        loading.value = false
        // 重新获取验证码
        if (captchaEnabled.value) {
          getCode()
        }
      })
    }
  })
}

function getCode(): void {
  getCodeImg().then(res => {
    captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled
    if (captchaEnabled.value) {
      codeUrl.value = "data:image/gif;base64," + res.img
      loginForm.value.uuid = res.uuid
    }
  })
}

function getCookie(): void {
  const username = Cookies.get("username")
  const password = Cookies.get("password")
  const rememberMe = Cookies.get("rememberMe")
  loginForm.value = {
    username: username === undefined ? loginForm.value.username : username,
    password: password === undefined ? loginForm.value.password : decrypt(password),
    rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
  }
}

getCode()
getCookie()

/* ===== 粒子动画 ===== */
interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  r: number
}

const particleCanvas = ref<HTMLCanvasElement>()

function initParticles(): void {
  const canvas = particleCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext("2d")
  if (!ctx) return
  let w = 0
  let h = 0
  let rafId = 0
  const ps: Particle[] = []

  const resize = (): void => {
    w = canvas.width = window.innerWidth
    h = canvas.height = window.innerHeight
    const n = Math.min(120, Math.floor(w / 12))
    ps.length = 0
    for (let i = 0; i < n; i++) {
      ps.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.6
      })
    }
  }
  resize()
  window.addEventListener("resize", resize)

  const draw = (): void => {
    ctx.clearRect(0, 0, w, h)
    for (const p of ps) {
      p.x += p.vx
      p.y += p.vy
      if (p.x < 0 || p.x > w) p.vx *= -1
      if (p.y < 0 || p.y > h) p.vy *= -1
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(125,211,252," + (0.25 + Math.random() * 0.35) + ")"
      ctx.fill()
    }
    for (let i = 0; i < ps.length; i++) {
      for (let j = i + 1; j < ps.length; j++) {
        const a = ps[i]
        const b = ps[j]
        const d = Math.hypot(a.x - b.x, a.y - b.y)
        if (d < 130) {
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.strokeStyle = "rgba(139,92,246," + (1 - d / 130) * 0.25 + ")"
          ctx.lineWidth = 1
          ctx.stroke()
        }
      }
    }
    rafId = requestAnimationFrame(draw)
  }
  draw()

  onBeforeUnmount(() => {
    cancelAnimationFrame(rafId)
    window.removeEventListener("resize", resize)
  })
}

onMounted(initParticles)
</script>
<style lang='scss' scoped>
.jl-login {
  --cyan: #22d3ee;
  --violet: #8b5cf6;
  --pink: #ec4899;
  --text: #e6edf7;
  --dim: #8b94b0;
  // Element Plus 变量覆盖，保证深浅主题下都是暗黑玻璃风
  --el-input-bg-color: rgba(255, 255, 255, 0.045);
  --el-input-border-color: rgba(148, 163, 255, 0.18);
  --el-input-hover-border-color: rgba(34, 211, 238, 0.45);
  --el-input-focus-border-color: var(--cyan);
  --el-input-placeholder-color: #55618a;
  --el-input-text-color: var(--text);
  --el-checkbox-text-color: var(--dim);
  --el-checkbox-checked-text-color: #7dd3fc;
  --el-checkbox-checked-bg-color: var(--cyan);
  --el-checkbox-checked-input-border-color: var(--cyan);
  --el-button-loading-mask-color: rgba(4, 18, 26, 0.18);

  position: relative;
  height: 100%;
  overflow: hidden;
  font-family: "PingFang SC", "Microsoft YaHei", "Segoe UI", sans-serif;
  background: #05060f;
  color: var(--text);

  /* ===== 背景层 ===== */
  .jl-bg {
    position: fixed;
    inset: 0;
    z-index: 0;

    .aurora {
      position: absolute;
      border-radius: 50%;
      filter: blur(120px);
      opacity: 0.55;
      animation: jl-drift 18s ease-in-out infinite alternate;
    }
    .a1 {
      width: 55vw; height: 55vw; left: -15vw; top: -20vw;
      background: radial-gradient(circle, #123c63, transparent 65%);
    }
    .a2 {
      width: 50vw; height: 50vw; right: -12vw; top: -8vw;
      background: radial-gradient(circle, #2a1a5e, transparent 65%);
      animation-delay: -6s;
    }
    .a3 {
      width: 45vw; height: 45vw; left: 20vw; bottom: -25vw;
      background: radial-gradient(circle, #3c1040, transparent 65%);
      animation-delay: -12s;
    }
  }

  .jl-grid {
    position: fixed;
    inset: 0;
    z-index: 0;
    background:
      linear-gradient(rgba(34, 211, 238, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(34, 211, 238, 0.05) 1px, transparent 1px);
    background-size: 56px 56px;
    -webkit-mask: radial-gradient(ellipse 70% 60% at 50% 45%, #000 30%, transparent 75%);
    mask: radial-gradient(ellipse 70% 60% at 50% 45%, #000 30%, transparent 75%);
  }

  canvas {
    position: fixed;
    inset: 0;
    z-index: 1;
  }

  @keyframes jl-drift {
    from { transform: translate(0, 0) scale(1); }
    to { transform: translate(6vw, 4vw) scale(1.15); }
  }

  /* ===== 版式 ===== */
  .jl-wrap {
    position: relative;
    z-index: 2;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9vw;
    padding: 0 6vw;
  }

  /* ===== 左侧品牌区 ===== */
  .jl-brand {
    flex: 0 0 420px;
    animation: jl-rise 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) both;

    .jl-logo {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 34px;

      .mark {
        width: 52px; height: 52px; border-radius: 14px;
        background: linear-gradient(135deg, var(--cyan), var(--violet) 55%, var(--pink));
        display: flex; align-items: center; justify-content: center;
        font-weight: 800; font-size: 24px; color: #fff;
        animation: jl-glow 3s ease-in-out infinite;
      }
      span {
        font-size: 26px; font-weight: 800; letter-spacing: 4px;
        background: linear-gradient(90deg, #7dd3fc, #a78bfa, #f0abfc);
        -webkit-background-clip: text; background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }
    h1 {
      font-size: 44px; line-height: 1.25; font-weight: 800; margin-bottom: 18px;
      background: linear-gradient(120deg, #e0f2fe 10%, #67e8f9 45%, #a78bfa 80%);
      -webkit-background-clip: text; background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p {
      color: var(--dim); font-size: 15px; line-height: 1.9; letter-spacing: 0.5px;
    }
    .tags {
      margin-top: 26px; display: flex; gap: 10px; flex-wrap: wrap;
      i {
        font-style: normal; font-size: 12px; padding: 6px 14px; border-radius: 99px;
        color: #9fd8ef; background: rgba(34, 211, 238, 0.08);
        border: 1px solid rgba(34, 211, 238, 0.25); letter-spacing: 2px;
      }
    }
    .stats {
      margin-top: 34px; display: flex; gap: 44px;
      b {
        font-size: 24px; font-weight: 800;
        background: linear-gradient(90deg, #67e8f9, #a78bfa);
        -webkit-background-clip: text; background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      span { display: block; font-size: 12px; color: var(--dim); margin-top: 4px; letter-spacing: 1px; }
    }
  }

  @keyframes jl-glow {
    0%, 100% { box-shadow: 0 0 24px rgba(34, 211, 238, 0.4); }
    50% { box-shadow: 0 0 44px rgba(139, 92, 246, 0.6); }
  }

  /* ===== 登录卡片 ===== */
  .jl-card-wrap {
    position: relative;
    animation: jl-rise 0.9s 0.12s cubic-bezier(0.2, 0.8, 0.2, 1) both;

    &::before {
      content: "";
      position: absolute;
      inset: -2px;
      z-index: -1;
      border-radius: 26px;
      background: linear-gradient(135deg, rgba(34, 211, 238, 0.5), rgba(139, 92, 246, 0.4), rgba(236, 72, 153, 0.4));
      filter: blur(18px);
      opacity: 0.55;
      animation: jl-card-glow 4s ease-in-out infinite alternate;
    }
  }

  @keyframes jl-card-glow {
    from { opacity: 0.35; }
    to { opacity: 0.7; }
  }

  @keyframes jl-rise {
    from { opacity: 0; transform: translateY(34px); }
    to { opacity: 1; transform: none; }
  }

  .jl-form {
    width: 420px;
    padding: 44px 40px 30px;
    border-radius: 24px;
    background: rgba(13, 17, 32, 0.72);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(148, 163, 255, 0.18);
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.06);

    .jl-head {
      text-align: center;
      margin-bottom: 30px;
      h2 { font-size: 22px; font-weight: 700; letter-spacing: 6px; }
      .sub { font-size: 12px; color: var(--dim); margin-top: 10px; letter-spacing: 3px; }
    }

    .jl-label {
      font-size: 12px;
      color: var(--dim);
      margin-bottom: 8px;
      letter-spacing: 2px;
    }

    .jl-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 2px 0 20px;
    }

    .link-type {
      font-size: 13px;
      color: #7dd3fc;
      text-decoration: none;
      transition: 0.3s;
      &:hover { color: #a5f3fc; text-shadow: 0 0 12px rgba(34, 211, 238, 0.8); }
    }

    /* ===== Element Plus 组件美化 ===== */
    :deep(.el-form-item) {
      margin-bottom: 22px;
    }

    :deep(.el-form-item__error) {
      font-size: 12px;
      color: #f87171;
      padding-top: 2px;
    }

    :deep(.el-input) {
      height: 48px;

      .el-input__wrapper {
        height: 48px;
        padding: 0 14px;
        border-radius: 12px;
        background: var(--el-input-bg-color);
        box-shadow: 0 0 0 1px var(--el-input-border-color) inset;
        transition: 0.3s;

        &:hover {
          box-shadow: 0 0 0 1px var(--el-input-hover-border-color) inset;
        }

        &.is-focus {
          box-shadow: 0 0 0 1px var(--cyan) inset, 0 0 0 3px rgba(34, 211, 238, 0.15), 0 0 24px rgba(34, 211, 238, 0.25);
          background: rgba(34, 211, 238, 0.05);
        }
      }

      .el-input__inner {
        height: 48px;
        font-size: 15px;
        letter-spacing: 1px;
        font-family: inherit;
      }

      .el-input__prefix {
        font-size: 16px;
        color: #5b6b8f;
        margin-right: 8px;
      }
    }

    :deep(.jl-code-img) {
      height: 32px;
      width: 90px;
      border-radius: 8px;
      cursor: pointer;
      object-fit: cover;
      border: 1px solid rgba(148, 163, 255, 0.25);
      transition: 0.3s;

      &:hover {
        border-color: var(--cyan);
        box-shadow: 0 0 12px rgba(34, 211, 238, 0.3);
      }
    }

    :deep(.el-checkbox) {
      height: 20px;

      .el-checkbox__label {
        font-size: 13px;
        padding-left: 6px;
      }

      .el-checkbox__inner {
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.06);
      }
    }

    .jl-btn {
      width: 100%;
      height: 50px;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 8px;
      color: #04121a;
      background: linear-gradient(90deg, #22d3ee, #8b5cf6 55%, #ec4899);
      background-size: 200% 100%;
      box-shadow: 0 10px 30px rgba(34, 211, 238, 0.35);
      transition: 0.35s;

      &:hover,
      &:focus {
        background: linear-gradient(90deg, #22d3ee, #8b5cf6 55%, #ec4899);
        background-size: 200% 100%;
        background-position: 100% 0;
        box-shadow: 0 10px 40px rgba(236, 72, 153, 0.45);
        transform: translateY(-2px);
        color: #04121a;
      }

      &:active {
        transform: translateY(0);
      }
    }
  }

  /* ===== 底部 ===== */
  .el-login-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 2;
    text-align: center;
    font-size: 12px;
    color: #3d4a6e;
    letter-spacing: 2px;
    padding: 14px 0;
    background: linear-gradient(transparent, rgba(5, 6, 15, 0.8));
  }

  /* ===== 小屏适配 ===== */
  @media (max-width: 1080px) {
    .jl-brand { display: none; }
    .jl-wrap { gap: 0; }
  }
}
</style>
