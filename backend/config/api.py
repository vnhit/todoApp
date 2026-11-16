from math import ceil

from django.http import JsonResponse
from rest_framework import exceptions
from rest_framework.authentication import SessionAuthentication as DRFSessionAuthentication
from rest_framework.pagination import PageNumberPagination


class SessionAuthentication(DRFSessionAuthentication):
    def enforce_csrf(self, request):
        try:
            super().enforce_csrf(request)
        except exceptions.PermissionDenied:
            raise exceptions.PermissionDenied("Phiên bảo mật không hợp lệ. Vui lòng thử lại.", code="csrf_failed")


class TaskPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


def exception_handler(exc, context):
    from rest_framework.views import exception_handler as drf_exception_handler

    response = drf_exception_handler(exc, context)
    if response is None:
        return None
    fields = {}
    if isinstance(exc, exceptions.ValidationError):
        code = "invalid_request"
        message = "Vui lòng kiểm tra thông tin đã nhập."
        fields = response.data if isinstance(response.data, dict) else {"non_field_errors": response.data}
    else:
        code = getattr(exc, "default_code", "request_failed")
        detail = response.data.get("detail", "Yêu cầu không thành công.")
        code = getattr(detail, "code", code)
        message = str(detail)
    if isinstance(exc, exceptions.NotAuthenticated):
        code, message = "auth_required", "Vui lòng đăng nhập."
    if isinstance(exc, exceptions.Throttled):
        code = "throttled"
        message = "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau."
        if exc.wait is not None:
            wait = f"{ceil(exc.wait / 60)} phút" if exc.wait >= 60 else f"{ceil(exc.wait)} giây"
            message = f"Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau {wait}."
    response.data = {"code": code, "message": message, "fields": fields}
    response["Cache-Control"] = "no-store"
    return response


def csrf_failure(request, reason=""):
    return JsonResponse({
        "code": "csrf_failed",
        "message": "Phiên bảo mật không hợp lệ. Vui lòng thử lại.",
        "fields": {},
    }, status=403)
