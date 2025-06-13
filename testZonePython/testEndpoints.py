import requests
import json
import random
import time
import os
from datetime import datetime, timedelta
from faker import Faker

# Configuration
BASE_URL = "http://localhost:3001/api"
AUTH_URL = f"{BASE_URL}/auth"
headers = {"Content-Type": "application/json"}
auth_headers = {"Content-Type": "application/json"}
fake = Faker(['es_ES', 'es_MX'])

# Storage for test data
users = []  # List of dictionaries with user info
user_tokens = {}  # Dictionary of JWT tokens by user_id
foundations = []  # List of dictionaries with foundation info
donations = []  # List of donation IDs
social_actions = []  # List of social action IDs
comments = []  # List of comment IDs
foundation_comments = []  # List of foundation comment IDs
ratings = []  # List of rating IDs
participation_requests = []  # List of participation request IDs
certificates = []  # List of certificate IDs
notifications = []  # List of notification IDs
suggestions = []  # List of suggestion IDs
favorites = []  # List of favorite IDs
uploaded_files = []  # List of uploaded file paths

# Helper functions


def print_status(message, success=True):
    """Print formatted status messages"""
    if success:
        print(f"✅ {message}")
    else:
        print(f"❌ {message}")


def login_user(email, password):
    """Login and get JWT token"""
    login_data = {
        "email": email,
        "password": password
    }
    try:
        response = requests.post(
            f"{AUTH_URL}/login", json=login_data, headers=headers)

        if response.status_code == 200 or response.status_code == 201:
            token_data = response.json()
            token = token_data.get('access_token')
            if token:
                print_status(f"Login successful for: {email}")
                return token
            else:
                print_status(
                    f"Token not found in response: {response.text}", False)
                return None
        else:
            print_status(
                f"Login error ({response.status_code}): {response.text}", False)
            return None
    except Exception as e:
        print_status(f"Connection error in login: {str(e)}", False)
        return None


def get_auth_headers(user_id=None):
    """Get headers with JWT token"""
    if user_id and user_id in user_tokens:
        token = user_tokens[user_id]
    elif 'admin' in user_tokens:
        token = user_tokens['admin']
    else:
        return headers  # No token, return basic headers

    return {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }

# Setup function to create necessary users and resources


def setup_test_data():
    """Setup initial test data"""
    global users, user_tokens, foundations

    print("\n=== CREATING TEST DATA ===")

    # Create admin user (foundation type)
    randomNumber = random.randint(1000, 9999)
    admin_data = {
        "name": "Admin Test",
        "email": f"admin.test{str(randomNumber)}@ejemplo.com",
        "password": "Password123",
        "user_type": "foundation"
    }

    try:
        response = requests.post(
            f"{BASE_URL}/users", json=admin_data, headers=headers)

        if response.status_code in [200, 201]:
            admin_info = response.json()
            users.append(admin_info)
            print_status(f"Admin user created: {admin_info['name']}")

            # Login with admin to get token
            admin_token = login_user(
                admin_data["email"], admin_data["password"])
            if admin_token:
                user_tokens[admin_info["id"]] = admin_token
                user_tokens['admin'] = admin_token
                print_status("Admin authenticated successfully")
            else:
                print_status("Admin authentication error", False)
        else:
            print_status(
                f"Error creating admin: {response.text}", False)
    except Exception as e:
        print_status(f"Connection error: {str(e)}", False)

    # Create a regular user
    user_data = {
        "name": fake.name(),
        "email": fake.email(),
        "password": "Password123",
        "user_type": "user"
    }

    try:
        response = requests.post(
            f"{BASE_URL}/users", json=user_data, headers=headers)

        if response.status_code in [200, 201]:
            user_info = response.json()
            users.append(user_info)
            print_status(f"Regular user created: {user_info['name']}")

            # Get JWT token for the user
            token = login_user(user_data["email"], user_data["password"])
            if token:
                user_tokens[user_info["id"]] = token
                print_status(f"Token saved for: {user_info['name']}")
            else:
                print_status(
                    f"Could not get token for {user_info['name']}", False)
        else:
            print_status(
                f"Error creating regular user: {response.text}", False)
    except Exception as e:
        print_status(f"Connection error: {str(e)}", False)

    # Create foundation profile for admin
    admin_user = next(
        (user for user in users if user["user_type"] == "foundation"), None)
    if admin_user:
        foundation_data = {
            "user_id": admin_user["id"],
            "legal_name": f"Test Foundation {fake.company()}",
            "address": fake.address(),
            "phone": fake.phone_number(),
            "website": f"https://www.testfoundation-{random.randint(1000, 9999)}.org"
        }

        admin_auth_headers = get_auth_headers(admin_user["id"])
        try:
            response = requests.post(
                f"{BASE_URL}/foundations", json=foundation_data, headers=admin_auth_headers)

            if response.status_code in [200, 201]:
                foundation_info = response.json()
                foundations.append(foundation_info)
                print_status(
                    f"Foundation profile created: {foundation_info['legal_name']}")
            else:
                print_status(
                    f"Error creating foundation profile: {response.status_code} - {response.text}", False)
        except Exception as e:
            print_status(f"Connection error: {str(e)}", False)
    else:
        print_status(
            "No foundation user available to create foundation profile", False)

    # Create resources needed for testing
    create_test_resources()


