from django.contrib import admin
from django.urls import include, path
from django.views.generic import TemplateView

from tasks.views import SummaryView

urlpatterns = [
    path("", TemplateView.as_view(template_name="index.html"), name="frontend"),
    path("admin/", admin.site.urls),
    path("api/v1/auth/", include("accounts.urls")),
    path("api/v1/tasks/", include("tasks.urls")),
    path("api/v1/dashboard/summary/", SummaryView.as_view()),
]
