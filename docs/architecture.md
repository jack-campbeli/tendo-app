# System Architecture Documentation

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│                      (Port 5173)                                │
│                                                                 │
│  ┌────────────────┐                                             │
│  │    Browser     │                                             │
│  │                │                                             │
│  │  React SPA     │                                             │
│  └───────┬────────┘                                             │
│          │                                                      │
│          │ HTML, CSS, JS                                        │
│          │                                                      │
│  ┌───────▼────────────────────────────────────────────┐         │
│  │         React Dev Server (Vite)                    │         │
│  │                                                    │         │
│  │  Components:                                       │         │
│  │  ├─ LoginPage                                      │         │
│  │  ├─ AdminPage (Form Builder)                       │         │
│  │  ├─ UserFormPage (Form Submission)                 │         │
│  │  ├─ Header (with Language Selector)                │         │
│  │  └─ Auth Components                                │         │
│  │                                                    │         │
│  │  Context:                                          │         │
│  │  └─ LanguageContext (Global State)                 │         │
│  └─────────────────────────────────────────────────────┘        │
│                          │                                      │
└──────────────────────────┼──────────────────────────────────────┘
                           │
                           │ HTTP/JSON
                           │ (CORS enabled - port 8000)
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                    WEB SERVER                                   │
│                    (Port 8000)                                  │
│                                                                 │
│  ┌────────────────────────────────────────────────────┐         │
│  │           Uvicorn ASGI Server                      │         │
│  │                                                    │         │
│  │  - Async request handling                          │         │
│  │  - WebSocket support (future)                      │         │
│  │  - Hot reload in development                       │         │
│  └───────────────────────┬────────────────────────────┘         │
│                          │                                      │
└──────────────────────────┼──────────────────────────────────────┘
                           │
                           │ passes via app routes
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                       BACKEND                                   │
│                   (FastAPI Application)                         │
│                                                                 │
│  ┌────────────────────────────────────────────────────┐         │
│  │              API Routes (main.py)                  │         │
│  │                                                    │         │
│  │  Authentication:                                   │         │
│  │  └─ POST /api/auth/login                           │         │
│  │                                                    │         │
│  │  Forms:                                            │         │
│  │  ├─ POST /api/forms                                │         │
│  │  ├─ GET  /api/forms                                │         │
│  │  ├─ GET  /api/forms/latest?lang={code}             │         │
│  │  └─ GET  /api/forms/{form_id}                      │         │
│  │                                                    │         │
│  │  Submissions:                                      │         │
│  │  ├─ POST /api/submissions                          │         │
│  │  └─ GET  /api/submissions                          │         │
│  │                                                    │         │
│  │  Users:                                            │         │
│  │  └─ GET  /api/users/{email}                        │         │
│  │                                                    │         │
│  │  Health:                                           │         │
│  │  └─ GET  /api/test                                 │         │
│  └─────────────────────┬──────────────────────────────┘         │
│                        │                                        │
│  ┌─────────────────────▼──────────────────────────┐             │
│  │          Business Logic Layer                  │             │
│  │                                                │             │
│  │  ┌──────────────────────────────┐              │             │
│  │  │   TranslationService         │              │             │
│  │  │  (services/translation_      │              │             │
│  │  │   service.py)                │              │             │
│  │  │                              │              │             │
│  │  │  Methods:                    │              │             │
│  │  │  ├─ translate_form_name()    │              │             │
│  │  │  ├─ translate_form_fields()  │◄─────────────┼────┐        │
│  │  │  └─ translate_responses_     │              │    │        │
│  │  │     to_english()             │              │    │        │
│  │  └───────────────┬──────────────┘              │    │        │
│  └──────────────────┼─────────────────────────────┘    │        │
│                     │                                  │        │
│                     │ API Calls                        │        │
│                     │                                  │        │
│  ┌──────────────────▼─────────────────┐                │        │
│  │   OpenAI API Integration           │                │        │
│  │                                     │               │        │
│  │   Model: gpt-4o-mini                │               │        │
│  │   Purpose: Medical translation      │               │        │
│  │   Cost: ~$0.01 per form            │                │        │
│  └─────────────────────────────────────┘               │        │
│                                                        │        │
│  ┌──────────────────────────────────────────────────┐   │       │
│  │       Data Access Layer (SQLModel ORM)           │   │       │
│  │                                                  │   │       │
│  │  Models (models.py):                             │   │       │
│  │  ├─ User                                         │   │       │
│  │  ├─ Form                                         │   │       │
│  │  ├─ FormSubmission                               │   │       │
│  │  └─ TranslatedForm ◄─────────────────────────────┼───┘       │
│  │                                                  │           │
│  │  Session Management:                             │           │
│  │  └─ get_session() (Dependency Injection)         │           │
│  └───────────────────────┬──────────────────────────┘           │
│                          │                                      │
│                          │ SQL Queries via ORM                  │
│                          │ (SQLModel)                           │
│  ┌───────────────────────▼──────────────────────────┐           │
│  │            SQLite Database                       │           │
│  │            (database.db)                         │           │
│  │                                                  │           │
│  │  Tables:                                         │           │
│  │  ├─ user                                         │           │
│  │  ├─ form                                         │           │
│  │  ├─ formsubmission                               │           │
│  │  └─ translatedform (cache)                       │           │
│  └──────────────────────────────────────────────────┘           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                            │
│                                                                 │
│  ┌────────────────────────────────────────┐                     │
│  │         OpenAI API                     │                     │
│  │         (api.openai.com)               │                     │
│  │                                        │                     │
│  │  - GPT-4o-mini model                   │                     │
│  │  - Translation endpoint                │                     │
│  │  - API key from config/api_key.txt     │                     │
│  └────────────────────────────────────────┘                     │
└─────────────────────────────────────────────────────────────────┘
```

## Component Interaction Flow

### User Authentication Flow

```
┌────────┐        ┌──────────┐        ┌─────────┐        ┌──────────┐
│ User   │        │ Frontend │        │ FastAPI │        │ Database │
└───┬────┘        └────┬─────┘        └────┬────┘        └────┬─────┘
    │                  │                   │                  │
    │ Enter Creds      │                   │                  │
    ├─────────────────►│                   │                  │
    │                  │ POST /api/auth/   │                  │
    │                  │      login        │                  │
    │                  ├──────────────────►│                  │
    │                  │                   │ SELECT * FROM    │
    │                  │                   │ user WHERE       │
    │                  │                   │ email = ?        │
    │                  │                   ├─────────────────►│
    │                  │                   │                  │
    │                  │                   │◄─────────────────┤
    │                  │                   │ User record      │
    │                  │                   │                  │
    │                  │                   │ Verify password  │
    │                  │                   │                  │
    │                  │◄──────────────────┤                  │
    │                  │ LoginResponse     │                  │
    │                  │ {user_type,       │                  │
    │                  │  name, email}     │                  │
    │◄─────────────────┤                   │                  │
    │ Redirect to      │                   │                  │
    │ Admin/User page  │                   │                  │
