import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Space, message, Typography, Divider } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import OptionsManager from './OptionsManager';

const { Title } = Typography;

/**
 * 字段编辑页面组件
 * 支持编辑现有字段和创建新字段
 */
const FieldEditPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [field, setField] = useState(null);
  const [tableInfo, setTableInfo] = useState(null);
  const [fieldType, setFieldType] = useState('text');
  const navigate = useNavigate();
  const location = useLocation();

  // 从URL参数获取字段ID和表格URL
  const params = new URLSearchParams(location.search);
  const fieldId = params.get('id') || 'create';
  const tableUrl = sessionStorage.getItem('feishu_tableUrl') || '';

  // 获取字段信息
  useEffect(() => {
    const fetchFieldInfo = async () => {
      try {
        const token = sessionStorage.getItem('feishu_token');
        
        if (!token) {
          message.error('认证信息已过期，请重新登录');
          navigate('/auth');
          return;
        }

        // 获取表格信息
        const tableResult = await api.tables.getInfo(tableUrl);
        if (tableResult.success) {
          setTableInfo(tableResult.data);
        }

        // 如果是编辑模式，获取字段详情
        if (fieldId !== 'create') {
          // 首先尝试从location.state获取字段信息
          const locationState = window.history.state?.state?.field;
          if (locationState) {
            setField(locationState);
            form.setFieldsValue({
              field_name: locationState.field_name,
            });
          } else {
            // 如果没有state信息，则通过API获取字段详情
            const fieldResult = await api.fields.get(fieldId);
            if (fieldResult.success) {
              setField(fieldResult.data);
              form.setFieldsValue({
                field_name: fieldResult.data.field_name,
              });
            } else {
              message.error('获取字段详情失败');
            }
          }
        } else {
          // 创建模式，从URL参数获取字段类型
          const urlParams = new URLSearchParams(window.location.search);
          const type = urlParams.get('type') || 'text';
          setFieldType(type);
        }
      } catch (error) {
        console.error('获取字段信息失败:', error);
        message.error('获取字段信息失败');
      }
    };

    fetchFieldInfo();
  }, [fieldId, navigate, form]);

  // 验证字段配置
  const validateFieldConfig = (config) => {
    const errors = [];
    
    if (!config.field_name || config.field_name.trim() === '') {
      errors.push('字段名称不能为空');
    }
    
    if (config.field_name && config.field_name.length > 50) {
      errors.push('字段名称不能超过50个字符');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // 保存字段
  const handleSave = async (values) => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('feishu_token');

      if (!token) {
        message.error('认证信息已过期，请重新登录');
        navigate('/auth');
        return;
      }

      // 生成字段配置
      let fieldConfig;
      let result;

      if (field) {
        // 更新现有字段 - 保留所有原始属性，只修改指定的属性
        fieldConfig = {
          field_name: values.field_name,
          type: field.type,
          ui_type: field.ui_type,
          description: field.description || '',
          is_primary: field.is_primary || false,
          property: field.property || {}
        };

        const validation = validateFieldConfig(fieldConfig);
        if (!validation.isValid) {
          message.error('字段配置验证失败：' + validation.errors.join(', '));
          return;
        }

        result = await api.fields.update({
          fieldId: field.field_id,
          fieldConfig: fieldConfig
        });

        if (result.success) {
          message.success('字段更新成功');
          navigate('/fields');
        }
      } else {
        // 创建新字段
        fieldConfig = {
          field_name: values.field_name,
          type: fieldType || 'text'
        };

        result = await api.fields.create(fieldConfig);

        if (result.success) {
          message.success('字段创建成功');
          navigate('/fields');
        }
      }
    } catch (error) {
      console.error('保存字段失败:', error);
      message.error(error.message || '保存字段失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理字段选项更新
  const handleOptionsUpdate = async (updatedField) => {
    try {
      const token = sessionStorage.getItem('feishu_token');
      
      if (!token) {
        message.error('认证信息已过期，请重新登录');
        navigate('/auth');
        return;
      }

      // 构建字段配置，确保包含所有必要属性
      let fieldConfig = {
        field_name: updatedField.field_name || field.field_name,
        type: updatedField.type || field.type,
        ui_type: updatedField.ui_type || field.ui_type,
        description: updatedField.description || field.description || '',
        is_primary: updatedField.is_primary || field.is_primary || false,
        property: updatedField.property || field.property || {}
      };

      // 对于选择类型的字段，确保property中包含options
      if (fieldConfig.type === '1' || fieldConfig.type === '2') { // 单选或多选
        if (!fieldConfig.property) {
          fieldConfig.property = {};
        }
        fieldConfig.property.options = updatedField.property?.options || field.property?.options || [];
      }

      const validation = validateFieldConfig(fieldConfig);
      if (!validation.isValid) {
        message.error('字段配置验证失败：' + validation.errors.join(', '));
        return;
      }

      const result = await api.fields.update({
        fieldId: updatedField.field_id || field.field_id,
        fieldConfig: fieldConfig
      });

      if (result.success) {
        message.success('选项更新成功');
        setField(updatedField);
      } else {
        message.error('选项更新失败: ' + (result.error || '未知错误'));
      }
    } catch (error) {
      console.error('更新选项失败:', error);
      message.error('更新选项失败: ' + (error.message || '未知错误'));
    }
  };

  return (
    <div className="container">
      <Card
        title={
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/fields')}
              type="text"
            />
            <Title level={4} style={{ margin: 0 }}>
              {fieldId === 'create' ? '新建字段' : '编辑字段'}
            </Title>
          </Space>
        }
        className="card-container"
      >
        {field && (
          <div style={{ marginBottom: '20px', padding: '12px', background: '#f8f9fa', borderRadius: '6px' }}>
            <Space>
              <span>字段类型：</span>
              <strong>{field.typeName}</strong>
              <span>|</span>
              <span>字段ID：</span>
              <strong>{field.field_id}</strong>
            </Space>
          </div>
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          autoComplete="off"
        >
          <Form.Item
            label="字段名称"
            name="field_name"
            rules={[
              { required: true, message: '请输入字段名称' },
              { max: 50, message: '字段名称不能超过50个字符' }
            ]}
          >
            <Input placeholder="请输入字段名称" size="large" />
          </Form.Item>

          {field && (field.type === '1' || field.type === '2') && (
            <>
              <Divider>字段选项</Divider>
              <OptionsManager 
                field={field} 
                onUpdate={handleOptionsUpdate}
              />
            </>
          )}

          <div className="action-buttons">
            <Space size="large">
              <Button onClick={() => navigate('/fields')}>
                取消
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
                size="large"
              >
                保存
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default FieldEditPage;