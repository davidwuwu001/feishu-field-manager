import axios from 'axios';

// 创建axios实例
const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api', // 本地开发环境使用本地API服务器
  timeout: 10000,
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证token等
    const token = sessionStorage.getItem('feishu_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// API方法
export const api = {
  // 认证相关
  auth: {
    login: (credentials) => apiClient.post('/auth', credentials),
  },

  // 表格相关
  tables: {
    getInfo: (url) => apiClient.get(`/tables?url=${encodeURIComponent(url)}`),
  },

  // 字段相关
  fields: {
    list: () => {
      // 从sessionStorage获取表格信息
      const tableInfo = JSON.parse(sessionStorage.getItem('feishu_tableInfo') || '{}');
      return apiClient.get(`/fields?appToken=${tableInfo.appToken}&tableId=${tableInfo.tableId}`);
    },
    get: (id) => {
      const tableInfo = JSON.parse(sessionStorage.getItem('feishu_tableInfo') || '{}');
      return apiClient.get(`/fields/${id}`, { params: { appToken: tableInfo.appToken, tableId: tableInfo.tableId } });
    },
    update: (data) => {
      const tableInfo = JSON.parse(sessionStorage.getItem('feishu_tableInfo') || '{}');
      return apiClient.put(`/fields`, { ...data, appToken: tableInfo.appToken, tableId: tableInfo.tableId });
    },
    delete: (id) => {
      const tableInfo = JSON.parse(sessionStorage.getItem('feishu_tableInfo') || '{}');
      return apiClient.delete(`/fields/${id}`, { data: { appToken: tableInfo.appToken, tableId: tableInfo.tableId } });
    },
    create: (data) => {
      const tableInfo = JSON.parse(sessionStorage.getItem('feishu_tableInfo') || '{}');
      return apiClient.post('/fields', { ...data, appToken: tableInfo.appToken, tableId: tableInfo.tableId });
    },
  },

  // 历史记录相关
  history: {
    list: () => apiClient.get('/history'),
    add: (data) => apiClient.post('/history', data),
    rollback: (id) => apiClient.post(`/history/rollback`, { id }),
  },
};

export default api;