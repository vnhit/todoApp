from django.core.validators import URLValidator
from rest_framework import serializers

from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    date = serializers.DateField(source="task_date", required=False)
    image = serializers.CharField(source="image_url", required=False, allow_blank=True, max_length=2048,
                                  validators=[URLValidator(schemes=["http", "https"])])

    class Meta:
        model = Task
        fields = ["id", "title", "description", "date", "priority", "status", "image", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class TaskFilterSerializer(serializers.Serializer):
    priority = serializers.ChoiceField(choices=Task.Priority.choices, required=False)
    status = serializers.ChoiceField(choices=Task.Status.choices, required=False)
