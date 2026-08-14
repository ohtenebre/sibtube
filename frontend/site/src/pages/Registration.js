import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios'; 

import '../registration.css';
import '../reset.css';

const Registration = () => {
  const location = useLocation();
  const [activeLink, setActiveLink] = useState('/registration');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();  // Останавливаем обычное поведение формы
    const requestData = {
        email,
        lastName,
        firstName,
        password,
    };

    console.log('Data being sent:', requestData); // Выводим данные для отладки

    try {
        const response = await axios.post('http://127.0.0.1:5000/api/register', requestData);
        setResponseMessage(response.data.message);
        if (response.data.message === 'Пользователь успешно зарегистрирован!') {
            navigate('/auth');
        }
    } catch (error) {
        if (error.response) {
            setResponseMessage(error.response.data.message); // Сообщение об ошибке от сервера
        } else {
            setResponseMessage('Что-то пошло не так, попробуйте снова.');  // Общее сообщение об ошибке
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
                <p className="auth__form-title">Данные для авторизации</p>
                <p className="auth__form-txt">Электронная почта</p>
                <input
                  className="auth__input"
                  type="email"
                  placeholder="mail@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <p className="auth__form-title">Прочие данные</p>
                <p className="auth__form-txt">Фамилия</p>
                <input
                  className="auth__input"
                  type="text"
                  placeholder="Ваша фамилия"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
                <p className="auth__form-txt">Имя</p>
                <input
                  className="auth__input"
                  type="text"
                  placeholder="Ваше имя"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
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
                  Отправить
                </button>
              </div>
              {responseMessage && <p className="response-message">{responseMessage}</p>}
              <p className="auth__form-notice">* поле, обязательное для заполнения</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Registration;
