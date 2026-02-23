@echo off
REM ===========================================
REM opencode-im-bridge 一键启动脚本 (Windows)
REM ===========================================

setlocal enabledelayedexpansion

echo.
echo ============================================================
echo        opencode-im-bridge v0.1.0
echo    Remote control for OpenCode via IM
echo ============================================================
echo.

REM 检查 Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] 未安装 Node.js，请先安装 Node.js 20+
    exit /b 1
)

REM 检查 pnpm
where pnpm >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] 安装 pnpm...
    npm install -g pnpm
)

REM 检查 .env
if not exist ".env" (
    echo [WARN] 未找到 .env 文件
    if exist ".env.example" (
        echo [INFO] 从 .env.example 创建 .env...
        copy .env.example .env >nul
        echo [WARN] 请编辑 .env 文件填入你的配置
        echo [INFO] 必要配置:
        echo   - QQ_APP_ID: QQ 机器人 AppID
        echo   - QQ_APP_SECRET: QQ 机器人 AppSecret
        echo.
        pause
        notepad .env
    ) else (
        echo [ERROR] 未找到 .env.example
        exit /b 1
    )
)

REM 安装依赖
echo [INFO] 安装依赖...
call pnpm install

REM 构建
echo [INFO] 构建项目...
call pnpm build

REM 启动
echo [INFO] 启动 opencode-im-bridge...
call pnpm start
