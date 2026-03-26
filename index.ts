/**
 * Portainer Skill for OpenClaw
 * Allows interaction with Portainer container management platform
 */

interface PortainerConfig {
  apiUrl: string;
  token: string;
  namespace?: string;
}

interface Container {
  Id: string;
  Names: string[];
  Image: string;
  Command: string;
  Created: number;
  Ports: Port[];
  Labels: Record<string, string>;
  State: string;
  Status: string;
}

interface Port {
  PrivatePort: number;
  PublicPort: number;
  Type: string;
}

interface Endpoint {
  Id: number;
  Name: string;
  URL: string;
  Type: number;
  Status: number;
  Groups: number[];
}

interface Stack {
  Id: number;
  Name: string;
  EndpointId: number;
  Status: number;
  SwarmId?: string;
}

interface User {
  Id: number;
  Username: string;
  Role: number;
  Password?: string;
}

interface Registry {
  Id: number;
  Name: string;
  URL: string;
  Authentication: boolean;
}

class PortainerSkill {
  private config: PortainerConfig;

  constructor(config: PortainerConfig) {
    this.config = config;
  }

  // ==================== 容器管理 ====================
  /**
   * 获取所有容器列表
   */
  async listContainers(filter?: string): Promise<Container[]> {
    try {
      const response = await fetch(`${this.config.apiUrl}/containers/json`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const containers: Container[] = await response.json();
      
      if (filter) {
        return containers.filter(container => 
          container.State.includes(filter) || 
          container.Status.includes(filter)
        );
      }
      
      return containers;
    } catch (error) {
      console.error('Error listing containers:', error);
      throw error;
    }
  }

  /**
   * 创建新容器
   */
  async createContainer(options: {
    image: string;
    name?: string;
    ports?: string[];
    volumes?: string[];
    env?: Record<string, string>;
    restartPolicy?: string;
  }): Promise<any> {
    try {
      const config: any = {
        Image: options.image,
        HostConfig: {}
      };

      if (options.name) {
        config.Name = options.name;
      }

      if (options.ports && options.ports.length > 0) {
        config.HostConfig.PortBindings = {};
        options.ports.forEach(port => {
          const [privatePort, publicPort] = port.split(':');
          config.HostConfig.PortBindings[`${privatePort}/tcp`] = [{
            HostPort: publicPort || privatePort
          }];
        });
      }

      if (options.volumes && options.volumes.length > 0) {
        config.HostConfig.Binds = options.volumes;
      }

      if (options.env && Object.keys(options.env).length > 0) {
        config.Env = Object.entries(options.env).map(([key, value]) => `${key}=${value}`);
      }

      if (options.restartPolicy) {
        config.HostConfig.RestartPolicy = { Name: options.restartPolicy };
      }

      const response = await fetch(`${this.config.apiUrl}/containers/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating container:', error);
      throw error;
    }
  }

  /**
   * 删除容器
   */
  async removeContainer(name: string): Promise<void> {
    try {
      const response = await fetch(`${this.config.apiUrl}/containers/${name}?force=true`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error removing container:', error);
      throw error;
    }
  }

  /**
   * 获取容器状态
   */
  async getContainerStatus(name: string): Promise<any> {
    try {
      const response = await fetch(`${this.config.apiUrl}/containers/${name}/json`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting container status:', error);
      throw error;
    }
  }

  /**
   * 启动容器
   */
  async startContainer(name: string): Promise<void> {
    try {
      const response = await fetch(`${this.config.apiUrl}/containers/${name}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error starting container:', error);
      throw error;
    }
  }

  /**
   * 停止容器
   */
  async stopContainer(name: string): Promise<void> {
    try {
      const response = await fetch(`${this.config.apiUrl}/containers/${name}/stop`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error stopping container:', error);
      throw error;
    }
  }

  /**
   * 重启容器
   */
  async restartContainer(name: string): Promise<void> {
    try {
      const response = await fetch(`${this.config.apiUrl}/containers/${name}/restart`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error restarting container:', error);
      throw error;
    }
  }

  // ==================== 环境管理 ====================
  /**
   * 获取所有端点
   */
  async listEndpoints(): Promise<Endpoint[]> {
    try {
      const response = await fetch(`${this.config.apiUrl}/endpoints`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error listing endpoints:', error);
      throw error;
    }
  }

  /**
   * 获取端点详细信息
   */
  async getEndpoint(id: number): Promise<Endpoint> {
    try {
      const response = await fetch(`${this.config.apiUrl}/endpoints/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting endpoint:', error);
      throw error;
    }
  }

  /**
   * 代理到端点的Docker API
   */
  async proxyDocker(endpointId: number, path: string, method: string = 'GET', body?: any): Promise<any> {
    try {
      const options: RequestInit = {
        method: method,
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json'
        }
      };

      if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(`${this.config.apiUrl}/endpoints/${endpointId}/docker${path}`, options);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error proxying to Docker API:', error);
      throw error;
    }
  }

  /**
   * 代理到端点的Kubernetes API
   */
  async proxyKubernetes(endpointId: number, path: string, method: string = 'GET', body?: any): Promise<any> {
    try {
      const options: RequestInit = {
        method: method,
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json'
        }
      };

      if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(`${this.config.apiUrl}/endpoints/${endpointId}/kubernetes${path}`, options);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error proxying to Kubernetes API:', error);
      throw error;
    }
  }

  // ==================== 多环境容器管理（核心功能）====================
  /**
   * 在指定环境中获取容器列表
   */
  async listContainers(endpointId: number, all?: boolean, filter?: string): Promise<any[]> {
    let path = '/containers/json';
    if (all) {
      path += '?all=true';
    }
    if (filter) {
      path += all ? `&filter=${filter}` : `?filter=${filter}`;
    }
    return await this.proxyDocker(endpointId, path);
  }

  /**
   * 在指定环境中获取容器详细信息
   */
  async inspectContainer(endpointId: number, containerId: string): Promise<any> {
    return await this.proxyDocker(endpointId, `/containers/${containerId}/json`);
  }

  /**
   * 在指定环境中启动容器
   */
  async startContainer(endpointId: number, containerId: string): Promise<void> {
    await this.proxyDocker(endpointId, `/containers/${containerId}/start`, 'POST');
  }

  /**
   * 在指定环境中停止容器
   */
  async stopContainer(endpointId: number, containerId: string): Promise<void> {
    await this.proxyDocker(endpointId, `/containers/${containerId}/stop`, 'POST');
  }

  /**
   * 在指定环境中重启容器
   */
  async restartContainer(endpointId: number, containerId: string): Promise<void> {
    await this.proxyDocker(endpointId, `/containers/${containerId}/restart`, 'POST');
  }

  /**
   * 在指定环境中删除容器
   */
  async removeContainer(endpointId: number, containerId: string, force?: boolean): Promise<void> {
    const query = force ? '?force=true' : '';
    await this.proxyDocker(endpointId, `/containers/${containerId}${query}`, 'DELETE');
  }

  /**
   * 在指定环境中暂停容器
   */
  async pauseContainer(endpointId: number, containerId: string): Promise<void> {
    await this.proxyDocker(endpointId, `/containers/${containerId}/pause`, 'POST');
  }

  /**
   * 在指定环境中恢复容器
   */
  async unpauseContainer(endpointId: number, containerId: string): Promise<void> {
    await this.proxyDocker(endpointId, `/containers/${containerId}/unpause`, 'POST');
  }

  /**
   * 在指定环境中更新容器
   */
  async updateContainer(endpointId: number, containerId: string, updateConfig: any): Promise<void> {
    await this.proxyDocker(endpointId, `/containers/${containerId}/update`, 'POST', updateConfig);
  }

  /**
   * 在指定环境中获取容器进程信息
   */
  async getContainerTop(endpointId: number, containerId: string): Promise<any> {
    return await this.proxyDocker(endpointId, `/containers/${containerId}/top`);
  }

  /**
   * 在指定环境中创建容器
   */
  async createContainer(endpointId: number, containerConfig: any): Promise<any> {
    return await this.proxyDocker(endpointId, '/containers/create', 'POST', containerConfig);
  }

  /**
   * 批量操作多个环境中的容器
   */
  async batchContainerOperation(
    operations: Array<{
      endpointId: number;
      containerId: string;
      operation: 'start' | 'stop' | 'restart' | 'remove' | 'pause' | 'unpause';
      force?: boolean;
    }>
  ): Promise<any[]> {
    const results: any[] = [];
    
    for (const op of operations) {
      try {
        switch (op.operation) {
          case 'start':
            await this.startContainer(op.endpointId, op.containerId);
            results.push({ endpointId: op.endpointId, containerId: op.containerId, operation: 'start', status: 'success' });
            break;
          case 'stop':
            await this.stopContainer(op.endpointId, op.containerId);
            results.push({ endpointId: op.endpointId, containerId: op.containerId, operation: 'stop', status: 'success' });
            break;
          case 'restart':
            await this.restartContainer(op.endpointId, op.containerId);
            results.push({ endpointId: op.endpointId, containerId: op.containerId, operation: 'restart', status: 'success' });
            break;
          case 'remove':
            await this.removeContainer(op.endpointId, op.containerId, op.force);
            results.push({ endpointId: op.endpointId, containerId: op.containerId, operation: 'remove', status: 'success' });
            break;
          case 'pause':
            await this.pauseContainer(op.endpointId, op.containerId);
            results.push({ endpointId: op.endpointId, containerId: op.containerId, operation: 'pause', status: 'success' });
            break;
          case 'unpause':
            await this.unpauseContainer(op.endpointId, op.containerId);
            results.push({ endpointId: op.endpointId, containerId: op.containerId, operation: 'unpause', status: 'success' });
            break;
        }
      } catch (error) {
        results.push({ 
          endpointId: op.endpointId, 
          containerId: op.containerId, 
          operation: op.operation, 
          status: 'error',
          error: error.message 
        });
      }
    }
    
    return results;
  }

  // ==================== Docker API 操作 ====================
  /**
   * 获取Docker容器列表
   */
  async listDockerContainers(endpointId: number, all?: boolean): Promise<any[]> {
    const path = all ? '/containers/json?all=true' : '/containers/json';
    return await this.proxyDocker(endpointId, path);
  }

  /**
   * 获取Docker容器详细信息
   */
  async inspectDockerContainer(endpointId: number, containerId: string): Promise<any> {
    return await this.proxyDocker(endpointId, `/containers/${containerId}/json`);
  }

  /**
   * 创建Docker容器
   */
  async createDockerContainer(endpointId: number, containerConfig: any): Promise<any> {
    return await this.proxyDocker(endpointId, '/containers/create', 'POST', containerConfig);
  }

  /**
   * 启动Docker容器
   */
  async startDockerContainer(endpointId: number, containerId: string): Promise<void> {
    await this.proxyDocker(endpointId, `/containers/${containerId}/start`, 'POST');
  }

  /**
   * 停止Docker容器
   */
  async stopDockerContainer(endpointId: number, containerId: string): Promise<void> {
    await this.proxyDocker(endpointId, `/containers/${containerId}/stop`, 'POST');
  }

  /**
   * 删除Docker容器
   */
  async removeDockerContainer(endpointId: number, containerId: string, force?: boolean): Promise<void> {
    const query = force ? '?force=true' : '';
    await this.proxyDocker(endpointId, `/containers/${containerId}${query}`, 'DELETE');
  }

  /**
   * 获取Docker镜像列表
   */
  async listDockerImages(endpointId: number, all?: boolean): Promise<any[]> {
    const path = all ? '/images/json?all=true' : '/images/json';
    return await this.proxyDocker(endpointId, path);
  }

  /**
   * 拉取Docker镜像
   */
  async pullDockerImage(endpointId: number, imageName: string): Promise<any> {
    return await this.proxyDocker(endpointId, '/images/create', 'POST', {
      fromImage: imageName
    });
  }

  /**
   * 删除Docker镜像
   */
  async removeDockerImage(endpointId: number, imageName: string): Promise<void> {
    await this.proxyDocker(endpointId, `/images/${imageName}`, 'DELETE');
  }

  /**
   * 获取Docker网络列表
   */
  async listDockerNetworks(endpointId: number): Promise<any[]> {
    return await this.proxyDocker(endpointId, '/networks');
  }

  /**
   * 获取Docker卷列表
   */
  async listDockerVolumes(endpointId: number): Promise<any[]> {
    return await this.proxyDocker(endpointId, '/volumes');
  }

  // ==================== 系统和安全功能 ====================
  /**
   * 获取系统信息
   */
  async getSystemInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.config.apiUrl}/system/info`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting system info:', error);
      throw error;
    }
  }

  /**
   * 获取策略列表
   */
  async getPolicies(): Promise<any[]> {
    try {
      const response = await fetch(`${this.config.apiUrl}/policies`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting policies:', error);
      throw error;
    }
  }

  /**
   * 获取观测性设置
   */
  async getObservabilitySettings(): Promise<any> {
    try {
      const response = await fetch(`${this.config.apiUrl}/observability/alerting/settings`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting observability settings:', error);
      throw error;
    }
  }

  // ==================== 应用部署 ====================
  /**
   * 获取所有栈
   */
  async listStacks(): Promise<Stack[]> {
    try {
      const response = await fetch(`${this.config.apiUrl}/stacks`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error listing stacks:', error);
      throw error;
    }
  }

  /**
   * 创建栈
   */
  async createStack(options: {
    name: string;
    endpointId: number;
    stackFile: string;
    env?: Record<string, string>;
  }): Promise<any> {
    try {
      const payload = {
        Name: options.name,
        EndpointID: options.endpointId,
        StackFile: options.stackFile,
        Env: options.env
      };

      const response = await fetch(`${this.config.apiUrl}/stacks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating stack:', error);
      throw error;
    }
  }

  /**
   * 删除栈
   */
  async removeStack(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.config.apiUrl}/stacks/${id}?endpointId=1`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error removing stack:', error);
      throw error;
    }
  }

  // ==================== 用户与权限管理 ====================
  /**
   * 获取所有用户
   */
  async listUsers(): Promise<User[]> {
    try {
      const response = await fetch(`${this.config.apiUrl}/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error listing users:', error);
      throw error;
    }
  }

  /**
   * 获取用户详细信息
   */
  async getUser(id: number): Promise<User> {
    try {
      const response = await fetch(`${this.config.apiUrl}/users/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  /**
   * 创建用户
   */
  async createUser(userData: {
    username: string;
    password: string;
    role: number;
  }): Promise<User> {
    try {
      const response = await fetch(`${this.config.apiUrl}/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * 更新用户
   */
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    try {
      const response = await fetch(`${this.config.apiUrl}/users/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * 删除用户
   */
  async removeUser(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.config.apiUrl}/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error removing user:', error);
      throw error;
    }
  }

  // ==================== 系统管理 ====================
  /**
   * 获取系统状态
   */
  async getStatus(): Promise<any> {
    try {
      const response = await fetch(`${this.config.apiUrl}/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting status:', error);
      throw error;
    }
  }

  /**
   * 获取系统信息
   */
  async getSystemInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.config.apiUrl}/system`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting system info:', error);
      throw error;
    }
  }

  /**
   * 获取注册表列表
   */
  async listRegistries(): Promise<Registry[]> {
    try {
      const response = await fetch(`${this.config.apiUrl}/registries`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error listing registries:', error);
      throw error;
    }
  }

  /**
   * 创建注册表
   */
  async createRegistry(registryData: {
    name: string;
    url: string;
    authentication: boolean;
    username?: string;
    password?: string;
  }): Promise<Registry> {
    try {
      const response = await fetch(`${this.config.apiUrl}/registries`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registryData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating registry:', error);
      throw error;
    }
  }

  /**
   * 更新注册表
   */
  async updateRegistry(id: number, registryData: Partial<Registry>): Promise<Registry> {
    try {
      const response = await fetch(`${this.config.apiUrl}/registries/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registryData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating registry:', error);
      throw error;
    }
  }

  /**
   * 删除注册表
   */
  async removeRegistry(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.config.apiUrl}/registries/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error removing registry:', error);
      throw error;
    }
  }

  /**
   * 获取资源控制
   */
  async getResourceControls(): Promise<any[]> {
    try {
      const response = await fetch(`${this.config.apiUrl}/resource_controls`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting resource controls:', error);
      throw error;
    }
  }

  /**
   * 获取标签
   */
  async getTags(): Promise<any[]> {
    try {
      const response = await fetch(`${this.config.apiUrl}/tags`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting tags:', error);
      throw error;
    }
  }
}

export default PortainerSkill;