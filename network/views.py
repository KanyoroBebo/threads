from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render, get_object_or_404
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST, require_GET, require_http_methods
from django.core.paginator import Paginator
from .models import *
import json


def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

@login_required
def new_post(request):
    if request.method == "POST":
        data = json.loads(request.body)
        content = data.get("post", "")
        if not content.strip():
            return JsonResponse({"error": "Post must have content."}, status=400)
        
        user = request.user
        post = Post(author=user, content=content)
        post.save()
        return JsonResponse(post.serialize(request.user), status=201)
    return JsonResponse({"error": "POST method required"}, status=400)

@require_GET    
def get_posts(request):
    feed_type = request.GET.get('feed', 'all')
    username = request.GET.get('username')
    
    # Handle following feed - require authentication
    if feed_type == 'following':
        if not request.user.is_authenticated:
            return JsonResponse({"error": "Authentication required for following feed."}, status=401)
        following_users = User.objects.filter(followers__follower=request.user)
        posts = Post.objects.filter(author__in=following_users)
    # Handle profile feed
    elif feed_type == 'profile' and username:
        try:
            user = User.objects.get(username=username)
            posts = Post.objects.filter(author=user)
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found."}, status=404)
    # Default to all posts
    else:
        posts = Post.objects.all()

    paginator = Paginator(posts, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    return JsonResponse({
        "posts": [post.serialize(request.user) for post in page_obj], 
        "has_next": page_obj.has_next(),
        "has_previous": page_obj.has_previous(),
        "page_number": page_obj.number,
        "num_pages": page_obj.paginator.num_pages,
        "current_page": page_obj.number,
        "is_authenticated": request.user.is_authenticated,
        "feed_type": feed_type
    }, safe=False)
   
@login_required
@require_GET
def following_page(request):
    following_users = User.objects.filter(followers__follower=request.user)
    posts = Post.objects.filter(author__in=following_users)
    
    paginator = Paginator(posts, 10)
    page_number = request.GET.get('page', 1)
    page_obj = paginator.get_page(page_number)
    
    return JsonResponse({
        "posts": [post.serialize(request.user) for post in page_obj],
        "has_next": page_obj.has_next(),
        "has_previous": page_obj.has_previous(),
        "page_number": page_obj.number,
        "num_pages": page_obj.paginator.num_pages,
        "current_page": page_obj.number,
        "is_authenticated": True,
        "feed_type": "following"
    }, safe=False)

@login_required
@require_POST   # Decorator that requires the request to be a POST request
def like_post(request, post_id):
    post = Post.objects.get(id=post_id)
    user = request.user

    # Check if post is already liked
    if user in post.likes.all():
        post.likes.remove(user)
        liked = False
    else:
        post.likes.add(user)
        liked = True
    return JsonResponse({
        "likes": post.likes.count(),
        "liked": liked
        })

@require_http_methods(["PUT", "POST"])
def edit_post(request, post_id):
    # check whether the user is the author
    post = get_object_or_404(Post, id=post_id)
    if request.user != post.author:
        #return error if not author
        return JsonResponse({"error": "User must be author of post"}, status=404)
    
    data = json.loads(request.body)
    new_content = data.get("post", "")
    if not new_content.strip():
        return JsonResponse({"error": "Post must have content."}, status=400)
    
    post.content = new_content
    post.save()
    return JsonResponse(post.serialize(request.user), status=200)

@login_required
def delete_post(request, post_id):
    if request.method != "DELETE":
        return JsonResponse({"error": "DELETE method required"}, status=405)
    else:
        post = get_object_or_404(Post, id=post_id)
        if request.user != post.author:
            return JsonResponse({"error": "User must be author of post"}, status=403)
        
        post.delete()
        return JsonResponse({"message": "Post deleted successfully."}, status=200)

@login_required
@require_GET
def profile(request, username):
    user = get_object_or_404(User, username=username)
    posts = Post.objects.filter(author=user)
    is_following = False
    if request.user.is_authenticated:
        # Check if current user is following this user
        is_following = Follow.objects.filter(following=user, follower=request.user).exists()
    
    paginator = Paginator(posts, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    return JsonResponse({
        "posts": [post.serialize(request.user) for post in page_obj],
        "is_following": is_following,
        "followers_count": user.followers.count(), 
        "following_count": user.following.count(),
        "has_next": page_obj.has_next(),
        "has_previous": page_obj.has_previous(),
        "page_number": page_obj.number,
        "num_pages": page_obj.paginator.num_pages,
        "current_page": page_obj.number,
        "profile_username": user.username,
        "is_authenticated": request.user.is_authenticated
    }, safe=False)

@login_required
@require_POST
def toggle_follow(request, username):
    user_to_follow = get_object_or_404(User, username=username)
    current_user = request.user

    if user_to_follow == current_user:
        return JsonResponse({"error": "Users cannot follow themselves."}, status=400)
    
    # Check if current user is already following the target user
    follow_relation = Follow.objects.filter(following=user_to_follow, follower=current_user)
    if follow_relation.exists():
        follow_relation.delete()
        is_following = False
    else:
        Follow.objects.create(following=user_to_follow, follower=current_user)
        is_following = True
    
    return JsonResponse({
        "is_following": is_following,
        "followers_count": user_to_follow.followers.count(),  
        "following_count": user_to_follow.following.count()
    }, status=200)