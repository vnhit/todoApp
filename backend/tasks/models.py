from django.conf import settings
from django.core.validators import MaxLengthValidator, URLValidator
from django.db import models
from django.utils import timezone


class Task(models.Model):
    class Priority(models.TextChoices):
        MODERATE = "Moderate", "Moderate"
        EXTREME = "Extreme", "Extreme"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        COMPLETED = "completed", "Completed"

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="tasks")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, validators=[MaxLengthValidator(10000)])
    task_date = models.DateField(default=timezone.localdate)
    priority = models.CharField(max_length=10, choices=Priority.choices, default=Priority.MODERATE)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    image_url = models.URLField(max_length=2048, blank=True, validators=[URLValidator(schemes=["http", "https"])])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at", "-id"]
        indexes = [
            models.Index(fields=["owner", "priority"], name="task_owner_priority"),
            models.Index(fields=["owner", "created_at"], name="task_owner_created"),
        ]
        constraints = [
            models.CheckConstraint(condition=models.Q(priority__in=["Moderate", "Extreme"]), name="task_valid_priority"),
            models.CheckConstraint(condition=models.Q(status__in=["pending", "completed"]), name="task_valid_status"),
        ]

    def __str__(self):
        return self.title
