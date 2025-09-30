import './App.css'
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import AdminPage from './pages/AdminPage'
import UserFormPage from './pages/UserFormPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin routes */}
        <Route path="/admin" element={<AdminPage />} />

        {/* User routes */}
        <Route path="/form/:formId" element={<UserFormPage />} />
        
        {/* Default route - displays latest form */}
        <Route path="/" element={<UserFormPage />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
