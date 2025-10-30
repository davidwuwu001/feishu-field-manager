const express = require('express');
const cors = require('cors');
const path = require('path');

// 创建Express应用
const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// API路由 - 使用Vercel格式的处理函数
app.post('/api/auth', async (req, res) => {
  try {
    // 确保req.body存在
    req.body = req.body || {};
    
    // 动态导入处理函数
    const authModule = await import('./api/auth.js');
    const handler = authModule.default;
    
    // 调用处理函数
    await handler(req, res);
  } catch (error) {
    console.error('Auth API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/tables', async (req, res) => {
  try {
    // 确保req.query存在
    req.query = req.query || {};
    
    // 动态导入处理函数
    const tablesModule = await import('./api/tables.js');
    const handler = tablesModule.default;
    
    // 调用处理函数
    await handler(req, res);
  } catch (error) {
    console.error('Tables API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/fields', async (req, res) => {
  try {
    // 确保req.query存在
    req.query = req.query || {};
    
    // 动态导入处理函数
    const fieldsModule = await import('./api/fields.js');
    const handler = fieldsModule.default;
    
    // 调用处理函数
    await handler(req, res);
  } catch (error) {
    console.error('Fields API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/fields/:id', async (req, res) => {
  try {
    // 确保req.query和req.params存在
    req.query = req.query || {};
    req.params = req.params || {};
    
    // 动态导入处理函数
    const fieldsModule = await import('./api/fields.js');
    const handler = fieldsModule.default;
    
    // 调用处理函数
    await handler(req, res);
  } catch (error) {
    console.error('Fields API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/fields', async (req, res) => {
  try {
    // 确保req.body存在
    req.body = req.body || {};
    
    // 动态导入处理函数
    const fieldsModule = await import('./api/fields.js');
    const handler = fieldsModule.default;
    
    // 调用处理函数
    await handler(req, res);
  } catch (error) {
    console.error('Fields API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/fields/:id', async (req, res) => {
  try {
    // 确保req.body和req.params存在
    req.body = req.body || {};
    req.params = req.params || {};
    
    // 将URL参数中的ID添加到请求体中，以便API处理函数使用
    if (req.params.id && !req.body.fieldId) {
      req.body.fieldId = req.params.id;
    }
    
    // 动态导入处理函数
    const fieldsModule = await import('./api/fields.js');
    const handler = fieldsModule.default;
    
    // 调用处理函数
    await handler(req, res);
  } catch (error) {
    console.error('Fields API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/fields', async (req, res) => {
  try {
    // 确保req.body存在
    req.body = req.body || {};
    
    // 动态导入处理函数
    const fieldsModule = await import('./api/fields.js');
    const handler = fieldsModule.default;
    
    // 调用处理函数
    await handler(req, res);
  } catch (error) {
    console.error('Fields API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/fields/:id', async (req, res) => {
  try {
    // 动态导入处理函数
    const fieldsModule = await import('./api/fields.js');
    const handler = fieldsModule.default;
    
    // 将URL参数添加到请求对象中
    req.params = req.params || {};
    req.query = req.query || {};
    req.query.id = req.params.id;
    
    // 调用处理函数
    await handler(req, res);
  } catch (error) {
    console.error('Fields API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/history', async (req, res) => {
  try {
    // 确保req.query存在
    req.query = req.query || {};
    
    // 动态导入处理函数
    const historyModule = await import('./api/history.js');
    const handler = historyModule.default;
    
    // 调用处理函数
    await handler(req, res);
  } catch (error) {
    console.error('History API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/history', async (req, res) => {
  try {
    // 确保req.body存在
    req.body = req.body || {};
    
    // 动态导入处理函数
    const historyModule = await import('./api/history.js');
    const handler = historyModule.default;
    
    // 调用处理函数
    await handler(req, res);
  } catch (error) {
    console.error('History API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/history/rollback', async (req, res) => {
  try {
    // 确保req.body存在
    req.body = req.body || {};
    
    // 动态导入处理函数
    const historyModule = await import('./api/history.js');
    const handler = historyModule.default;
    
    // 调用处理函数
    await handler(req, res);
  } catch (error) {
    console.error('History API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 处理所有其他请求，返回前端应用
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`API服务器运行在端口 ${PORT}`);
});