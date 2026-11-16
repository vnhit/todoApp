from django.contrib.auth.models import AbstractUser
from django.core.validators import URLValidator
from django.db import models
from django.db.models.functions import Lower

from .managers import UserManager


class User(AbstractUser):
    username = None
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=150)
    avatar_url = models.URLField(max_length=2048, blank=True, validators=[URLValidator(schemes=["http", "https"])])

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]
    objects = UserManager()

    class Meta:
        constraints = [models.UniqueConstraint(Lower("email"), name="user_email_case_insensitive")]

    def save(self, *args, **kwargs):
        self.email = self.email.strip().lower()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.email
