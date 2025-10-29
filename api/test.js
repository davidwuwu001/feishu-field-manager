export default async function handler(req, res) {
  res.json({
    success: true,
    message: '飞书字段管理工具API运行正常',
    timestamp: new Date().toISOString(),
    method: req.method
  });
}