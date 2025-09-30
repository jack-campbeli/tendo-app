import './App.css'
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import AdminPage from './pages/AdminPage'
import UserFormPage from './pages/UserFormPage'
import LoginPage from './pages/LoginPage'
import ProtectedRoute from './components/common/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
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
        
        {/* Default route - displays latest form (patients only) */}
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
  )
}

export default App
