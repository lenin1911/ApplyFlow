import json
import socket
import sys
import threading
import time
import unittest
import urllib.error
import urllib.parse
import urllib.request
import uuid

import uvicorn
from app.main import app


def get_free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


class BackendIntegrationTestCase(unittest.TestCase):
    server_thread = None
    server = None
    base_url = None
    port = None

    @classmethod
    def setUpClass(cls):
        cls.port = get_free_port()
        cls.base_url = f"http://127.0.0.1:{cls.port}"
        config = uvicorn.Config(
            app=app,
            host="127.0.0.1",
            port=cls.port,
            log_level="error",
        )
        cls.server = uvicorn.Server(config)
        cls.server_thread = threading.Thread(target=cls.server.run, daemon=True)
        cls.server_thread.start()

        # Wait for server to become responsive
        max_wait = 10
        start_time = time.time()
        while time.time() - start_time < max_wait:
            try:
                with urllib.request.urlopen(f"{cls.base_url}/") as res:
                    if res.status == 200:
                        break
            except Exception:
                time.sleep(0.1)
        else:
            raise RuntimeError("Test server failed to start within timeout")

    @classmethod
    def tearDownClass(cls):
        if cls.server:
            cls.server.should_exit = True
            time.sleep(0.3)

    def request(
        self,
        method: str,
        path: str,
        body: dict | None = None,
        token: str | None = None,
    ) -> tuple[int, dict | list | str]:
        url = f"{self.base_url}{path}"
        data = json.dumps(body).encode("utf-8") if body is not None else None
        req = urllib.request.Request(url, data=data, method=method)
        req.add_header("Content-Type", "application/json")
        if token:
            req.add_header("Authorization", f"Bearer {token}")

        try:
            with urllib.request.urlopen(req) as resp:
                resp_body = resp.read().decode("utf-8")
                try:
                    return resp.status, json.loads(resp_body)
                except Exception:
                    return resp.status, resp_body
        except urllib.error.HTTPError as e:
            error_body = e.read().decode("utf-8")
            try:
                return e.code, json.loads(error_body)
            except Exception:
                return e.code, error_body

    def register_and_login(self, username_prefix: str = "user") -> tuple[dict, str]:
        uid = uuid.uuid4().hex[:8]
        user_data = {
            "username": f"{username_prefix}_{uid}",
            "email": f"{username_prefix}_{uid}@example.com",
            "password": "Password123!",
        }
        status, resp = self.request("POST", "/auth/register", user_data)
        self.assertEqual(status, 201, f"Failed to register user: {resp}")

        login_data = {
            "email": user_data["email"],
            "password": user_data["password"],
        }
        status, login_resp = self.request("POST", "/auth/login", login_data)
        self.assertEqual(status, 200, f"Failed to login user: {login_resp}")
        token = login_resp["access_token"]
        return resp, token

    # =========================================================================
    # ROOT & HEALTH TESTS
    # =========================================================================
    def test_01_root_and_test_db(self):
        status, resp = self.request("GET", "/")
        self.assertEqual(status, 200)
        self.assertEqual(resp.get("message"), "Placement Tracker API is running")

        status, resp = self.request("GET", "/test-db")
        self.assertEqual(status, 200)
        self.assertEqual(resp.get("database"), 1)

    # =========================================================================
    # AUTHENTICATION TESTS
    # =========================================================================
    def test_02_register_success(self):
        uid = uuid.uuid4().hex[:8]
        payload = {
            "username": f"alice_{uid}",
            "email": f"alice_{uid}@example.com",
            "password": "ValidPassword123",
        }
        status, resp = self.request("POST", "/auth/register", payload)
        self.assertEqual(status, 201)
        self.assertEqual(resp["username"], payload["username"])
        self.assertEqual(resp["email"], payload["email"])
        self.assertIn("id", resp)
        self.assertNotIn("password", resp)
        self.assertNotIn("password_hash", resp)

    def test_03_register_duplicate_email(self):
        uid = uuid.uuid4().hex[:8]
        payload = {
            "username": f"user1_{uid}",
            "email": f"dup_{uid}@example.com",
            "password": "ValidPassword123",
        }
        status, _ = self.request("POST", "/auth/register", payload)
        self.assertEqual(status, 201)

        duplicate_payload = {
            "username": f"user2_{uid}",
            "email": f"dup_{uid}@example.com",
            "password": "AnotherPassword123",
        }
        status, resp = self.request("POST", "/auth/register", duplicate_payload)
        self.assertEqual(status, 400)
        self.assertEqual(resp.get("detail"), "Email already registered")

    def test_04_register_duplicate_username(self):
        uid = uuid.uuid4().hex[:8]
        payload = {
            "username": f"samename_{uid}",
            "email": f"userA_{uid}@example.com",
            "password": "ValidPassword123",
        }
        status, _ = self.request("POST", "/auth/register", payload)
        self.assertEqual(status, 201)

        duplicate_username_payload = {
            "username": f"samename_{uid}",
            "email": f"userB_{uid}@example.com",
            "password": "AnotherPassword123",
        }
        status, resp = self.request("POST", "/auth/register", duplicate_username_payload)
        self.assertEqual(status, 400)
        self.assertEqual(resp.get("detail"), "Username already taken")

    def test_05_register_validation_errors(self):
        # Empty / whitespace username
        status, _ = self.request("POST", "/auth/register", {
            "username": "   ",
            "email": "test@example.com",
            "password": "Password123",
        })
        self.assertEqual(status, 422)

        # Username too short (<3 chars)
        status, _ = self.request("POST", "/auth/register", {
            "username": "ab",
            "email": "test@example.com",
            "password": "Password123",
        })
        self.assertEqual(status, 422)

        # Invalid email
        status, _ = self.request("POST", "/auth/register", {
            "username": "valid_name",
            "email": "not-an-email",
            "password": "Password123",
        })
        self.assertEqual(status, 422)

        # Password too short (<6 chars)
        status, _ = self.request("POST", "/auth/register", {
            "username": "valid_name",
            "email": "valid@example.com",
            "password": "123",
        })
        self.assertEqual(status, 422)

    def test_06_login_success_and_invalid_credentials(self):
        user, token = self.register_and_login("logintest")
        self.assertTrue(len(token) > 20)

        # Invalid password
        status, resp = self.request("POST", "/auth/login", {
            "email": user["email"],
            "password": "WrongPassword999",
        })
        self.assertEqual(status, 401)
        self.assertEqual(resp.get("detail"), "Invalid email or password")

        # Nonexistent email
        status, resp = self.request("POST", "/auth/login", {
            "email": "nonexistent_email_123@example.com",
            "password": "Password123",
        })
        self.assertEqual(status, 401)
        self.assertEqual(resp.get("detail"), "Invalid email or password")

    def test_07_auth_me_scenarios(self):
        user, token = self.register_and_login("metest")

        # With valid token
        status, resp = self.request("GET", "/auth/me", token=token)
        self.assertEqual(status, 200)
        self.assertEqual(resp["id"], user["id"])
        self.assertEqual(resp["username"], user["username"])
        self.assertEqual(resp["email"], user["email"])
        self.assertNotIn("password", resp)
        self.assertNotIn("password_hash", resp)

        # Without token
        status, _ = self.request("GET", "/auth/me")
        self.assertEqual(status, 401)

        # With malformed token
        status, resp = self.request("GET", "/auth/me", token="invalid.token.structure")
        self.assertEqual(status, 401)
        self.assertEqual(resp.get("detail"), "Invalid token")

    # =========================================================================
    # APPLICATION CRUD & VALIDATION TESTS
    # =========================================================================
    def test_08_application_create_valid_and_defaults(self):
        _, token = self.register_and_login("apptest")

        payload = {
            "company_name": "Acme Corp",
            "job_title": "Backend Engineer",
            "status": "Applied",
            "job_url": "https://acme.com/jobs/backend",
            "notes": "Applied through company career portal",
        }
        status, resp = self.request("POST", "/applications/", payload, token=token)
        self.assertEqual(status, 201)
        self.assertEqual(resp["company_name"], "Acme Corp")
        self.assertEqual(resp["job_title"], "Backend Engineer")
        self.assertEqual(resp["status"], "Applied")
        self.assertEqual(resp["job_url"], "https://acme.com/jobs/backend")
        self.assertEqual(resp["notes"], "Applied through company career portal")
        self.assertIn("id", resp)
        self.assertIn("applied_date", resp)
        self.assertIn("user_id", resp)

    def test_09_application_validation(self):
        _, token = self.register_and_login("valtest")

        # Empty company name
        status, _ = self.request("POST", "/applications/", {
            "company_name": "   ",
            "job_title": "Dev",
        }, token=token)
        self.assertEqual(status, 422)

        # Empty job title
        status, _ = self.request("POST", "/applications/", {
            "company_name": "Acme",
            "job_title": "   ",
        }, token=token)
        self.assertEqual(status, 422)

        # Invalid status
        status, _ = self.request("POST", "/applications/", {
            "company_name": "Acme",
            "job_title": "Dev",
            "status": "WaitingReview",
        }, token=token)
        self.assertEqual(status, 422)

        # Invalid job URL scheme / malformed URL
        status, _ = self.request("POST", "/applications/", {
            "company_name": "Acme",
            "job_title": "Dev",
            "job_url": "ftp://example.com/job",
        }, token=token)
        self.assertEqual(status, 422)

        status, _ = self.request("POST", "/applications/", {
            "company_name": "Acme",
            "job_title": "Dev",
            "job_url": "invalid_url_without_scheme",
        }, token=token)
        self.assertEqual(status, 422)

        # Notes exceeding 1000 characters
        status, _ = self.request("POST", "/applications/", {
            "company_name": "Acme",
            "job_title": "Dev",
            "notes": "x" * 1001,
        }, token=token)
        self.assertEqual(status, 422)

        # Valid payload with empty optional fields
        status, resp = self.request("POST", "/applications/", {
            "company_name": " Minimalist Ltd ",
            "job_title": " Junior Dev ",
        }, token=token)
        self.assertEqual(status, 201)
        self.assertEqual(resp["company_name"], "Minimalist Ltd")  # Stripped
        self.assertEqual(resp["job_title"], "Junior Dev")  # Stripped
        self.assertEqual(resp["status"], "Applied")  # Default status

    def test_10_application_get_by_id_update_delete(self):
        _, token = self.register_and_login("crudtest")

        # Create
        status, created = self.request("POST", "/applications/", {
            "company_name": "Meta",
            "job_title": "Software Engineer",
            "status": "Applied",
        }, token=token)
        self.assertEqual(status, 201)
        app_id = created["id"]

        # Get by ID
        status, fetched = self.request("GET", f"/applications/{app_id}", token=token)
        self.assertEqual(status, 200)
        self.assertEqual(fetched["id"], app_id)
        self.assertEqual(fetched["company_name"], "Meta")

        # Update
        update_payload = {
            "company_name": "Meta Platforms",
            "job_title": "Senior Software Engineer",
            "status": "Interview",
            "notes": "First round scheduled",
        }
        status, updated = self.request("PUT", f"/applications/{app_id}", update_payload, token=token)
        self.assertEqual(status, 200)
        self.assertEqual(updated["company_name"], "Meta Platforms")
        self.assertEqual(updated["job_title"], "Senior Software Engineer")
        self.assertEqual(updated["status"], "Interview")
        self.assertEqual(updated["notes"], "First round scheduled")

        # Delete
        status, del_resp = self.request("DELETE", f"/applications/{app_id}", token=token)
        self.assertEqual(status, 200)
        self.assertEqual(del_resp.get("message"), "Application deleted successfully")

        # Get after delete -> 404
        status, _ = self.request("GET", f"/applications/{app_id}", token=token)
        self.assertEqual(status, 404)

        # Nonexistent operations
        status, _ = self.request("GET", "/applications/999999", token=token)
        self.assertEqual(status, 404)

        status, _ = self.request("PUT", "/applications/999999", update_payload, token=token)
        self.assertEqual(status, 404)

        status, _ = self.request("DELETE", "/applications/999999", token=token)
        self.assertEqual(status, 404)

    # =========================================================================
    # FILTERING, SEARCH, PAGINATION, SORTING TESTS
    # =========================================================================
    def test_11_filtering_search_pagination_sorting(self):
        _, token = self.register_and_login("filteruser")

        companies = [
            ("Google Cloud", "SRE", "Interview", "2026-09-01T10:00:00Z"),
            ("Google AI", "Research Engineer", "Offer", "2026-09-03T10:00:00Z"),
            ("Microsoft Azure", "Backend Dev", "Applied", "2026-09-02T10:00:00Z"),
            ("Amazon AWS", "Systems Dev", "Rejected", "2026-09-04T10:00:00Z"),
            ("Alphabet Labs", "Intern", "Interview", "2026-09-05T10:00:00Z"),
        ]

        for company, title, status_val, dt in companies:
            status_code, _ = self.request("POST", "/applications/", {
                "company_name": company,
                "job_title": title,
                "status": status_val,
                "applied_date": dt,
            }, token=token)
            self.assertEqual(status_code, 201)

        # Filter by status = Interview
        status_code, resp = self.request("GET", "/applications/?status=Interview", token=token)
        self.assertEqual(status_code, 200)
        self.assertEqual(len(resp), 2)
        for item in resp:
            self.assertEqual(item["status"], "Interview")

        # Invalid status filter -> 422
        status_code, _ = self.request("GET", "/applications/?status=InvalidStatus", token=token)
        self.assertEqual(status_code, 422)

        # Search company = 'google' (case-insensitive partial match)
        status_code, resp = self.request("GET", "/applications/?company=google", token=token)
        self.assertEqual(status_code, 200)
        self.assertEqual(len(resp), 2)
        for item in resp:
            self.assertIn("Google", item["company_name"])

        # Combined filter & search
        status_code, resp = self.request("GET", "/applications/?status=Interview&company=google", token=token)
        self.assertEqual(status_code, 200)
        self.assertEqual(len(resp), 1)
        self.assertEqual(resp[0]["company_name"], "Google Cloud")

        # Sorting: newest applied_date first
        status_code, resp = self.request("GET", "/applications/?limit=10", token=token)
        self.assertEqual(status_code, 200)
        self.assertEqual(len(resp), 5)
        # 2026-09-05 should be first
        self.assertEqual(resp[0]["company_name"], "Alphabet Labs")
        # 2026-09-01 should be last
        self.assertEqual(resp[-1]["company_name"], "Google Cloud")

        # Pagination: page=1, limit=2
        status_code, page1 = self.request("GET", "/applications/?page=1&limit=2", token=token)
        self.assertEqual(status_code, 200)
        self.assertEqual(len(page1), 2)

        status_code, page2 = self.request("GET", "/applications/?page=2&limit=2", token=token)
        self.assertEqual(status_code, 200)
        self.assertEqual(len(page2), 2)
        self.assertNotEqual(page1[0]["id"], page2[0]["id"])

        # Invalid pagination values -> 422
        status_code, _ = self.request("GET", "/applications/?page=0", token=token)
        self.assertEqual(status_code, 422)

        status_code, _ = self.request("GET", "/applications/?limit=0", token=token)
        self.assertEqual(status_code, 422)

        status_code, _ = self.request("GET", "/applications/?limit=101", token=token)
        self.assertEqual(status_code, 422)

    # =========================================================================
    # APPLICATION STATISTICS TESTS
    # =========================================================================
    def test_12_application_statistics_empty_and_populated(self):
        # User with no applications
        _, empty_token = self.register_and_login("emptyuser")
        status, stats = self.request("GET", "/applications/stats", token=empty_token)
        self.assertEqual(status, 200)
        self.assertEqual(stats, {
            "total": 0,
            "Applied": 0,
            "Interview": 0,
            "Rejected": 0,
            "Offer": 0,
        })

        # User with applications
        _, token = self.register_and_login("statsuser")
        statuses_to_create = ["Applied", "Applied", "Interview", "Offer", "Rejected"]
        for st in statuses_to_create:
            self.request("POST", "/applications/", {
                "company_name": f"Company {st}",
                "job_title": "Engineer",
                "status": st,
            }, token=token)

        status, stats = self.request("GET", "/applications/stats", token=token)
        self.assertEqual(status, 200)
        self.assertEqual(stats["total"], 5)
        self.assertEqual(stats["Applied"], 2)
        self.assertEqual(stats["Interview"], 1)
        self.assertEqual(stats["Rejected"], 1)
        self.assertEqual(stats["Offer"], 1)

    # =========================================================================
    # MULTI-USER ISOLATION & AUTHORIZATION TESTS
    # =========================================================================
    def test_13_multi_user_isolation(self):
        _, token_a = self.register_and_login("userA")
        _, token_b = self.register_and_login("userB")

        # User A creates an application
        status, app_a = self.request("POST", "/applications/", {
            "company_name": "Company A",
            "job_title": "Developer A",
            "status": "Applied",
        }, token=token_a)
        self.assertEqual(status, 201)

        # User B creates an application
        status, app_b = self.request("POST", "/applications/", {
            "company_name": "Company B",
            "job_title": "Developer B",
            "status": "Offer",
        }, token=token_b)
        self.assertEqual(status, 201)

        # User A cannot GET User B's application
        status, _ = self.request("GET", f"/applications/{app_b['id']}", token=token_a)
        self.assertEqual(status, 404)

        # User A cannot UPDATE User B's application
        status, _ = self.request("PUT", f"/applications/{app_b['id']}", {
            "company_name": "Hacked Company",
            "job_title": "Hacked Title",
            "status": "Rejected",
        }, token=token_a)
        self.assertEqual(status, 404)

        # Verify User B's application was NOT modified
        status, app_b_check = self.request("GET", f"/applications/{app_b['id']}", token=token_b)
        self.assertEqual(status, 200)
        self.assertEqual(app_b_check["company_name"], "Company B")

        # User A cannot DELETE User B's application
        status, _ = self.request("DELETE", f"/applications/{app_b['id']}", token=token_a)
        self.assertEqual(status, 404)

        # User A's list only contains User A's application
        status, list_a = self.request("GET", "/applications/", token=token_a)
        self.assertEqual(status, 200)
        app_ids_a = [item["id"] for item in list_a]
        self.assertIn(app_a["id"], app_ids_a)
        self.assertNotIn(app_b["id"], app_ids_a)

        # User A's statistics do not include User B's applications
        status, stats_a = self.request("GET", "/applications/stats", token=token_a)
        self.assertEqual(status, 200)
        self.assertEqual(stats_a["total"], 1)
        self.assertEqual(stats_a["Applied"], 1)
        self.assertEqual(stats_a["Offer"], 0)


if __name__ == "__main__":
    unittest.main()
