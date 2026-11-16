from django.contrib import admin

from .models import Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ["title", "owner", "priority", "status", "task_date"]
    list_filter = ["priority", "status"]
    search_fields = ["title", "owner__email"]
    readonly_fields = ["created_at", "updated_at"]
