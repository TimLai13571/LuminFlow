@echo off
setlocal enabledelayedexpansion
echo DEBUG_PASSED_LINE_2
cd /d "%~dp0"
echo DEBUG_PASSED_LINE_3
title LuminFlow 一键启动

:: ============================================================
::  LuminFlow - 一键启动脚本
::  自动检测环境、安装依赖、启动前后端服务
::  适用: Windows 10/11
::
::  注意: 不使用 chcp 65001 (CMD 已知 Bug 会导致 pause 闪退)
::  所有字符均为纯 ASCII，兼容性最优
:: ============================================================

echo.
echo  +==========================================+
echo  ^|   LuminFlow 审计AI助手 - 一键启动       ^|
echo  +==========================================+
echo.

:: ============================================================
:: Step 1: 环境检测
:: ============================================================

echo  [1/4] 正在检测运行环境...
echo DEBUG_PASSED_LINE_25
echo.
echo DEBUG_PASSED_LINE_26

:: --- Check Node.js ---
echo DEBUG_PASSED_LINE_28
where node >nul 2>nul
echo DEBUG_PASSED_LINE_29
if %ERRORLEVEL% NEQ 0 (
    echo    [FAIL] 未检测到 Node.js
    echo.
    echo    请先安装 Node.js (版本 >= 18.0):
    echo    下载地址: https://nodejs.org/
    echo    安装时请勾选 "Add to PATH"
    echo.
    goto :error_exit
)
for /f "tokens=*" %%v in ('node -v') do echo    [ OK ] Node.js: %%v
echo DEBUG_PASSED_LINE_39

:: --- Check npm ---
echo DEBUG_PASSED_LINE_41
where npm >nul 2>nul
echo DEBUG_PASSED_LINE_42
if %ERRORLEVEL% NEQ 0 (
    echo    [FAIL] 未检测到 npm (通常随 Node.js 一起安装)
    goto :error_exit
)
for /f "tokens=*" %%v in ('npm -v') do echo    [ OK ] npm: v%%v

echo DEBUG_PASSED_LINE_48
:: --- Check Python (优先 python，回退 python3) ---
set PYTHON_CMD=python
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    where python3 >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo    [FAIL] 未检测到 Python
        echo.
        echo    请先安装 Python (版本 >= 3.11):
        echo    下载地址: https://www.python.org/downloads/
        echo    安装时请勾选 "Add Python to PATH"
        echo.
        goto :error_exit
    )
    set PYTHON_CMD=python3
)
for /f "tokens=*" %%v in ('%PYTHON_CMD% --version 2^>^&1') do echo    [ OK ] Python: %%v
echo DEBUG_PASSED_LINE_65

:: --- Check pip ---
%PYTHON_CMD% -m pip --version >nul 2>nul
echo DEBUG_PASSED_LINE_68
if %ERRORLEVEL% NEQ 0 (
    echo    [FAIL] 未检测到 pip (请确保 Python 安装时包含 pip)
    goto :error_exit
)
echo    [ OK ] pip: 已就绪

echo.
echo    ---- 环境检测全部通过！----
echo.

:: ============================================================
:: Step 2: 配置文件检查
:: ============================================================

echo  [2/4] 正在检查配置文件...
echo.

:: Check .env
if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo    [ OK ] 已从 .env.example 创建 .env 文件
        echo           (AI 功能将使用 Mock 模式运行，无需 API Key)
    ) else (
        echo    [WARN] .env.example 文件缺失，跳过配置
    )
) else (
    echo    [ OK ] .env 配置文件已存在
)
echo.

:: ============================================================
:: Step 3: 依赖安装
:: ============================================================

echo  [3/4] 正在检查依赖...
echo.

:: --- Frontend: node_modules ---
if not exist "node_modules" (
echo DEBUG_PASSED_LINE_108
    echo    >>> 正在安装前端依赖 (可能需要 2-5 分钟)...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo    [FAIL] 前端依赖安装失败
        echo    提示: 可使用以下命令切换国内镜像后重试:
        echo    npm config set registry https://registry.npmmirror.com
        goto :error_exit
    )
    echo.
    echo    [ OK ] 前端依赖安装完成
) else (
    echo    [ OK ] 前端依赖已就绪 (node_modules)
)

:: --- Backend: Python packages ---
cd /d "%~dp0server"
%PYTHON_CMD% -c "import fastapi; import uvicorn" >nul 2>nul
echo DEBUG_PASSED_LINE_127
if %ERRORLEVEL% NEQ 0 (
    echo    >>> 正在安装后端依赖...
    echo.
    %PYTHON_CMD% -m pip install -r requirements.txt
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo    [FAIL] 后端依赖安装失败
        echo    提示: 可使用以下命令切换国内镜像后重试:
        echo    pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
        cd /d "%~dp0"
        goto :error_exit
    )
    echo.
    echo    [ OK ] 后端依赖安装完成
) else (
    echo    [ OK ] 后端依赖已就绪
)
cd /d "%~dp0"
echo DEBUG_PASSED_LINE_145
echo.

:: ============================================================
:: Step 4: 启动服务
:: ============================================================

echo  [4/4] 正在启动服务...
echo.
echo    +-------------------------------------------+
echo    ^|  后端服务  ^|  http://localhost:8000        ^|
echo    ^|  前端服务  ^|  http://localhost:5173        ^|
echo    ^|  API 文档  ^|  http://localhost:8000/docs   ^|
echo    +-------------------------------------------+
echo.
echo    将打开两个新窗口分别运行前后端服务。
echo    关闭对应窗口即可停止服务。
echo.

:: Start backend in a new window
echo DEBUG_PASSED_LINE_164
start "LuminFlow Backend" cmd /k "cd /d %~dp0server && echo ============================================ && echo   LuminFlow AI Backend && echo   http://localhost:8000 && echo ============================================ && echo. && %PYTHON_CMD% -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

:: Wait for backend to initialize
echo    等待后端服务初始化 (3秒)...
timeout /t 3 /nobreak >nul

:: Start frontend in a new window
start "LuminFlow Frontend" cmd /k "cd /d %~dp0 && echo ============================================ && echo   LuminFlow Frontend && echo   http://localhost:5173 && echo ============================================ && echo. && npm run dev"
echo DEBUG_PASSED_LINE_172

echo.
echo.
echo  +==========================================+
echo  ^|  所有服务已启动！                      ^|
echo  ^|  首次编译可能需要 10-30 秒，请稍候。   ^|
echo  +==========================================+
echo.
echo  后端: http://localhost:8000
echo  前端: http://localhost:5173
echo.
echo  按任意键关闭此启动面板 (不会停止服务)...
pause >nul
exit /b 0

:: ============================================================
:: Error exit
:: ============================================================
:error_exit
echo.
echo.
echo  +==========================================+
echo  ^|  启动失败，请根据上述提示修复问题。    ^|
echo  +==========================================+
echo.
echo  建议：在命令行中手动运行此脚本以查看完整错误信息：
echo  cd /d "%~dp0"
echo  一键启动.bat
echo.
pause
exit /b 1
