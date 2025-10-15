# SportsRaiser API Documentation

## Base URL
```
Local: http://localhost:3001/api/v1
Production: https://your-api-domain.com/api/v1
```

## Authentication

All endpoints (except `/auth/*`) require JWT authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

---

## Endpoints

### Authentication

#### Send Magic Link
```http
POST /auth/magic-link
Content-Type: application/json

{
  "email": "parent@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Magic link sent successfully. Check your email!",
  "emailId": "abc123..."
}
```

#### Verify Magic Link Token
```http
POST /auth/verify
Content-Type: application/json

{
  "token": "abc123..."
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "StudentID": "STU-001",
    "FirstName": "John",
    "LastName": "Doe",
    "ParentEmail": "parent@example.com",
    "Team": "U12 Eagles",
    "Program": "Soccer"
  }
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "StudentID": "STU-001",
    "FirstName": "John",
    "LastName": "Doe",
    "ParentEmail": "parent@example.com",
    "Team": "U12 Eagles",
    "Program": "Soccer"
  }
}
```

#### Refresh User Data
```http
POST /auth/refresh
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "user": { ... }
}
```

---

### Students

#### Get All Students
```http
GET /students
GET /students?enriched=true  # Include calculated stats
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "StudentID": "STU-001",
      "FirstName": "John",
      "LastName": "Doe",
      "Team": "U12 Eagles",
      "Goal_$": 500,
      "ParentEmail": "parent@example.com",
      "PersonalLink": "https://yourdomain.com/donate/STU-001",
      "QR_URL": "https://...",
      "Avatar_URL": "https://...",
      "Program": "Soccer",
      "QR_Link": "https://...",
      "CardsSold": 25,
      "NetRaised": 250.00,
      "ReferralPoints": 50,
      "TotalRewards": 300.00
    }
  ],
  "count": 1
}
```

#### Get Student by ID
```http
GET /students/:id
```

#### Get Student by Email
```http
GET /students/email/:email
```

#### Get Students by Team
```http
GET /students/team/:teamName
```

#### Get Students by Program
```http
GET /students/program/:programName
```

#### Add New Student
```http
POST /students
Content-Type: application/json

{
  "FirstName": "Jane",
  "LastName": "Smith",
  "Team": "U14 Tigers",
  "Goal_$": 1000,
  "ParentEmail": "jane@example.com",
  "Program": "Basketball"
}
```

**Response:**
```json
{
  "success": true,
  "studentId": "STU-1738234567-ABC12",
  "message": "Student added successfully"
}
```

#### Get All Teams
```http
GET /students/meta/teams
```

**Response:**
```json
{
  "success": true,
  "data": ["U12 Eagles", "U14 Tigers", "Varsity Lions"],
  "count": 3
}
```

#### Get All Programs
```http
GET /students/meta/programs
```

---

### Orders

#### Get All Orders
```http
GET /orders
GET /orders?status=Paid              # Filter by status
GET /orders?studentId=STU-001        # Filter by student
GET /orders?days=7                    # Get last 7 days
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "Timestamp": "2025-01-15T10:30:00.000Z",
      "OrderID": "ORD-001",
      "BuyerName": "Alice Johnson",
      "BuyerEmail": "alice@example.com",
      "BuyerPhone": "(555) 123-4567",
      "Quantity": 5,
      "TotalPaid": 50.00,
      "StudentID": "STU-001",
      "Status": "Paid"
    }
  ],
  "count": 1
}
```

#### Get Orders for Student
```http
GET /orders/student/:studentId
```

#### Get Order Statistics for Student
```http
GET /orders/student/:studentId/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalOrders": 10,
    "totalCards": 50,
    "totalRevenue": 500.00,
    "paidOrders": 9,
    "pendingOrders": 1,
    "refundedOrders": 0
  }
}
```

#### Add New Order
```http
POST /orders
Content-Type: application/json

{
  "BuyerName": "Bob Wilson",
  "BuyerEmail": "bob@example.com",
  "BuyerPhone": "555-987-6543",
  "Quantity": 3,
  "TotalPaid": 30.00,
  "StudentID": "STU-001",
  "Status": "Paid"
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "ORD-1738234567-XYZ89",
  "message": "Order created successfully"
}
```

#### Get Top Buyers
```http
GET /orders/top-buyers?limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "BuyerEmail": "alice@example.com",
      "BuyerName": "Alice Johnson",
      "TotalOrders": 5,
      "TotalSpent": 150.00,
      "TotalCards": 15
    }
  ],
  "count": 1
}
```

#### Get Overall Order Statistics
```http
GET /orders/stats/overall
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalOrders": 100,
    "totalRevenue": 10000.00,
    "totalCards": 1000,
    "averageOrderValue": 100.00,
    "paidOrders": 95,
    "pendingOrders": 5
  }
}
```

---

### Referrals

