import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import play from '../img/play.png';
import del from '../img/delete.svg';
import Header from './Header';

import '../reset.css';
import '../profile.css';

const Profile = () => {
  const [videos, setVideos] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));  // Получаем весь объект user из localStorage
    const userId = user?.user_id;  // Извлекаем user_id
  
    if (!userId) {
      setMessage('Не удалось получить ID пользователя.');
      return;  // Если userId не найден, показываем сообщение и прекращаем выполнение
    }
  
    const fetchUserVideos = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/api/videos?user_id=${userId}`);
        
        if (response.data.message) {
          setMessage(response.data.message);  // Показываем ошибку, если она есть
        } else {
          setVideos(response.data);
        }
      } catch (error) {
        console.error('Ошибка при загрузке видео:', error);
        setMessage('Ошибка при загрузке видео');
      }
    };
  
    fetchUserVideos();
  }, []);
  

  const handleDelete = async (videoId) => {
    const userId = localStorage.getItem('user_id');
    if (!window.confirm('Вы уверены, что хотите удалить это видео?')) return;

    try {
      const response = await axios.delete(`http://127.0.0.1:5000/api/delete_video/${videoId}?user_id=${userId}`);
      alert(response.data.message);
      setVideos((prevVideos) => prevVideos.filter((video) => video.id !== videoId));
    } catch (error) {
      console.error('Ошибка при удалении видео:', error);
      alert('Не удалось удалить видео.');
    }
  };

  return (
    <div className="profile-page">
        <Header />
      <h1 className="profile-title">Профиль</h1>
      {message && <p className="profile-message">{message}</p>}
      <div className="videos-grid">
        {videos.length > 0 ? (
          videos.map((video) => (
            <div key={video.id} className="video-card">
              <img
                src={`http://127.0.0.1:5000/api/video_thumbnail/${video.id}`}
                alt={video.title}
                className="video-thumbnail"
              />
              <h2 className="video-title">{video.title}</h2>
              <div className="video-actions">
                <button className="delete-button" onClick={() => handleDelete(video.id)}>
                  <img src={del} alt="Удалить" className="video__pick" />
                </button>
                <Link to={`/video/${video.id}`} className="video-link">
                  <img src={play} alt="Просмотреть" className="video__pick" />
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p>У вас нет загруженных видео.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
