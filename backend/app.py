import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from moviepy import VideoFileClip
from flask import Response
from PIL import Image
from flask import send_file
import jwt
import datetime

app = Flask(__name__)
CORS(app)

SECRET_KEY = os.environ.get("SECRET_KEY", "dev_secret_key")

basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(basedir, "instance", "your_database.db")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_POOL_SIZE'] = 10
app.config['SQLALCHEMY_POOL_TIMEOUT'] = 30
app.config['SQLALCHEMY_MAX_OVERFLOW'] = 10
app.config['SQLALCHEMY_POOL_RECYCLE'] = 1800
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

app.config['JSON_AS_ASCII'] = False

# Модель Video
class Video(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    user = db.relationship('User', backref=db.backref('videos', lazy=True))

# Модели
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    first_name = db.Column(db.String(120), nullable=False)
    last_name = db.Column(db.String(120), nullable=False)
    password = db.Column(db.String(120), nullable=False)
    access_code = db.Column(db.String(120), nullable=False)

# Модель комментариев
class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(255), nullable=False)
    video_id = db.Column(db.Integer, db.ForeignKey('video.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    user = db.relationship('User', backref=db.backref('comments', lazy=True))
    video = db.relationship('Video', backref=db.backref('comments', lazy=True))

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"message": "Пользователь не найден!"}), 400

    if not bcrypt.check_password_hash(user.password, password):
        return jsonify({"message": "Неверный пароль!"}), 400

    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }, SECRET_KEY, algorithm='HS256')

    return jsonify({
        "message": "Успешная авторизация!",
        "name": user.first_name,
        "user_id": user.id,
        "token": token
    })

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    print('Received data:', data)

    email = data.get('email')
    password = data.get('password')
    first_name = data.get('firstName')
    last_name = data.get('lastName')

    print(f"email: {email}, password: {password}, first_name: {first_name}, last_name: {last_name}")

    if not email or not password or not first_name or not last_name:
        return jsonify({"message": "Все поля обязательны!"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Пользователь с таким email уже существует!"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    new_user = User(email=email, password=hashed_password, first_name=first_name, last_name=last_name, access_code="")
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Пользователь успешно зарегистрирован!"}), 201

@app.route('/api/delete_video/<int:video_id>', methods=['DELETE'])
def delete_video(video_id):
    user_id = request.args.get('user_id')
    print(f"Получен запрос на удаление видео с ID {video_id} от пользователя {user_id}")

    if not user_id:
        return jsonify({"message": "user_id не передан!"}), 400

    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"message": "Пользователь не найден"}), 404
    
    video = db.session.get(Video, video_id)
    if not video:
        return jsonify({"message": "Видео не найдено"}), 404

    if video.user_id != user.id:
        return jsonify({"message": "Нет доступа для удаления этого видео"}), 403

    try:
        comments_to_delete = Comment.query.filter(Comment.video_id == video_id).all()
        if comments_to_delete:
            for comment in comments_to_delete:
                db.session.delete(comment)
            db.session.commit()
            print(f"Комментарии для видео {video_id} успешно удалены.")

        thumbnail_path = os.path.join(basedir, 'uploaded_videos', f'{video.id}_thumbnail.jpg')
        if os.path.exists(thumbnail_path):
            try:
                os.remove(thumbnail_path) 
                print(f"Миниатюра для видео {video_id} успешно удалена.")
            except Exception as e:
                print(f"Ошибка при удалении миниатюры: {e}")

        db.session.delete(video)
        db.session.commit()

        return jsonify({"message": "Видео успешно удалено"}), 200

    except Exception as e:
        print(f"Ошибка при удалении видео: {e}")
        db.session.rollback()
        return jsonify({"message": f"Ошибка при удалении видео: {e}"}), 500


