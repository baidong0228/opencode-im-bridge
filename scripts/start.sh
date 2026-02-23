#!/bin/bash
# ===========================================
# opencode-im-bridge 一键启动脚本 (Linux/macOS)
# ===========================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印函数
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 检查依赖
check_dependencies() {
    log_info "检查依赖..."
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        log_error "未安装 Node.js，请先安装 Node.js 20+"
        exit 1
    fi
    
    # 检查 pnpm
    if ! command -v pnpm &> /dev/null; then
        log_info "安装 pnpm..."
        npm install -g pnpm
    fi
    
    log_success "依赖检查通过"
}

# 检查配置
check_config() {
    if [ ! -f ".env" ]; then
        log_warn "未找到 .env 文件"
        
        if [ -f ".env.example" ]; then
            log_info "从 .env.example 创建 .env..."
            cp .env.example .env
            log_warn "请编辑 .env 文件填入你的配置"
            log_info "必要配置:"
            log_info "  - QQ_APP_ID: QQ 机器人 AppID"
            log_info "  - QQ_APP_SECRET: QQ 机器人 AppSecret"
            echo ""
            read -p "按回车键继续编辑配置..."
            ${EDITOR:-nano} .env
        else
            log_error "未找到 .env.example，请手动创建 .env"
            exit 1
        fi
    fi
}

# 安装依赖
install_deps() {
    log_info "安装依赖..."
    pnpm install
    log_success "依赖安装完成"
}

# 构建
build() {
    log_info "构建项目..."
    pnpm build
    log_success "构建完成"
}

# 启动
start() {
    log_info "启动 opencode-im-bridge..."
    pnpm start
}

# Docker 启动
docker_start() {
    log_info "使用 Docker 启动..."
    
    if ! command -v docker &> /dev/null; then
        log_error "未安装 Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> \dev/null && ! docker compose version &> /dev/null; then
        log_error "未安装 docker-compose"
        exit 1
    fi
    
    # 检查 .env
    check_config
    
    # 使用 docker-compose 启动
    if docker compose version &> /dev/null; then
        docker compose up -d
    else
        docker-compose up -d
    fi
    
    log_success "Docker 容器已启动"
    log_info "查看日志: docker-compose logs -f bridge"
}

# Docker 启动 (包含 NapCatQQ)
docker_start_full() {
    log_info "使用 Docker 启动 (包含 NapCatQQ)..."
    
    if ! command -v docker &> /dev/null; then
        log_error "未安装 Docker"
        exit 1
    fi
    
    check_config
    
    # 使用 onebot profile 启动
    if docker compose version &> /dev/null; then
        docker compose --profile onebot up -d
    else
        docker-compose --profile onebot up -d
    fi
    
    log_success "Docker 容器已启动"
    log_info "查看日志: docker-compose logs -f"
}

# 显示帮助
show_help() {
    echo "opencode-im-bridge 一键启动脚本"
    echo ""
    echo "用法: $0 [命令]"
    echo ""
    echo "命令:"
    echo "  start       - 本地启动 (需要先 install + build)"
    echo "  install     - 安装依赖"
    echo "  build       - 构建项目"
    echo "  docker      - Docker 启动 (仅 bridge 服务)"
    echo "  docker-full - Docker 启动 (bridge + NapCatQQ)"
    echo "  help        - 显示帮助"
    echo ""
    echo "快速开始:"
    echo "  $0           - 本地开发模式 (自动检查并安装依赖)"
    echo "  $0 docker    - 生产部署 (Docker 单服务)"
    echo "  $0 docker-full - 完整部署 (Docker + NapCatQQ)"
}

# 主函数
main() {
    echo ""
    echo "╔════════════════════════════════════════════╗"
    echo "║       opencode-im-bridge v0.1.0            ║"
    echo "║   Remote control for OpenCode via IM       ║"
    echo "╚════════════════════════════════════════════╝"
    echo ""
    
    case "${1:-}" in
        start)
            check_config
            start
            ;;
        install)
            install_deps
            ;;
        build)
            build
            ;;
        docker)
            docker_start
            ;;
        docker-full)
            docker_start_full
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            # 默认: 本地开发模式
            check_dependencies
            check_config
            install_deps
            build
            start
            ;;
    esac
}

main "$@"
