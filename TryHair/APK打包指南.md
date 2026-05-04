# APK 打包指南

## 方式一：使用 HBuilderX 打包（推荐）

### 1. 安装 HBuilderX
下载地址：https://www.dcloud.io/hbuilderx.html
选择「App开发版」下载安装

### 2. 导入项目
1. 打开 HBuilderX
2. 文件 → 导入 → 从本地目录导入
3. 选择当前项目目录 `TryHair`

### 3. 配置 App 打包信息
1. 打开 `src/manifest.json`
2. 在「App图标配置」中上传应用图标（1024x1024 PNG）
3. 在「App启动界面配置」中配置启动图
4. 在「App模块配置」中选择需要的模块（相机、存储等已在manifest中配置）

### 4. 打包 APK
1. 点击菜单「发行」→「原生App-云打包」
2. 选择「Android」平台
3. 填写以下信息：
   - 应用名称：发型试戴
   - 版本号：1.0.0
   - 版本名称：100
   - 包名：com.tryhair.app（已配置）
4. 选择「使用DCloud公用证书」（测试用）
5. 点击「打包」
6. 等待打包完成后下载 APK

### 5. 本地打包（可选）
如果需要使用自有证书或自定义打包：
1. 安装 Android Studio
2. 配置 Android SDK
3. 在 HBuilderX 中点击「发行」→「原生App-本地打包」
4. 生成打包资源
5. 使用 Android Studio 打开项目并编译

## 方式二：使用命令行构建 App 资源

```bash
# 构建 App 平台资源
npm run build:app
```

构建完成后，资源将生成在 `dist/build/app` 目录，可使用 HBuilderX 进行进一步打包。

## 权限说明

应用已配置以下 Android 权限：
- CAMERA：相机拍照
- WRITE_EXTERNAL_STORAGE：写入存储
- READ_EXTERNAL_STORAGE：读取存储
- INTERNET：网络访问

## 注意事项

1. **测试版 APK**：使用 DCloud 公用证书打包的 APK 只能用于测试，不能正式发布
2. **正式发布**：需要申请自己的 Android 签名证书
3. **图标要求**：建议准备 1024x1024 的 PNG 格式图标
4. **启动图**：建议准备不同尺寸的启动图以适配各种屏幕

## 快速测试

如果只是想快速测试，可以：
1. 下载 HBuilderX
2. 导入项目
3. 连接 Android 手机（开启 USB 调试）
4. 点击「运行」→「运行到手机或模拟器」→「运行到 Android App 基座」