```

### Form Creation with Translation Caching Flow

```
┌────────┐    ┌──────────┐    ┌─────────┐    ┌──────────┐    ┌────────┐
│ Admin  │    │ Frontend │    │ FastAPI │    │ OpenAI   │    │   DB   │
└───┬────┘    └────┬─────┘    └────┬────┘    └────┬─────┘    └───┬────┘
    │              │               │              │              │
    │ Create Form  │               │              │              │
    ├─────────────►│               │              │              │
    │              │ POST /api/    │              │              │
    │              │      forms    │              │              │
    │              ├──────────────►│              │              │
    │              │               │ Generate UUID│              │
    │              │               │              │              │
    │              │               │ INSERT INTO  │              │
    │              │               │ form         │              │
    │              │               ├─────────────────────────────►│
    │              │               │              │              │
    │              │               │ For each pre-cache lang     │
    │              │               │ (es, fr, zh, etc.)          │
    │              │               │              │              │
    │              │               │ Translate    │              │
    │              │               │ form_name    │              │
    │              │               ├─────────────►│              │
    │              │               │              │              │
    │              │               │◄─────────────┤              │
    │              │               │ Translated   │              │
    │              │               │              │              │
    │              │               │ Translate    │              │
    │              │               │ fields       │              │
    │              │               ├─────────────►│              │
    │              │               │              │              │
    │              │               │◄─────────────┤              │
    │              │               │ Translated   │              │
    │              │               │ fields       │              │
    │              │               │              │              │
    │              │               │ INSERT INTO  │              │
    │              │               │ translatedform              │
    │              │               ├─────────────────────────────►│
    │              │               │              │              │
    │              │◄──────────────┤              │              │
    │              │ {form_id}     │              │              │
    │◄─────────────┤              │              │              │
    │ Success      │              │              │              │
