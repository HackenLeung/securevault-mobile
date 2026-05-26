# SecureVault

SecureVault 是一个基于 Expo Router 和 React Native 的密码管理器原型项目，当前重点是验证手机端核心流程、页面交互和视觉风格。

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
  (tabs)/index.tsx           主页
  (tabs)/settings.tsx        设置页
  add-password.tsx           新增密码
  quick-entry.tsx            快速录入
  password-detail/[id].tsx   密码详情
components/
  ui.tsx                     通用 UI 组件
data/
  vault.ts                   示例密码数据
services/
  security.ts                安全相关占位逻辑
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

- 密码列表数据目前写在 [data/vault.ts](data/vault.ts)
- 主密码校验目前是 [services/security.ts](services/security.ts) 里的占位实现
- `security.ts` 中的加密结构和说明文字目前只是脚手架，不代表已接入真实加密
- 复制到剪贴板已接入，但“自动清空剪贴板”还没有实现

## 后续

- 接入真实本地持久化方案
- 补齐主密码派生、加密和解密流程
- 把新增、编辑、删除流程接到真实状态
- 落地 OCR / 粘贴解析逻辑
- 补充主题、国际化和更新能力
- 增加关键页面与核心流程测试
