import React, { useState } from 'react';
import axios from 'axios';

import '../upload.css';

const UploadVideoModal = ({ onClose }) => {
  const [title, setTitle] = useState('');
  const [video, setVideo] = useState(null);
  const [message, setMessage] = useState('');

  // Получаем user_id из localStorage
  const user_id = JSON.parse(localStorage.getItem('user'))?.user_id;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Проверяем, что user_id существует
    if (!user_id) {
      setMessage('Ошибка: пользователь не авторизован');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('video', video);
    formData.append('user_id', user_id); // Используем динамический ID пользователя

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/upload_video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage(response.data.message);
    } catch (error) {
      setMessage('Ошибка при загрузке видео');
      console.error(error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <h1 className="upload-title">Загрузить видео</h1>
        <form onSubmit={handleSubmit} className="upload-form">
          <input
            type="text"
            placeholder="Название видео"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="upload-input"
            required
          />
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideo(e.target.files[0])}
            className="upload-input"
            required
          />
          <button type="submit" className="upload-button">Загрузить</button>
        </form>
        {message && <p className="upload-message">{message}</p>}
      </div>
    </div>
  );
};

export default UploadVideoModal;
