
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API Routes
    path("new_post", views.new_post, name="new_post"),
    path("posts", views.get_posts, name="get_posts"),
    path("following", views.following_page, name="following"),
    path("like/<int:post_id>", views.like_post, name="like_post"),
    path("edit/<int:post_id>", views.edit_post, name="edit_post"),
    path("delete/<int:post_id>", views.delete_post, name="delete_post"),
    path("profile/<str:username>", views.profile, name="profile"),
    path("follow/<str:username>", views.toggle_follow, name="follow"),
]
