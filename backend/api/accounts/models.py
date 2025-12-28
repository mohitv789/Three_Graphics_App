from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.conf import settings
from core.models import TimeStampedModel
class UserManager(BaseUserManager):

    def create_user(self, email, password=None, **extra_fields):
        """Creates and saves a new user"""
        if not email:
            raise ValueError('Users must have an email address')
        user = self.model(email=self.normalize_email(email), **extra_fields)
        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self, email, first_name, last_name, password):
        """Creates and saves a new super user"""
        user = self.create_user(email, first_name, last_name,password)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)

        return user
    
class UserToken(models.Model):
    user_id = models.IntegerField()
    token = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    expired_at = models.DateTimeField()


class Reset(models.Model):
    email = models.CharField(max_length=255)
    token = models.CharField(max_length=255, unique=True)

class User(AbstractUser):
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    email = models.CharField(max_length=255, unique=True)
    username = models.CharField(max_length=255,default=email)
    password = models.CharField(max_length=255)
    tfa_secret = models.CharField(max_length=255, default='')
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ["username","first_name","last_name"]

    def __str__(self):
        return self.first_name + " " + self.last_name

class UserProfile(TimeStampedModel):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="user_profile")
    avatar = models.URLField(max_length=500)
    status = models.TextField()
    bio = models.TextField()
    gender = models.CharField(max_length=255)
    city = models.CharField(max_length=255)
    url = models.TextField()
    def __str__(self):
        return self.user.first_name + " " + self.user.last_name 