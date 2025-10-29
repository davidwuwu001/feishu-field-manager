import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, message, Typography, Space, Checkbox } from 'antd';
import { KeyOutlined, LinkOutlined } from '@ant-design/icons';
import { api } from '../services/api';

const { Title, Text } = Typography;

export default function AuthPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [rememberCredentials, setRememberCredentials] = useState(false);
  const navigate = useNavigate();

  // 组件加载时，从localStorage获取保存的凭据
  useEffect(() => {
    const savedCredentials = localStorage.getItem('feishu_credentials');
    if (savedCredentials) {
      try {
        const credentials = JSON.parse(savedCredentials);
        form.setFieldsValue({
          appId: credentials.appId || '',
          appSecret: credentials.appSecret || '',
          tableUrl: credentials.tableUrl || ''
        });
        setRememberCredentials(true);
      } catch (error) {
        console.error('解析保存的凭据失败:', error);
      }
    }
  }, [form]);

  const handleConnect = async (values) => {
    setLoading(true);
    try {
      // 验证表格URL格式
      try {
        new URL(values.tableUrl);
        if (!values.tableUrl.includes('feishu.cn')) {
          throw new Error('请输入有效的飞书表格URL');
        }
      } catch (error) {
        message.error('请输入有效的飞书表格URL');
        return;
      }

      // 测试认证
      const authResult = await api.auth.login(values);

      if (authResult.success) {
        message.success('连接成功！');

        // 保存认证信息到sessionStorage
        sessionStorage.setItem('feishu_token', authResult.token);
        sessionStorage.setItem('feishu_appId', values.appId);
        sessionStorage.setItem('feishu_tableUrl', values.tableUrl);

        // 如果用户选择记住凭据，则保存到localStorage
        if (rememberCredentials) {
          localStorage.setItem('feishu_credentials', JSON.stringify({
            appId: values.appId,
            appSecret: values.appSecret,
            tableUrl: values.tableUrl
          }));
        } else {
          // 如果用户不选择记住，清除之前保存的凭据
          localStorage.removeItem('feishu_credentials');
        }

        // 跳转到字段列表页面
        navigate('/fields');
      } else {
        message.error('认证失败');
      }
    } catch (error) {
      console.error('认证失败:', error);
      message.error(error.message || '连接失败，请检查凭据和URL是否正确');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div style={{ maxWidth: 500, margin: '0 auto', marginTop: '60px' }}>
        <Card
          style={{
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            borderRadius: '12px'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Title level={3} style={{ color: '#1890ff', marginBottom: '8px' }}>
              🎯 飞书字段管理工具
            </Title>
            <Text type="secondary">
              便捷管理飞书多维表格字段和选项
            </Text>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleConnect}
            autoComplete="off"
          >
            <Form.Item
              label="应用ID"
              name="appId"
              rules={[
                { required: true, message: '请输入应用ID' },
                { pattern: /^cli_/, message: '应用ID格式不正确' }
              ]}
            >
              <Input
                prefix={<KeyOutlined />}
                placeholder="cli_xxxxxxxxxxxxxxxx"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="应用密钥"
              name="appSecret"
              rules={[
                { required: true, message: '请输入应用密钥' },
                { min: 10, message: '应用密钥长度不足' }
              ]}
            >
              <Input.Password
                prefix={<KeyOutlined />}
                placeholder="请输入应用密钥"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="表格地址"
              name="tableUrl"
              rules={[
                { required: true, message: '请输入表格地址' },
                { type: 'url', message: '请输入有效的URL' }
              ]}
            >
              <Input
                prefix={<LinkOutlined />}
                placeholder="https://xxx.feishu.cn/base/xxxxxx"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Checkbox
                checked={rememberCredentials}
                onChange={(e) => setRememberCredentials(e.target.checked)}
              >
                记住我的凭据（仅保存在本地浏览器中）
              </Checkbox>
            </Form.Item>

            <Form.Item style={{ marginBottom: '12px' }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                style={{ height: '44px', fontSize: '16px' }}
              >
                连接表格
              </Button>
            </Form.Item>
          </Form>

          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              💡 支持标准表格和Wiki表格链接
            </Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              🔐 凭据可选择保存在本地浏览器中，方便下次使用
            </Text>
          </Space>
        </Card>
      </div>
    </div>
  );
}