def create_test_resources():
    """Create resources for testing (donations, social actions, etc.)"""
    # Get users for testing
    regular_user = next(
        (user for user in users if user["user_type"] == "user"), None)
    admin_user = next(
        (user for user in users if user["user_type"] == "foundation"), None)

    if not regular_user or not admin_user or not foundations:
        print_status(
            "Missing required users or foundations for resource creation", False)
        return

    # Create a donation
    if regular_user and foundations:
        donation_data = {
            "user_id": regular_user["id"],
            "foundation_id": foundations[0]["id"],
            "amount": round(random.uniform(10, 1000), 2)
        }

        try:
            user_auth_headers = get_auth_headers(regular_user["id"])
            response = requests.post(
                f"{BASE_URL}/donations", json=donation_data, headers=user_auth_headers)

            if response.status_code in [200, 201]:
                donation_info = response.json()
                donations.append(donation_info)
                print_status(f"Donation created: ${donation_data['amount']}")
            else:
                print_status(
                    f"Error creating donation: {response.status_code} - {response.text}", False)
        except Exception as e:
            print_status(f"Connection error: {str(e)}", False)

    # Create a social action
    if admin_user and foundations:
        # Generate coherent dates
        today = datetime.now()
        start_date = today + timedelta(days=random.randint(5, 30))
        end_date = start_date + timedelta(days=random.randint(1, 14))

        action_data = {
            "foundation_id": foundations[0]["id"],
            "description": f"Test social action {random.randint(1000, 9999)}",
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        }

        try:
            admin_auth_headers = get_auth_headers(admin_user["id"])
            response = requests.post(
                f"{BASE_URL}/social-actions", json=action_data, headers=admin_auth_headers)

            if response.status_code in [200, 201]:
                action_info = response.json()
                social_actions.append(action_info)
                print_status(
                    f"Social action created: {action_info['description'][:30]}...")
            else:
                print_status(
                    f"Error creating social action: {response.status_code} - {response.text}", False)
        except Exception as e:
            print_status(f"Connection error: {str(e)}", False)

    # Create a participation request
    if regular_user and social_actions:
        request_data = {
            "user_id": regular_user["id"],
            "social_action_id": social_actions[0]["id"]
        }

        try:
            user_auth_headers = get_auth_headers(regular_user["id"])
            response = requests.post(
                f"{BASE_URL}/participation-requests", json=request_data, headers=user_auth_headers)

            if response.status_code in [200, 201]:
                request_info = response.json()
                participation_requests.append(request_info)
                print_status(f"Participation request created")

                # Accept the request
                admin_auth_headers = get_auth_headers(admin_user["id"])
                update_data = {"status": "accepted"}

                update_response = requests.patch(
                    f"{BASE_URL}/participation-requests/{request_info['id']}",
                    json=update_data,
                    headers=admin_auth_headers
                )

                if update_response.status_code in [200, 201]:
                    print_status("Participation request accepted")
                else:
                    print_status(
                        f"Error accepting request: {update_response.status_code} - {update_response.text}", False)
            else:
                print_status(
                    f"Error creating participation request: {response.status_code} - {response.text}", False)
        except Exception as e:
            print_status(f"Connection error: {str(e)}", False)

    # Create a comment for a foundation using the new endpoint
    if regular_user and foundations:
        foundation_comment_data = {
            "user_id": regular_user["id"],
            "foundation_id": foundations[0]["id"],
            "text": "Test comment for foundation using new endpoint"
        }

        try:
            user_auth_headers = get_auth_headers(regular_user["id"])
            response = requests.post(
                f"{BASE_URL}/foundation-detail/comment", json=foundation_comment_data, headers=user_auth_headers)

            if response.status_code in [200, 201]:
                comment_info = response.json()
                foundation_comments.append(comment_info)
                print_status(f"Foundation comment created using new endpoint")
            else:
                print_status(
                    f"Error creating foundation comment: {response.status_code} - {response.text}", False)
        except Exception as e:
            print_status(f"Connection error: {str(e)}", False)

    # Create another comment for a foundation using the general comments endpoint
    if regular_user and foundations:
        foundation_comment_data = {
            "user_id": regular_user["id"],
            "foundation_id": foundations[0]["id"],
            "text": "Test comment for foundation using general endpoint"
        }

        try:
            user_auth_headers = get_auth_headers(regular_user["id"])
            response = requests.post(
                f"{BASE_URL}/comments", json=foundation_comment_data, headers=user_auth_headers)

            if response.status_code in [200, 201]:
                comment_info = response.json()
                foundation_comments.append(comment_info)
                print_status(
                    f"Foundation comment created using general endpoint")
            else:
                print_status(
                    f"Error creating foundation comment: {response.status_code} - {response.text}", False)
        except Exception as e:
            print_status(f"Connection error: {str(e)}", False)


