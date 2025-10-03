import './App.css'
import React from 'react'

{/* Router - listens for URL changes */}
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import AdminPage from './pages/AdminPage'
import UserFormPage from './pages/UserFormPage'
import LoginPage from './pages/LoginPage'
import ProtectedRoute from './components/common/ProtectedRoute'
import { LanguageProvider } from './contexts/LanguageContext'

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
        {/* Default route - redirects to appropriate page based on user type */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              {/* This will never render - ProtectedRoute redirects */}
              <div />
            </ProtectedRoute>
          } 
        />

        {/* Login route - accessible to everyone */}
        <Route path="/login" element={<LoginPage />} />

        {/* Admin routes - only admins can access */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedUserType="admin">
              <AdminPage />
            </ProtectedRoute>
          } 
        />

        {/* Patient routes - only patients can access */}
        <Route 
          path="/forms/:formId" 
          element={
            <ProtectedRoute allowedUserType="patient">
              <UserFormPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Latest form route (patients only) */}
        <Route 
          path="/forms/latest" 
          element={
            <ProtectedRoute allowedUserType="patient">
              <UserFormPage />
            </ProtectedRoute>
          } 
        />

        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  )
}

export default App
