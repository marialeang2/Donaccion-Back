# API Documentation

This document describes all endpoints available in the system, including authentication requirements, expected request/response formats, and examples.

## Table of Contents

- [Authentication](#authentication)
- [Users](#users)
- [Foundations](#foundations)
- [Donations](#donations)
- [Social Actions / Opportunities](#social-actions--opportunities)
- [Comments](#comments)
- [Ratings](#ratings)
- [Participation Requests](#participation-requests)
- [Certificates](#certificates)
- [Notifications](#notifications)
- [Suggestions](#suggestions)
- [File Upload](#file-upload)
- [Reports](#reports)

## Authentication

Most endpoints in this API require authentication via JSON Web Token (JWT). Endpoints marked with 🔒 require a valid JWT token in the `Authorization` header.

```
Authorization: Bearer <token>
```

### Login

```http
POST /auth/login
```

Request Body:

```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

Response:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-generado",
    "name": "Nombre del Usuario",
    "email": "usuario@ejemplo.com",
    "user_type": "user",
    "created_at": "2023-05-05T00:00:00.000Z"
  }
}
```

Example:

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "contraseña123"
  }'
```

### Register

```http
POST /register
```

Request Body:

```json
{
  "name": "Nombre del Usuario",
  "email": "usuario@ejemplo.com",
  "password": "contraseña123",
  "user_type": "user" // "user" or "foundation"
}
```

Response:

```json
{
  "id": "uuid-generado",
  "name": "Nombre del Usuario",
  "email": "usuario@ejemplo.com",
  "user_type": "user",
  "created_at": "2023-05-05T00:00:00.000Z"
}
```

Example:

```bash
curl -X POST http://localhost:3001/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nombre del Usuario",
    "email": "usuario@ejemplo.com",
    "password": "contraseña123",
    "user_type": "user"
  }'
```

## Users

### Create User

```http
POST /api/users
```

Request Body:

```json
{
  "name": "Nombre del Usuario",
  "email": "usuario@ejemplo.com",
  "password": "contraseña123",
  "user_type": "user" // "user" or "foundation"
}
```

Response:

```json
{
  "id": "uuid-generado",
  "name": "Nombre del Usuario",
  "email": "usuario@ejemplo.com",
  "user_type": "user",
  "created_at": "2023-05-05T00:00:00.000Z"
}
```

Example:

```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nombre del Usuario",
    "email": "usuario@ejemplo.com",
    "password": "contraseña123",
    "user_type": "user"
  }'
```

### Get User Profile

🔒 Requires Authentication

```http
GET /api/users/:id
```

Response:

```json
{
  "id": "uuid-del-usuario",
  "name": "Nombre del Usuario",
  "email": "usuario@ejemplo.com",
  "user_type": "user",
  "created_at": "2023-05-05T00:00:00.000Z"
}
```

Example:

```bash
curl -X GET http://localhost:3001/api/users/uuid-del-usuario \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Get All Users

🔒 Requires Authentication

```http
GET /api/users
```

Response:

```json
[
  {
    "id": "uuid-usuario-1",
    "name": "Usuario 1",
    "email": "usuario1@ejemplo.com",
    "user_type": "user",
    "created_at": "2023-05-05T00:00:00.000Z"
  },
  {
    "id": "uuid-usuario-2",
    "name": "Usuario 2",
    "email": "usuario2@ejemplo.com",
    "user_type": "foundation",
    "created_at": "2023-05-06T00:00:00.000Z"
  }
]
```

Example:

```bash
curl -X GET http://localhost:3001/api/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Update User

🔒 Requires Authentication

```http
PATCH /api/users/:id
```

Request Body (all fields optional):

```json
{
  "name": "Nuevo Nombre",
  "email": "nuevo@ejemplo.com",
  "password": "nueva_contraseña"
}
```

Response:

```json
{
  "id": "uuid-del-usuario",
  "name": "Nuevo Nombre",
  "email": "nuevo@ejemplo.com",
  "user_type": "user",
  "created_at": "2023-05-05T00:00:00.000Z",
  "updated_at": "2023-05-10T00:00:00.000Z"
}
```

Example:

```bash
curl -X PATCH http://localhost:3001/api/users/uuid-del-usuario \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "name": "Nuevo Nombre"
  }'
```

### Delete User

🔒 Requires Authentication

```http
DELETE /api/users/:id
```

Response:

```json
{
  "message": "User deleted successfully"
}
```

Example:

```bash
curl -X DELETE http://localhost:3001/api/users/uuid-del-usuario \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Favorites

#### Get User Favorites

🔒 Requires Authentication

```http
GET /api/users/:id/favorites
```

Response:

```json
[
  {
    "id": "uuid-de-favorito",
    "user_id": "uuid-del-usuario",
    "item_id": "uuid-de-la-fundacion",
    "item_type": "foundation",
    "created_at": "2023-05-15T00:00:00.000Z"
  },
  {
    "id": "uuid-de-otro-favorito",
    "user_id": "uuid-del-usuario",
    "item_id": "uuid-de-la-oportunidad",
    "item_type": "opportunity",
    "created_at": "2023-05-16T00:00:00.000Z"
  }
]
```

Example:

```bash
curl -X GET http://localhost:3001/api/users/uuid-del-usuario/favorites \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Add to Favorites

🔒 Requires Authentication

```http
POST /api/users/:id/favorites
```

Request Body:

```json
{
  "item_id": "uuid-of-foundation-or-opportunity",
  "item_type": "foundation" // "foundation" or "opportunity"
}
```

Response:

```json
{
  "id": "uuid-de-favorito",
  "user_id": "uuid-del-usuario",
  "item_id": "uuid-of-foundation-or-opportunity",
  "item_type": "foundation",
  "created_at": "2023-05-15T00:00:00.000Z"
}
```

Example:

```bash
curl -X POST http://localhost:3001/api/users/uuid-del-usuario/favorites \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "item_id": "uuid-of-foundation-or-opportunity",
    "item_type": "foundation"
  }'
```

#### Remove from Favorites

🔒 Requires Authentication

```http
DELETE /api/users/:id/favorites/:itemId
```

Response:

```json
{
  "message": "Item removed from favorites"
}
```

Example:

```bash
curl -X DELETE http://localhost:3001/api/users/uuid-del-usuario/favorites/uuid-of-foundation-or-opportunity \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Foundations

### Create Foundation

🔒 Requires Authentication

```http
POST /api/foundations
```

Request Body:

```json
{
  "user_id": "uuid-del-usuario",
  "legal_name": "Fundación Ejemplo Oficial",
  "address": "Calle Principal #123",
  "phone": "123456789",
  "website": "https://fundacion-ejemplo.com"
}
```

Response:

```json
{
  "id": "uuid-generado",
  "user_id": "uuid-del-usuario",
  "legal_name": "Fundación Ejemplo Oficial",
  "address": "Calle Principal #123",
  "phone": "123456789",
  "website": "https://fundacion-ejemplo.com",
  "created_at": "2023-05-10T00:00:00.000Z"
}
```

Example:

```bash
curl -X POST http://localhost:3001/api/foundations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "user_id": "uuid-del-usuario",
    "legal_name": "Fundación Ejemplo Oficial",
    "address": "Calle Principal #123",
    "phone": "123456789",
    "website": "https://fundacion-ejemplo.com"
  }'
```

### Get All Foundations

```http
GET /api/foundations
```

Response:

```json
[
  {
    "id": "uuid-fundacion-1",
    "user_id": "uuid-usuario-1",
    "legal_name": "Fundación Ejemplo 1",
    "address": "Calle 1 #123",
    "phone": "123456789",
    "website": "https://fundacion1.com",
    "created_at": "2023-05-10T00:00:00.000Z"
  },
  {
    "id": "uuid-fundacion-2",
    "user_id": "uuid-usuario-2",
    "legal_name": "Fundación Ejemplo 2",
    "address": "Calle 2 #456",
    "phone": "987654321",
    "website": "https://fundacion2.com",
    "created_at": "2023-05-11T00:00:00.000Z"
  }
]
```

Example:

```bash
curl -X GET http://localhost:3001/api/foundations
```

### Get Foundation by ID

```http
GET /api/foundations/:id
```

Response:

```json
{
  "id": "uuid-fundacion",
  "user_id": "uuid-usuario",
  "legal_name": "Fundación Ejemplo",
  "address": "Calle Principal #123",
  "phone": "123456789",
  "website": "https://fundacion-ejemplo.com",
  "created_at": "2023-05-10T00:00:00.000Z"
}
```

Example:

```bash
curl -X GET http://localhost:3001/api/foundations/uuid-fundacion
```

### Get Foundation by User ID

```http
GET /api/foundations/user/:userId
```

Response:

```json
{
  "id": "uuid-fundacion",
  "user_id": "uuid-usuario",
  "legal_name": "Fundación Ejemplo",
  "address": "Calle Principal #123",
  "phone": "123456789",
  "website": "https://fundacion-ejemplo.com",
  "created_at": "2023-05-10T00:00:00.000Z"
}
```

Example:

```bash
curl -X GET http://localhost:3001/api/foundations/user/uuid-usuario
```

### Update Foundation

🔒 Requires Authentication

```http
PATCH /api/foundations/:id
```

Request Body (all fields optional):

```json
{
  "legal_name": "Nuevo Nombre de Fundación",
  "address": "Nueva Dirección #456",
  "phone": "987654321",
  "website": "https://nueva-fundacion.com"
}
```

Response:

```json
{
  "id": "uuid-fundacion",
  "user_id": "uuid-usuario",
  "legal_name": "Nuevo Nombre de Fundación",
  "address": "Nueva Dirección #456",
  "phone": "987654321",
  "website": "https://nueva-fundacion.com",
  "created_at": "2023-05-10T00:00:00.000Z",
  "updated_at": "2023-05-15T00:00:00.000Z"
}
```

Example:

```bash
curl -X PATCH http://localhost:3001/api/foundations/uuid-fundacion \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "website": "https://nueva-fundacion.com"
  }'
```

### Delete Foundation

🔒 Requires Authentication

```http
DELETE /api/foundations/:id
```

Response:

```json
{
  "message": "Foundation deleted successfully"
}
```

Example:

```bash
curl -X DELETE http://localhost:3001/api/foundations/uuid-fundacion \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Donations

### Create Donation

🔒 Requires Authentication

```http
POST /api/donations
```

Request Body:

```json
{
  "user_id": "uuid-del-usuario",
  "foundation_id": "uuid-de-la-fundacion",
  "amount": 100.5
}
```

Response:

```json
{
  "id": "uuid-generado",
  "user_id": "uuid-del-usuario",
  "foundation_id": "uuid-de-la-fundacion",
  "amount": 100.5,
  "created_at": "2023-05-20T00:00:00.000Z"
}
```

Example:

```bash
curl -X POST http://localhost:3001/api/donations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "user_id": "uuid-del-usuario",
    "foundation_id": "uuid-de-la-fundacion",
    "amount": 100.5
  }'
```

### Get All Donations

🔒 Requires Authentication

```http
GET /api/donations
```

Response:

```json
[
  {
    "id": "uuid-donacion-1",
    "user_id": "uuid-usuario-1",
    "foundation_id": "uuid-fundacion-1",
    "amount": 100.5,
    "created_at": "2023-05-20T00:00:00.000Z"
  },
  {
    "id": "uuid-donacion-2",
    "user_id": "uuid-usuario-2",
    "foundation_id": "uuid-fundacion-1",
    "amount": 200.75,
    "created_at": "2023-05-21T00:00:00.000Z"
  }
]
```

Example:

```bash
curl -X GET http://localhost:3001/api/donations \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Get Donation by ID

🔒 Requires Authentication

```http
GET /api/donations/:id
```

Response:

```json
{
  "id": "uuid-donacion",
  "user_id": "uuid-usuario",
  "foundation_id": "uuid-fundacion",
  "amount": 100.5,
  "created_at": "2023-05-20T00:00:00.000Z"
}
```

Example:

```bash
curl -X GET http://localhost:3001/api/donations/uuid-donacion \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Get Donations by User

🔒 Requires Authentication

```http
GET /api/donations/user/:userId
```

Response:

```json
[
  {
    "id": "uuid-donacion-1",
    "user_id": "uuid-usuario",
    "foundation_id": "uuid-fundacion-1",
    "amount": 100.5,
    "created_at": "2023-05-20T00:00:00.000Z"
  },
  {
    "id": "uuid-donacion-2",
    "user_id": "uuid-usuario",
    "foundation_id": "uuid-fundacion-2",
    "amount": 50.25,
    "created_at": "2023-05-22T00:00:00.000Z"
  }
]
```

Example:

```bash
curl -X GET http://localhost:3001/api/donations/user/uuid-usuario \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Get Donations by Foundation

🔒 Requires Authentication

```http
GET /api/donations/foundation/:foundationId
```

Response:

```json
[
  {
    "id": "uuid-donacion-1",
    "user_id": "uuid-usuario-1",
    "foundation_id": "uuid-fundacion",
    "amount": 100.5,
    "created_at": "2023-05-20T00:00:00.000Z"
  },
  {
    "id": "uuid-donacion-2",
    "user_id": "uuid-usuario-2",
    "foundation_id": "uuid-fundacion",
    "amount": 200.75,
    "created_at": "2023-05-21T00:00:00.000Z"
  }
]
```

Example:

```bash
curl -X GET http://localhost:3001/api/donations/foundation/uuid-fundacion \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Update Donation

🔒 Requires Authentication

```http
PATCH /api/donations/:id
```

Request Body:

```json
{
  "amount": 150.75
}
```

Response:

```json
{
  "id": "uuid-donacion",
  "user_id": "uuid-usuario",
  "foundation_id": "uuid-fundacion",
  "amount": 150.75,
  "created_at": "2023-05-20T00:00:00.000Z",
  "updated_at": "2023-05-25T00:00:00.000Z"
}
```

Example:

```bash
curl -X PATCH http://localhost:3001/api/donations/uuid-donacion \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "amount": 150.75
  }'
```

### Delete Donation

🔒 Requires Authentication

```http
DELETE /api/donations/:id
```

Response:

```json
{
  "message": "Donation deleted successfully"
}
```

Example:

```bash
curl -X DELETE http://localhost:3001/api/donations/uuid-donacion \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Social Actions / Opportunities

Social actions can be accessed through two equivalent sets of endpoints: `/api/social-actions` and `/api/opportunities`.

### Create Social Action

🔒 Requires Authentication

```http
POST /api/social-actions
```

or

```http
POST /api/opportunities
```

Request Body:

```json
{
  "foundation_id": "uuid-de-la-fundacion",
  "description": "Descripción de la acción social",
  "start_date": "2023-06-01T10:00:00Z",
  "end_date": "2023-06-05T18:00:00Z"
}
```

Response:

```json
{
  "id": "uuid-generado",
  "foundation_id": "uuid-de-la-fundacion",
  "description": "Descripción de la acción social",
  "start_date": "2023-06-01T10:00:00Z",
  "end_date": "2023-06-05T18:00:00Z",
  "created_at": "2023-05-25T00:00:00.000Z"
}
```

Example:

```bash
curl -X POST http://localhost:3001/api/social-actions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "foundation_id": "uuid-de-la-fundacion",
    "description": "Descripción de la acción social",
    "start_date": "2023-06-01T10:00:00Z",
    "end_date": "2023-06-05T18:00:00Z"
  }'
```

### Get All Social Actions

```http
GET /api/social-actions
```

or

```http
GET /api/opportunities
```

Response:

```json
[
  {
    "id": "uuid-accion-1",
    "foundation_id": "uuid-fundacion-1",
    "description": "Descripción de la acción social 1",
    "start_date": "2023-06-01T10:00:00Z",
    "end_date": "2023-06-05T18:00:00Z",
    "created_at": "2023-05-25T00:00:00.000Z"
  },
  {
    "id": "uuid-accion-2",
    "foundation_id": "uuid-fundacion-2",
    "description": "Descripción de la acción social 2",
    "start_date": "2023-06-10T09:00:00Z",
    "end_date": "2023-06-12T17:00:00Z",
    "created_at": "2023-05-26T00:00:00.000Z"
  }
]
```

Example:

```bash
curl -X GET http://localhost:3001/api/social-actions
```

### Get Social Action by ID

```http
GET /api/social-actions/:id
```

or

```http
GET /api/opportunities/:id
```

Response:

```json
{
  "id": "uuid-accion",
  "foundation_id": "uuid-fundacion",
  "description": "Descripción de la acción social",
  "start_date": "2023-06-01T10:00:00Z",
  "end_date": "2023-06-05T18:00:00Z",
  "created_at": "2023-05-25T00:00:00.000Z"
}
```

Example:

```bash
curl -X GET http://localhost:3001/api/social-actions/uuid-accion
```

### Get Social Actions by Foundation

```http
GET /api/social-actions/foundation/:foundationId
```

or

```http
GET /api/opportunities/foundation/:foundationId
```

Response:

```json
[
  {
    "id": "uuid-accion-1",
    "foundation_id": "uuid-fundacion",
    "description": "Descripción de la acción social 1",
    "start_date": "2023-06-01T10:00:00Z",
    "end_date": "2023-06-05T18:00:00Z",
    "created_at": "2023-05-25T00:00:00.000Z"
  },
  {
    "id": "uuid-accion-2",
    "foundation_id": "uuid-fundacion",
    "description": "Descripción de la acción social 2",
    "start_date": "2023-06-10T09:00:00Z",
    "end_date": "2023-06-12T17:00:00Z",
    "created_at": "2023-05-26T00:00:00.000Z"
  }
]
```

Example:

```bash
curl -X GET http://localhost:3001/api/social-actions/foundation/uuid-fundacion
```

### Get Upcoming Social Actions

```http
GET /api/social-actions/upcoming
```

or

```http
GET /api/opportunities/upcoming
```

Response:

```json
[
  {
    "id": "uuid-accion-1",
    "foundation_id": "uuid-fundacion-1",
    "description": "Descripción de la acción social 1",
    "start_date": "2023-06-01T10:00:00Z",
    "end_date": "2023-06-05T18:00:00Z",
    "created_at": "2023-05-25T00:00:00.000Z"
  },
  {
    "id": "uuid-accion-2",
    "foundation_id": "uuid-fundacion-2",
    "description": "Descripción de la acción social 2",
    "start_date": "2023-06-10T09:00:00Z",
    "end_date": "2023-06-12T17:00:00Z",
    "created_at": "2023-05-26T00:00:00.000Z"
  }
]
```

Example:

```bash
curl -X GET http://localhost:3001/api/social-actions/upcoming
```

### Get Active Social Actions

```http
GET /api/social-actions/active
```

or

```http
GET /api/opportunities/active
```

Response:

```json
[
  {
    "id": "uuid-accion-1",
    "foundation_id": "uuid-fundacion-1",
    "description": "Descripción de la acción social 1",
    "start_date": "2023-05-20T10:00:00Z",
    "end_date": "2023-06-05T18:00:00Z",
    "created_at": "2023-05-15T00:00:00.000Z"
  }
]
```

Example:

```bash
curl -X GET http://localhost:3001/api/social-actions/active
```

### Update Social Action

🔒 Requires Authentication

```http
PUT /api/social-actions/:id
```

or

```http
PUT /api/opportunities/:id
```

Request Body (all fields optional):

```json
{
  "description": "Nueva descripción de la acción social",
  "start_date": "2023-06-02T11:00:00Z",
  "end_date": "2023-06-06T16:00:00Z"
}
```

Response:

```json
{
  "id": "uuid-accion",
  "foundation_id": "uuid-fundacion",
  "description": "Nueva descripción de la acción social",
  "start_date": "2023-06-02T11:00:00Z",
  "end_date": "2023-06-06T16:00:00Z",
  "created_at": "2023-05-25T00:00:00.000Z",
  "updated_at": "2023-05-28T00:00:00.000Z"
}
```

Example:

```bash
curl -X PUT http://localhost:3001/api/social-actions/uuid-accion \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "description": "Nueva descripción de la acción social",
    "start_date": "2023-06-02T11:00:00Z",
    "end_date": "2023-06-06T16:00:00Z"
  }'
```

### Delete Social Action

🔒 Requires Authentication

```http
DELETE /api/social-actions/:id
```

or

```http
DELETE /api/opportunities/:id
```

Response:

```json
{
  "message": "Social action deleted successfully"
}
```

Example:

```bash
curl -X DELETE http://localhost:3001/api/social-actions/uuid-accion \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Apply to Social Action

🔒 Requires Authentication

```http
POST /api/social-actions/:id/apply
```

or

```http
POST /api/opportunities/:id/apply
```

Request Body (optional):

```json
{
  "message": "I would like to participate in this activity"
}
```

Response:

```json
{
  "id": "uuid-solicitud",
  "user_id": "uuid-usuario",
  "social_action_id": "uuid-accion",
  "status": "pending",
  "message": "I would like to participate in this activity",
  "created_at": "2023-05-30T00:00:00.000Z"
}
```

Example:

```bash
curl -X POST http://localhost:3001/api/opportunities/uuid-accion/apply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "message": "I would like to participate in this activity"
  }'
```

## Comments

### Create Comment

🔒 Requires Authentication

```http
POST /api/comments
```

Request Body (for donation):

```json
{
  "user_id": "uuid-del-usuario",
  "donation_id": "uuid-de-la-donacion",
  "text": "Comentario sobre la donación"
}
```

Or for social action:

```json
{
  "user_id": "uuid-del-usuario",
  "social_action_id": "uuid-de-la-accion-social",
  "text": "Comentario sobre la acción social"
}
```

Response:

```json
{
  "id": "uuid-generado",
  "user_id": "uuid-del-usuario",
  "donation_id": "uuid-de-la-donacion",
  "social_action_id": null,
  "text": "Comentario sobre la donación",
  "created_at": "2023-06-01T00:00:00.000Z"
}
```

Example:

```bash
curl -X POST http://localhost:3001/api/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "user_id": "uuid-del-usuario",
    "donation_id": "uuid-de-la-donacion",
    "text": "Comentario sobre la donación"
  }'
```

### Get All Comments

🔒 Requires Authentication

```http
GET /api/comments
```

Response:

```json
[
  {
    "id": "uuid-comentario-1",
    "user_id": "uuid-usuario-1",
    "donation_id": "uuid-donacion-1",
    "social_action_id": null,
    "text": "Comentario sobre la donación 1",
    "created_at": "2023-06-01T00:00:00.000Z"
  },
  {
    "id": "uuid-comentario-2",
    "user_id": "uuid-usuario-2",
    "donation_id": null,
    "social_action_id": "uuid-accion-1",
    "text": "Comentario sobre la acción social 1",
    "created_at": "2023-06-02T00:00:00.000Z"
  }
]
```

Example:

```bash
curl -X GET http://localhost:3001/api/comments \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Get Comment by ID

```http
GET /api/comments/:id
```

Response:

```json
{
  "id": "uuid-comentario",
  "user_id": "uuid-usuario",
  "donation_id": "uuid-donacion",
  "social_action_id": null,
  "text": "Comentario sobre la donación",
  "created_at": "2023-06-01T00:00:00.000Z"
}
```

Example:

```bash
curl -X GET http://localhost:3001/api/comments/uuid-comentario
```

### Get Comments by User

🔒 Requires Authentication

```http
GET /api/comments/user/:userId
```

Response:

```json
[
  {
    "id": "uuid-comentario-1",
    "user_id": "uuid-usuario",
    "donation_id": "uuid-donacion-1",
    "social_action_id": null,
    "text": "Comentario sobre la donación 1",
    "created_at": "2023-06-01T00:00:00.000Z"
  },
  {
    "id": "uuid-comentario-2",
    "user_id": "uuid-usuario",
    "donation_id": null,
    "social_action_id": "uuid-accion-1",
    "text": "Comentario sobre la acción social 1",
    "created_at": "2023-06-02T00:00:00.000Z"
  }
]
```

Example:

```bash
curl -X GET http://localhost:3001/api/comments/user/uuid-usuario \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Get Comments by Donation

```http
GET /api/comments/donation/:donationId
```

Response:

```json
[
  {
    "id": "uuid-comentario-1",
    "user_id": "uuid-usuario-1",
    "donation_id": "uuid-donacion",
    "social_action_id": null,
    "text": "Comentario 1 sobre la donación",
    "created_at": "2023-06-01T00:00:00.000Z"
  },
  {
    "id": "uuid-comentario-2",
    "user_id": "uuid-usuario-2",
    "donation_id": "uuid-donacion",
    "social_action_id": null,
    "text": "Comentario 2 sobre la donación",
    "created_at": "2023-06-02T00:00:00.000Z"
  }
]
```

Example:

```bash
curl -X GET http://localhost:3001/api/comments/donation/uuid-donacion
```

### Get Comments by Social Action

```http
GET /api/comments/social-action/:socialActionId
```

Response:

```json
[
  {
    "id": "uuid-comentario-1",
    "user_id": "uuid-usuario-1",
    "donation_id": null,
    "social_action_id": "uuid-accion",
    "text": "Comentario 1 sobre la acción social",
    "created_at": "2023-06-01T00:00:00.000Z"
  },
  {
    "id": "uuid-comentario-2",
    "user_id": "uuid-usuario-2",
    "donation_id": null,
    "social_action_id": "uuid-accion",
    "text": "Comentario 2 sobre la acción social",
    "created_at": "2023-06-02T00:00:00.000Z"
  }
]
```

Example:

```bash
curl -X GET http://localhost:3001/api/comments/social-action/uuid-accion
```

### Get Comments by Opportunity

```http
GET /api/comments/opportunity/:opportunityId
```

Response:

(Same format as Get Comments by Social Action)

Example:

```bash
curl -X GET http://localhost:3001/api/comments/opportunity/uuid-accion
```

### Update Comment

🔒 Requires Authentication

```http
PATCH /api/comments/:id
```

Request Body:

```json
{
  "text": "Texto actualizado del comentario"
}
```

Response:

```json
{
  "id": "uuid-comentario",
  "user_id": "uuid-usuario",
  "donation_id": "uuid-donacion",
  "social_action_id": null,
  "text": "Texto actualizado del comentario",
  "created_at": "2023-06-01T00:00:00.000Z",
  "updated_at": "2023-06-03T00:00:00.000Z"
}
```

Example:

```bash
curl -X PATCH http://localhost:3001/api/comments/uuid-comentario \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "text": "Texto actualizado del comentario"
  }'
```

### Delete Comment

🔒 Requires Authentication

```http
DELETE /api/comments/:id
```

Response:

```json
{
  "message": "Comment deleted successfully"
}
```

Example:

```bash
curl -X DELETE http://localhost:3001/api/comments/uuid-comentario \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Crear Comentario para Fundación

🔒 Requiere Autenticación

```http
POST /api/foundation-detail/comment
```

Request Body:

```json
{
  "user_id": "uuid-del-usuario",
  "foundation_id": "uuid-de-la-fundacion",
  "text": "Comentario sobre la fundación"
}
```

Response:

```json
{
  "id": "uuid-generado",
  "user_id": "uuid-del-usuario",
  "foundation_id": "uuid-de-la-fundacion",
  "donation_id": null,
  "social_action_id": null,
  "text": "Comentario sobre la fundación",
  "created_at": "2023-06-01T00:00:00.000Z"
}
```

Example:

```bash
curl -X POST http://localhost:3001/api/foundation-detail/comment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "user_id": "uuid-del-usuario",
    "foundation_id": "uuid-de-la-fundacion",
    "text": "Comentario sobre la fundación"
  }'
```

### Obtener Comentarios por Fundación

```http
GET /api/comments/foundation/:foundationId
```

Response:

```json
[
  {
    "id": "uuid-comentario-1",
    "user_id": "uuid-usuario-1",
    "donation_id": null,
    "social_action_id": null,
    "foundation_id": "uuid-fundacion",
    "text": "Comentario 1 sobre la fundación",
    "created_at": "2023-06-01T00:00:00.000Z"
  },
  {
    "id": "uuid-comentario-2",
    "user_id": "uuid-usuario-2",
    "donation_id": null,
    "social_action_id": null,
    "foundation_id": "uuid-fundacion",
    "text": "Comentario 2 sobre la fundación",
    "created_at": "2023-06-02T00:00:00.000Z"
  }
]
```

Example:

```bash
curl -X GET http://localhost:3001/api/comments/foundation/uuid-fundacion
```

También puedes usar el endpoint general de comentarios para crear comentarios para fundaciones:

```bash
curl -X POST http://localhost:3001/api/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "user_id": "uuid-del-usuario",
    "foundation_id": "uuid-de-la-fundacion",
    "text": "Comentario sobre la fundación"
  }'
```

## Ratings

### Create Rating

🔒 Requires Authentication

```http
POST /api/ratings
```

Request Body (for donation):

```json
{
  "user_id": "uuid-del-usuario",
  "donation_id": "uuid-de-la-donacion",
  "rating": 5
}
```

Or for social action:

```json
{
  "user_id": "uuid-del-usuario",
  "social_action_id": "uuid-de-la-accion-social",
  "rating": 4
}
```

Response:

```json
{
  "id": "uuid-generado",
  "user_id": "uuid-del-usuario",
  "donation_id": "uuid-de-la-donacion",
  "social_action_id": null,
  "rating": 5,
  "created_at": "2023-06-05T00:00:00.000Z"
}
```

Example:

```bash
curl -X POST http://localhost:3001/api/ratings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "user_id": "uuid-del-usuario",
    "donation_id": "uuid-de-la-donacion",
    "rating": 5
  }'
```

### Get All Ratings

🔒 Requires Authentication

```http
GET /api/ratings
```

Response:

```json
[
  {
    "id": "uuid-rating-1",
    "user_id": "uuid-usuario-1",
    "donation_id": "uuid-donacion-1",
    "social_action_id": null,
    "rating": 5,
    "created_at": "2023-06-05T00:00:00.000Z"
  },
  {
    "id": "uuid-rating-2",
    "user_id": "uuid-usuario-2",
    "donation_id": null,
    "social_action_id": "uuid-accion-1",
    "rating": 4,
    "created_at": "2023-06-06T00:00:00.000Z"
  }
]
```

Example:

```bash
curl -X GET http://localhost:3001/api/ratings \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Get Rating by ID

🔒 Requires Authentication

```http
GET /api/ratings/:id
```

Response:

```json
{
  "id": "uuid-rating",
  "user_id": "uuid-usuario",
  "donation_id": "uuid-donacion",
  "social_action_id": null,
  "rating": 5,
  "created_at": "2023-06-05T00:00:00.000Z"
}
```

Example:

```bash
curl -X GET http://localhost:3001/api/ratings/uuid-rating \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Get Ratings by User

🔒 Requires Authentication

```http
GET /api/ratings/user/:userId
```

Response:

```json
[
  {
    "id": "uuid-rating-1",
    "user_id": "uuid-usuario",
    "donation_id": "uuid-donacion-1",
    "social_action_id": null,
    "rating": 5,
    "created_at": "2023-06-05T00:00:00.000Z"
  },
  {
    "id": "uuid-rating-2",
    "user_id": "uuid-usuario",
    "donation_id": null,
    "social_action_id": "uuid-accion-1",
    "rating": 4,
    "created_at": "2023-06-06T00:00:00.000Z"
  }
]
```

Example:

```bash
curl -X GET http://localhost:3001/api/ratings/user/uuid-usuario \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Get Ratings by Donation

```http
GET /api/ratings/donation/:donationId
```

Response:

```json
[
  {
    "id": "uuid-rating-1",
    "user_id": "uuid-usuario-1",
    "donation_id": "uuid-donacion",
    "social_action_id": null,
    "rating": 5,
    "created_at": "2023-06-05T00:00:00.000Z"
  },
  {
    "id": "uuid-rating-2",
    "user_id": "uuid-usuario-2",
    "donation_id": "uuid-donacion",
    "social_action_id": null,
    "rating": 4,
    "created_at": "2023-06-06T00:00:00.000Z"
  }
]
```

Example:

```bash
curl -X GET http://localhost:3001/api/ratings/donation/uuid-donacion
```

### Get Average Rating for Donation

```http
GET /api/ratings/donation/:donationId/average
```

Response:

```json
{
  "donation_id": "uuid-donacion",
  "average_rating": 4.5,
  "count": 2
}
```

Example:

```bash
curl -X GET http://localhost:3001/api/ratings/donation/uuid-donacion/average
```

### Get Ratings by Social Action

```http
GET /api/ratings/social-action/:socialActionId
```

Response:

```json
[
  {
    "id": "uuid-rating-1",
    "user_id": "uuid-usuario-1",
    "donation_id": null,
    "social_action_id": "uuid-accion",
    "rating": 5,
    "created_at": "2023-06-05T00:00:00.000Z"
  },
  {
    "id": "uuid-rating-2",
    "user_id": "uuid-usuario-2",
    "donation_id": null,
    "social_action_id": "uuid-accion",
    "rating": 3,
    "created_at": "2023-06-06T00:00:00.000Z"
  }
]
```

Example:

```bash
curl -X GET http://localhost:3001/api/ratings/social-action/uuid-accion
```

### Get Ratings by Opportunity

```http
GET /api/ratings/opportunity/:opportunityId
```

Response:

(Same format as Get Ratings by Social Action)

Example:

```bash
curl -X GET http://localhost:3001/api/ratings/opportunity/uuid-accion
```

### Get Average Rating for Social Action

```http
GET /api/ratings/social-action/:socialActionId/average
```

Response:

```json
{
  "social_action_id": "uuid-accion",
  "average_rating": 4,
  "count": 2
}
```

Example:

```bash
curl -X GET http://localhost:3001/api/ratings/social-action/uuid-accion/average
```

### Get Average Rating for Opportunity

```http
GET /api/ratings/opportunity/:opportunityId/average
```

Response:

(Same format as Get Average Rating for Social Action)

Example:

```bash
curl -X GET http://localhost:3001/api/ratings/opportunity/uuid-accion/average
```

### Update Rating

🔒 Requires Authentication

```http
PATCH /api/ratings/:id
```

Request Body:

```json
{
  "rating": 4
}
```

Response:

```json
{
  "id": "uuid-rating",
  "user_id": "uuid-usuario",
  "donation_id": "uuid-donacion",
  "social_action_id": null,
  "rating": 4,
  "created_at": "2023-06-05T00:00:00.000Z",
  "updated_at": "2023-06-07T00:00:00.000Z"
}
```

Example:

```bash
curl -X PATCH http://localhost:3001/api/ratings/uuid-rating \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "rating": 4
  }'
```

### Delete Rating

🔒 Requires Authentication

```http
DELETE /api/ratings/:id
```

Response:

```json
{
  "message": "Rating deleted successfully"
}
```

Example:

```bash
curl -X DELETE http://localhost:3001/api/ratings/uuid-rating \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Participation Requests

### Create Participation Request

🔒 Requires Authentication

```http
POST /api/participation-requests
```

Request Body:

```json
{
  "user_id": "uuid-del-usuario",
  "social_action_id": "uuid-de-la-accion-social"
}
```

Response:

```json
{
  "id": "uuid-generado",
  "user_id": "uuid-del-usuario",
  "social_action_id": "uuid-de-la-accion-social",
  "status": "pending",
  "created_at": "2023-06-10T00:00:00.000Z"
}
```

Example:

```bash
curl -X POST http://localhost:3001/api/participation-requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "user_id": "uuid-del-usuario",
    "social_action_id": "uuid-de-la-accion-social"
  }'
```

### Get All Participation Requests

🔒 Requires Authentication

```http
GET /api/participation-requests
```

Response:

```json
[
  {
    "id": "uuid-solicitud-1",
    "user_id": "uuid-usuario-1",
    "social_action_id": "uuid-accion-1",
    "status": "pending",
    "created_at": "2023-06-10T00:00:00.000Z"
  },
  {
    "id": "uuid-solicitud-2",
    "user_id": "uuid-usuario-2",
    "social_action_id": "uuid-accion-1",
    "status": "accepted",
    "created_at": "2023-06-11T00:00:00.000Z"
  }
]
```

Example:

```bash
curl -X GET http://localhost:3001/api/participation-requests \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Get Participation Request by ID

🔒 Requires Authentication

```http
GET /api/participation-requests/:id
```

Response:

```json
{
  "id": "uuid-solicitud",
  "user_id": "uuid-usuario",
  "social_action_id": "uuid-accion",
  "status": "pending",
  "created_at": "2023-06-10T00:00:00.000Z"
}
```

Example:

```bash
curl -X GET http://localhost:3001/api/participation-requests/uuid-solicitud \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Get Participation Requests by User

🔒 Requires Authentication

```http
GET /api/participation-requests/user/:userId
```

Response:

```json
[
  {
    "id": "uuid-solicitud-1",
    "user_id": "uuid-usuario",
    "social_action_id": "uuid-accion-1",
    "status": "pending",
    "created_at": "2023-06-10T00:00:00.000Z"
  },
  {
    "id": "uuid-solicitud-2",
    "user_id": "uuid-usuario",
    "social_action_id": "uuid-accion-2",
    "status": "accepted",
    "created_at": "2023-06-11T00:00:00.000Z"
  }
]
```

Example:

```bash
curl -X GET http://localhost:3001/api/participation-requests/user/uuid-usuario \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Get Participation Requests by Social Action

🔒 Requires Authentication

```http
GET /api/participation-requests/social-action/:socialActionId
```

Response:

```json
[
  {
    "id": "uuid-solicitud-1",
    "user_id": "uuid-usuario-1",
    "social_action_id": "uuid-accion",
    "status": "pending",
    "created_at": "2023-06-10T00:00:00.000Z"
  },
  {
    "id": "uuid-solicitud-2",
    "user_id": "uuid-usuario-2",
    "social_action_id": "uuid-accion",
    "status": "accepted",
    "created_at": "2023-06-11T00:00:00.000Z"
  }
]
```

Example:

```bash
curl -X GET http://localhost:3001/api/participation-requests/social-action/uuid-accion \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Get Applications by Opportunity

🔒 Requires Authentication

```http
GET /api/opportunities/:opportunityId/applications
```

Response:

(Same format as Get Participation Requests by Social Action)

Example:

```bash
curl -X GET http://localhost:3001/api/opportunities/uuid-accion/applications \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Get Pending Participation Requests by Social Action

🔒 Requires Authentication

```http
GET /api/participation-requests/social-action/:socialActionId/pending
```

Response:

```json
[
  {
    "id": "uuid-solicitud-1",
    "user_id": "uuid-usuario-1",
    "social_action_id": "uuid-accion",
    "status": "pending",
    "created_at": "2023-06-10T00:00:00.000Z"
  },
  {
    "id": "uuid-solicitud-2",
    "user_id": "uuid-usuario-2",
    "social_action_id": "uuid-accion",
    "status": "pending",
    "created_at": "2023-06-11T00:00:00.000Z"
  }
]
```

Example:

```bash
curl -X GET http://localhost:3001/api/participation-requests/social-action/uuid-accion/pending \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Get Pending Applications by Opportunity

🔒 Requires Authentication

```http
GET /api/opportunities/:opportunityId/pending-applications
```

Response:

(Same format as Get Pending Participation Requests by Social Action)

Example:

```bash
curl -X GET http://localhost:3001/api/opportunities/uuid-accion/pending-applications \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Update Participation Request (accept or reject)

🔒 Requires Authentication

```http
PATCH /api/participation-requests/:id
```

Request Body:

```json
{
  "status": "accepted" // "accepted", "rejected" or "pending"
}
```

Response:

```json
{
  "id": "uuid-solicitud",
  "user_id": "uuid-usuario",
  "social_action_id": "uuid-accion",
  "status": "accepted",
  "created_at": "2023-06-10T00:00:00.000Z",
  "updated_at": "2023-06-12T00:00:00.000Z"
}
```

Example:

```bash
curl -X PATCH http://localhost:3001/api/participation-requests/uuid-solicitud \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "status": "accepted"
  }'
```

### Delete Participation Request

🔒 Requires Authentication

```http
DELETE /api/participation-requests/:id
```

Response:

```json
{
  "message": "Participation request deleted successfully"
}
```

Example:

```bash
curl -X DELETE http://localhost:3001/api/participation-requests/uuid-solicitud \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Certificates

### Create Certificate

🔒 Requires Authentication (Foundation only)

```http
POST /api/certificates
```

Request Body:

```json
{
  "user_id": "uuid-del-usuario",
  "description": "Certificado de participación"
}
```

Response:

```json
{
  "id": "uuid-generado",
  "user_id": "uuid-del-usuario",
  "description": "Certificado de participación",
  "created_at": "2023-06-15T00:00:00.000Z"
}
```

Example:

```bash
curl -X POST http://localhost:3001/api/certificates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "user_id": "uuid-del-usuario",
    "description": "Certificado de participación"
  }'
```

### Get All Certificates

🔒 Requires Authentication (Foundation only)

```http
GET /api/certificates
```

Response:

```json
[
  {
    "id": "uuid-certificado-1",
    "user_id": "uuid-usuario-1",
    "description": "Certificado de participación 1",
    "created_at": "2023-06-15T00:00:00.000Z"
  },
  {
    "id": "uuid-certificado-2",
    "user_id": "uuid-usuario-2",
    "description": "Certificado de participación 2",
    "created_at": "2023-06-16T00:00:00.000Z"
  }
]
```

Example:

```bash
curl -X GET http://localhost:3001/api/certificates \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Get Certificate by ID

🔒 Requires Authentication

```http
GET /api/certificates/:id
```

Response:

```json
{
  "id": "uuid-certificado",
  "user_id": "uuid-usuario",
  "description": "Certificado de participación",
  "created_at": "2023-06-15T00:00:00.000Z"
}
```

Example:

```bash
curl -X GET http://localhost:3001/api/certificates/uuid-certificado \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Get Certificates by User

🔒 Requires Authentication

```http
GET /api/certificates/user/:userId
```

Response:

```json
[
  {
    "id": "uuid-certificado-1",
    "user_id": "uuid-usuario",
    "description": "Certificado de participación 1",
    "created_at": "2023-06-15T00:00:00.000Z"
  },
  {
    "id": "uuid-certificado-2",
    "user_id": "uuid-usuario",
    "description": "Certificado de participación 2",
    "created_at": "2023-06-16T00:00:00.000Z"
  }
]
```

Example:

```bash
curl -X GET http://localhost:3001/api/certificates/user/uuid-usuario \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Download Certificate

🔒 Requires Authentication

```http
GET /api/certificates/:id/download
```

Response:

(Binary PDF file)

Example:

```bash
curl -X GET http://localhost:3001/api/certificates/uuid-certificado/download \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  --output certificate.pdf
```

### Update Certificate

🔒 Requires Authentication (Foundation only)

```http
PATCH /api/certificates/:id
```

Request Body:

```json
{
  "description": "Certificado de participación actualizado"
}
```

Response:

```json
{
  "id": "uuid-certificado",
  "user_id": "uuid-usuario",
  "description": "Certificado de participación actualizado",
  "created_at": "2023-06-15T00:00:00.000Z",
  "updated_at": "2023-06-17T00:00:00.000Z"
}
```

Example:

```bash
curl -X PATCH http://localhost:3001/api/certificates/uuid-certificado \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "description": "Certificado de participación actualizado"
  }'
