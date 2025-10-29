// 飞书API工具函数

export const FIELD_TYPES = {
  TEXT: 1,
  NUMBER: 2,
  SINGLE_SELECT: 3,
  MULTI_SELECT: 4,
  DATETIME: 5,
  CHECKBOX: 7,
  USER: 11,
  URL: 15,
  ATTACHMENT: 17,
  SINGLE_LINK: 18,
  FORMULA: 20,
  DOUBLE_LINK: 21,
  LOCATION: 22,
  AUTO_NUMBER: 1005,
};

export const FIELD_TYPE_NAMES = {
  [FIELD_TYPES.TEXT]: '文本',
  [FIELD_TYPES.NUMBER]: '数字',
  [FIELD_TYPES.SINGLE_SELECT]: '单选',
  [FIELD_TYPES.MULTI_SELECT]: '多选',
  [FIELD_TYPES.DATETIME]: '日期时间',
  [FIELD_TYPES.CHECKBOX]: '复选框',
  [FIELD_TYPES.USER]: '人员',
  [FIELD_TYPES.URL]: '网址',
  [FIELD_TYPES.ATTACHMENT]: '附件',
  [FIELD_TYPES.SINGLE_LINK]: '单向关联',
  [FIELD_TYPES.FORMULA]: '公式',
  [FIELD_TYPES.DOUBLE_LINK]: '双向关联',
  [FIELD_TYPES.LOCATION]: '地理位置',
  [FIELD_TYPES.AUTO_NUMBER]: '自动编号',
};

export const OPTION_COLORS = [
  { name: '深灰色', value: 0 },
  { name: '红色', value: 1 },
  { name: '橙色', value: 2 },
  { name: '黄色', value: 3 },
  { name: '绿色', value: 4 },
  { name: '蓝色', value: 5 },
  { name: '紫色', value: 6 },
  { name: '粉色', value: 7 },
];

// 解析飞书表格URL
export function parseFeishuUrl(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    let appToken = pathname.split('/').at(-1);
    const viewId = urlObj.searchParams.get('view');
    const tableId = urlObj.searchParams.get('table');

    return {
      appToken,
      tableId,
      viewId,
      isWiki: pathname.includes('/wiki/'),
    };
  } catch (error) {
    throw new Error('无效的飞书表格URL');
  }
}

// 生成选项配置
export function generateOptionConfig(options) {
  return {
    options: options.map(option => ({
      id: option.id,
      name: option.name,
      color: option.color || 0,
    }))
  };
}

// 生成完整的字段配置
export function generateFieldConfig(fieldName, fieldType, options = null) {
  const config = {
    field_name: fieldName,
    type: fieldType,
  };

  // 根据字段类型添加配置
  if (fieldType === FIELD_TYPES.SINGLE_SELECT || fieldType === FIELD_TYPES.MULTI_SELECT) {
    config.ui_type = fieldType === FIELD_TYPES.SINGLE_SELECT ? 'SingleSelect' : 'MultiSelect';
    if (options) {
      config.property = generateOptionConfig(options);
    }
  } else if (fieldType === FIELD_TYPES.TEXT) {
    config.ui_type = 'Text';
  } else if (fieldType === FIELD_TYPES.NUMBER) {
    config.ui_type = 'Number';
  }

  return config;
}

// 验证字段配置
export function validateFieldConfig(config) {
  const errors = [];

  if (!config.field_name || config.field_name.trim() === '') {
    errors.push('字段名称不能为空');
  }

  if (!config.type || !Object.values(FIELD_TYPES).includes(config.type)) {
    errors.push('无效的字段类型');
  }

  if ((config.type === FIELD_TYPES.SINGLE_SELECT || config.type === FIELD_TYPES.MULTI_SELECT) &&
      config.property && config.property.options) {

    const optionNames = config.property.options.map(opt => opt.name);
    const duplicates = optionNames.filter((name, index) => optionNames.indexOf(name) !== index);

    if (duplicates.length > 0) {
      errors.push(`选项名称重复: ${duplicates.join(', ')}`);
    }

    config.property.options.forEach((option, index) => {
      if (!option.name || option.name.trim() === '') {
        errors.push(`第${index + 1}个选项名称不能为空`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// 格式化字段信息用于显示
export function formatFieldForDisplay(field) {
  return {
    ...field,
    typeName: FIELD_TYPE_NAMES[field.type] || '未知类型',
    hasOptions: field.property && field.property.options,
    optionCount: field.property?.options?.length || 0,
  };
}

// 生成随机颜色
export function getRandomColor() {
  const colors = OPTION_COLORS;
  return colors[Math.floor(Math.random() * colors.length)].value;
}

// 比较两个选项数组的差异
export function compareOptions(oldOptions, newOptions) {
  const oldMap = new Map(oldOptions.map(opt => [opt.name, opt]));
  const newMap = new Map(newOptions.map(opt => [opt.name, opt]));

  const added = newOptions.filter(opt => !oldMap.has(opt.name));
  const removed = oldOptions.filter(opt => !newMap.has(opt.name));
  const modified = newOptions.filter(opt => {
    const oldOpt = oldMap.get(opt.name);
    return oldOpt && oldOpt.color !== opt.color;
  });

  return { added, removed, modified };
}