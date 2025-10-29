// 简化的内存存储（生产环境应使用数据库）
const historyStorage = new Map();

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      // 获取历史记录
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({
          error: '用户ID不能为空'
        });
      }

      const userHistory = historyStorage.get(userId) || [];

      // 按时间倒序排列
      const sortedHistory = userHistory.sort((a, b) => b.timestamp - a.timestamp);

      res.json({
        success: true,
        data: sortedHistory
      });

    } else if (req.method === 'POST') {
      // 添加历史记录
      const historyItem = req.body;

      if (!historyItem || !historyItem.userId) {
        return res.status(400).json({
          error: '历史记录项或用户ID不能为空'
        });
      }

      // 生成唯一ID
      const historyId = `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const itemWithId = {
        ...historyItem,
        id: historyId,
        timestamp: Date.now(),
      };

      // 存储历史记录
      const userHistory = historyStorage.get(historyItem.userId) || [];
      userHistory.push(itemWithId);
      historyStorage.set(historyItem.userId, userHistory);

      res.json({
        success: true,
        data: itemWithId
      });

    } else if (req.method === 'POST' && req.url.includes('/rollback')) {
      // 回滚操作
      const urlParts = req.url.split('/');
      const historyId = urlParts[urlParts.length - 2]; // 获取 /history/{id}/rollback 中的 id

      if (!historyId) {
        return res.status(400).json({
          error: '历史记录ID不能为空'
        });
      }

      // 查找对应的历史记录
      let targetHistory = null;
      let userId = null;

      for (const [uid, userHistory] of historyStorage.entries()) {
        const found = userHistory.find(item => item.id === historyId);
        if (found) {
          targetHistory = found;
          userId = uid;
          break;
        }
      }

      if (!targetHistory) {
        return res.status(404).json({
          error: '未找到指定的历史记录'
        });
      }

      if (!targetHistory.canRollback) {
        return res.status(400).json({
          error: '该操作不支持回滚'
        });
      }

      // 执行回滚操作（这里简化处理，实际应该调用相应的API）
      const rollbackHistory = {
        userId,
        operation: 'ROLLBACK',
        fieldId: targetHistory.fieldId,
        fieldName: targetHistory.fieldName,
        beforeState: targetHistory.afterState,
        afterState: targetHistory.beforeState,
        canRollback: true,
        originalHistoryId: historyId,
        timestamp: Date.now(),
        id: `rollback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      // 存储回滚记录
      const userHistory = historyStorage.get(userId) || [];
      userHistory.push(rollbackHistory);
      historyStorage.set(userId, userHistory);

      res.json({
        success: true,
        message: '回滚操作成功',
        data: rollbackHistory
      });

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('History API Error:', error.message);
    res.status(500).json({
      error: '服务器内部错误',
      details: error.message
    });
  }
}