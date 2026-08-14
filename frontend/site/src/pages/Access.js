import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios'; 

import '../registration.css';
import '../reset.css';

const Access = () => {
  const location = useLocation();
  const [activeLink, setActiveLink] = useState('/access');
  const [email, setEmail] = useState('');
  const [accessCode, setAccessCode] = useState('');
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
        accessCode,
      });

      setResponseMessage(response.data.message);
      if (response.data.message === 'Успешная авторизация!') {
        navigate('/home');
      }
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
                    регистрация
                  </Link>
                </li>
                <li>
                  <Link
                    to="/access"
                    className={activeLink === '/access' ? 'active' : ''}
                    onClick={() => setActiveLink('/access')}
                  >
                    код доступа
                  </Link>
                </li>
              </ul>
            </div>
            <div className="auth__form">
              <div className="auth__form-items">
                <p className="auth__form-txt">
                  Укажите электронную почту для восстановления кода
                </p>
                <input
                  className="auth__input"
                  type="email"
                  placeholder="mail@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input
                  className="auth__input"
                  type="text"
                  placeholder="Введите код доступа"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  required
                />
                <button className="auth__button" type="submit" onClick={handleSubmit}>
                  Отправить
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

export default Access;
