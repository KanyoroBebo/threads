# Social Network – Django

A full-stack social network web application built with **Django**, **JS**, and **HTML/CSS**.  
Users can create posts, follow other users, like/unlike posts, edit or delete their own posts, and view a feed of posts from people they follow.  
Pagination is included for a smooth browsing experience.

---

## Features

- **User Authentication**
  - Register, login, and logout using Django’s built-in auth system.

- **Posting**
  - Create, edit (AJAX inline), and delete posts without page refresh.
  - Real-time updates after creating or deleting a post.

- **Likes**
  - Like/unlike posts dynamically using AJAX.
  - Heart icon toggles between filled ❤️ and outline 🤍.

- **Feeds**
  - **All Posts:** View every post on the network.
  - **Following:** View posts only from users you follow.

- **Profiles**
  - View a user’s profile with their posts, follower and following counts.
  - Follow/unfollow users with one click.
  - Users cannot follow themselves.

- **Pagination**
  - 10 posts per page.
  - Dynamic “Next” and “Previous” navigation.

---

## Tech Stack

- **Backend:** Django 5.1.1 (Python 3.10+)
- **Configuration:** python-decouple 3.8 (environment variable management)
- **Frontend:** Vanilla JavaScript (Fetch API), HTML5, CSS3
- **Database:** SQLite (default, easy to switch to PostgreSQL/MySQL)

---

## Installation & Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/social-network-django.git
   cd social-network-django
   ```

2. **Create a virtual environment**

   ```bash
   python3 -m venv venv
   source venv/bin/activate    # macOS/Linux
   venv\Scripts\activate       # Windows
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Create environment file**

   Create a `.env` file in the project root and add the required variables:
   ```bash
   SECRET_KEY=your-very-long-secret-key-here
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1
   ```

5. **Apply migrations**

   ```bash
   python manage.py migrate
   ```

6. **Create a superuser (optional)**

   ```bash
   python manage.py createsuperuser
   ```

7. **Run the development server**

   ```bash
   python manage.py runserver
   ```

8. Visit **[http://127.0.0.1:8000/](http://127.0.0.1:8000/)** in your browser.

---

## Environment Variables

This project uses **python-decouple** for environment variable management.  
You **must** create a `.env` file in the project root directory with the following variables:

**Required Variables:**
* `SECRET_KEY` – Django secret key (generate your own using Django's get_random_secret_key())
* `DEBUG` – Set to `True` for development, `False` for production
* `ALLOWED_HOSTS` – Comma-separated list of allowed hostnames (e.g., `localhost,127.0.0.1` for development)

**Optional Variables:**
* `DATABASE_URL` – Connection string if using PostgreSQL/MySQL instead of SQLite
* `EMAIL_HOST_USER` – Email account for sending notifications (if email functionality is added)
* `EMAIL_HOST_PASSWORD` – Password or app key for the email account (if email functionality is added)

**Example .env file:**
```
SECRET_KEY=your-very-long-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

> **Note:** (Never commit the actual values of these variables to source control.tch API)
---

## File Structure

```
project4/                # Django project root
│
├─ .env                 # Environment variables (create this file)
├─ .gitignore          # Git ignore file
├─ db.sqlite3          # SQLite database (generated after migration)
├─ manage.py           # Django management script
├─ requirements.txt    # Python dependencies
├─ README.md          # This file
│
├─ project4/          # Django project settings
│  ├─ __init__.py
│  ├─ settings.py     # Django settings
│  ├─ urls.py         # Root URL configuration
│  ├─ wsgi.py         # WSGI application
│  └─ asgi.py         # ASGI application
│
└─ network/           # Main Django app
   ├─ __init__.py
   ├─ admin.py        # Django admin configuration
   ├─ apps.py         # App configuration
   ├─ models.py       # Database models (User, Post, Follow)
   ├─ views.py        # View functions
   ├─ urls.py         # App URL patterns
   ├─ tests.py        # Unit tests
   ├─ migrations/     # Database migrations
   ├─ static/
   │  └─ network/
   │     ├─ posts.js  # Frontend JavaScript
   │     └─ styles.css # CSS styles
   └─ templates/
      └─ network/
         ├─ index.html
         ├─ layout.html
         ├─ login.html
         └─ register.html
```

---

## Credits

* Inspired by the **CS50 Web Programming with Python and JavaScript** course.
* Built and customized by **[Kevin Kanyoro]**.

