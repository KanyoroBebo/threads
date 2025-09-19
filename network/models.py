from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    id = models.BigAutoField(primary_key=True)

    def __str__(self):
        return super().__str__()

class Post(models.Model):
    class Meta:
        ordering = ['-created_at']

    id = models.BigAutoField(primary_key=True)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    edited_at = models.DateTimeField(auto_now=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    likes = models.ManyToManyField(User, related_name='likes', blank=True)

    def serialize(self, user):
        return {
            "id": self.id,
            "content": self.content,
            "created_at": self.created_at.isoformat(),
            "edited_at": self.edited_at,
            "author": self.author.username,
            "likes": self.likes.count(),
            "liked": user in self.likes.all(),
            "is_author": user.is_authenticated and self.author == user
        }
    
class Follow(models.Model):
    class Meta:
        unique_together = ('following', 'follower')
        
    id = models.BigAutoField(primary_key=True)
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers')
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following')
    
    def serialize(self):
        return {
            "id": self.id,
            "following": self.following.username,
            "follower": self.follower.username
        }