import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../img/logo.svg';
import exit from '../img/exit.svg';
import account from '../img/prof.svg';

import '../registration.css';
import '../reset.css';

const Header = () => {
  // Состояние для отслеживания авторизации пользователя
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  // Используем useEffect для получения информации о пользователе из localStorage
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user); // Парсим строку из JSON в объект
      setIsLoggedIn(true);
      setUserName(parsedUser.name); // Устанавливаем имя пользователя
    }
  }, []);

  const handleLogout = () => {
    // Очистить состояние авторизации и удалить пользователя из localStorage
    setIsLoggedIn(false);
    setUserName('');
    localStorage.removeItem('user');
  };

  return (
    <header className="header">
      <div className="wrapper">
        <div className="header__wrapper">
          <div className="header__logo">
            <Link to="/" className="header__logo-link">
              <img src={logo} alt="Логотип" className="header__logo-pic" />
            </Link>
          </div>
          <div className="header__user-info">
            {isLoggedIn ? (
              <>
                <span className="header__username">{userName}</span>
                <button className="header__exit-button" onClick={handleLogout}>
                  <img src={exit} alt="Выход" className="header__pic" />
                </button>
              </>
            ) : (
              <Link to="/auth" className="header__username">Войдите в аккаунт</Link>
            )}
            <div className="header__icons">
              <Link to="/profile" className="header__icon">
                <img src={account} alt="Профиль" className="header__pic" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