```

### Delete Certificate

🔒 Requires Authentication (Foundation only)

```http
DELETE /api/certificates/:id
```

Response:

```json
{
  "message": "Certificate deleted successfully"
}
```

Example:

```bash
curl -X DELETE http://localhost:3001/api/certificates/uuid-certificado \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Notifications

### Create Notification

🔒 Requires Authentication (Foundation only)

```http
POST /api/notifications
```

Request Body:

```json
{
  "user_id": "uuid-del-usuario",
  "message": "Mensaje de notificación",
  "read": false
}
```

Response:

```json
{
  "id": "uuid-generado",
  "user_id": "uuid-del-usuario",
  "message": "Mensaje de notificación",
  "read": false,
  "created_at": "2023-06-20T00:00:00.000Z"
}
```

Example:

```bash
curl -X POST http://localhost:3001/api/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "user_id": "uuid-del-usuario",
    "message": "Mensaje de notificación",
    "read": false
  }'
```

### Get All Notifications

🔒 Requires Authentication (Foundation only)

```http
GET /api/notifications
```

Response:

```json
[
  {
    "id": "uuid-notificacion-1",
    "user_id": "uuid-usuario-1",
    "message": "Mensaje de notificación 1",
    "read": false,
    "created_at": "2023-06-20T00:00:00.000Z"
  },
  {
    "id": "uuid-notificacion-2",
    "user_id": "uuid-usuario-2",
    "message": "Mensaje de notificación 2",
    "read": true,
    "created_at": "2023-06-21T00:00:00.000Z"
  }
]
```

