# Full-stack buyer portal (assessment)

Django REST API + React (Vite) frontend for a property buyer: register, login (JWT), browse catalog, and manage favourites.

## Prerequisites

- Python 3.11+ (3.13 works)
- Node.js 20+ and npm

## Backend (Django)

`Property.image` is a **URL** (e.g. CDN/S3 public URL), not a multipart file upload.

Example image URLs for testing:

- `https://cdn.ankaek.com/res/aok/default_coffee.jpg`

```bash
cd /path/to/full_stack_assignment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
//For admin
--->for createsuperuser from folder terminal : python manage.py createsuperuser

--> base_url/admin (eg. base_url localhost:8000/admin)
API base URL: **http://127.0.0.1:8000/api/**

### Main endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/register` | No | Register (`name`, `email`, `password` min 8 chars, optional `role`) |
| POST | `/api/login` | No | Login → `access`, `refresh`, `user` |
| GET | `/api/me` | Bearer | Current user `id`, `name`, `email`, `role` |
| GET | `/api/catalog` | No | Paginated property catalog (`page`, `page_size`) |
| POST | `/api/properties` | Bearer | Create property (`name`, `description`, `price`, `image` URL) |
| GET | `/api/favourites` | Bearer | Paginated favourites |
| POST | `/api/favourites` | Bearer | Toggle like: `property_id`, `liked` (boolean) |

Responses use `{ "code", "message", "data" }` with HTTP status matching `code`.

## Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**. The dev server proxies `/api` to Django on port 8000.

### UI flow (browser)

1. Open `/register`, create an account (password at least 8 characters).
2. Sign in at `/login`.
3. On `/dashboard`, use **Browse catalog** / **My favourites** (on small screens, use the **Browse** / **Saved** bar at the bottom).
4. Add or remove favourites with the button on each property card. Pagination uses **Previous** / **Next**.
5. From **`/dashboard`**, use **List a new property** (or **`/dashboard/list-property`**) to create a listing. You must be signed in. Paste an **image URL** (e.g. from your CDN).

```bash
npm run build   # production build to frontend/dist
```

## Example flow (API)

1. **Register** — `POST /api/register` with JSON body:
   `{"name":"Ada","email":"ada@example.com","password":"longsecret","role":"buyer"}`
2. **Login** — `POST /api/login` with `{"email":"ada@example.com","password":"longsecret"}` → save `data.access`.
3. **Profile** — `GET /api/me` with header `Authorization: Bearer <access>`.
4. **Catalog** — `GET /api/catalog?page=1` (no auth).
5. **Create property** — `POST /api/properties` with Bearer token and JSON `{"name":"…","description":"…","price":"99.00","image":"https://…"}`.
6. **Add favourite** — `POST /api/favourites` with Bearer token and body `{"property_id":1,"liked":true}`.
7. **List favourites** — `GET /api/favourites?page=1` with Bearer token.
8. **Remove favourite** — same POST with `"liked":false`.

Create sample properties via **`/dashboard/list-property`** in the UI, **admin** (`/admin/`), or the API above.

## Project layout

- `full_stack_buyer/` — Django project settings
- `api/` — REST API app
- `frontend/` — React + Vite + Tailwind
