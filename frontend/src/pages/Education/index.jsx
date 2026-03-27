import React from 'react';
import { Routes, Route } from 'react-router-dom';
import EducationHome from './EducationHome';
import ArticlePage from './ArticlePage';

export default function EducationSection() {
  return (
    <Routes>
      <Route path="/" element={<EducationHome />} />
      <Route path="/:id" element={<ArticlePage />} />
    </Routes>
  );
}
