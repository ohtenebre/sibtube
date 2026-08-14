import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import play from '../img/play.png';
import del from '../img/delete.svg';
import Header from './Header';
import upload from '../img/u.svg';
import Upload from './Upload';

import '../reset.css';
import '../videos.css';

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Функция для загрузки видео
  const fetchVideos = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/videos');
      setVideos(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке видео:', error);
      setMessage('Ошибка при загрузке видео');
    }
  };

  // Загрузка видео при монтировании компонента и через интервалы
  useEffect(() => {
    fetchVideos(); // Загрузка видео при монтировании

    // Регулярно обновляем видео каждые 5 секунд
    const intervalId = setInterval(fetchVideos, 5000);

    // Очистка интервала при размонтировании компонента
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const handleUploadClick = () => {
    if (isAuthenticated) {
      setIsModalOpen(true);
    } else {
      setMessage('Сначала войдите в аккаунт.');
    }
  };

  const user_id = JSON.parse(localStorage.getItem('user'))?.user_id;

  const handleDelete = async (videoId) => {
    if (!user_id) {
      alert('Пожалуйста, войдите в аккаунт');
      return;
    }
  
    if (!window.confirm('Вы уверены, что хотите удалить это видео?')) return;
  
    try {
      const response = await axios.delete(`http://127.0.0.1:5000/api/delete_video/${videoId}`, {
        params: { user_id: user_id },
      });
      alert(response.data.message);
  
      // Обновление списка видео
      setVideos((prevVideos) => prevVideos.filter((video) => video.id !== videoId));
    } catch (error) {
      console.error('Ошибка при удалении видео:', error);
      alert('Не удалось удалить видео.');
    }
  };

  return (
    <div className="videos-page">
      <Header />
      <div className="upload__form">
        <button className="upload__logo-link" onClick={handleUploadClick}>
          <img src={upload} alt="Логотип" className="upload__logo-pic" />
          <span className="upload__text">Загрузить</span>
        </button>
      </div>
      {message && <p className="videos-message">{message}</p>}
      <div className="videos-grid">
        {videos.map((video) => (
          <div key={video.id} className="video-card">
            <img
              src={`http://127.0.0.1:5000/api/video_thumbnail/${video.id}`}
              alt={video.title}
              className="video-thumbnail"
            />
            <h2 className="video-title">{video.title}</h2>
            <div className="video-actions">
              <button
                className="delete-button"
                onClick={() => handleDelete(video.id)}
              >
                <img src={del} alt="Удалить" className="video__pick" />
              </button>
              <Link to={`/video/${video.id}`} className="video-link">
                <img src={play} alt="Смотреть" className="video__pick" />
              </Link>
            </div>
          </div>
        ))}
      </div>
      {isModalOpen && <Upload onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default Videos;
