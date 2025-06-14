# OpenForms API Documentation

A comprehensive REST API for form building, management, and response collection.

## Base URL
```
https://your-domain.com/api
```

## Authentication
All protected endpoints require session-based authentication. Login via `/api/auth/login` to establish a session.

---

## Core Form Management

### Create Form
```http
POST /api/forms
Authorization: Required
Content-Type: application/json

{
  "title": "Contact Form",
  "description": "Get in touch with us",
  "fields": [],
  "rows": [],
  "themeColor": "#3b82f6"
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Contact Form",
  "description": "Get in touch with us",
  "fields": [],
  "rows": [],
  "themeColor": "#3b82f6",
  "shareId": "form_123_abc",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### Get All Forms
```http
GET /api/forms
Authorization: Required
```

### Get Form by ID
```http
GET /api/forms/{id}
```

### Get Form by Share ID
```http
GET /api/forms/share/{shareId}
```

### Update Form
```http
PUT /api/forms/{id}
Authorization: Required
Content-Type: application/json

{
  "title": "Updated Form Title",
  "description": "Updated description"
}
```

### Delete Form
```http
DELETE /api/forms/{id}
Authorization: Required
```

---

## Field Management

### Add Field to Form
```http
POST /api/forms/{id}/fields
Authorization: Required
Content-Type: application/json

{
  "id": "field_unique_id",
  "type": "text",
  "label": "Full Name",
  "placeholder": "Enter your full name",
  "required": true,
  "rowId": "row_id",
  "columnIndex": 0,
  "width": 1
}
```

**Field Types:**
- `text`, `email`, `number`, `phone`, `date`, `time`
- `textarea`, `select`, `radio`, `checkbox`
- `rating`, `file`, `address`, `range`, `toggle`

### Update Field
```http
PUT /api/forms/{id}/fields/{fieldId}
Authorization: Required
Content-Type: application/json

{
  "label": "Updated Field Label",
  "required": false
}
```

### Delete Field
```http
DELETE /api/forms/{id}/fields/{fieldId}
Authorization: Required
```

---

## Row Management

### Add Row to Form
```http
POST /api/forms/{id}/rows
Authorization: Required
Content-Type: application/json

{
  "id": "row_unique_id",
  "columns": 2,
  "order": 0
}
```

### Delete Row
```http
DELETE /api/forms/{id}/rows/{rowId}
Authorization: Required
```

---

## Form Responses

### Submit Form Response
```http
POST /api/forms/{id}/responses
Content-Type: application/json

{
  "responses": {
    "field_id_1": "John Doe",
    "field_id_2": "john@example.com",
    "field_id_3": ["Option 1", "Option 3"]
  }
}
```

### Get Form Responses
```http
GET /api/forms/{id}/responses
Authorization: Required
```

### Get All Responses
```http
GET /api/responses
Authorization: Required
```

### Get Response Statistics
```http
GET /api/responses/stats
Authorization: Required
```

**Response:**
```json
{
  "totalResponses": 150,
  "todayResponses": 5,
  "completionRate": 87,
  "averageTime": "2:34"
}
```

---

## Advanced Features

### Duplicate Form
```http
POST /api/forms/{id}/duplicate
Authorization: Required
```

### Form Validation
```http
POST /api/forms/{id}/validate
Content-Type: application/json

{
  "responses": {
    "field_id_1": "value1",
    "field_id_2": "value2"
  }
}
```

**Response:**
```json
{
  "isValid": false,
  "errors": {
    "field_id_1": "This field is required",
    "field_id_2": "Please enter a valid email address"
  }
}
```

### Form Analytics
```http
GET /api/forms/{id}/analytics
Authorization: Required
```

**Response:**
```json
{
  "totalResponses": 50,
  "todayResponses": 3,
  "weeklyResponses": 15,
  "averageCompletionTime": "2:45",
  "fieldAnalytics": [
    {
      "fieldId": "field_1",
      "fieldLabel": "Name",
      "responseCount": 48,
      "completionRate": 96
    }
  ],
  "responsesByDay": {
    "2024-01-01": 5,
    "2024-01-02": 3
  }
}
```

---

## Export & Import

### Export Form as JSON
```http
GET /api/forms/{id}/export
Authorization: Required
```

Downloads a JSON file containing the complete form structure.

### Import Form from JSON
```http
POST /api/forms/import
Authorization: Required
Content-Type: application/json

{
  "title": "Imported Form",
  "description": "Form imported from JSON",
  "fields": [...],
  "rows": [...],
  "themeColor": "#3b82f6"
}
```

### Export Responses as CSV
```http
GET /api/responses/export/csv
Authorization: Required
```

### Export Form-Specific Responses as CSV
```http
GET /api/forms/{id}/responses/export/csv
Authorization: Required
```

---

## Templates

### Get All Templates
```http
GET /api/templates?category=contact
```

**Response:**
```json
{
  "templates": [...],
  "categories": [
    {
      "id": "contact",
      "name": "Contact Forms",
      "description": "Contact forms, feedback, and inquiry templates"
    }
  ]
}
```

### Create Template from Form
```http
POST /api/forms/{id}/template
Authorization: Required
Content-Type: application/json

{
  "category": "custom"
}
```

### Create Form from Template
```http
POST /api/templates/{id}/create-form
Authorization: Required
Content-Type: application/json

{
  "title": "New Form from Template",
  "description": "Custom description"
}
```

---

## User Management

### Get User Forms
```http
GET /api/user/forms?page=1&limit=10&search=contact
Authorization: Required
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search term
- `status`: Filter by status

