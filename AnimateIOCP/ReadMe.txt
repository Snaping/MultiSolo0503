
========================================================================
    AnimateIOCP - IOCP工作原理演示
========================================================================

应用程序概述：
----------------
本程序使用VS2022 MFC实现了一个IOCP（Input/Output Completion Ports）工作原理的动画演示程序。

功能特点：
----------------
1. 可视化展示IOCP的工作流程
2. 支持启动、停止和重置演示
3. 可调整动画速度
4. 实时显示运行日志
5. 完整的IOCP服务器实现

文件说明：
----------------
- AnimateIOCP.sln: Visual Studio解决方案文件
- AnimateIOCP.vcxproj: 项目文件
- AnimateIOCP.h/cpp: 应用程序主类
- AnimateIOCPDlg.h/cpp: 主对话框类（包含动画显示）
- IOCPServer.h/cpp: IOCP服务器核心实现
- resource.h: 资源ID定义
- AnimateIOCP.rc: 资源文件
- pch.h/cpp: 预编译头

IOCP工作原理：
----------------
1. 创建IOCP完成端口
2. 创建工作线程池
3. 将Socket绑定到IOCP
4. 投递异步IO请求
5. 工作线程从IOCP获取完成通知
6. 处理完成的IO操作

编译运行：
----------------
1. 使用Visual Studio 2022打开AnimateIOCP.sln
2. 选择Debug或Release配置
3. 选择x64平台
4. 编译并运行
