# 迁移说明（MIGRATION.md）

> 本文档用于把本项目从一台设备迁移到另一台设备继续开发。
> **读者可能是新设备上的 AI 助手** —— 请先完整读完本文再动手。

---

## 一、这个包是什么

一份 **Next.js 14 全栈外贸独立站源码**（宠物用品 + 手工制品），
当前状态：**功能完整可运行**，已构建通过、已验证、已部署过在线预览。

**包内已包含**：全部源码、Prisma 数据模型、演示数据、配置文件、`.env`（**仅含占位符，无任何真实密钥**）、README。

**包内不包含**（需要在目标设备重新生成）：

| 目录 | 原因 |
|---|---|
| `node_modules/` | 体积大（约 588MB）且与平台相关，重装更可靠 |
| `.next/` | 构建缓存，会自动重新生成 |
| `tsconfig.tsbuildinfo` | 临时文件 |

---

## 二、目标设备上的恢复步骤

### 第 1 步：确认环境

需要 **Node.js 18+**（项目在 Node 22 上开发）与 **npm**。

```bash
node -v      # 期望 v18 以上
npm -v
```

### 第 2 步：安装依赖

```bash
cd <解压后的项目目录>
npm install
```

耗时约 1–3 分钟（视网络而定）。**这一步必须在目标设备执行**，不要拷贝 `node_modules`。

### 第 3 步：确认环境变量

仓库内已带 `.env`，内容为演示模式配置，**无需修改即可运行**：

```bash
DEMO_MODE="true"
NEXT_PUBLIC_DEMO_MODE="true"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_NAME="Paw & Craft"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="demo-secret-for-preview-only-32chars"
```

> ⚠️ 上述 `NEXTAUTH_SECRET` 是**演示用值**，仅够本地预览。
> 将来上线前必须用 `openssl rand -base64 32` 重新生成。

### 第 4 步：构建并启动

```bash
npm run build
npm run start            # → http://localhost:3000
```

> **演示模式下不需要数据库**。项目全程跑在 `DEMO_MODE=true`，
> 前台与后台都使用内置示例数据。**不要**执行 `db:push` 或 `db:seed`。

如果 `npm run build` 报 Prisma 相关错误（缺少 `DATABASE_URL`），
按下面方式临时给一个占位值即可，构建与运行都不受影响：

```bash
DATABASE_URL="postgresql://u:p@localhost:5432/db" npm run build
```

或者开发模式（热更新，无需 build）：

```bash
npm run dev
```

### 第 5 步：验证

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000
# 期望输出 200
```

浏览器打开这些地址确认：

| 地址 | 期望 |
|---|---|
| `http://localhost:3000` | 首页正常渲染 |
| `http://localhost:3000/products` | 商品列表 6 个商品 |
| `http://localhost:3000/products/handmade-leather-collar` | 详情页，色卡含 Custom 白块 |
| `http://localhost:3000/checkout` | 空车时仍显示 Style/Size 区块 |
| `http://localhost:3000/admin` | Dashboard，默认 Today，含 4 组图表 |

---

## 三、给新设备上的 AI 的提示

如果你是新会话中的 AI，接手这个项目时请注意：

1. **先读 `README.md`** —— 里面有完整的技术栈、目录结构、功能清单与设计取舍。
2. **语言约定**：**网站内容（面向用户）必须是英文；与用户沟通、代码注释用中文。**
3. **零依赖约束**：项目刻意不引入图表库和动画库。所有图表是手写内联 SVG
   （`src/components/admin/`），动效是纯 CSS。**新增可视化请复用已有组件，不要装新库。**
4. **演示/真实双通道**：`src/lib/content.ts` 与 `src/lib/analytics.ts` 都采用
   「演示模式读内置数据，真实模式读数据库」的写法。改动时保持这个模式。
5. **数据来源**：Dashboard 中订单量/销售额/热销产品走真实查询（演示下叠加模拟基线）；
   访问量/国家/渠道是**基于日期的种子伪随机**生成（同一天刷新结果一致，不要改成 `Math.random()`）。
6. **不要删除 `.codebuddy` 目录**（如存在）—— 那是项目相关数据，非临时缓存。

---

## 四、继续往下做的可能方向

按优先级排列，具体以用户指令为准：

**内容替换（上线前必做）**
- 替换 `src/lib/demo-data.ts` 中所有占位文案为最终文案
- 替换 Unsplash 示例图为真实产品图（首页 Hero、商品图、列表页页头）

**支付接入（上线前必做）**
- 在 `/admin/payments` 或 `.env` 填入四家网关的真实商户密钥
- 以各网关官方文档核对 `src/lib/payments/sign.ts` 的字段名与签名顺序
- 在各网关后台配置回调白名单

**功能增强（可选）**
- 接入真实邮件发送（`src/lib/mailer.ts` 已预留 SendGrid 接口）
- 接入埋点采集（建 `/api/track` 路由，替换 `analytics.ts` 中的模拟函数）
- 附件存储改接对象存储（当前为 `public/uploads/custom/` 本地目录）
- 购物车升级为 Context / Zustand（当前为 localStorage）
- 多语言（next-intl）+ 多货币汇率换算

---

## 五、常见问题

**Q：`npm run build` 失败，提示 Prisma 找不到 DATABASE_URL？**
A：演示模式不需要数据库，但 Prisma 在构建时会校验 schema。
给一个占位连接串即可（见第 4 步），不影响运行。

**Q：启动后页面空白 / 样式错乱？**
A：删除 `.next` 后重新 `npm run build`。若仍异常，确认 `npm install` 完整执行无报错。

**Q：端口 3000 被占用？**
A：`npx next start -p 3001` 换端口，或先释放 3000（`fuser -k 3000/tcp`）。

**Q：能在新设备上直接跑旧设备构建好的产物吗？**
A：不建议。`.next` 与 `node_modules` 都未包含在包内，且它们是平台相关的。
在目标设备重新 `npm install` + `npm run build` 是最稳妥的方式。

**Q：`.env` 里为什么没有数据库和支付密钥？**
A：项目一直以演示模式开发，从未配置真实密钥，因此包里没有任何敏感信息，可安全传输。
