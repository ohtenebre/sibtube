import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Registration from './pages/Registration';
import Access from './pages/Access';
import Auth from './pages/Auth';
import Upload from './pages/Upload';
import Profile from './pages/Profile';
import Listvideos from './pages/Listvideos';  // Компонент для списка видео
import VideoPage from './pages/VideoPage';  // Компонент для страницы конкретного видео

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Listvideos />} /> {/* Главная страница с видео */}
        <Route path="/registration" element={<Registration />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/video/:videoId" element={<VideoPage />} /> {/* Страница просмотра видео */}
        <Route path="/upload" element={<Upload />} />
        <Route path="/videos" element={<Listvideos />} />
        <Route path="/access" element={<Access />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
};

export default App;