Example:

```bash
curl -X GET http://localhost:3001/api/notifications \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Get Unread Notifications

🔒 Requires Authentication

```http
GET /api/notifications/unread
```

Response:

```json
[
  {
    "id": "uuid-notificacion-1",
    "user_id": "uuid-usuario",
    "message": "Mensaje de notificación 1",
    "read": false,
    "created_at": "2023-06-20T00:00:00.000Z"
  },
  {
    "id": "uuid-notificacion-2",
    "user_id": "uuid-usuario",
    "message": "Mensaje de notificación 2",
    "read": false,
    "created_at": "2023-06-21T00:00:00.000Z"
  }
]
```

Example:

```bash
curl -X GET http://localhost:3001/api/notifications/unread \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Get Notification by ID

🔒 Requires Authentication

```http
GET /api/notifications/:id
```

Response:

```json
{
  "id": "uuid-notificacion",
  "user_id": "uuid-usuario",
  "message": "Mensaje de notificación",
  "read": false,
  "created_at": "2023-06-20T00:00:00.000Z"
}
```

Example:

```bash
curl -X GET http://localhost:3001/api/notifications/uuid-notificacion \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Get Notifications by User

🔒 Requires Authentication

```http
GET /api/notifications/user/:userId
```

Response:

```json
[
  {
    "id": "uuid-notificacion-1",
    "user_id": "uuid-usuario",
    "message": "Mensaje de notificación 1",
    "read": false,
    "created_at": "2023-06-20T00:00:00.000Z"
  },
  {
    "id": "uuid-notificacion-2",
    "user_id": "uuid-usuario",
    "message": "Mensaje de notificación 2",
    "read": true,
    "created_at": "2023-06-21T00:00:00.000Z"
  }
]
```

Example:

```bash
curl -X GET http://localhost:3001/api/notifications/user/uuid-usuario \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Get Unread Notifications by User

