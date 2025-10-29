import axios from 'axios';

export default async function handler(req, res) {
  // 只允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { appId, appSecret } = req.body;

    if (!appId || !appSecret) {
      return res.status(400).json({
        error: '应用ID和应用密钥不能为空'
      });
    }

    // 获取tenant_access_token
    const response = await axios.post(
      'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
      {
        app_id: appId,
        app_secret: appSecret,
      },
      {
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      }
    );

    const result = response.data;

    if (result.code !== 0) {
      return res.status(400).json({
        error: `认证失败: ${result.msg}`,
        code: result.code
      });
    }

    res.json({
      success: true,
      token: result.tenant_access_token,
      expire: result.expire,
    });

  } catch (error) {
    console.error('Auth API Error:', error.message);

    const errorMessage = error.response?.data?.msg || error.message;
    res.status(500).json({
      error: `认证失败: ${errorMessage}`,
      details: error.response?.data || null
    });
  }
}