import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import {
  FieldBinaryOutlined
} from '@ant-design/icons';
import AuthPage from './components/AuthPage';
import FieldListPage from './components/FieldListPage';
import FieldEditPage from './components/FieldEditPage';
import FieldCreatePage from './components/FieldCreatePage';
import './styles/App.css';

const { Header, Content, Footer } = Layout;

export default function App() {
  return (
    <Layout className="layout">
      <Header className="header">
        <div className="logo">
          <FieldBinaryOutlined style={{ color: '#fff', fontSize: '24px', marginRight: '12px' }} />
          <h1 style={{ color: '#fff', display: 'inline', fontSize: '20px', fontWeight: '500' }}>
            飞书字段管理工具
          </h1>
        </div>
      </Header>

      <Content className="content">
        <Routes>
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/fields" element={<FieldListPage />} />
          <Route path="/fields/:fieldId/edit" element={<FieldEditPage />} />
          <Route path="/fields/create" element={<FieldCreatePage />} />
          <Route path="/fields/create/:type" element={<FieldEditPage />} />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </Content>

      <Footer className="footer">
        飞书字段管理工具 ©2023 Created by Developer
      </Footer>
    </Layout>
  );
}