@app.route('/api/upload_video', methods=['POST'])
def upload_video():
    print("Запрос на загрузку видео получен!")
    title = request.form.get('title')
    video_file = request.files.get('video')
    user_id = request.form.get('user_id')

    if not title or not video_file or not user_id:
        print("Ошибка: не все поля заполнены.")
        return jsonify({"message": "Все поля обязательны!"}), 400

    user = User.query.get(user_id)
    if not user:
        print(f"Пользователь с ID {user_id} не найден.")
        return jsonify({"message": "Пользователь не найден!"}), 404

    video_filename = video_file.filename
    upload_folder = os.path.join(basedir, 'uploaded_videos')
    os.makedirs(upload_folder, exist_ok=True)
    video_path = os.path.join(upload_folder, video_filename)
    video_file.save(video_path)

    new_video = Video(title=title, filename=video_filename, user_id=user_id)
    db.session.add(new_video)
    db.session.commit()

    print("Видео успешно загружено!")
    return jsonify({"message": "Видео успешно загружено!", "video_id": new_video.id})


@app.route('/api/videos', methods=['GET'])
def get_videos():
    user_id = request.args.get('user_id')

    if user_id:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"message": "Пользователь не найден"}), 404

        videos = Video.query.filter_by(user_id=user_id).all()
    else:
        videos = Video.query.all()

    videos_data = [
        {"id": video.id, "title": video.title, "filename": video.filename, "user_id": video.user_id}
        for video in videos
    ]
    return jsonify(videos_data)


@app.route('/api/video_thumbnail/<int:video_id>', methods=['GET'])
def get_video_thumbnail(video_id):
    video = Video.query.get(video_id)
    if not video:
        return jsonify({"message": "Видео не найдено"}), 404

    video_path = os.path.join(basedir, 'uploaded_videos', video.filename)
    thumbnail_path = os.path.join(basedir, 'uploaded_videos', f'{video.id}_thumbnail.jpg')

    if not os.path.exists(video_path):
        return jsonify({"message": "Видео файл не найден!"}), 404

    if os.path.exists(thumbnail_path):
        return send_file(thumbnail_path, mimetype='image/jpeg')

    try:
        clip = VideoFileClip(video_path)
        
        frame_time = 3
        frame = clip.get_frame(frame_time)
        
        frame_image = Image.fromarray(frame)
        
        frame_image.save(thumbnail_path)
        
        print(f"Миниатюра для видео {video_id} успешно создана на {frame_time} сек.")

    except Exception as e:
        print(f"Ошибка при создании миниатюры: {e}")
        return jsonify({"message": f"Ошибка при создании миниатюры: {e}"}), 500
    return send_file(thumbnail_path, mimetype='image/jpeg')


@app.route('/api/stream_video/<int:video_id>', methods=['GET'])
def stream_video(video_id):
    video = Video.query.get(video_id)
    if not video:
        return jsonify({"message": "Видео не найдено"}), 404

    video_path = os.path.join(basedir, 'uploaded_videos', video.filename)

    def generate():
        with open(video_path, 'rb') as video_file:
            while chunk := video_file.read(8192):
                yield chunk

    return Response(generate(), content_type='video/mp4')

@app.route('/api/add_comment', methods=['POST'])
def add_comment():
    data = request.json
    video_id = data.get('video_id')
    user_id = data.get('user_id')
    text = data.get('text')

    if not text or not video_id or not user_id:
        return jsonify({"message": "Все поля обязательны!"}), 400

    user = User.query.get(user_id)
    video = Video.query.get(video_id)

    if not user or not video:
        return jsonify({"message": "Пользователь или видео не найдены!"}), 404

    comment = Comment(text=text, video_id=video_id, user_id=user_id)
    db.session.add(comment)
    db.session.commit()

    return jsonify({"message": "Комментарий успешно добавлен!"}), 201

@app.route('/api/get_comments/<int:video_id>', methods=['GET'])
def get_comments(video_id):
    video = Video.query.get(video_id)
    if not video:
        return jsonify({"message": "Видео не найдено!"}), 404

    comments = Comment.query.filter_by(video_id=video_id).all()
    comments_data = [
        {
            "id": comment.id,
            "text": comment.text,
            "user": {
                "id": comment.user.id,
                "first_name": comment.user.first_name,
                "last_name": comment.user.last_name
            }
        }
        for comment in comments
    ]

    return jsonify({"comments": comments_data}), 200

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)