```

### Form Retrieval with Translation Flow

```
┌────────┐    ┌──────────┐    ┌─────────┐    ┌──────────┐    ┌────────┐
│Patient │    │ Frontend │    │ FastAPI │    │ OpenAI   │    │   DB   │
└───┬────┘    └────┬─────┘    └────┬────┘    └────┬─────┘    └───┬────┘
    │              │               │              │              │
    │ Select       │               │              │              │
    │ Language: ES │               │              │              │
    ├─────────────►│               │              │              │
    │              │ Update        │              │              │
    │              │ LanguageContext              │              │
    │              │               │              │              │
    │              │ GET /api/     │              │              │
    │              │ forms/latest  │              │              │
    │              │ ?lang=es      │              │              │
    │              ├──────────────►│              │              │
    │              │               │ SELECT * FROM│              │
    │              │               │ form ORDER BY│              │
    │              │               │ created_at   │              │
    │              │               ├─────────────────────────────►│
    │              │               │              │              │
    │              │               │◄─────────────────────────────┤
    │              │               │ Latest form  │              │
    │              │               │              │              │
    │              │               │ SELECT * FROM│              │
    │              │               │ translatedform              │
    │              │               │ WHERE form_id=?             │
    │              │               │ AND lang='es'│              │
    │              │               ├─────────────────────────────►│
    │              │               │              │              │
    │              │               │◄─────────────────────────────┤
    │              │               │ Cached       │              │
    │              │               │ translation  │              │
    │              │               │ (or null)    │              │
    │              │               │              │              │
    │              │               │ If cached:   │              │
    │              │◄──────────────┤ Return it    │              │
    │              │ Translated    │              │              │
    │              │ Form          │              │              │
    │              │               │              │              │
    │              │               │ If not cached:              │
    │              │               │ Translate via│              │
    │              │               │ OpenAI       │              │
    │              │               ├─────────────►│              │
    │              │               │◄─────────────┤              │
    │              │               │              │              │
    │              │               │ Cache result │              │
    │              │               ├─────────────────────────────►│
    │              │               │              │              │
    │              │◄──────────────┤              │              │
    │◄─────────────┤              │              │              │
    │ Display form │              │              │              │
    │ in Spanish   │              │              │              │
```

### Form Submission with Response Translation Flow

```
┌────────┐    ┌──────────┐    ┌─────────┐    ┌──────────┐    ┌────────┐
│Patient │    │ Frontend │    │ FastAPI │    │ OpenAI   │    │   DB   │
└───┬────┘    └────┬─────┘    └────┬────┘    └────┬─────┘    └───┬────┘
    │              │               │              │              │
    │ Fill form    │               │              │              │
    │ (in Spanish) │               │              │              │
    ├─────────────►│               │              │              │
    │              │               │              │              │
    │ Submit       │               │              │              │
    ├─────────────►│               │              │              │
    │              │ POST /api/    │              │              │
    │              │ submissions   │              │              │
    │              │ {form_id,     │              │              │
    │              │  data,        │              │              │
    │              │  lang: "es"}  │              │              │
    │              ├──────────────►│              │              │
    │              │               │              │              │
    │              │               │ Translate    │              │
    │              │               │ responses    │              │
    │              │               │ to English   │              │
    │              │               ├─────────────►│              │
    │              │               │              │              │
    │              │               │◄─────────────┤              │
    │              │               │ English      │              │
    │              │               │ responses    │              │
    │              │               │              │              │
    │              │               │ INSERT INTO  │              │
    │              │               │ formsubmission              │
    │              │               │ (English data)              │
    │              │               ├─────────────────────────────►│
    │              │               │              │              │
    │              │◄──────────────┤              │              │
    │              │ {status:      │              │              │
    │              │  success}     │              │              │
    │◄─────────────┤               │              │              │
    │ Confirmation │               │              │              │
