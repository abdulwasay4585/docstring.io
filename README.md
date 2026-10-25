# Docstring.io

> AI-powered docstring generation for developers.

Docstring.io is a full-stack web application that turns source code into formatted documentation comments using an AI model. Users can paste code into a Monaco editor, choose a programming language and documentation style, generate a docstring, copy the result, and revisit previous generations. The application also includes account authentication, usage limits, plan-based feature restrictions, generation history, and an administrator dashboard.

## Features

- **AI docstring generation** powered by the Groq API and the `llama-3.3-70b-versatile` model.
- **Interactive code editor** built with Monaco Editor.
- **Multiple documentation styles**, including:
  - Google
  - NumPy
  - Sphinx
  - JSDoc
- **Language selection** for Python, JavaScript, and Go.
- **Free-plan restrictions** with Python support and a daily generation limit.
- **Guest usage limits** based on the visitor's IP address.
- **User registration and login** using bcrypt password hashing and JSON Web Tokens.
- **Generation history** for signed-in users and guests tracked by IP address.
- **Copy-to-clipboard output** for generated docstrings.
- **Responsive interface** with mobile-friendly sidebars and navigation.
- **Pricing page** for Free, Pro, and Enterprise plans.
- **Admin dashboard** with user statistics, plan management, and account blocking.
- **Production serving support** where the Express server can serve the built React application.

## Technology stack

### Frontend

- React 19
- Vite 7
- React Router
- Axios
- Monaco Editor
- Tailwind CSS
- Framer Motion
- Lucide React

### Backend

- Node.js
- Express 5
- MongoDB with Mongoose
- Groq SDK
- JSON Web Tokens
- bcryptjs
- express-rate-limit
- dotenv
- CORS

## Project structure

```text
.
├── backend/
│   ├── middleware/
│   │   ├── auth.js             # Required JWT authentication middleware
│   │   └── optionalAuth.js     # Authentication middleware for guests and users
│   ├── models/
│   │   ├── Generation.js       # Generated docstring history schema
│   │   └── User.js             # User, guest, plan, and usage schema
│   ├── routes/
│   │   ├── admin.js             # Admin statistics and user-management endpoints
│   │   ├── auth.js              # Registration, login, and current-user endpoints
│   │   └── generate.js          # AI generation and history endpoints
│   ├── seedAdmin.js             # Creates the initial administrator account
│   ├── server.js                # Express application entry point
│   ├── test-groq.js             # Small Groq API connectivity test
│   ├── package.json             # Backend scripts and dependencies
│   └── .env                     # Local environment variables; do not commit
├── frontend/
│   ├── public/                  # Static public assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── CodeEditor.jsx       # Monaco-based source-code editor
│   │   │   ├── ConfirmationModal.jsx
│   │   │   ├── ControlBar.jsx        # Language, style, and generation controls
│   │   │   ├── Footer.jsx
│   │   │   ├── GuestLimitModal.jsx
│   │   │   ├── OutputViewer.jsx      # Generated docstring viewer and copy action
│   │   │   └── Sidebar.jsx           # Generation-history sidebar
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx   # Protected administration interface
│   │   │   ├── Home.jsx              # Main generation workspace
│   │   │   ├── Login.jsx
│   │   │   ├── Pricing.jsx
│   │   │   └── Register.jsx
│   │   ├── App.jsx               # Client-side routes
│   │   ├── config.js             # API base URL configuration
│   │   ├── index.css             # Global styles
│   │   └── main.jsx              # React application bootstrap
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── vercel.json               # SPA fallback configuration for Vercel
├── .gitignore
└── README.md
```

## How the application works

1. The React frontend loads the generation workspace from `frontend/src/pages/Home.jsx`.
2. A user enters source code in `CodeEditor` and selects a language and docstring style through `ControlBar`.
3. The frontend sends the code, language, and style to `POST /api/generate`.
4. The backend identifies the user from the JWT token or creates/looks up a guest account by IP address.
5. The backend applies rate limits, guest limits, daily usage limits, and plan restrictions.
6. The request is sent to Groq with a prompt asking for only the requested docstring.
7. The generated result is saved as a `Generation` document in MongoDB and returned to the frontend.
8. The frontend displays the response in `OutputViewer` and adds it to the recent-history sidebar.