**Response:**
```json
{
  "forms": [
    {
      "id": 1,
      "title": "Contact Form",
      "responseCount": 25,
      "lastResponse": "2024-01-01T12:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

### Get User Statistics
```http
GET /api/user/stats
Authorization: Required
```

**Response:**
```json
{
  "totalForms": 12,
  "totalResponses": 340,
  "responsesThisMonth": 45,
  "responsesThisWeek": 12,
  "averageResponsesPerForm": 28,
  "topPerformingForms": [
    {
      "id": 1,
      "title": "Contact Form",
      "responseCount": 150
    }
  ],
  "responsesByDay": {
    "2024-01-01": 5,
    "2024-01-02": 3
  }
}
```

---

## Search & Filtering

### Search Forms
```http
GET /api/forms/search?q=contact&sortBy=title&order=asc
Authorization: Required
```

**Query Parameters:**
- `q`: Search query
- `category`: Filter by category
- `status`: Filter by status
- `sortBy`: Sort field (title, created, updated)
- `order`: Sort order (asc, desc)

---

## Bulk Operations

### Bulk Delete Forms
```http
POST /api/forms/bulk/delete
Authorization: Required
Content-Type: application/json

{
  "formIds": [1, 2, 3]
}
```

**Response:**
```json
{
  "results": [
    { "formId": 1, "success": true },
    { "formId": 2, "success": true },
    { "formId": 3, "success": false, "error": "Form not found" }
  ]
}
```

---

## Webhooks

### Configure Webhook
```http
POST /api/forms/{id}/webhook
Authorization: Required
Content-Type: application/json

{
  "url": "https://your-app.com/webhook",
  "events": ["submission", "update", "delete"]
}
```

**Response:**
```json
{
  "formId": 1,
  "url": "https://your-app.com/webhook",
  "events": ["submission", "update", "delete"],
  "active": true,
  "secret": "webhook_secret_key"
}
```

### Test Webhook
```http
POST /api/forms/{id}/webhook/test
Authorization: Required
Content-Type: application/json

{
  "url": "https://your-app.com/webhook"
}
```

---

## Sharing & Collaboration

### Update Sharing Settings
```http
PUT /api/forms/{id}/sharing
Authorization: Required
Content-Type: application/json

{
  "isPublic": true,
  "allowAnonymous": true,
  "requirePassword": false,
  "password": null
}
```

### Regenerate Share ID
```http
POST /api/forms/{id}/regenerate-share-id
Authorization: Required
```

**Response:**
```json
{
  "shareId": "form_new_share_id",
  "shareUrl": "https://your-domain.com/form/form_new_share_id"
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `500`: Internal Server Error

---

## Rate Limiting

API requests are limited to:
- 1000 requests per hour for authenticated users
- 100 requests per hour for anonymous users

---

## Field Schema

### Complete Field Object
```json
{
  "id": "field_unique_id",
  "type": "text",
  "label": "Field Label",
  "placeholder": "Enter value...",
  "required": true,
  "rowId": "row_id",
  "columnIndex": 0,
  "width": 1,
  "options": ["Option 1", "Option 2"],
  "validation": {
    "minLength": 3,
    "maxLength": 100,
    "pattern": "regex_pattern"
  }
}
```

### Field Types with Specific Properties

**Select/Radio/Checkbox:**
```json
{
  "type": "select",
  "options": ["Option 1", "Option 2", "Option 3"]
}
```

**Number/Range:**
```json
{
  "type": "number",
  "min": 0,
  "max": 100,
  "step": 1
}
```

**File Upload:**
```json
{
  "type": "file",
  "accept": "image/*",
  "maxSize": "5MB",
  "multiple": false
}
```

---

## Webhook Payload Examples

### Form Submission
```json
{
  "event": "submission",
  "formId": 1,
  "responseId": 123,
  "timestamp": "2024-01-01T12:00:00Z",
  "data": {
    "responses": {
      "field_1": "John Doe",
      "field_2": "john@example.com"
    },
    "metadata": {
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0..."
    }
  }
}
```

### Form Update
```json
{
  "event": "update",
  "formId": 1,
  "timestamp": "2024-01-01T12:00:00Z",
  "data": {
    "changes": {
      "title": "New Form Title",
      "fields": [...]
    }
  }
}
```

---

## SDK Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

const client = axios.create({
  baseURL: 'https://your-domain.com/api',
  withCredentials: true
});

// Create a form
const form = await client.post('/forms', {
  title: 'My New Form',
  fields: [
    {
      type: 'text',
      label: 'Name',
      required: true
    }
  ]
});

// Submit a response
await client.post(`/forms/${form.data.id}/responses`, {
  responses: {
    'field_id': 'John Doe'
  }
});
```

### Python
```python
import requests

session = requests.Session()
base_url = 'https://your-domain.com/api'

# Create a form
form_data = {
    'title': 'My New Form',
    'fields': [
        {
            'type': 'text',
            'label': 'Name',
            'required': True
        }
    ]
}

response = session.post(f'{base_url}/forms', json=form_data)
form = response.json()

# Submit a response
response_data = {
    'responses': {
        'field_id': 'John Doe'
    }
}

session.post(f'{base_url}/forms/{form["id"]}/responses', json=response_data)
```

---

This API provides complete programmatic access to all form builder functionality, enabling developers to create custom integrations, automate form management, and build advanced workflows around form data collection.