```

## Technology Stack Details

### Frontend Stack

- **React 19**: Latest React with concurrent features
- **Vite**: Fast build tool and dev server
- **React Router**: Client-side routing
- **CSS Modules**: Scoped styling
- **Context API**: Global state management (LanguageContext)

### Backend Stack

- **FastAPI**: Modern async Python web framework
- **SQLModel**: Type-safe ORM (Pydantic + SQLAlchemy)
- **Uvicorn**: ASGI server with async support
- **OpenAI SDK**: Official Python client for GPT API
- **Python 3.13**: Latest Python features

### Database

- **SQLite**: Embedded database for development
- **SQLModel ORM**: Type-safe queries and migrations
- **Auto-migrations**: Tables created on startup

### External Services

- **OpenAI API**: GPT-4o-mini for translations
- **API Key Storage**: Local file (`config/api_key.txt`)

## Configuration Management

### Backend Configuration

Located in `backend/config/`:

1. **constants.py**:

   ```python
   SUPPORTED_LANGUAGES = {
       "en": "English",
       "es": "Spanish",
       "fr": "French",
       # ... more languages
   }

   PRE_CACHE_LANGUAGES = ["es"]  # Languages to pre-translate
   ```

2. **api_key.txt**:

   - Contains OpenAI API key
   - Gitignored for security
   - Loaded by TranslationService

### Frontend Configuration

- **API Base URL**: Hardcoded to `http://localhost:8000`
- **Language Options**: Defined in Header component
- **Default Language**: English (`en`)

## Security Considerations

### Current Implementation (Development)

⚠️ **Not production-ready**:

- Passwords stored in plain text
- CORS allows all origins (`*`)
- No JWT or session tokens
- API key stored in plain text file
- No rate limiting

### Production Recommendations

✅ **Required for production**:

1. **Authentication**:

   - Hash passwords with bcrypt/argon2
   - Implement JWT tokens or session-based auth
   - Add refresh token rotation
   - Implement password reset flow

2. **API Security**:

   - Restrict CORS to frontend domain
   - Add rate limiting (e.g., slowapi)
   - Implement API key rotation
   - Use environment variables for secrets
   - Add request validation and sanitization

3. **Database**:

   - Migrate to PostgreSQL
   - Enable SSL connections
   - Implement backup strategy
   - Add connection pooling

4. **Translation Service**:

   - Store API key in secret manager (AWS Secrets, HashiCorp Vault)
   - Implement usage quotas per user
   - Add fallback to cached translations if API fails
   - Monitor API costs

## Deployment Architecture

### Development Environment

```
localhost:5173 (Frontend) ──► localhost:8000 (Backend) ──► local database.db
                                      │
                                      └──► OpenAI API
```

### Production Architecture (Recommended)

```
                          ┌─── CDN (CloudFront)
                          │
User ──► Load Balancer ───┼─── Frontend (S3/Nginx)
                          │
                          └─── API Gateway ──► Backend (ECS/Lambda)
                                                    │
                                                    ├─── RDS (PostgreSQL)
                                                    ├─── Redis (Cache)
                                                    ├─── Secrets Manager
                                                    └─── OpenAI API
```

## Performance Optimizations

### Current Optimizations

1. **Translation Caching**: Reduces API calls by 90%+
2. **Pre-caching**: Translates on form creation, not retrieval
3. **JSON Storage**: Reduces JOIN operations
4. **Indexed Queries**: Fast lookups on email and form_id

### Future Optimizations

1. **Redis Caching**: Add Redis layer for frequently accessed data
2. **CDN**: Serve static frontend assets via CDN
3. **Database Indexing**: Add compound indexes for complex queries
4. **Lazy Loading**: Load form fields on demand
5. **Pagination**: Add pagination to submissions list
6. **WebSockets**: Real-time form updates for admins

## Monitoring and Observability

### Recommended Tools

- **Application Monitoring**: Sentry for error tracking
- **Performance**: New Relic or DataDog APM
- **Logs**: Structured logging with ELK stack
- **Metrics**: Prometheus + Grafana for system metrics
- **Uptime**: UptimeRobot or Pingdom

### Key Metrics to Monitor

1. **API Performance**:

   - Response time per endpoint
   - Error rate
   - Request rate

2. **Translation Service**:

   - Cache hit rate
   - OpenAI API latency
   - Translation costs per day

3. **Database**:

   - Query execution time
   - Connection pool usage
   - Database size

4. **User Activity**:

   - Forms created per day
   - Submissions per day
   - Active users
   - Language distribution

---

**Last Updated**: October 3, 2025
**Architecture Version**: 1.0.0
