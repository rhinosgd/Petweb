# Paw & Craft — 宠物 + 手工 外贸独立站（Next.js 全栈自建）

一个**不依赖 WordPress / Shopify** 的自托管外贸电商系统，面向「宠物用品 + 手工制品」品类，
视觉与信息架构参照 [maxbone.com](https://www.maxbone.com/) 的编辑化排版风格。

- **前台营销站**：首页 / 商品列表 / 商品详情 / 关于 / 博客 / 结账 / 客户中心
- **独立管理后台**：数据分析 Dashboard、站点内容、商品、订单、定做工单、支付配置
- **统一支付层**：内置 4 家收款网关 —— **Stripe / PayPal / 钱海 Oceanpayment / Wintopay**
- **定做（Custom）报价流程**：客户提交需求 → 后台报价 → 客户接受/拒绝 → 生成待付款订单
- **全站文案为英文**（面向海外买家）

---

## 一、技术栈

| 层 | 选型 |
|---|---|
| 框架 | Next.js 14.2（App Router）+ React 18 + TypeScript |
| 样式 | Tailwind CSS 3.4（近黑 + 米白 + 低饱和点缀的编辑化风格） |
| 图标 | lucide-react |
| 图表 | **纯手写内联 SVG**（未引入任何图表库） |
| 动画 | **纯 CSS `@keyframes` + transition**（未引入动画库） |
| 数据库 | PostgreSQL + Prisma ORM 5 |
| 鉴权 | NextAuth（Credentials，保护 `/admin`） |
| 支付 | 自研 `PaymentProvider` 抽象 + 4 家网关实现 |

> 设计约束（重要）：项目刻意保持**零图表库、零动画库**。新增可视化请优先复用
> `src/components/admin/` 下已有的纯 SVG 组件，不要为此安装大型依赖。

---

## 二、快速开始（演示模式，无需数据库）

项目支持 **DEMO_MODE**：开启后整站（前台 + 后台）使用内置示例数据运行，
**不需要 PostgreSQL、不需要跑 migrate/seed**，适合快速预览与开发。

```bash
# 1. 安装依赖
npm install

# 2. 确认 .env 中演示模式已开启（仓库内已配好）
#    DEMO_MODE="true"
#    NEXT_PUBLIC_DEMO_MODE="true"

# 3. 构建并启动
npm run build
npm run start          # → http://localhost:3000
```

开发模式（热更新）：

```bash
npm run dev            # → http://localhost:3000
```

**访问入口**

| 入口 | 地址 |
|---|---|
| 前台首页 | http://localhost:3000 |
| 商品列表 | http://localhost:3000/products |
| 结账 | http://localhost:3000/checkout |
| 客户定做查询 | http://localhost:3000/account/custom-orders |
| **管理后台** | http://localhost:3000/admin |

---

## 三、连接真实数据库（关闭演示模式）

```bash
# 1. 准备 PostgreSQL，把连接串写入 .env
#    DATABASE_URL="postgresql://user:password@host:5432/petcraft?schema=public"

# 2. 关闭演示模式
#    DEMO_MODE="false"
#    NEXT_PUBLIC_DEMO_MODE="false"

# 3. 生成密钥
openssl rand -base64 32      # 填入 NEXTAUTH_SECRET

# 4. 建表
npm run db:push              # 或 npm run db:migrate

# 5. 灌入种子数据（管理员 / 站点内容 / 示例商品 / 支付网关）
npm run db:seed

# 6. 启动
npm run build && npm run start
```

后台默认账号见 `.env` 的 `ADMIN_EMAIL` / `ADMIN_PASSWORD`。

---

## 四、目录结构

```
prisma/
├─ schema.prisma              # 数据模型（含 AnalyticsEvent 埋点表）
└─ seed.ts                    # 种子数据

src/
├─ app/
│  ├─ page.tsx                # 首页（Hero / 精选 / 品牌故事 / 评价）
│  ├─ products/               # 商品列表（左侧文案 + 右侧配图的编辑化页头）
│  │  └─ [slug]/              #   商品详情（对齐 maxbone 完整结构）
│  ├─ about/  blog/           # 关于 / 博客
│  ├─ checkout/               # 结账 + 成功页（含 Style/Size 变量）
│  ├─ custom/[slug]/          # 定做询价表单页
│  ├─ account/custom-orders/  # 客户定做订单查询（邮箱 + 单号）
│  ├─ admin/                  # 🔧 后台
│  │  ├─ page.tsx             #   Dashboard（数据分析，服务端取数）
│  │  ├─ DashboardView.tsx    #   Dashboard 客户端视图
│  │  ├─ login/               #   登录
│  │  ├─ settings/            #   站点设置（改前台文案/图片）
│  │  ├─ products/            #   商品管理
│  │  ├─ orders/              #   订单管理
│  │  ├─ custom-orders/       #   定做工单管理（报价）
│  │  └─ payments/            #   支付配置
│  └─ api/
│     ├─ auth/                #   NextAuth
│     ├─ checkout/            #   下单 + 发起支付
│     ├─ custom-requests/     #   定做工单（提交/查询/报价/响应）
│     ├─ upload/              #   定做附件上传（本地目录）
│     ├─ settings/ products/  #   后台内容读写
│     ├─ payment-config/      #   支付网关配置读写
│     └─ payment/{gateway}/callback/   # 四家支付回调
├─ components/
│  ├─ admin/                  # 后台专用
│  │  ├─ VisitsChart.tsx          # 7 日访问折线（早期版本）
│  │  ├─ RevenueOrdersChart.tsx   # 订单量+销售额双轴曲线
│  │  ├─ RankBarChart.tsx         # 横向条形图（国家/渠道排行）
│  │  ├─ ColumnChart.tsx          # 竖向柱状图（热销产品）
│  │  ├─ RangeSwitcher.tsx        # 时间范围切换器
│  │  ├─ AdminSidebar/Topbar/Shell.tsx
│  │  └─ RichTextField / ImageSpecHint.tsx
│  ├─ AddToCart.tsx           # 详情页购买区（色卡 / 尺码 / Custom 入口）
│  ├─ CustomRequestForm.tsx   # 定做表单（含附件拖拽上传）
│  ├─ CustomOrdersLookup.tsx  # 客户定做单查询与接受/拒绝
│  ├─ CartDrawer.tsx  ProductCard.tsx  ProductGallery.tsx
│  ├─ Reviews.tsx  SpecAccordion.tsx  FaqAccordion.tsx
│  └─ SiteChrome.tsx          # 导航 + 页脚（含 Mega Menu）
└─ lib/
   ├─ prisma.ts auth.ts utils.ts
   ├─ cart.ts                 # 购物车模型（Style/Size/Custom 变体）
   ├─ product.ts              # 商品字段归一化
   ├─ content.ts              # 统一内容读取（演示/真实双通道）
   ├─ demo-data.ts            # 演示数据（商品/文章/评价/FAQ/设置）
   ├─ custom-requests.ts      # 定做工单数据层
   ├─ mailer.ts               # 邮件通知（预留接口 + 演示模拟）
   ├─ analytics.ts            # 📊 数据分析层（含埋点接口与渠道推断）
   └─ payments/               # 💳 统一支付层
      ├─ types.ts             #   PaymentProvider 接口
      ├─ config.ts            #   密钥加载（DB 优先，env 兜底）
      ├─ sign.ts              #   签名/验签/自动提交表单
      ├─ stripe.ts paypal.ts oceanpayment.ts wintopay.ts
      ├─ callback.ts          #   统一回调处理（验签+幂等+金额校验）
      └─ index.ts             #   getProvider() 路由
```

---

## 五、页面路由总览

| 路由 | 说明 |
|---|---|
| `/` | 首页 |
| `/products` | 商品列表 |
| `/products/[slug]` | 商品详情 |
| `/custom/[slug]` | 定做询价表单 |
| `/checkout` `/checkout/success` | 结账 / 成功页 |
| `/account/custom-orders` | 客户定做单查询 |
| `/about` `/blog` `/blog/[slug]` | 关于 / 博客 |
| `/admin` | 数据分析 Dashboard |
| `/admin/products` `/admin/orders` | 商品 / 订单管理 |
| `/admin/custom-orders` | 定做工单管理 |
| `/admin/payments` `/admin/settings` | 支付配置 / 站点设置 |

---

## 六、后台功能

### 6.1 数据分析 Dashboard（`/admin`）

四组模块，时间范围支持 **Today / 7 Days / 30 Days / 1 Year / Custom**，默认 **Today**，
选择通过 URL 参数同步（`/admin?range=30d`），可收藏可分享。

| 模块 | 内容 |
|---|---|
| **Orders & Revenue** | 双轴曲线（左轴订单数、右轴销售额）+ 三块关键数字（订单数/销售额/客单价）+ 环比涨跌 |
| **Top 10 Countries** | 国家排行，By Visits / By Orders 双 Tab，含访问量、下单量、转化率 |
| **Top 10 Products** | 近 30 天热销产品柱状图，悬浮显示销量与销售额 |
| **Traffic Channels** | 8 个渠道分布（搜索关键词/图片广告/视频广告/社交/引荐/邮件/直接/其他），双 Tab |
| **Top Search Keywords** | 搜索关键词及其访问量与下单量 |
| **Creative Performance** | 素材位表现（图片/视频/社交） |

**数据来源策略**（`src/lib/analytics.ts`）：

- **订单量、销售额、热销产品** → 真实数据库查询；演示模式下叠加确定性模拟基线。
- **访问量、国家、渠道** → 基于日期的**种子伪随机**生成，同一天多次刷新结果一致。
- **自动分桶**：当天按小时、7/30 天按天、1 年按月；自定义区间按跨度自动判定。

### 6.2 其他后台页面

| 页面 | 能做什么 |
|---|---|
| **站点设置** | 编辑前台首页标题/副标题/主图/CTA、品牌故事、页脚版权，保存即生效 |
| **商品管理** | 增删改查商品，含图片、价格、库存、分类、颜色、尺码、定制字段、首页精选开关 |
| **订单管理** | 查看订单、买家、金额、网关、状态、商品明细（含 Style/Size） |
| **定做工单** | 查看客户提交的定做需求与附件，填写报价金额与备注，状态流转 |
| **支付配置** | 开关 4 家网关、填密钥/商户号、设置支持币种、配置收银台地址 |

---

## 七、核心业务功能

### 7.1 Style / Size 商品变量

- 商品详情页购买区提供 **Color 色卡**（商品配色 + 末尾 Custom 白块）与 **Size 尺码**（商品尺码 + 末尾 Custom）。
- 购物车以 `variantKey()`（id + style + size + customText）作为行唯一键，
  避免不同规格被误合并。变量贯穿 详情页 → 购物车 → 结算页 → 订单表。
- 结算页**购物车为空时仍展示 Style / Size 区块**：此时选择存入 localStorage
  （`paw-craft-pending-variant`），客户之后从商品页加购时自动套用，套用后清空。
  优先级：**详情页显式选择 > 结算页偏好**。

### 7.2 定做（Custom）报价流程

触发方式：客户在详情页把 **Color 或 Size 选为 Custom** → 按钮变为「Request Custom Quote」→ 进入表单页。

流程链路：

```
客户提交定做表单（材料/颜色/尺寸/描述/邮箱 + 附件）
        ↓  状态 PENDING_QUOTE
后台收到工单 → 填写报价金额与备注
        ↓  状态 QUOTED（客户侧显示「等待付款」）
客户查询（邮箱 + 单号）→ 接受 → 生成待付款订单（linkedOrderNo）
                        → 拒绝 → 记录理由
```

- 单号格式：`CR{YYYYMMDDHHmm}{4位随机}`
- 附件存储：本地目录 `public/uploads/custom/`（支持图片 / PDF / Word，单文件上限 10MB）
- 邮件通知：`src/lib/mailer.ts` 预留真实发送接口（SendGrid），演示模式下打印日志模拟

### 7.3 客户定做单查询

`/account/custom-orders` —— 客户凭**邮箱 + 定做单号**查询进度，
可查看状态、报价、活动时间线，并执行接受付款 / 拒绝（附理由）。

---

## 八、四家支付网关接入

统一抽象接口（`src/lib/payments/types.ts`）：

```ts
interface PaymentProvider {
  createCheckout(input): Promise<{ redirectUrl?, clientPayload?, gatewayTxnId? }>;
  verifyCallback(payload, headers): Promise<{ success, orderNo, amount, ... }>;
}
```

### Stripe（信用卡 / Apple Pay / Google Pay）
- 模式：**PaymentIntent + clientSecret**，前端 Stripe.js 确认（不接触卡号，符合 PCI）
- 配置：`STRIPE_SECRET_KEY`、`STRIPE_WEBHOOK_SECRET`、`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- 回调：`POST /api/payment/stripe/callback`（**用原始 body 验签**）

### PayPal
- 模式：REST Orders v2 + approve 链接跳转（fetch 直连，无需官方 SDK）
- 配置：`PAYPAL_CLIENT_ID`、`PAYPAL_CLIENT_SECRET`、`PAYPAL_ENV=sandbox|live`
- 回调：`POST /api/payment/paypal/callback`

### 钱海 Oceanpayment（托管收银台）
- 模式：服务端生成签名 → **自动提交表单**跳转收银台 → 异步通知回填订单
- 配置：`OCEANPAYMENT_ACCOUNT`、`OCEANPAYMENT_TERMINAL`、`OCEANPAYMENT_SECURE_CODE`、`OCEANPAYMENT_GATEWAY_URL`
- 回调：`POST|GET /api/payment/oceanpayment/callback` → 返回纯文本 `SUCCESS`

### Wintopay（托管收银台）
- 模式：同钱海
- 配置：`WINTOPAY_MERCHANT_ID`、`WINTOPAY_SECRET_KEY`、`WINTOPAY_GATEWAY_URL`
- 回调：`POST|GET /api/payment/wintopay/callback` → 返回纯文本 `SUCCESS`

> ⚠️ **字段名与签名规则**：代码中的参数名为通用示例结构，
> 落地前请**以各网关官方最新文档为准**核对字段与拼接顺序。签名逻辑集中在 `sign.ts`，便于按文档微调。

**支付安全要点（已实现）**

1. **回调验签** —— 防伪造通知
2. **幂等处理** —— 已 PAID 的订单重复通知直接返回成功
3. **金额校验** —— 回调金额与订单金额不一致时标记 FAILED
4. **密钥隔离** —— 密钥只存服务端，后台仅显示「是否已配置」，不回传明文

---

## 九、埋点（预留，当前未采集）

`prisma/schema.prisma` 已定义 `AnalyticsEvent` 表（含 `EventType` / `Channel` 枚举），
字段覆盖：会话标识、访客标识、订单归因、渠道、渠道明细、国家、落地页、商品、附加信息。

`src/lib/analytics.ts` 已提供：

- `trackEvent(payload)` —— 事件上报入口（当前直接返回，未写库）
- `inferChannel(referer, utmSource)` —— 从来源推断渠道

**上线采集时**：新建 `/api/track` 路由（解析 UA / referer / IP 国家），
在前台页面调用即可；随后把 `analytics.ts` 中的 `simulate*` 系列函数
替换为对 `AnalyticsEvent` 的真实查询，**UI 无需改动**。

---

## 十、部署

1. **数据库**：Supabase / Neon / Railway 建 PostgreSQL，写入 `DATABASE_URL`
2. **应用**：Vercel（推荐）或 Railway / 自有服务器
   ```bash
   npm run build && npm start
   ```
3. **环境变量**：在平台配置全部 `.env` 项，`NEXT_PUBLIC_SITE_URL` 填正式域名
4. **支付回调白名单**：在各网关后台加入回调域名：
   - `https://你的域名/api/payment/stripe/callback`
   - `https://你的域名/api/payment/paypal/callback`
   - `https://你的域名/api/payment/oceanpayment/callback`
   - `https://你的域名/api/payment/wintopay/callback`
5. **强制 HTTPS**：支付回调必须 HTTPS
6. **附件目录**：`public/uploads/custom/` 需可写；生产建议改接对象存储（S3 / R2）

---

## 十一、尚未完成 / 待接入

- **四家支付网关的真实商户密钥**尚未填入（`/admin/payments` 或 `.env`）
- **真实产品图与最终文案**尚未替换（当前为 Unsplash 示例图 + 演示文案）
- **邮件真实发送**未接入（`mailer.ts` 已预留 SendGrid 接口）
- **埋点采集**未接入（表结构与接口已就绪，见第九节）
- 购物车目前为 localStorage 极简版，如需可升级为 Context / Zustand
- 多语言（next-intl）、多货币汇率自动换算
- 商品图片上传接对象存储

---

## 十二、已知设计取舍

- **零图表库 / 零动画库**：全部用内联 SVG 与 CSS 实现，保持依赖精简。
- **Style 与 Color 的关系**：详情页的 Color 色卡同时承担「颜色」与「款式」语义，
  因此未单独再放一个 Style 下拉；结算页仍保留独立的 Style 选择。
- **演示数据与真实数据并存**：`content.ts` 与 `analytics.ts` 均采用
  「演示模式走内置数据、真实模式走数据库」的双通道写法，便于平滑切换。