🔒 Requires Authentication

```http
GET /api/notifications/user/:userId/unread
```

Response:

```json
[
  {
    "id": "uuid-notificacion-1",
    "user_id": "uuid-usuario",
    "message": "Mensaje de notificación 1",
    "read": false,
    "created_at": "2023-06-20T00:00:00.000Z"
  },
  {
    "id": "uuid-notificacion-2",
    "user_id": "uuid-usuario",
    "message": "Mensaje de notificación 2",
    "read": false,
    "created_at": "2023-06-21T00:00:00.000Z"
  }
]
```

Example:

```bash
curl -X GET http://localhost:3001/api/notifications/user/uuid-usuario/unread \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Mark Notification as Read

🔒 Requires Authentication

```http
PATCH /api/notifications/:id/read
```

Response:

```json
{
  "id": "uuid-notificacion",
  "user_id": "uuid-usuario",
  "message": "Mensaje de notificación",
  "read": true,
  "created_at": "2023-06-20T00:00:00.000Z",
  "updated_at": "2023-06-22T00:00:00.000Z"
}
```

Example:

```bash
curl -X PATCH http://localhost:3001/api/notifications/uuid-notificacion/read \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Mark All Notifications as Read

🔒 Requires Authentication

```http
POST /api/notifications/mark-all-read
```