def test_get_endpoints():
    """Test GET endpoints that weren't covered in the original script"""
    print("\n=== TESTING GET ENDPOINTS ===")

    regular_user = next(
        (user for user in users if user["user_type"] == "user"), None)
    admin_user = next(
        (user for user in users if user["user_type"] == "foundation"), None)

    if not regular_user or not admin_user:
        print_status("Missing required users for GET endpoint testing", False)
        return

    user_auth_headers = get_auth_headers(regular_user["id"])
    admin_auth_headers = get_auth_headers(admin_user["id"])

    # List of GET endpoints to test
    get_endpoints = [
        # Users
        {"url": f"{BASE_URL}/users", "auth_headers": admin_auth_headers,
            "name": "Get all users"},
        {"url": f"{BASE_URL}/users/{regular_user['id']}",
            "auth_headers": user_auth_headers, "name": "Get user profile"},

        # Foundations
        {"url": f"{BASE_URL}/foundations", "auth_headers": headers,
            "name": "Get all foundations"},
        {"url": f"{BASE_URL}/foundations/{foundations[0]['id']}", "auth_headers": headers,
            "name": "Get foundation by ID"} if foundations else None,
        {"url": f"{BASE_URL}/foundations/user/{admin_user['id']}",
            "auth_headers": headers, "name": "Get foundation by user ID"},

        # Donations
        {"url": f"{BASE_URL}/donations", "auth_headers": admin_auth_headers,
            "name": "Get all donations"},
        {"url": f"{BASE_URL}/donations/{donations[0]['id']}", "auth_headers": user_auth_headers,
            "name": "Get donation by ID"} if donations else None,
        {"url": f"{BASE_URL}/donations/user/{regular_user['id']}",
            "auth_headers": user_auth_headers, "name": "Get donations by user"},
        {"url": f"{BASE_URL}/donations/foundation/{foundations[0]['id']}",
            "auth_headers": admin_auth_headers, "name": "Get donations by foundation"} if foundations else None,

        # Social Actions
        {"url": f"{BASE_URL}/social-actions", "auth_headers": headers,
            "name": "Get all social actions"},
        {"url": f"{BASE_URL}/social-actions/{social_actions[0]['id']}", "auth_headers": headers,
            "name": "Get social action by ID"} if social_actions else None,
        {"url": f"{BASE_URL}/social-actions/upcoming",
            "auth_headers": headers, "name": "Get upcoming social actions"},
        {"url": f"{BASE_URL}/social-actions/active",
            "auth_headers": headers, "name": "Get active social actions"},
        {"url": f"{BASE_URL}/social-actions/foundation/{foundations[0]['id']}",
            "auth_headers": headers, "name": "Get social actions by foundation"} if foundations else None,

        # Opportunities (alias for social actions)
        {"url": f"{BASE_URL}/opportunities", "auth_headers": headers,
            "name": "Get all opportunities"},
        {"url": f"{BASE_URL}/opportunities/{social_actions[0]['id']}", "auth_headers": headers,
            "name": "Get opportunity by ID"} if social_actions else None,
        {"url": f"{BASE_URL}/opportunities/upcoming",
            "auth_headers": headers, "name": "Get upcoming opportunities"},
        {"url": f"{BASE_URL}/opportunities/active",
            "auth_headers": headers, "name": "Get active opportunities"},
        {"url": f"{BASE_URL}/opportunities/foundation/{foundations[0]['id']}",
            "auth_headers": headers, "name": "Get opportunities by foundation"} if foundations else None,

        # Comments
        {"url": f"{BASE_URL}/comments", "auth_headers": admin_auth_headers,
            "name": "Get all comments"},
        {"url": f"{BASE_URL}/comments/user/{regular_user['id']}",
            "auth_headers": user_auth_headers, "name": "Get comments by user"},
        {"url": f"{BASE_URL}/comments/donation/{donations[0]['id']}",
            "auth_headers": headers, "name": "Get comments by donation"} if donations else None,
        {"url": f"{BASE_URL}/comments/social-action/{social_actions[0]['id']}",
            "auth_headers": headers, "name": "Get comments by social action"} if social_actions else None,
        {"url": f"{BASE_URL}/comments/opportunity/{social_actions[0]['id']}",
            "auth_headers": headers, "name": "Get comments by opportunity"} if social_actions else None,
        {"url": f"{BASE_URL}/comments/foundation/{foundations[0]['id']}",
            "auth_headers": headers, "name": "Get comments by foundation"} if foundations else None,

        # Ratings
        {"url": f"{BASE_URL}/ratings", "auth_headers": headers,
            "name": "Get all ratings"},
        {"url": f"{BASE_URL}/ratings/user/{regular_user['id']}",
            "auth_headers": headers, "name": "Get ratings by user"},
        {"url": f"{BASE_URL}/ratings/donation/{donations[0]['id']}",
            "auth_headers": headers, "name": "Get ratings by donation"} if donations else None,
        {"url": f"{BASE_URL}/ratings/donation/{donations[0]['id']}/average",
            "auth_headers": headers, "name": "Get average rating for donation"} if donations else None,
        {"url": f"{BASE_URL}/ratings/social-action/{social_actions[0]['id']}",
            "auth_headers": headers, "name": "Get ratings by social action"} if social_actions else None,
        {"url": f"{BASE_URL}/ratings/social-action/{social_actions[0]['id']}/average",
            "auth_headers": headers, "name": "Get average rating for social action"} if social_actions else None,
        {"url": f"{BASE_URL}/ratings/opportunity/{social_actions[0]['id']}",
            "auth_headers": headers, "name": "Get ratings by opportunity"} if social_actions else None,
        {"url": f"{BASE_URL}/ratings/opportunity/{social_actions[0]['id']}/average",
            "auth_headers": headers, "name": "Get average rating for opportunity"} if social_actions else None,

        # Participation Requests
        {"url": f"{BASE_URL}/participation-requests",
            "auth_headers": admin_auth_headers, "name": "Get all participation requests"},
        {"url": f"{BASE_URL}/participation-requests/user/{regular_user['id']}",
            "auth_headers": user_auth_headers, "name": "Get participation requests by user"},
        {"url": f"{BASE_URL}/participation-requests/social-action/{social_actions[0]['id']}",
            "auth_headers": admin_auth_headers, "name": "Get participation requests by social action"} if social_actions else None,
        {"url": f"{BASE_URL}/participation-requests/social-action/{social_actions[0]['id']}/pending",
            "auth_headers": admin_auth_headers, "name": "Get pending participation requests"} if social_actions else None,
        {"url": f"{BASE_URL}/opportunities/{social_actions[0]['id']}/applications",
            "auth_headers": admin_auth_headers, "name": "Get applications by opportunity"} if social_actions else None,
        {"url": f"{BASE_URL}/opportunities/{social_actions[0]['id']}/pending-applications",
            "auth_headers": admin_auth_headers, "name": "Get pending applications by opportunity"} if social_actions else None,

        # Certificates
        {"url": f"{BASE_URL}/certificates",
            "auth_headers": admin_auth_headers, "name": "Get all certificates"},
        {"url": f"{BASE_URL}/certificates/user/{regular_user['id']}",
            "auth_headers": user_auth_headers, "name": "Get certificates by user"},

        # Notifications
        {"url": f"{BASE_URL}/notifications",
            "auth_headers": admin_auth_headers, "name": "Get all notifications"},
        {"url": f"{BASE_URL}/notifications/unread",
            "auth_headers": user_auth_headers, "name": "Get unread notifications"},
        {"url": f"{BASE_URL}/notifications/user/{regular_user['id']}",
            "auth_headers": admin_auth_headers, "name": "Get notifications by user"},
        {"url": f"{BASE_URL}/notifications/user/{regular_user['id']}/unread",
            "auth_headers": admin_auth_headers, "name": "Get unread notifications by user"},

        # Suggestions
        {"url": f"{BASE_URL}/suggestions", "auth_headers": admin_auth_headers,
            "name": "Get all suggestions"},
        {"url": f"{BASE_URL}/suggestions/unprocessed",
            "auth_headers": admin_auth_headers, "name": "Get unprocessed suggestions"},
        {"url": f"{BASE_URL}/suggestions/user/{regular_user['id']}",
            "auth_headers": admin_auth_headers, "name": "Get suggestions by user"},

    ]

    # Filter None values (endpoints that depend on data that might not exist)
    get_endpoints = [
        endpoint for endpoint in get_endpoints if endpoint is not None]

    # Test each endpoint
    for endpoint in get_endpoints:
        try:
            response = requests.get(
                endpoint["url"], headers=endpoint["auth_headers"])
            if response.status_code in [200, 201, 204]:
                print_status(f"{endpoint['name']}: {response.status_code}")
            else:
                print_status(
                    f"{endpoint['name']}: {response.status_code} - {response.text}", False)
        except Exception as e:
            print_status(f"Error with {endpoint['name']}: {str(e)}", False)


