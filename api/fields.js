import axios from 'axios';

export default async function handler(req, res) {
  try {
    // 从请求头获取token
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    // 从查询参数获取appToken和tableId（GET请求）
    const queryAppToken = req.query.appToken;
    const queryTableId = req.query.tableId;
    
    // 从请求体获取appToken和tableId（POST/PUT/DELETE请求）
    const bodyAppToken = req.body?.appToken;
    const bodyTableId = req.body?.tableId;
    const fieldId = req.body?.fieldId;
    const fieldConfig = req.body?.fieldConfig;
    const operation = req.body?.operation;
    
    const finalAppToken = queryAppToken || bodyAppToken;
    const finalTableId = queryTableId || bodyTableId;

    if (!token) {
      return res.status(401).json({
        error: '访问令牌不能为空'
      });
    }

    if (!finalAppToken || !finalTableId) {
      return res.status(400).json({
        error: '应用令牌和表格ID不能为空'
      });
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
    };

    if (req.method === 'GET') {
      // 检查是否有字段ID参数，如果有则获取单个字段详情，否则获取字段列表
      const fieldId = req.params.id;
      
      if (fieldId) {
        // 获取单个字段详情
        try {
          const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${finalAppToken}/tables/${finalTableId}/fields/${fieldId}`;
          const response = await axios.get(url, { headers });
          const result = response.data;

          if (result.code !== 0) {
            return res.status(400).json({
              error: `获取字段详情失败: ${result.msg}`
            });
          }

          // 确保返回完整的字段信息，包括选项
          const field = result.data.field;
          
          // 对于单选或多选字段，确保选项信息完整
          if ((field.type === '1' || field.type === '2') && field.property && field.property.options) {
            // 选项信息已包含在响应中，无需额外处理
            console.log(`获取到${field.type === '1' ? '单选' : '多选'}字段，选项数量:`, field.property.options.length);
          }

          res.json({
            success: true,
            data: field
          });
        } catch (error) {
          return res.status(500).json({
            error: '获取字段详情失败',
            details: error.response?.data || null
          });
        }
      } else {
        // 获取字段列表
        let hasMore = true;
        let pageToken = "";
        let fields = [];

        while (hasMore) {
          const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${finalAppToken}/tables/${finalTableId}/fields?page_size=100${pageToken ? `&page_token=${encodeURIComponent(pageToken)}` : ""}`;

          try {
            const response = await axios.get(url, { headers });
            const result = response.data;

            if (result.code !== 0) {
              return res.status(400).json({
                error: `获取字段列表失败: ${result.msg}`
              });
            }

            fields = fields.concat(result.data.items);
            hasMore = result.data.has_more;
            pageToken = result.data.page_token;
          } catch (error) {
            return res.status(500).json({
              error: '获取字段列表失败',
              details: error.response?.data || null
            });
          }
        }

        res.json({
          success: true,
          data: fields
        });
      }
    } else if (req.method === 'POST') {
      // 创建新字段
      if (!fieldConfig) {
        return res.status(400).json({
          error: '字段配置不能为空'
        });
      }

      try {
        const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${finalAppToken}/tables/${finalTableId}/fields`;
        const response = await axios.post(url, fieldConfig, { headers });

        const result = response.data;
        if (result.code !== 0) {
          return res.status(400).json({
            error: `创建字段失败: ${result.msg}`,
            details: result
          });
        }

        res.json({
          success: true,
          data: result.data.field
        });

      } catch (error) {
        res.status(500).json({
          error: '创建字段失败',
          details: error.response?.data || null
        });
      }

    } else if (req.method === 'PUT') {
      // 更新字段
      if (!fieldId || !fieldConfig) {
        return res.status(400).json({
          error: '字段ID和字段配置不能为空'
        });
      }

      try {
        // 对于选择类型的字段，先获取原始字段信息以确保options不为空
        if (fieldConfig.type === '1' || fieldConfig.type === '2') { // 单选或多选
          try {
            const getUrl = `https://open.feishu.cn/open-apis/bitable/v1/apps/${finalAppToken}/tables/${finalTableId}/fields/${fieldId}`;
            const getResponse = await axios.get(getUrl, { headers });
            
            if (getResponse.data.code === 0 && getResponse.data.data.field) {
              const originalField = getResponse.data.data.field;
              
              // 确保property对象存在
              if (!fieldConfig.property) {
                fieldConfig.property = {};
              }
              
              // 如果当前配置中没有options或options为空，使用原始字段的options
              if (!fieldConfig.property.options || fieldConfig.property.options.length === 0) {
                if (originalField.property && originalField.property.options) {
                  fieldConfig.property.options = originalField.property.options;
                }
              }
            }
          } catch (getError) {
            console.warn('获取原始字段信息失败，继续更新:', getError.message);
          }
        }
        
        const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${finalAppToken}/tables/${finalTableId}/fields/${fieldId}`;
        const response = await axios.put(url, fieldConfig, { headers });

        const result = response.data;
        if (result.code !== 0) {
          return res.status(400).json({
            error: `更新字段失败: ${result.msg}`,
            details: result
          });
        }

        res.json({
          success: true,
          data: result.data.field
        });

      } catch (error) {
        console.error('更新字段API错误:', error.response?.data || error.message);
        res.status(500).json({
          error: '更新字段失败',
          details: error.response?.data || error.message
        });
      }

    } else if (req.method === 'DELETE') {
      // 删除字段
      // 从URL参数获取字段ID
      const fieldId = req.params.id || req.query.id;
      
      // 从请求体或查询参数获取appToken和tableId
      const { appToken: bodyAppToken, tableId: bodyTableId } = req.body;
      const queryAppToken = req.query.appToken;
      const queryTableId = req.query.tableId;
      
      const deleteAppToken = bodyAppToken || queryAppToken || finalAppToken;
      const deleteTableId = bodyTableId || queryTableId || finalTableId;
      
      if (!fieldId) {
        return res.status(400).json({
          error: '字段ID不能为空'
        });
      }

      try {
        const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${deleteAppToken}/tables/${deleteTableId}/fields/${fieldId}`;
        const response = await axios.delete(url, { headers });

        const result = response.data;
        if (result.code !== 0) {
          return res.status(400).json({
            error: `删除字段失败: ${result.msg}`,
            details: result
          });
        }

        res.json({
          success: true,
          message: '字段删除成功'
        });

      } catch (error) {
        res.status(500).json({
          error: '删除字段失败',
          details: error.response?.data || null
        });
      }

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Fields API Error:', error.message);
    res.status(500).json({
      error: '服务器内部错误',
      details: error.message
    });
  }
}