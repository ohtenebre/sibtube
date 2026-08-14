import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

import '../registration.css';
import '../reset.css';

const Auth = () => {
  const location = useLocation();
  const [activeLink, setActiveLink] = useState('/auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/login', {
        email,
        password,
      });
  
      const { name, token, user_id } = response.data;
      
      if (!name) {
        setResponseMessage('Ошибка: сервер не вернул имя пользователя.');
        return;
      }
  
      setResponseMessage('Успешная авторизация!');
      const user = { name, token, user_id }; // Убедитесь, что сохраняете user_id
      localStorage.setItem('user', JSON.stringify(user));  // Сохраняем весь объект user
      navigate('/');
    } catch (error) {
      if (error.response) {
        setResponseMessage(error.response.data.message);
      } else {
        setResponseMessage('Что-то пошло не так, попробуйте снова.');
      }
    }
  };
  

  

  return (
    <div>
      <Header />
      <main className="main">
        <section className="intro">
          <div className="auth">
            <div className="auth__menu">
              <ul className="auth__menu-items" ref={menuRef}>
                <li>
                  <Link
                    to="/registration"
                    className={activeLink === '/registration' ? 'active' : ''}
                    onClick={() => setActiveLink('/registration')}
                  >
                    Регистрация
                  </Link>
                </li>
                <li>
                  <Link
                    to="/auth"
                    className={activeLink === '/auth' ? 'active' : ''}
                    onClick={() => setActiveLink('/auth')}
                  >
                    Войти
                  </Link>
                </li>
              </ul>
            </div>
            <div className="auth__form">
              <div className="auth__form-items">
                <p className="auth__form-title">Данные для входа</p>
                <p className="auth__form-txt">Электронная почта</p>
                <input
                  className="auth__input"
                  type="email"
                  placeholder="mail@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <p className="auth__form-txt">Пароль</p>
                <input
                  className="auth__input"
                  type="password"
                  placeholder="Ваш пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button className="auth__button" type="submit" onClick={handleSubmit}>
                  Войти
                </button>
              </div>
              {responseMessage && <p className="response-message">{responseMessage}</p>}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Auth;
