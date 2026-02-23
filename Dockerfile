# ===========================================
# Dockerfile for opencode-im-bridge
# 轻量级 Node.js 运行环境
# ===========================================

FROM node:20-alpine AS builder

WORKDIR /app

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./
COPY tsconfig.json ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY src ./src

# 构建
RUN pnpm build

# 生产环境镜像
FROM node:20-alpine

WORKDIR /app

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制构建产物和必要文件
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# 创建工作目录
RUN mkdir -p /app/workspace

# 环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["node", "dist/cli.js"]
