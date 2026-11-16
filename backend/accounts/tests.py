from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

User = get_user_model()
PASSWORD = "Violet-Cloud!8912"


class AccountTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient(enforce_csrf_checks=True)

    def csrf(self, client=None):
        client = client or self.client
        token = client.get("/api/v1/auth/csrf/").json()["csrfToken"]
        client.credentials(HTTP_X_CSRFTOKEN=token)
        return token

    def register(self, **overrides):
        self.csrf()
        return self.client.post("/api/v1/auth/register/", {
            "email": "User@Example.com", "name": "Test User", "password": PASSWORD, **overrides,
        }, format="json")

    def login(self, client=None, password=PASSWORD):
        client = client or self.client
        self.csrf(client)
        response = client.post("/api/v1/auth/login/", {
            "email": "USER@EXAMPLE.COM", "password": password,
        }, format="json")
        self.csrf(client)
        return response

    def test_anonymous_access_and_csrf_on_public_auth(self):
        for endpoint in ["/auth/me/", "/tasks/", "/dashboard/summary/"]:
            response = self.client.get("/api/v1" + endpoint)
            self.assertEqual(response.status_code, 403)
            self.assertEqual(response.json()["code"], "auth_required")
        for action in ["register", "login"]:
            response = self.client.post(f"/api/v1/auth/{action}/", {}, format="json")
            self.assertEqual(response.status_code, 403)
            self.assertEqual(response.json()["code"], "csrf_failed")

    def test_register_hashes_password_and_rejects_duplicate_email(self):
        response = self.register()
        self.assertEqual(response.status_code, 201, response.content)
        self.assertEqual(set(response.json()), {"id", "email", "name", "avatar"})
        user = User.objects.get()
        self.assertEqual(user.email, "user@example.com")
        self.assertNotEqual(user.password, PASSWORD)
        self.assertTrue(user.check_password(PASSWORD))
        response = self.register(email="USER@example.COM")
        self.assertEqual(response.status_code, 400)
        self.assertIn("email", response.json()["fields"])

    def test_password_and_profile_validation(self):
        self.assertEqual(self.register(password="123").status_code, 400)
        self.assertEqual(self.register(name="   ").status_code, 400)
        self.register()
        self.login()
        response = self.client.patch("/api/v1/auth/me/", {"name": "New Name", "avatar": "https://example.com/me.png"}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["name"], "New Name")
        response = self.client.patch("/api/v1/auth/me/", {"avatar": "javascript:alert(1)"}, format="json")
        self.assertEqual(response.status_code, 400)
        self.client.patch("/api/v1/auth/me/", {"email": "other@example.com", "is_staff": True}, format="json")
        self.assertFalse(User.objects.get().is_staff)
        self.assertEqual(User.objects.get().email, "user@example.com")

    def test_login_rotation_csrf_and_logout_revoke_old_session(self):
        self.register()
        old_token = self.csrf()
        response = self.client.post("/api/v1/auth/login/", {"email": "user@example.com", "password": PASSWORD}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.client.get("/api/v1/auth/me/").status_code, 200)
        self.client.credentials(HTTP_X_CSRFTOKEN=old_token)
        response = self.client.post("/api/v1/tasks/", {"title": "Blocked"}, format="json")
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json()["code"], "csrf_failed")
        self.csrf()
        stale_session = self.client.cookies["sessionid"].value
        self.assertEqual(self.client.post("/api/v1/auth/logout/").status_code, 204)
        other = APIClient()
        other.cookies["sessionid"] = stale_session
        self.assertEqual(other.get("/api/v1/auth/me/").status_code, 403)

    def test_change_password_keeps_current_session_and_revokes_other_session(self):
        self.register()
        self.login()
        other = APIClient(enforce_csrf_checks=True)
        self.login(other)
        endpoint = "/api/v1/auth/change-password/"
        response = self.client.post(endpoint, {"current_password": "wrong", "new_password": "Another-Secret!8912"}, format="json")
        self.assertEqual(response.status_code, 400)
        response = self.client.post(endpoint, {"current_password": PASSWORD, "new_password": "Another-Secret!8912"}, format="json")
        self.assertEqual(response.status_code, 204)
        self.assertEqual(self.client.get("/api/v1/auth/me/").status_code, 200)
        self.assertEqual(other.get("/api/v1/auth/me/").status_code, 403)
        self.assertEqual(self.login(password=PASSWORD).status_code, 400)
        self.assertEqual(self.login(password="Another-Secret!8912").status_code, 200)

    def test_auth_rate_limits(self):
        self.csrf()
        for _ in range(10):
            self.client.post("/api/v1/auth/login/", {}, format="json")
        response = self.client.post("/api/v1/auth/login/", {}, format="json")
        self.assertEqual(response.status_code, 429)
        self.assertEqual(response.json()["code"], "throttled")

    @override_settings(DEBUG=True)
    def test_local_registration_allows_retrying_invalid_form(self):
        self.csrf()
        for _ in range(6):
            response = self.client.post("/api/v1/auth/register/", {}, format="json")
            self.assertEqual(response.status_code, 400)
        self.assertEqual(self.register().status_code, 201)

    @override_settings(DEBUG=True)
    def test_local_registration_still_limits_bursts(self):
        self.csrf()
        for _ in range(60):
            response = self.client.post("/api/v1/auth/register/", {}, format="json")
            self.assertEqual(response.status_code, 400)
        response = self.client.post("/api/v1/auth/register/", {}, format="json")
        self.assertEqual(response.status_code, 429)
        self.assertLessEqual(int(response["Retry-After"]), 60)

    @override_settings(DEBUG=False)
    def test_production_registration_keeps_hourly_limit_and_clear_message(self):
        self.csrf()
        for _ in range(5):
            response = self.client.post("/api/v1/auth/register/", {}, format="json")
            self.assertEqual(response.status_code, 400)
        response = self.client.post("/api/v1/auth/register/", {}, format="json")
        self.assertEqual(response.status_code, 429)
        self.assertEqual(response.json()["code"], "throttled")
        self.assertIn("Vui lòng thử lại sau", response.json()["message"])
        self.assertIn("phút", response.json()["message"])
        self.assertGreater(int(response["Retry-After"]), 3500)

    def test_admin_can_create_email_based_user(self):
        admin = User.objects.create_superuser("admin@example.com", PASSWORD, name="Admin")
        client = APIClient()
        client.force_login(admin)
        self.assertEqual(client.get("/admin/accounts/user/add/").status_code, 200)
        response = client.post("/admin/accounts/user/add/", {
            "email": "created@example.com", "name": "Created in admin",
            "password1": PASSWORD, "password2": PASSWORD, "usable_password": "true",
        })
        self.assertEqual(response.status_code, 302)
        self.assertTrue(User.objects.get(email="created@example.com").check_password(PASSWORD))
