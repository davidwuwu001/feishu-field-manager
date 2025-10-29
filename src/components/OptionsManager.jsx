import React, { useState, useEffect } from 'react';
import { Button, Space, Input, Modal, Form, message, ColorPicker, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

/**
 * 选项管理组件
 * 用于管理单选和多选字段的选项
 */
const OptionsManager = ({ field, onUpdate }) => {
  const [options, setOptions] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingOption, setEditingOption] = useState(null);
  const [form] = Form.useForm();

  // 初始化选项数据
  useEffect(() => {
    if (field && field.property && field.property.options) {
      setOptions([...field.property.options]);
    }
  }, [field]);

  // 显示添加/编辑选项模态框
  const showModal = (option = null) => {
    setEditingOption(option);
    if (option) {
      form.setFieldsValue({
        name: option.name,
        color: option.color !== undefined ? option.color : 0
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ color: 0 });
    }
    setIsModalVisible(true);
  };

  // 处理模态框确认
  const handleModalOk = () => {
    form.validateFields().then(values => {
      const newOption = {
        name: values.name,
        color: values.color || 0
      };

      let newOptions;
      if (editingOption) {
        // 编辑现有选项
        newOptions = options.map(opt => 
          opt === editingOption ? { ...opt, ...newOption } : opt
        );
      } else {
        // 添加新选项
        newOptions = [...options, newOption];
      }

      setOptions(newOptions);
      setIsModalVisible(false);
      setEditingOption(null);
      form.resetFields();
    });
  };

  // 删除选项
  const handleDeleteOption = (optionToDelete) => {
    const newOptions = options.filter(option => option !== optionToDelete);
    setOptions(newOptions);
  };

  // 提交更新到父组件
  const handleUpdateField = () => {
    if (onUpdate) {
      // 确保字段配置完整
      const updatedField = {
        ...field,
        property: {
          ...field.property,
          options: options
        }
      };
      
      // 对于选择类型的字段，确保property中包含options
      if (field.type === '1' || field.type === '2') { // 单选或多选
        if (!updatedField.property) {
          updatedField.property = {};
        }
        updatedField.property.options = options;
      }
      
      onUpdate(updatedField);
    }
  };

  // 颜色映射
  const colorMap = ['geekblue', 'red', 'orange', 'green', 'cyan', 'blue', 'purple', 'pink'];

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <Space>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => showModal()}
          >
            添加选项
          </Button>
          <Button onClick={handleUpdateField}>
            保存更改
          </Button>
        </Space>
      </div>

      <div>
        {options.map((option, index) => (
          <div key={index} style={{
            padding: '8px 12px',
            margin: '4px 0',
            border: '1px solid #f0f0f0',
            borderRadius: '6px',
            background: '#fafafa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span
                className="color-indicator"
                style={{
                  backgroundColor: `var(--antd-color-${colorMap[option.color] || 'gray'})`,
                  width: '16px',
                  height: '16px',
                  borderRadius: '4px',
                  marginRight: '8px',
                  display: 'inline-block'
                }}
              />
              <span>{option.name}</span>
            </div>
            <Space>
              <Button 
                type="text" 
                size="small" 
                icon={<EditOutlined />} 
                onClick={() => showModal(option)}
              />
              <Popconfirm
                title="确定要删除此选项吗？"
                onConfirm={() => handleDeleteOption(option)}
                okText="确定"
                cancelText="取消"
              >
                <Button 
                  type="text" 
                  size="small" 
                  danger 
                  icon={<DeleteOutlined />} 
                />
              </Popconfirm>
            </Space>
          </div>
        ))}
      </div>

      <Modal
        title={editingOption ? "编辑选项" : "添加选项"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingOption(null);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="选项名称"
            name="name"
            rules={[{ required: true, message: '请输入选项名称' }]}
          >
            <Input placeholder="请输入选项名称" />
          </Form.Item>
          <Form.Item
            label="选项颜色"
            name="color"
          >
            <div>
              {colorMap.map((color, index) => (
                <Button
                  key={index}
                  type={form.getFieldValue('color') === index ? 'primary' : 'default'}
                  style={{
                    backgroundColor: `var(--antd-color-${color})`,
                    margin: '4px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '4px',
                    border: form.getFieldValue('color') === index ? '2px solid #1890ff' : 'none'
                  }}
                  onClick={() => form.setFieldsValue({ color: index })}
                />
              ))}
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OptionsManager;