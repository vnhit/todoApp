from datetime import datetime, timezone as dt_timezone
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Task

User = get_user_model()


class TaskTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.owner = User.objects.create_user("owner@example.com", "Secret-12345!", name="Owner")
        cls.other = User.objects.create_user("other@example.com", "Secret-12345!", name="Other")

    def setUp(self):
        self.client = APIClient()
        self.client.force_authenticate(self.owner)

    def test_crud_and_server_owned_fields(self):
        response = self.client.post("/api/v1/tasks/", {"title": "  First task  ", "owner": self.other.id, "id": 999}, format="json")
        self.assertEqual(response.status_code, 201, response.content)
        task = Task.objects.get()
        self.assertEqual(task.owner, self.owner)
        self.assertEqual(task.title, "First task")
        self.assertEqual(task.status, "pending")
        self.assertEqual(task.priority, "Moderate")
        endpoint = f"/api/v1/tasks/{task.id}/"
        self.assertEqual(self.client.get(endpoint).json()["title"], "First task")
        response = self.client.patch(endpoint, {"status": "completed", "priority": "Extreme", "date": "2026-11-15"}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["date"], "2026-11-15")
        self.assertEqual(self.client.get("/api/v1/dashboard/summary/").json(), {"total": 1, "pending": 0, "completed": 1})
        self.assertEqual(self.client.delete(endpoint).status_code, 204)
        self.assertFalse(Task.objects.exists())

    def test_cross_account_access_is_denied_everywhere(self):
        private_task = Task.objects.create(owner=self.other, title="Private", priority="Extreme")
        endpoint = f"/api/v1/tasks/{private_task.id}/"
        self.assertEqual(self.client.get(endpoint).status_code, 404)
        self.assertEqual(self.client.patch(endpoint, {"status": "completed"}, format="json").status_code, 404)
        self.assertEqual(self.client.delete(endpoint).status_code, 404)
        self.assertEqual(self.client.get("/api/v1/tasks/").json()["count"], 0)
        self.assertEqual(self.client.get("/api/v1/tasks/?priority=Extreme").json()["count"], 0)
        self.assertEqual(self.client.get("/api/v1/dashboard/summary/").json(), {"total": 0, "pending": 0, "completed": 0})

    def test_pagination_filters_and_summary_use_entire_dataset(self):
        Task.objects.bulk_create([Task(owner=self.owner, title=f"Task {i}", priority="Extreme" if i < 5 else "Moderate",
                                       status="completed" if i < 3 else "pending") for i in range(25)])
        first = self.client.get("/api/v1/tasks/").json()
        second = self.client.get("/api/v1/tasks/?page=2").json()
        self.assertEqual(first["count"], 25)
        self.assertEqual(len(first["results"]), 20)
        self.assertEqual(len(second["results"]), 5)
        self.assertFalse({t["id"] for t in first["results"]} & {t["id"] for t in second["results"]})
        self.assertEqual(self.client.get("/api/v1/tasks/?priority=Extreme&status=pending").json()["count"], 2)
        self.assertEqual(self.client.get("/api/v1/dashboard/summary/").json(), {"total": 25, "pending": 22, "completed": 3})
        self.assertEqual(self.client.get("/api/v1/tasks/?status=unknown").status_code, 400)
        self.assertEqual(self.client.get("/api/v1/tasks/?priority=unknown").status_code, 400)

    def test_validation(self):
        for data in [{"title": " "}, {"title": "x" * 201}, {"date": "2026-99-99"}, {"date": ""},
                     {"priority": "urgent"}, {"status": "done"}, {"image": "javascript:alert(1)"},
                     {"image": "ftp://example.com/image.png"}, {"description": "x" * 10001}]:
            with self.subTest(data=list(data)):
                response = self.client.post("/api/v1/tasks/", {"title": "Task", **data}, format="json")
                self.assertEqual(response.status_code, 400, response.content)
                self.assertEqual(response.json()["code"], "invalid_request")

    def test_default_date_uses_vietnam_timezone(self):
        with patch("django.utils.timezone.now", return_value=datetime(2026, 11, 14, 18, 0, tzinfo=dt_timezone.utc)):
            response = self.client.post("/api/v1/tasks/", {"title": "After midnight"}, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["date"], "2026-11-15")

    def test_database_constraints(self):
        with self.assertRaises(IntegrityError), transaction.atomic():
            Task.objects.create(owner=self.owner, title="Invalid", status="unknown")
        with self.assertRaises(IntegrityError), transaction.atomic():
            Task.objects.create(owner=self.owner, title="Invalid", priority="unknown")
        with self.assertRaises(IntegrityError), transaction.atomic():
            User.objects.bulk_create([User(email="OWNER@example.com", name="Duplicate")])

    def test_frontend_is_served_from_separate_directory(self):
        response = self.client.get("/")
        self.assertContains(response, '/static/src/app.js')
        self.assertContains(response, '/static/dist/output.css')