Response:

```json
{
  "message": "All notifications marked as read",
  "count": 5
}
```

Example:

```bash
curl -X POST http://localhost:3001/api/notifications/mark-all-read \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Mark All Notifications of a User as Read

🔒 Requires Authentication

```http
POST /api/notifications/user/:userId/mark-all-read
```

Response:

```json
{
  "message": "All notifications for user marked as read",
  "count": 3
}
```

Example:

```bash
curl -X POST http://localhost:3001/api/notifications/user/uuid-usuario/mark-all-read \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Update Notification

🔒 Requires Authentication (Foundation only)

```http
PATCH /api/notifications/:id
```

Request Body:

```json
{
  "message": "Mensaje de notificación actualizado",
  "read": true
}
```

Response:

```json
{
  "id": "uuid-notificacion",
  "user_id": "uuid-usuario",
  "message": "Mensaje de notificación actualizado",
  "read": true,
  "created_at": "2023-06-20T00:00:00.000Z",
  "updated_at": "2023-06-22T00:00:00.000Z"
}
```

Example:

```bash
curl -X PATCH http://localhost:3001/api/notifications/uuid-notificacion \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "message": "Mensaje de notificación actualizado",
    "read": true
  }'
```

### Delete Notification

🔒 Requires Authentication

```http
DELETE /api/notifications/:id
```

