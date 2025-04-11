import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { CoursePage } from './pages/CoursePage';
import BackToTop from './components/BackToTop';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<HomePage />} />
        <Route path="/course/:courseId" element={<CoursePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

    <BackToTop />

    </BrowserRouter>
  );
}



export default App;