#### Get All Referrals
```http
GET /referrals
GET /referrals?stage=Contacted       # Filter by stage
GET /referrals?studentId=STU-001     # Filter by student
GET /referrals?days=7                 # Get last 7 days
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "ReferralID": "REF-001",
      "StudentID": "STU-001",
      "ReferralName": "Oak Valley School",
      "ReferralEmail": "contact@oakvalley.edu",
      "ReferralPhone": "555-111-2222",
      "Organization": "Oak Valley Elementary",
      "Stage": "Contacted",
      "Points": 10,
      "DateAdded": "2025-01-15T10:00:00.000Z",
      "LastUpdated": "2025-01-15T10:00:00.000Z"
    }
  ],
  "count": 1
}
```

#### Get Referrals for Student
```http
GET /referrals/student/:studentId
```

#### Get Referral Statistics for Student
```http
GET /referrals/student/:studentId/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalReferrals": 5,
    "totalPoints": 150,
    "byStage": {
      "Contacted": 2,
      "Interested": 1,
      "Meeting Scheduled": 1,
      "Signed Up": 1
    }
  }
}
```

#### Add New Referral
```http
POST /referrals
Content-Type: application/json

{
  "StudentID": "STU-001",
  "ReferralName": "Pine Hill School",
  "ReferralEmail": "info@pinehill.edu",
  "ReferralPhone": "555-333-4444",
  "Organization": "Pine Hill Middle School",
  "Stage": "Contacted"
}
```

**Response:**
```json
{
  "success": true,
  "referralId": "REF-1738234567-DEF45",
  "message": "Referral added successfully"
}
```

#### Update Referral
```http
PUT /referrals/:id
Content-Type: application/json

{
  "Stage": "Interested",
  "ReferralPhone": "555-333-5555"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Referral updated successfully"
}
```

#### Get Referral Leaderboard
```http
GET /referrals/leaderboard?limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "StudentID": "STU-001",
      "TotalReferrals": 10,
      "TotalPoints": 500,
      "Rank": 1
    }
  ],
  "count": 1
}
```

#### Get Overall Referral Statistics
```http
GET /referrals/stats/overall
```

---

### Leaderboard

#### Get Student Leaderboard
```http
GET /leaderboard/students
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "StudentID": "STU-001",
      "FirstName": "John",
      "LastName": "Doe",
      "Team": "U12 Eagles",
      "CardsSold": 50,
      "NetRaised": 500.00,
      "ReferralPoints": 100,
      "TotalRewards": 600.00,
      "OverallRank": 1,
      "Medal": "🥇"
    }
  ],
  "count": 1
}
```

#### Get Team Leaderboard
```http
GET /leaderboard/teams
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "Team": "U12 Eagles",
      "Program": "Soccer",
      "TotalStudents": 15,
      "TotalCards": 300,
      "TotalNet": 3000.00,
      "AvgPerStudent": 200.00
    }
  ],
  "count": 1
}
```

#### Get Team-Specific Leaderboard
```http
GET /leaderboard/team/:teamName
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "StudentID": "STU-001",
      "FirstName": "John",
      "LastName": "Doe",
      "Team": "U12 Eagles",
      "CardsSold": 50,
      "NetRaised": 500.00,
      "TeamRank": 1
    }
  ],
  "count": 1
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

---

## Rate Limiting

- **Default**: 100 requests per 15 minutes per IP
- **Auth endpoints**: 5 requests per 15 minutes per IP

When rate limit is exceeded:
```json
{
  "success": false,
  "error": "Too many requests from this IP, please try again later."
}
```

---

## Referral Stages & Points

| Stage | Points |
|-------|--------|
| Contacted | 10 |
| Interested | 25 |
| Meeting Scheduled | 50 |
| Signed Up | 100 |

---

## Order Statuses

- `Paid` - Payment received
- `Pending` - Payment pending
- `Refunded` - Order refunded
- `Cancelled` - Order cancelled

---

## Example: Complete Authentication Flow

```javascript
// 1. Send magic link
const response1 = await fetch('http://localhost:3001/api/v1/auth/magic-link', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'parent@example.com' })
});

// 2. User clicks link in email with token parameter
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

// 3. Verify token and get JWT
const response2 = await fetch('http://localhost:3001/api/v1/auth/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token })
});

const { token: jwtToken, user } = await response2.json();

// 4. Use JWT for authenticated requests
const response3 = await fetch('http://localhost:3001/api/v1/students', {
  headers: {
    'Authorization': `Bearer ${jwtToken}`
  }
});
```

---

## Testing with cURL

```bash
# Send magic link
curl -X POST http://localhost:3001/api/v1/auth/magic-link \
  -H "Content-Type: application/json" \
  -d '{"email":"parent@example.com"}'

# Get all students
curl http://localhost:3001/api/v1/students

# Add new order
curl -X POST http://localhost:3001/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "BuyerName": "Test Buyer",
    "BuyerEmail": "buyer@example.com",
    "BuyerPhone": "555-1234",
    "Quantity": 5,
    "TotalPaid": 50.00,
    "StudentID": "STU-001"
  }'
```

---

## Support

For questions or issues, refer to:
- [Google Sheets Service Guide](../../GOOGLE_SHEETS_SERVICE_GUIDE.md)
- [Migration Plan](../../MIGRATION_PLAN.md)