Response:

```json
{
  "message": "Notification deleted successfully"
}
```

Example:

```bash
curl -X DELETE http://localhost:3001/api/notifications/uuid-notificacion \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Suggestions

### Create Suggestion

🔒 Requires Authentication

```http
POST /api/suggestions
```

Request Body:

```json
{
  "user_id": "uuid-del-usuario",
  "content": "Contenido de la sugerencia",
  "processed": false
}
```

Response:

```json
{
  "id": "uuid-generado",
  "user_id": "uuid-del-usuario",
  "content": "Contenido de la sugerencia",
  "processed": false,
  "created_at": "2023-06-25T00:00:00.000Z"
}
```

Example:

```bash
curl -X POST http://localhost:3001/api/suggestions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "user_id": "uuid-del-usuario",
    "content": "Contenido de la sugerencia",
    "processed": false
  }'
```

### Get All Suggestions

🔒 Requires Authentication (Foundation only)

```http
GET /api/suggestions
```

Response:

```json
[
  {
    "id": "uuid-sugerencia-1",
    "user_id": "uuid-usuario-1",
    "content": "Contenido de la sugerencia 1",
    "processed": false,
    "created_at": "2023-06-25T00:00:00.000Z"
  },
  {
    "id": "uuid-sugerencia-2",
    "user_id": "uuid-usuario-2",
    "content": "Contenido de la sugerencia 2",
    "processed": true,
    "created_at": "2023-06-26T00:00:00.000Z"
  }
]
```

Example:

```bash
curl -X GET http://localhost:3001/api/suggestions \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Get Unprocessed Suggestions

