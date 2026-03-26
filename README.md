# Portainer Skill

OpenClaw 的 Portainer 技能，用于与 Portainer 容器管理平台进行交互。

## 功能特性

### 容器管理
- 管理 Docker 容器（创建、删除、启动、停止、重启）
- 列出所有运行中的容器
- 端口映射和卷挂载支持
- 环境变量和重启策略支持

### 多环境容器管理（核心功能）
- 统一代理接口：通过 `/api/endpoints/{endpointId}/docker/` 管理不同环境
- 环境隔离：通过 endpointId 区分不同环境
- 批量操作：支持跨环境容器批量管理

### 环境管理
- 管理 Docker、Kubernetes 等环境端点
- 端点代理访问（Docker/K8s API）
- 环境组管理

### 应用部署
- 管理 Compose、Swarm、K8s 应用栈
- 模板和自定义模板管理
- Helm 图表管理

### 用户与权限
- 用户管理（创建、更新、删除）
- 团队和成员关系管理
- 角色权限定义
- 资源控制管理

### 系统管理
- 系统状态和信息查询
- 注册表管理（Docker 镜像仓库）
- 资源控制管理
- 标签管理
- 策略管理

### Docker API 直接操作
- 容器操作（列表、创建、删除、启动、停止等）
- 镜像操作（拉取、删除、构建等）
- 网络操作（管理网络）
- 卷操作（管理卷）
- 服务和节点操作（适用于 Swarm）

### 安全特性
- JWT 和 API 密钥认证支持
- 完整的错误处理机制
- 细粒度权限控制

## 安装

```bash
# 克隆技能仓库
git clone https://github.com/BB-ClawTeam/potainer-skill.git
cd potainer-skill

# 安装依赖
npm install
```

## 配置

在使用技能前，需要配置 Portainer 连接信息：

```json
{
  "apiUrl": "http://localhost:9000/api",
  "token": "your-portainer-token-here"
}
```

## 使用方法

### 容器操作
```bash
# 列出所有容器
portainer containers list

# 列出运行中的容器
portainer containers list --filter running

# 创建容器
portainer container create \
  --image nginx:latest \
  --name my-nginx \
  --port 8080:80 \
  --volume /host/path:/container/path

# 启动容器
portainer container start --name my-container

# 停止容器
portainer container stop --name my-container

# 重启容器
portainer container restart --name my-container
```

### 多环境容器管理
```bash
# 在指定环境中列出容器
portainer containers list --endpoint-id 1

# 在指定环境中启动容器
portainer container start --endpoint-id 1 --container-id abc123

# 在指定环境中停止容器
portainer container stop --endpoint-id 1 --container-id abc123

# 在指定环境中重启容器
portainer container restart --endpoint-id 1 --container-id abc123

# 在指定环境中删除容器
portainer container remove --endpoint-id 1 --container-id abc123

# 批量操作多个环境中的容器
portainer container batch \
  --operation start \
  --endpoint-id 1 --container-id container1 \
  --endpoint-id 2 --container-id container2
```

### 环境管理
```bash
# 列出所有端点
portainer endpoints list

# 获取特定端点信息
portainer endpoint get --id 1

# 代理到Docker API
portainer proxy docker --endpoint-id 1 --path /containers/json
```

### 应用部署
```bash
# 列出所有栈
portainer stacks list

# 创建栈
portainer stack create \
  --name my-stack \
  --endpoint-id 1 \
  --stack-file docker-compose.yml

# 删除栈
portainer stack delete --id 1
```

### 用户管理
```bash
# 列出所有用户
portainer users list

# 创建用户
portainer user create \
  --username john \
  --password secret123 \
  --role 1

# 更新用户
portainer user update --id 1 --role 2

# 删除用户
portainer user delete --id 1
```

### 系统管理
```bash
# 获取系统状态
portainer system status

# 获取系统信息
portainer system info

# 列出注册表
portainer registries list

# 创建注册表
portainer registry create \
  --name my-registry \
  --url https://registry.example.com \
  --authentication true
```

### Docker API 操作
```bash
# 列出Docker容器
portainer docker containers list --endpoint-id 1

# 创建Docker容器
portainer docker container create \
  --endpoint-id 1 \
  --image nginx:latest \
  --name my-nginx

# 拉取Docker镜像
portainer docker image pull --endpoint-id 1 --image nginx:latest

# 列出Docker镜像
portainer docker images list --endpoint-id 1

# 列出Docker网络
portainer docker networks list --endpoint-id 1

# 列出Docker卷
portainer docker volumes list --endpoint-id 1
```

## 多环境容器管理详解

Portainer 技能专为多环境容器管理而优化，通过统一的代理接口实现跨环境操作：

### API 结构
所有容器操作都通过统一的代理路径进行：
```
/api/endpoints/{endpointId}/docker/containers/*
```

### URL 构建方式
前端使用 buildDockerProxyUrl 函数构建标准的API URL：
```javascript
// 示例：启动endpoint 1中的容器abc123
buildDockerProxyUrl(1, 'containers', 'abc123', 'start')
// 结果: /endpoints/1/docker/containers/abc123/start
```

### 使用示例
```bash
# 在环境1中启动容器
portainer container start --endpoint-id 1 --container-id my-container

# 在环境2中停止容器
portainer container stop --endpoint-id 2 --container-id my-container

# 批量操作：同时在多个环境中启动容器
portainer container batch \
  --operation start \
  --endpoint-id 1 --container-id container1 \
  --endpoint-id 2 --container-id container2 \
  --endpoint-id 3 --container-id container3
```

## 技术细节

该技能使用 TypeScript 编写，提供了完整的类型安全和异步操作支持。

## 许可证

MIT License