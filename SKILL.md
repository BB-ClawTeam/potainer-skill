# Portainer Skill

这个技能允许 OpenClaw 与 Portainer 容器管理平台进行交互。

## 功能

### 核心功能
- 管理 Docker 容器 (创建、删除、启动、停止、重启)
- 配置 Portainer 实例
- 监控 Docker 环境
- 创建和删除容器
- 获取容器状态信息

### 高级功能
- 环境管理 (端点和环境组)
- 应用部署 (栈和模板管理)
- 用户与权限管理
- 注册表管理
- 系统设置和状态查询

## 使用方法

### 基本用法
```bash
# 查看容器列表
portainer containers list

# 创建新容器
portainer container create --image nginx --name my-nginx

# 删除容器
portainer container delete --name my-nginx

# 获取容器状态
portainer container status --name my-nginx
```

## 配置

技能需要以下配置：
- Portainer API 地址
- 访问令牌 (JWT 或 API Key)
- 默认命名空间

## API 操作分类

### 身份认证与授权
- 认证操作: /api/auth 路径处理用户登录、JWT令牌生成
- API密钥管理: 通过 X-API-KEY 头部进行身份验证
- 权限管理: 细粒度的授权操作（Docker容器、镜像、网络、卷等）

### 环境管理
- 端点操作: /api/endpoints 管理Docker、Kubernetes等环境
- 环境组管理: /api/endpoint_groups 组织相关环境
- 端点代理: /api/endpoints/{id}/{proxy} 代理到Docker/K8s API

### 应用部署
- 栈管理: /api/stacks 处理Compose、Swarm、K8s应用部署
- 模板管理: /api/templates 和 /api/custom_templates 管理应用模板
- Helm管理: /api/endpoints/{id}/kubernetes/helm 管理Helm图表

### 用户与权限管理
- 用户管理: /api/users 处理用户CRUD操作
- 团队管理: /api/teams 和 /api/team_memberships 管理团队和成员关系
- 角色管理: /api/roles 定义用户权限
- 资源控制: /api/resource_controls 管理资源访问控制

### 系统管理
- 设置管理: /api/settings 配置Portainer实例
- 状态查询: /api/status 和 /api/system 获取系统信息
- 注册表管理: /api/registries 管理Docker镜像仓库
- 标签管理: /api/tags 管理标签
- 策略管理: /api/policies 管理安全策略

### 多环境容器管理（核心功能）
- 统一代理接口: /api/endpoints/{endpointId}/docker/containers/* 
- 环境隔离: 通过 endpointId 区分不同环境
- 标准化操作: 所有容器操作都通过统一的代理路径

### Docker API 操作（通过代理）
- 容器操作: /api/endpoints/{id}/docker/containers/* （列表、创建、删除、启动等）
- 镜像操作: /api/endpoints/{id}/docker/images/* （拉取、删除、构建等）
- 网络操作: /api/endpoints/{id}/docker/networks/* （管理网络）
- 卷操作: /api/endpoints/{id}/docker/volumes/* （管理卷）
- 服务操作: /api/endpoints/{id}/docker/services/* （管理服务）
- 节点操作: /api/endpoints/{id}/docker/nodes/* （管理节点）

### 其他功能
- GitOps操作: /api/gitops 管理Git操作
- LDAP管理: /api/ldap 管理LDAP集成
- Webhook管理: /api/webhooks 管理Webhook
- SSL管理: /api/ssl 管理SSL证书
- 观测性: /api/observability 管理监控和告警

## 示例

### 创建容器
```bash
portainer container create \
  --image nginx:latest \
  --name my-nginx \
  --port 8080:80 \
  --volume /host/path:/container/path
```

### 列出容器
```bash
portainer containers list --filter running
```

### 删除容器
```bash
portainer container delete --name my-container
```

## 错误处理

技能会处理以下错误情况：
- API 连接失败
- 认证失败
- 容器不存在
- 权限不足
- 网络超时