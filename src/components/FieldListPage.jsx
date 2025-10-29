import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, List, Tag, Space, message, Typography, Empty, Spin } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { api } from '../services/api';
import { formatFieldForDisplay, FIELD_TYPES } from '../utils/feishu';

const { Title, Text } = Typography;

export default function FieldListPage() {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableInfo, setTableInfo] = useState(null);
  const navigate = useNavigate();

  // 获取字段列表
  const fetchFields = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('feishu_token');
      const tableUrl = sessionStorage.getItem('feishu_tableUrl');

      if (!token || !tableUrl) {
        message.error('认证信息已过期，请重新登录');
        navigate('/auth');
        return;
      }

      // 先获取表格信息
      const tableResult = await api.tables.getInfo(tableUrl);

      if (!tableResult.success) {
        message.error('获取表格信息失败');
        return;
      }

      setTableInfo(tableResult.data);
      
      // 将表格信息存储到sessionStorage，供API服务使用
      sessionStorage.setItem('feishu_tableInfo', JSON.stringify({
        appToken: tableResult.data.appToken,
        tableId: tableResult.data.tableId
      }));

      // 获取字段列表
      const fieldsResult = await api.fields.list();

      if (fieldsResult.success) {
        const formattedFields = fieldsResult.data.map(formatFieldForDisplay);
        setFields(formattedFields);
      } else {
        message.error('获取字段列表失败');
      }
    } catch (error) {
      console.error('获取字段列表失败:', error);
      message.error(error.message || '获取字段列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  // 处理字段编辑
  const handleEditField = (field) => {
    navigate(`/fields/${field.field_id}/edit`, { state: { field } });
  };

  // 处理字段删除
  const handleDeleteField = async (field) => {
    try {
      const confirmDelete = window.confirm(
        `确定要删除字段"${field.field_name}"吗？此操作不可恢复。`
      );

      if (!confirmDelete) return;

      const deleteResult = await api.fields.delete(field.field_id);

      if (deleteResult.success) {
        message.success('字段删除成功');
        fetchFields(); // 重新获取字段列表
      }
    } catch (error) {
      console.error('删除字段失败:', error);
      message.error(error.message || '删除字段失败');
    }
  };

  // 获取字段类型标签颜色
  const getFieldTypeColor = (type) => {
    const colors = {
      [FIELD_TYPES.TEXT]: 'blue',
      [FIELD_TYPES.NUMBER]: 'green',
      [FIELD_TYPES.SINGLE_SELECT]: 'orange',
      [FIELD_TYPES.MULTI_SELECT]: 'purple',
      [FIELD_TYPES.DATETIME]: 'cyan',
      [FIELD_TYPES.CHECKBOX]: 'red',
      [FIELD_TYPES.USER]: 'magenta',
      [FIELD_TYPES.URL]: 'geekblue',
      [FIELD_TYPES.ATTACHMENT]: 'volcano',
    };
    return colors[type] || 'default';
  };

  return (
    <div className="container">
      <Card
        title={
          <Space>
            <Title level={4} style={{ margin: 0 }}>
              📋 字段列表
            </Title>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchFields}
              loading={loading}
              size="small"
            >
              刷新
            </Button>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/fields/create')}
          >
            新建字段
          </Button>
        }
        className="card-container"
      >
        {tableInfo && (
          <div style={{ marginBottom: '16px', padding: '12px', background: '#f8f9fa', borderRadius: '6px' }}>
            <Text strong>表格信息：</Text>
            <Text style={{ marginLeft: '8px' }}>
              {tableInfo.appInfo?.name || '未知表格'}
            </Text>
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
          </div>
        ) : fields.length === 0 ? (
          <Empty
            description="暂无字段"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <List
            dataSource={fields}
            renderItem={(field) => (
              <List.Item
                className="field-item"
                actions={[
                  <Button
                    key="edit"
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => handleEditField(field)}
                  >
                    编辑
                  </Button>,
                  <Button
                    key="delete"
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteField(field)}
                  >
                    删除
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong>{field.field_name}</Text>
                      {field.is_primary && <Tag color="red">主字段</Tag>}
                    </Space>
                  }
                  description={
                    <Space wrap>
                      <Tag color={getFieldTypeColor(field.type)}>
                        {field.typeName}
                      </Tag>
                      {field.hasOptions && (
                        <Tag color="default">
                          {field.optionCount} 个选项
                        </Tag>
                      )}
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        ID: {field.field_id}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
}