# SecureVault

SecureVault 是一个基于 Expo Router 和 React Native 的密码管理器原型项目，当前重点是验证手机端核心流程、页面交互和视觉风格。

## 项目介绍

SecureVault 面向移动端密码管理场景，提供主密码解锁、密码条目管理、快速录入、密码生成、主题语言设置和版本检查等基础能力。项目目前更偏前端原型和本地演示实现，适合继续扩展真实加密存储、持久化和正式发布流程。

当前首页默认从空密码库开始，首次进入会引导用户设置主密码；新增、编辑、删除等操作会在当前运行会话内生效。

## 已实现功能

- 首次启动设置主密码
- 主密码解锁和生物识别解锁入口
- 新增、编辑、查看、复制密码
- 密码生成器和默认生成配置
- 首页搜索、分类筛选、空状态和无结果状态
- 收藏置顶、回收站、恢复和永久删除
- 主题切换、语言切换，默认跟随系统
- 自动锁定和截屏保护设置
- GitHub Pages 检查更新

## 技术栈

- Expo 52
- React Native 0.76
- Expo Router 4
- TypeScript
- `react-native-safe-area-context`
- `phosphor-react-native`
- `lucide-react-native`

## 目录结构

```text
app/
  index.tsx                  解锁页入口
  setup-master-password.tsx  首次设置主密码
  (tabs)/index.tsx           主页
  (tabs)/settings.tsx        设置页
  add-password.tsx           新增密码
  quick-entry.tsx            快速录入
  password-detail/[id].tsx   密码详情
components/
  ui.tsx                     通用 UI 组件
data/
  vault.ts                   密码条目内存数据层
docs/
  latest.json                GitHub Pages 更新清单
services/
  security.ts                安全相关占位逻辑
  update.ts                  检查更新服务
theme/
  tokens.ts                  颜色、圆角、阴影、间距 token
scripts/
  run-android-jbr.ps1        Android 本地启动辅助脚本
```

## 安装与运行

### 环境要求

- Node.js 18 及以上
- npm
- Android 模拟器、真机，或 Web 预览环境

### 安装依赖

```bash
npm install
```

### 启动开发服务

```bash
npm run start
```

启动后可以按 Expo 的方式选择在 Android、iOS 或 Web 中运行。

## 可用脚本

```bash
npm run start
npm run web
npm run android
npm run android:jbr
npm run ios
npm run typecheck
```

各脚本作用：

- `npm run start`：启动 Expo 开发服务
- `npm run web`：以 Web 模式启动项目
- `npm run android`：按默认 Java 环境运行 Android
- `npm run android:jbr`：使用本地 Android Studio JBR 运行 Android
- `npm run ios`：运行 iOS
- `npm run typecheck`：执行 TypeScript 类型检查

## Android JBR 说明

`npm run android:jbr` 会执行 [scripts/run-android-jbr.ps1](scripts/run-android-jbr.ps1)，脚本里当前写死的 JBR 路径是：

## 当前数据与安全实现说明

- 密码列表当前从空数组开始，运行时新增项保存在 [data/vault.ts](data/vault.ts) 的内存数组里
- 主密码校验目前是 [services/security.ts](services/security.ts) 里的占位实现
- `security.ts` 中的加密结构和说明文字目前只是脚手架，不代表已接入真实加密
- 复制到剪贴板已接入，但“自动清空剪贴板”还没有实现
- 检查更新读取 [docs/latest.json](docs/latest.json)，线上地址对应 GitHub Pages

## 后续

- 接入真实本地持久化方案
- 补齐主密码派生、加密和解密流程
- 把新增、编辑、删除流程接到真实状态
- 落地粘贴解析逻辑
- 完善 GitHub Releases 发版和 APK 下载流程
- 增加关键页面与核心流程测试