🔒 Requires Authentication (Foundation only)

```http
GET /api/suggestions/unprocessed
```

Response:

```json
[
  {
    "id": "uuid-sugerencia-1",
    "user_id": "uuid-usuario-1",
    "content": "Contenido de la sugerencia 1",
    "processed": false,
    "created_at": "2023-06-25T00:00:00.000Z"
  },
  {
    "id": "uuid-sugerencia-2",
    "user_id": "uuid-usuario-2",
    "content": "Contenido de la sugerencia 2",
    "processed": false,
    "created_at": "2023-06-26T00:00:00.000Z"
  }
]
```

Example:

```bash
curl -X GET http://localhost:3001/api/suggestions/unprocessed \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Get Suggestion by ID

🔒 Requires Authentication

```http
GET /api/suggestions/:id
```

Response:

```json
{
  "id": "uuid-sugerencia",
  "user_id": "uuid-usuario",
  "content": "Contenido de la sugerencia",
  "processed": false,
  "created_at": "2023-06-25T00:00:00.000Z"
}
```

Example:

```bash
curl -X GET http://localhost:3001/api/suggestions/uuid-sugerencia \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Get Suggestions by User

🔒 Requires Authentication

```http
GET /api/suggestions/user/:userId
```

Response:

```json
[
  {
    "id": "uuid-sugerencia-1",
    "user_id": "uuid-usuario",
    "content": "Contenido de la sugerencia 1",
    "processed": false,
    "created_at": "2023-06-25T00:00:00.000Z"
  },
  {
    "id": "uuid-sugerencia-2",
    "user_id": "uuid-usuario",
    "content": "Contenido de la sugerencia 2",
    "processed": true,
    "created_at": "2023-06-26T00:00:00.000Z"
  }
]
```

