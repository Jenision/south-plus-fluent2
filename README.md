# South Plus Fluent 2 (南+ 微软 Fluent 2 现代重构)

将 **南+ South Plus** 全面重构为新一代消费级 **Microsoft Fluent 2 Design System（Windows 11 Bloom + Microsoft Store + Copilot 时代）** 视觉风格与 **Windows 11 / Microsoft 365** 操作逻辑的油猴用户脚本（v1.0.0 Virtual DOM 重建架构），零外部依赖、完整保留站点原生脚本与 AJAX 请求交互。

## 安装方式

1. 安装 **Tampermonkey** 或 **Violentmonkey** 浏览器扩展。
2. 新建脚本，将 [`south-plus-fluent2.user.js`](./south-plus-fluent2.user.js) 全部内容粘贴保存。
3. 打开任意南+镜像站即可生效。

## 核心特性

- **新一代消费级 Fluent 2 材质、标志与微动效**：
  - **Windows 11 Fluent 2 定制 SVG 徽标**：多层渐变斜角 Squircle 图标 + 几何化 `S` 丝带与右上角 `+` 号（悬停旋转 90° 与镜面光泽扫过），搭配结构化「南+ South Plus」字标，随 5 套强调色自动联动。
  - **动态呼吸 Windows 11 Bloom Mica 画布**：多色漫反射环境光晕随 5 套强调色联动并缓慢漂移呼吸，侧边栏（Mica Alt）与主卡片形成 5 级叠层景深；支持 `prefers-reduced-motion` 自动降级。
  - **WinUI 3 定向光照描边 + Acrylic 磨砂噪点 + 滚动抬升**：卡片顶部微亮高光边与底部微深阴影边，浮层叠加内联 SVG 微噪点纹理；页面滚动时顶部 Acrylic TitleBar 动态抬升阴影。
  - **Fluent 2 流畅动效体系**：Expander / TreeView 平滑 CSS Grid 折叠展开、Pivot 选项卡滑动指示条（`fl2-pivot-ink`）、KPI 交错入场与数字缓动计数、按钮按压回弹与 ToggleSwitch 滑块微拉伸、主题日/夜图标旋转变形、以及 Fluent Reveal 悬停微光追踪。
- **Windows 11 / Microsoft 365 交互逻辑**：
  - **顶部一体化 TitleBar + AutoSuggestBox**：集成面包屑、即时模糊检索版块/全站搜索建议框（`Ctrl+K` 或 `/` 聚焦）、单行防换行 Persona 用户按钮与 Live Persona 浮层。
  - **可折叠 NavigationView + 内联 TreeView**：常用版块置顶（不再被大量活动归档版块挤占），并提供按大类原地展开的版块目录树。
  - **Win11 右侧设置抽屉**：支持 `跟随系统 / 浅色 / 深色`、5 套强调色、舒适/紧凑密度、标准/宽屏画布、推广过滤与折叠偏好。
  - **帖子上下文粘性 CommandBar**：内置楼层跳转 `ComboBox` 下拉框、只看楼主、一键收藏、字号切换与快速回复直达。
- **全页面 Virtual DOM 重建（覆盖全部 18 个核心场景）**：
  - 论坛首页（准确提取全站 KPI、Fluent 公告 MessageBar、Pivot 4 栏热帖零跳变静默预取与单栏双列 16 条骨架屏展示、2 列语义化版块卡片）
  - 版块主题列表（DetailsList 数据列表、折叠置顶与版块公告、实时本地筛选与排序）与图墙模式（响应式画廊卡片 + 裁剪/完整比例切换 + 灯箱）
  - 帖子详情、购买贴与站点公告（粘性 CommandBar、购买交易卡片、警告栏、图片灯箱与快速回复卡片）
  - 个人空间（`u.php` 首页/主题/回复/资料/好友/收藏/商品）
  - 设置中心、短消息与积分管理（Master-Detail 布局 + Fluent Pivot 选项卡）
  - 登录页与操作跳转提示页

## 快捷键

| 快捷键 | 功能 |
| --- | --- |
| `Ctrl + K` / `/` | 聚焦顶部 AutoSuggestBox（版块直达与全站搜索） |
| `[` | 展开 / 折叠左侧 NavigationView |
| `Esc` | 关闭浮层、建议框、Win11 设置抽屉与图片灯箱 |
