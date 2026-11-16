from django.db.models import Count, Q
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Task
from .serializers import TaskFilterSerializer, TaskSerializer


@method_decorator(never_cache, name="dispatch")
class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_queryset(self):
        queryset = Task.objects.filter(owner=self.request.user)
        if self.action == "list":
            filters = TaskFilterSerializer(data=self.request.query_params)
            filters.is_valid(raise_exception=True)
            queryset = queryset.filter(**filters.validated_data)
        return queryset

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


@method_decorator(never_cache, name="dispatch")
class SummaryView(APIView):
    def get(self, request):
        summary = Task.objects.filter(owner=request.user).aggregate(
            total=Count("id"),
            pending=Count("id", filter=Q(status=Task.Status.PENDING)),
            completed=Count("id", filter=Q(status=Task.Status.COMPLETED)),
        )
        return Response(summary)