def test_update_endpoints():
    """Test PUT/PATCH endpoints that weren't covered in the original script"""
    print("\n=== TESTING UPDATE ENDPOINTS ===")

    regular_user = next(
        (user for user in users if user["user_type"] == "user"), None)
    admin_user = next(
        (user for user in users if user["user_type"] == "foundation"), None)

    if not regular_user or not admin_user:
        print_status(
            "Missing required users for update endpoint testing", False)
        return

    user_auth_headers = get_auth_headers(regular_user["id"])
    admin_auth_headers = get_auth_headers(admin_user["id"])

    # Test updating user
    user_update = {
        "name": f"Updated {regular_user['name']}"
    }

    try:
        response = requests.patch(
            f"{BASE_URL}/users/{regular_user['id']}", json=user_update, headers=user_auth_headers)
        if response.status_code in [200, 201, 204]:
            print_status(f"Update user: {response.status_code}")
        else:
            print_status(
                f"Update user: {response.status_code} - {response.text}", False)
    except Exception as e:
        print_status(f"Error updating user: {str(e)}", False)

    # Test updating foundation
    if foundations:
        foundation_update = {
            "website": f"https://www.updated-{random.randint(1000, 9999)}.org"
        }

        try:
            response = requests.patch(
                f"{BASE_URL}/foundations/{foundations[0]['id']}", json=foundation_update, headers=admin_auth_headers)
            if response.status_code in [200, 201, 204]:
                print_status(f"Update foundation: {response.status_code}")
            else:
                print_status(
                    f"Update foundation: {response.status_code} - {response.text}", False)
        except Exception as e:
            print_status(f"Error updating foundation: {str(e)}", False)

    # Create a comment then update it
    if regular_user and donations:
        # First create the comment
        comment_data = {
            "user_id": regular_user["id"],
            "donation_id": donations[0]["id"],
            "text": "Test comment"
        }

        try:
            response = requests.post(
                f"{BASE_URL}/comments", json=comment_data, headers=user_auth_headers)
            if response.status_code in [200, 201]:
                comment = response.json()
                comments.append(comment)
                print_status("Comment created for update test")

                # Now update it
                comment_update = {
                    "text": "Updated test comment"
                }

                update_response = requests.patch(
                    f"{BASE_URL}/comments/{comment['id']}", json=comment_update, headers=user_auth_headers)
                if update_response.status_code in [200, 201, 204]:
                    print_status(
                        f"Update comment: {update_response.status_code}")
                else:
                    print_status(
                        f"Update comment: {update_response.status_code} - {update_response.text}", False)
            else:
                print_status(
                    f"Create comment for update: {response.status_code} - {response.text}", False)
        except Exception as e:
            print_status(f"Error with comment update test: {str(e)}", False)

    # Update a foundation comment
    if regular_user and foundation_comments:
        foundation_comment = foundation_comments[0]
        comment_update = {
            "text": "Updated foundation comment"
        }

        try:
            response = requests.patch(
                f"{BASE_URL}/comments/{foundation_comment['id']}", json=comment_update, headers=user_auth_headers)
            if response.status_code in [200, 201, 204]:
                print_status(
                    f"Update foundation comment: {response.status_code}")
            else:
                print_status(
                    f"Update foundation comment: {response.status_code} - {response.text}", False)
        except Exception as e:
            print_status(f"Error updating foundation comment: {str(e)}", False)

    # Create and update rating
    if regular_user and donations:
        # First create the rating
        rating_data = {
            "user_id": regular_user["id"],
            "donation_id": donations[0]["id"],
            "rating": 4
        }

        try:
            response = requests.post(
                f"{BASE_URL}/ratings", json=rating_data, headers=user_auth_headers)
            if response.status_code in [200, 201]:
                rating = response.json()
                ratings.append(rating)
                print_status("Rating created for update test")

                # Now update it
                rating_update = {
                    "rating": 5
                }

                update_response = requests.patch(
                    f"{BASE_URL}/ratings/{rating['id']}", json=rating_update, headers=user_auth_headers)
                if update_response.status_code in [200, 201, 204]:
                    print_status(
                        f"Update rating: {update_response.status_code}")
                else:
                    print_status(
                        f"Update rating: {update_response.status_code} - {update_response.text}", False)
            else:
                print_status(
                    f"Create rating for update: {response.status_code} - {response.text}", False)
        except Exception as e:
            print_status(f"Error with rating update test: {str(e)}", False)

    # Test notification mark as read
    if regular_user and admin_user:
        # First create a notification
        notification_data = {
            "user_id": regular_user["id"],
            "message": "Test notification",
            "read": False
        }

        try:
            response = requests.post(
                f"{BASE_URL}/notifications", json=notification_data, headers=admin_auth_headers)
            if response.status_code in [200, 201]:
                notification = response.json()
                notifications.append(notification)
                print_status("Notification created for update test")

                # Now mark as read
                read_response = requests.patch(
                    f"{BASE_URL}/notifications/{notification['id']}/read", headers=user_auth_headers)
                if read_response.status_code in [200, 201, 204]:
                    print_status(
                        f"Mark notification as read: {read_response.status_code}")
                else:
                    print_status(
                        f"Mark notification as read: {read_response.status_code} - {read_response.text}", False)
            else:
                print_status(
                    f"Create notification for mark as read: {response.status_code} - {response.text}", False)
        except Exception as e:
            print_status(
                f"Error with notification update test: {str(e)}", False)

    # Test mark all notifications as read
    try:
        response = requests.post(
            f"{BASE_URL}/notifications/mark-all-read", headers=user_auth_headers)
        if response.status_code in [200, 201, 204]:
            print_status(
                f"Mark all notifications as read: {response.status_code}")
        else:
            print_status(
                f"Mark all notifications as read: {response.status_code} - {response.text}", False)
    except Exception as e:
        print_status(
            f"Error marking all notifications as read: {str(e)}", False)