Example:

```bash
curl -X GET http://localhost:3001/api/suggestions/user/uuid-usuario \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Mark Suggestion as Processed

🔒 Requires Authentication (Foundation only)

```http
PATCH /api/suggestions/:id/process
```

Response:

```json
{
  "id": "uuid-sugerencia",
  "user_id": "uuid-usuario",
  "content": "Contenido de la sugerencia",
  "processed": true,
  "created_at": "2023-06-25T00:00:00.000Z",
  "updated_at": "2023-06-27T00:00:00.000Z"
}
```

Example:

```bash
curl -X PATCH http://localhost:3001/api/suggestions/uuid-sugerencia/process \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Update Suggestion

🔒 Requires Authentication

```http
PATCH /api/suggestions/:id
```

Request Body:

```json
{
  "content": "Contenido de la sugerencia actualizado",
  "processed": true
}
```

Response:

```json
{
  "id": "uuid-sugerencia",
  "user_id": "uuid-usuario",
  "content": "Contenido de la sugerencia actualizado",
  "processed": true,
  "created_at": "2023-06-25T00:00:00.000Z",
  "updated_at": "2023-06-27T00:00:00.000Z"
}
```

Example:

```bash
curl -X PATCH http://localhost:3001/api/suggestions/uuid-sugerencia \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "content": "Contenido de la sugerencia actualizado",
    "processed": true
  }'
```

### Delete Suggestion

🔒 Requires Authentication

```http
DELETE /api/suggestions/:id
```

Response:

```json
{
  "message": "Suggestion deleted successfully"
}
```

Example:

```bash
curl -X DELETE http://localhost:3001/api/suggestions/uuid-sugerencia \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## File Upload

### Upload Document

🔒 Requires Authentication

```http
POST /api/upload-documents
```

Form data:

- file: [file]

Response:

```json
{
  "url": "http://localhost:3001/uploads/documents/file-1234567890.pdf",
  "filename": "file-1234567890.pdf"
}
```

Example:

```bash
curl -X POST http://localhost:3001/api/upload-documents \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "file=@/path/to/document.pdf"
```

### Upload Image

🔒 Requires Authentication

```http
POST /api/upload-image
```

Form data:

- image: [file]
- type: "profile" | "foundation" | "opportunity"
- entity_id: uuid of the related entity

Response:

```json
{
  "url": "http://localhost:3001/uploads/images/profile/image-1234567890.jpg",
  "filename": "image-1234567890.jpg"
}
```

Example:

```bash
curl -X POST http://localhost:3001/api/upload-image \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "image=@/path/to/image.jpg" \
  -F "type=profile" \
  -F "entity_id=uuid-del-usuario"
```

## Reports

### Get General Reports

🔒 Requires Authentication (Foundation only)

```http
GET /api/reports
```

Response:

```json
{
  "total_donations": 15000.75,
  "total_users": 50,
  "total_foundations": 10,
  "total_social_actions": 25,
  "recent_activities": [
    {
      "type": "donation",
      "amount": 100.5,
      "date": "2023-06-25T00:00:00.000Z"
    },
    {
      "type": "participation",
      "action": "Descripción de la acción social",
      "date": "2023-06-26T00:00:00.000Z"
    }
  ]
}
```

Example:

```bash
curl -X GET http://localhost:3001/api/reports \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Get Donations by Category

🔒 Requires Authentication (Foundation only)

```http
GET /api/reports/donations-by-category
```

Response:

```json
[
  {
    "category": "Educación",
    "amount": 5000.25
  },
  {
    "category": "Salud",
    "amount": 3500.5
  },
  {
    "category": "Medio Ambiente",
    "amount": 4500.0
  },
  {
    "category": "Otros",
    "amount": 2000.0
  }
]
```

Example:

```bash
curl -X GET http://localhost:3001/api/reports/donations-by-category \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Get Donations by Day

🔒 Requires Authentication (Foundation only)

```http
GET /api/reports/donations-by-day
```

Response:

```json
[
  {
    "date": "2023-06-01",
    "amount": 1000.5
  },
  {
    "date": "2023-06-02",
    "amount": 750.25
  },
  {
    "date": "2023-06-03",
    "amount": 1200.0
  },
  {
    "date": "2023-06-04",
    "amount": 850.75
  }
]
```

Example:

```bash
curl -X GET http://localhost:3001/api/reports/donations-by-day \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```
