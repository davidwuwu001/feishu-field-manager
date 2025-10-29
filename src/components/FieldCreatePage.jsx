import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, Button, Card, message, Space, Select, Divider, InputNumber, Typography } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, PlusOutlined } from '@ant-design/icons';
import { api } from '../services/api';

const { Title } = Typography;

// 字段类型选项
const FIELD_TYPES = [
  { value: 'text', label: '文本' },
  { value: 'number', label: '数字' },
  { value: 'single_select', label: '单选' },
  { value: 'multi_select', label: '多选' },
  { value: 'date', label: '日期' },
  { value: 'checkbox', label: '勾选框' },
  { value: 'user', label: '人员' },
  { value: 'phone', label: '电话号码' },
  { value: 'email', label: '邮箱' },
  { value: 'url', label: '网址' }
];

// 字段类型映射到飞书API的数字类型
const FIELD_TYPE_MAP = {
  'text': 1,        // 多行文本
  'number': 2,      // 数字
  'single_select': 3, // 单选
  'multi_select': 4,  // 多选
  'date': 5,        // 日期
  'checkbox': 7,    // 勾选框
  'user': 11,       // 人员
  'phone': 13,      // 电话号码
  'email': 15,      // 邮箱
  'url': 17         // 网址
};

export default function FieldCreatePage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [tableInfo, setTableInfo] = useState(null);
  const [fieldType, setFieldType] = useState('text');
  const [options, setOptions] = useState([{ id: Date.now(), name: '', color: 0 }]);
  const navigate = useNavigate();

  // 获取表格信息
  useEffect(() => {
    const fetchTableInfo = async () => {
      try {
        const token = sessionStorage.getItem('feishu_token');
        const tableUrl = sessionStorage.getItem('feishu_tableUrl');

        if (!token || !tableUrl) {
          message.error('认证信息已过期，请重新登录');
          navigate('/auth');
          return;
        }

        // 获取表格信息
        const tableResult = await api.tables.getInfo(tableUrl);
        if (tableResult.success) {
          setTableInfo(tableResult.data);
        }
      } catch (error) {
        console.error('获取表格信息失败:', error);
        message.error('获取表格信息失败');
      }
    };

    fetchTableInfo();
  }, [navigate]);

  // 处理字段类型变化
  const handleFieldTypeChange = (value) => {
    setFieldType(value);
    // 重置选项
    if (value === 'single_select' || value === 'multi_select') {
      setOptions([{ id: Date.now(), name: '', color: 0 }]);
    } else {
      // 确保彻底清除选项，避免切换到文本类型时仍有残留选项
      setOptions([]);
      console.log('字段类型已更改为非选择类型，选项已清除');
    }
  };

  // 添加选项
  const addOption = () => {
    setOptions([...options, { id: Date.now(), name: '', color: Math.floor(Math.random() * 8) }]);
  };

  // 删除选项
  const removeOption = (index) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  // 更新选项
  const updateOption = (index, field, value) => {
    const newOptions = [...options];
    newOptions[index][field] = value;
    setOptions(newOptions);
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
      const fieldConfig = {
        field_name: values.field_name,
        type: FIELD_TYPE_MAP[fieldType] // 将字符串类型转换为数字类型
      };

      // 如果是选择类型字段，添加选项
      if (fieldType === 'single_select' || fieldType === 'multi_select') {
        fieldConfig.property = {
          options: options.filter(opt => opt.name.trim() !== '').map(opt => ({
            name: opt.name.trim(),
            color: opt.color
          }))
        };
      }

      // 将fieldConfig包装在对象中发送到API
      const result = await api.fields.create({ fieldConfig });

      if (result.success) {
        message.success('字段创建成功');
        navigate('/fields');
      }
    } catch (error) {
      console.error('创建字段失败:', error);
      message.error(error.message || '创建字段失败');
    } finally {
      setLoading(false);
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
              新建字段
            </Title>
          </Space>
        }
        className="card-container"
      >
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

          <Form.Item
            label="字段类型"
            name="field_type"
            initialValue="text"
            rules={[{ required: true, message: '请选择字段类型' }]}
          >
            <Select
              placeholder="请选择字段类型"
              size="large"
              onChange={handleFieldTypeChange}
              options={FIELD_TYPES}
            />
          </Form.Item>

          {(fieldType === 'single_select' || fieldType === 'multi_select') && (
            <>
              <Divider>选项设置</Divider>
              <div style={{ marginBottom: '20px' }}>
                {options.map((option, index) => (
                  <div key={option.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '10px',
                    gap: '10px'
                  }}>
                    <Input
                      placeholder="选项名称"
                      value={option.name}
                      onChange={(e) => updateOption(index, 'name', e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <Select
                      value={option.color}
                      onChange={(value) => updateOption(index, 'color', value)}
                      style={{ width: '120px' }}
                      options={[
                        { value: 0, label: '灰色' },
                        { value: 1, label: '红色' },
                        { value: 2, label: '橙色' },
                        { value: 3, label: '黄色' },
                        { value: 4, label: '绿色' },
                        { value: 5, label: '蓝色' },
                        { value: 6, label: '紫色' },
                        { value: 7, label: '棕色' }
                      ]}
                    />
                    <Button
                      onClick={() => removeOption(index)}
                      danger
                    >
                      删除
                    </Button>
                  </div>
                ))}
                <Button
                  type="dashed"
                  onClick={addOption}
                  icon={<PlusOutlined />}
                  block
                >
                  添加选项
                </Button>
              </div>
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
                创建字段
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
}