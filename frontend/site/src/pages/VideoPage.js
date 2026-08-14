import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';

import '../reset.css';
import '../video.css';

const VideoPage = () => {
  const { videoId } = useParams();
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const url = `http://127.0.0.1:5000/api/stream_video/${videoId}`;
        setVideoUrl(url);
  
        const videoResponse = await axios.get(`http://127.0.0.1:5000/api/videos/${videoId}`);
        setVideoTitle(videoResponse.data.title);
      } catch (error) {
        console.error('Ошибка при загрузке видео:', error);
      }
    };
  
    fetchVideo();
  
    const fetchComments = async () => {
      try {
        const commentsResponse = await axios.get(`http://127.0.0.1:5000/api/get_comments/${videoId}`);
        setComments(commentsResponse.data.comments);
      } catch (error) {
        console.error('Ошибка при загрузке комментариев:', error);
      }
    };
  
    const intervalId = setInterval(fetchComments, 100);

    return () => {
      clearInterval(intervalId);
    };
  }, [videoId]);
  
  
  const handleCommentSubmit = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.user_id;
  
    if (!userId) {
      console.error("Пользователь не авторизован");
      return;
    }
  
    try {
      await axios.post('http://127.0.0.1:5000/api/add_comment', { video_id: videoId, user_id: userId, text: commentText });
  
      const newComment = {
        id: Date.now(),
        text: commentText,
        user: {
          first_name: user.first_name,
          last_name: user.last_name,
        },
      };
  
      setComments((prevComments) => [newComment, ...prevComments]);
  
      setCommentText('');
  
      const response = await axios.get(`http://127.0.0.1:5000/api/get_comments/${videoId}`);
      setComments(response.data.comments);
  
    } catch (error) {
      console.error('Ошибка при добавлении комментария:', error);
    }
  };
  
  

  return (
    <div className="video-page">
      <Header />
      <div className="video__n__chat">
        <div className="video-container">
          {videoUrl ? (
            <video controls className="video-player">
              <source src={videoUrl} type="video/mp4" />
              Ваш браузер не поддерживает видео.
            </video>
          ) : (
            <p>Загрузка...</p>
          )}
        </div>

        <div className="chat-container">
          <nav className="chat-tabs">
            <button className="active-tab">Чат</button>
          </nav>

          <div className="chat-messages">
            {comments.map((comment) => (
              <div key={comment.id} className="message">
                <strong className="message-author">{comment.user.first_name} {comment.user.last_name}</strong>
                <p className="message-text">{comment.text}</p>
              </div>
            ))}
          </div>

          <div className="chat-input">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Текст"
            />
            <button className="send-btn" onClick={handleCommentSubmit}>Отправить</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPage;