def test_delete_endpoints():
    """Test DELETE endpoints that weren't covered in the original script"""
    print("\n=== TESTING DELETE ENDPOINTS ===")

    regular_user = next(
        (user for user in users if user["user_type"] == "user"), None)
    admin_user = next(
        (user for user in users if user["user_type"] == "foundation"), None)

    if not regular_user or not admin_user:
        print_status(
            "Missing required users for delete endpoint testing", False)
        return

    user_auth_headers = get_auth_headers(regular_user["id"])
    admin_auth_headers = get_auth_headers(admin_user["id"])

    # Test deleting a comment (create one first)
    if regular_user and donations:
        comment_data = {
            "user_id": regular_user["id"],
            "donation_id": donations[0]["id"],
            "text": "Comment to delete"
        }

        try:
            response = requests.post(
                f"{BASE_URL}/comments", json=comment_data, headers=user_auth_headers)
            if response.status_code in [200, 201]:
                comment = response.json()
                print_status("Comment created for delete test")

                # Now delete it
                delete_response = requests.delete(
                    f"{BASE_URL}/comments/{comment['id']}", headers=user_auth_headers)
                if delete_response.status_code in [200, 201, 204]:
                    print_status(
                        f"Delete comment: {delete_response.status_code}")
                else:
                    print_status(
                        f"Delete comment: {delete_response.status_code} - {delete_response.text}", False)
            else:
                print_status(
                    f"Create comment for delete: {response.status_code} - {response.text}", False)
        except Exception as e:
            print_status(f"Error with comment delete test: {str(e)}", False)

    # Test deleting a foundation comment (create one first)
    if regular_user and foundations:
        comment_data = {
            "user_id": regular_user["id"],
            "foundation_id": foundations[0]["id"],
            "text": "Foundation comment to delete"
        }

        try:
            response = requests.post(
                f"{BASE_URL}/foundation-detail/comment", json=comment_data, headers=user_auth_headers)
            if response.status_code in [200, 201]:
                comment = response.json()
                print_status("Foundation comment created for delete test")

                # Now delete it
                delete_response = requests.delete(
                    f"{BASE_URL}/comments/{comment['id']}", headers=user_auth_headers)
                if delete_response.status_code in [200, 201, 204]:
                    print_status(
                        f"Delete foundation comment: {delete_response.status_code}")
                else:
                    print_status(
                        f"Delete foundation comment: {delete_response.status_code} - {delete_response.text}", False)
            else:
                print_status(
                    f"Create foundation comment for delete: {response.status_code} - {response.text}", False)
        except Exception as e:
            print_status(
                f"Error with foundation comment delete test: {str(e)}", False)

    # Test deleting a notification (create one first)
    if regular_user and admin_user:
        notification_data = {
            "user_id": regular_user["id"],
            "message": "Notification to delete",
            "read": False
        }

        try:
            response = requests.post(
                f"{BASE_URL}/notifications", json=notification_data, headers=admin_auth_headers)
            if response.status_code in [200, 201]:
                notification = response.json()
                print_status("Notification created for delete test")

                # Now delete it
                delete_response = requests.delete(
                    f"{BASE_URL}/notifications/{notification['id']}", headers=user_auth_headers)
                if delete_response.status_code in [200, 201, 204]:
                    print_status(
                        f"Delete notification: {delete_response.status_code}")
                else:
                    print_status(
                        f"Delete notification: {delete_response.status_code} - {delete_response.text}", False)
            else:
                print_status(
                    f"Create notification for delete: {response.status_code} - {response.text}", False)
        except Exception as e:
            print_status(
                f"Error with notification delete test: {str(e)}", False)

    # Test deleting a favorite (create one first)
    if regular_user and foundations:
        favorite_data = {
            "item_id": foundations[0]["id"],
            "item_type": "foundation"
        }

        try:
            response = requests.post(
                f"{BASE_URL}/users/{regular_user['id']}/favorites", json=favorite_data, headers=user_auth_headers)
            if response.status_code in [200, 201]:
                favorite = response.json()
                print_status("Favorite created for delete test")

                # Now delete it
                delete_response = requests.delete(
                    f"{BASE_URL}/users/{regular_user['id']}/favorites/{foundations[0]['id']}", headers=user_auth_headers)
                if delete_response.status_code in [200, 201, 204]:
                    print_status(
                        f"Delete favorite: {delete_response.status_code}")
                else:
                    print_status(
                        f"Delete favorite: {delete_response.status_code} - {delete_response.text}", False)
            else:
                print_status(
                    f"Create favorite for delete: {response.status_code} - {response.text}", False)
        except Exception as e:
            print_status(f"Error with favorite delete test: {str(e)}", False)


def main():
    """Main function to run all tests"""
    print("=== STARTING ENDPOINT TESTING ===")
    print("This script will test all endpoints that weren't covered in the original population script.")

    # Setup test data
    setup_test_data()

    # Run tests
    test_get_endpoints()
    test_update_endpoints()
    test_delete_endpoints()

    print("\n=== TESTING COMPLETED ===")
    print(f"Users created: {len(users)}")
    print(f"Foundations created: {len(foundations)}")
    print(f"Donations created: {len(donations)}")
    print(f"Social actions created: {len(social_actions)}")
    print(f"Comments created: {len(comments)}")
    print(f"Foundation comments created: {len(foundation_comments)}")
    print(f"Ratings created: {len(ratings)}")
    print(f"Participation requests created: {len(participation_requests)}")
    print(f"Notifications created: {len(notifications)}")


if __name__ == "__main__":
    main()