## API overview

The backend runs under the `/api` prefix.

### Health check

```text
GET /api/status
```

Returns a simple response confirming that the API is running.

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

Registration and login return a JWT. Authenticated requests pass the token through the `x-auth-token` request header.

Example header:

```http
x-auth-token: <jwt-token>
```

### Docstring generation

```text
POST /api/generate
```

Request body:

```json
{
  "code": "def add(a, b):\n    return a + b",
  "language": "python",
  "style": "Google"
}
```

Successful response:

```json
{
  "docstring": "..."
}
```

### Generation history

```text
GET    /api/generate/history
DELETE /api/generate/history/:id
PUT    /api/generate/history/:id
```

History retrieval supports authenticated users and guests. Deleting and updating history require authentication and verify ownership of the requested record.

### Administration

All administration endpoints require a valid JWT belonging to an administrator.

```text
GET /api/admin/stats
GET /api/admin/users
PUT /api/admin/users/:id/block
PUT /api/admin/users/:id/plan
```

The dashboard exposes total users, active IP addresses, recent request volume, daily generations, account plans, and account blocking controls.

## Usage limits and plans

The current backend implementation applies the following rules:

| Account type | Generation limit | Language access |
| --- | ---: | --- |
| Guest | 5 per day | Python only through the free-plan rules |
| Free user | 50 per day | Python |
| Pro user | No daily generation limit in the generation route | Python, JavaScript, and Go |
| Enterprise | Stored as a supported plan value | Intended for future expanded features |

The API also applies an Express rate limiter to generation requests. The implementation currently allows up to 20 requests per minute per limiter key.

The pricing page presents the product tiers, but payment processing and automated upgrades are not implemented yet. Pro access is currently managed through the administrator dashboard.

## Prerequisites

Install the following before running the project locally:

- Node.js 18 or newer
- npm
- MongoDB, either locally or through MongoDB Atlas
- A Groq API key

## Environment variables

Create a `.env` file inside `backend/`:

```dotenv
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/docstring
JWT_SECRET=replace-with-a-long-random-secret
GROQ_API_KEY=your-groq-api-key
FRONTEND_URL=http://localhost:5173
```

### Variable reference

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | Express server port. Defaults to `5000`. |
| `NODE_ENV` | No | Use `production` to serve `frontend/dist` from Express. |
| `MONGODB_URI` | Yes for persistence | MongoDB connection string. |
| `JWT_SECRET` | Yes for authentication | Secret used to sign and verify JWTs. |
| `GROQ_API_KEY` | Yes for generation | API key used by `groq-sdk`. |
| `FRONTEND_URL` | No | Allowed frontend origin for CORS. |

Create `frontend/.env` only when the frontend needs to call a backend hosted at a non-default URL:

```dotenv
VITE_API_URL=http://localhost:5000
```

In development, the frontend defaults to `http://localhost:5000`. In production, it uses `VITE_API_URL` when provided and otherwise uses relative API URLs.

## Local development

Clone the repository and install dependencies:

```bash
git clone https://github.com/abdulwasay4585/docstring.io.git
cd docstring.io

cd backend
npm install

cd ../frontend
npm install
```

Start the backend in one terminal:

