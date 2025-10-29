import axios from 'axios';

export default async function handler(req, res) {
  try {
    // 从请求头获取token或从请求体获取
    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.replace('Bearer ', '') : req.body.token;
    
    // 从查询参数获取表格URL或从请求体获取
    const tableUrl = req.query.url || req.body.tableUrl;

    if (!token || !tableUrl) {
      return res.status(400).json({
        error: '访问令牌和表格URL不能为空'
      });
    }

    // 解析表格URL
    let appToken, tableId, viewId;
    try {
      const url = new URL(tableUrl);
      const pathname = url.pathname;
      appToken = pathname.split("/").at(-1);
      viewId = url.searchParams.get("view");
      tableId = url.searchParams.get("table");

      if (pathname.includes("/wiki/")) {
        // 处理wiki类型的表格
        const wikiResponse = await axios.get(
          `https://open.feishu.cn/open-apis/wiki/v2/spaces/get_node?token=${encodeURIComponent(appToken)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json; charset=utf-8",
            },
          }
        );

        const wikiResult = wikiResponse.data;
        if (wikiResult.code !== 0) {
          return res.status(400).json({
            error: `获取wiki节点信息失败: ${wikiResult.msg}`
          });
        }

        appToken = wikiResult.data.node.obj_token;
      }
    } catch (error) {
      return res.status(400).json({
        error: '无效的表格URL'
      });
    }

    // 获取表格基本信息
    try {
      const response = await axios.get(
        `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      );

      const result = response.data;
      if (result.code !== 0) {
        return res.status(400).json({
          error: `获取表格信息失败: ${result.msg}`
        });
      }

      res.json({
        success: true,
        data: {
          appToken,
          tableId,
          viewId,
          appInfo: result.data.app
        }
      });

    } catch (error) {
      res.status(500).json({
        error: '获取表格信息失败',
        details: error.response?.data || null
      });
    }

  } catch (error) {
    console.error('Tables API Error:', error.message);
    res.status(500).json({
      error: '服务器内部错误',
      details: error.message
    });
  }
}