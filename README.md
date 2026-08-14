# SibTube

A small YouTube-style video sharing platform built with **React** (frontend) and **Flask** (backend). Users can register, log in, upload videos, browse the feed, watch videos with auto-generated thumbnails, and leave comments.

## Features

- **Authentication** — JWT-based registration and login, passwords hashed with bcrypt
- **Video upload** — upload MP4 files with a title
- **Auto thumbnails** — thumbnails are generated from a video frame using MoviePy and PIL
- **Video streaming** — chunked playback via a streaming API endpoint
- **Comments** — add and view comments on any video
- **Profile page** — manage your uploads and delete your own videos
- **Access codes** — restricted-area support via access code entry

## Tech Stack

| Layer     | Technology                                                                                     |
|-----------|------------------------------------------------------------------------------------------------|
| Frontend  | React 19, React Router 7, Axios (Create React App)                                             |
| Backend   | Python 3, Flask, Flask-SQLAlchemy, Flask-Bcrypt, PyJWT                                         |
| Database  | SQLite                                                                                         |
| Media     | MoviePy, Pillow (thumbnail extraction)                                                         |

## Project Structure

```
.
├── backend/                  # Flask API
│   ├── app.py                # Application entry point, models & API routes
│   ├── requirements.txt      # Python dependencies
│   └── uploaded_videos/      # Uploaded videos + generated thumbnails (gitignored)
└── frontend/
    └── site/                 # React application
        ├── package.json
        └── src/
            ├── App.js        # Routes
            └── pages/        # Auth, Upload, VideoPage, Profile, etc.
```

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm

### 1. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # on Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

The API starts at `http://127.0.0.1:5000`. The SQLite database and `uploaded_videos/` folder are created automatically on first run.

> Set the `SECRET_KEY` environment variable in production instead of using the default dev key.

### 2. Frontend

In a second terminal:

```bash
cd frontend/site
npm install
npm start
```

The app opens at `http://localhost:3000` and proxies API calls to the backend on port `5000`.

### Running both at once

```bash
cd frontend/site
npm start   # runs backend and frontend concurrently (requires `pip install` to be done first)
```

## API Overview

| Method | Endpoint                            | Description                              |
|--------|-------------------------------------|------------------------------------------|
| POST   | `/api/register`                     | Register a new user                      |
| POST   | `/api/login`                        | Log in, returns a JWT token              |
| GET    | `/api/videos`                       | List all videos (optionally `?user_id=`) |
| POST   | `/api/upload_video`                 | Upload a video (`title`, `video`, `user_id`) |
| GET    | `/api/stream_video/<id>`            | Stream a video file                      |
| GET    | `/api/video_thumbnail/<id>`         | Get (or generate) a video thumbnail      |
| DELETE | `/api/delete_video/<id>?user_id=`   | Delete a video the user owns             |
| POST   | `/api/add_comment`                  | Add a comment to a video                 |
| GET    | `/api/get_comments/<id>`            | Get comments for a video                 |

## License

This project is for educational purposes and is not affiliated with YouTube or Google.