```bash
cd backend
npm run dev
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Open the Vite development URL shown in the terminal, normally:

```text
http://localhost:5173
```

The backend API is normally available at:

```text
http://localhost:5000
```

### Production build

The backend package includes a build script that installs backend dependencies, installs frontend dependencies, and creates the frontend production bundle:

```bash
cd backend
npm run build
```

To run the application in production mode:

```bash
cd backend
NODE_ENV=production npm start
```

When `NODE_ENV=production`, `backend/server.js` serves the files from `frontend/dist` and falls back to `index.html` for client-side routes.

### Seed an administrator

After configuring MongoDB and the backend environment variables, run:

```bash
cd backend
node seedAdmin.js
```

The seed script creates the following administrator if one does not already exist:

```text
Email:    admin@docstring.io
Password: adminpassword
```

Change this password immediately in a production deployment. The seed credentials are intended only for initial local setup.

### Test Groq connectivity

To verify that the Groq API key is available:

```bash
cd backend
node test-groq.js
```

## Frontend routes

| Route | Purpose |
| --- | --- |
| `/` | Main docstring generation workspace |
| `/login` | User login |
| `/register` | New user registration |
| `/pricing` | Free, Pro, and Enterprise plan information |
| `/admin` | Administrator dashboard |

Unknown frontend routes redirect to `/` through the route configuration in `App.jsx`.

## Data models

### User

The `User` model stores registered users and guest usage records. Important fields include:

- `email`
- `password`
- `ipAddress`
- `role`: `guest`, `user`, or `admin`
- `plan`: `free`, `pro`, or `enterprise`
- `generationsCount`
- `lastResetDate`
- `isBlocked`
- `joinedAt`

### Generation

The `Generation` model stores the source code and generated output:

- `userId`
- `ipAddress`
- `code`
- `language`
- `style`
- `docstring`
- `timestamp`

## Security notes

- Keep `.env` files out of version control.
- Use a strong, randomly generated `JWT_SECRET` in every non-local environment.
- Replace the seeded administrator password before deployment.
- Restrict `FRONTEND_URL` to the actual production frontend origin instead of using a wildcard.
- Do not expose password hashes or sensitive user fields through new admin endpoints.
- Review guest IP-based tracking and rate limiting for privacy, proxies, and IPv6 behavior before production use.
- Configure HTTPS when deploying the frontend and backend publicly.

## Available npm scripts

### Backend

```bash
npm start       # Start the Express server
npm run dev     # Start the server with Nodemon
npm run build   # Install dependencies and build the frontend
npm test        # Placeholder; no automated backend tests are configured yet
```

### Frontend

```bash
npm run dev     # Start the Vite development server
npm run build   # Build the production bundle
npm run lint    # Run ESLint
npm run preview # Preview the production build locally
```

## Deployment

The frontend includes a `vercel.json` rewrite that sends all routes to `index.html`, which is required for React Router client-side navigation on Vercel.

A typical deployment consists of:

1. Deploying the frontend as a Vite application.
2. Deploying the backend as a Node.js service.
3. Creating a MongoDB database.
4. Adding the backend environment variables to the hosting provider.
5. Setting `VITE_API_URL` in the frontend deployment to the public backend URL.
6. Setting `FRONTEND_URL` in the backend deployment to the public frontend URL.
7. Running the administrator seed script once against the production database, then changing the generated password.

For a single-service deployment, build the frontend and run the backend with `NODE_ENV=production`; Express will serve the generated frontend assets.

## Current limitations

- Automated payment processing is not implemented; the pricing page displays plans and the admin dashboard changes plan values manually.
- Backend automated tests are not configured yet.
- Failed-generation statistics are currently represented as zero because failed requests are not persisted in a separate log model.
- Guest history is tied to IP-address-based lookup and can be affected by shared networks or changing IP addresses.
- The admin interface contains operational controls and should be protected with additional deployment-level security controls.
- The exact set of supported languages and docstring styles is controlled by the frontend selections and backend plan checks; adding a new language should update both sides.

## Contributing

1. Create a feature branch.
2. Keep frontend and backend changes focused and documented.
3. Add or update tests when introducing backend behavior.
4. Run the frontend linter and production build before opening a pull request.
5. Never commit API keys, database credentials, JWT secrets, or local `.env` files.

```bash
cd frontend
npm run lint
npm run build
```

## License

No project license has been declared yet. Add a license file before distributing or reusing the project publicly.

## Project status

Docstring.io is an actively evolving MVP-style application. The core generation, authentication, history, plan restrictions, and administrator workflows are implemented, while billing, comprehensive testing, and production hardening remain future work.
