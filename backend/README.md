# Backend

## Authentication

Authentication for Stock0 is handled entirely by **Appwrite** - a Backend-as-a-Service platform that provides:

- 🔐 **Google OAuth** integration
- 👤 **User management** and session handling  
- 🗄️ **Database** for user data and preferences
- 🔑 **API keys** for server-side operations
- 🔒 **Security** with built-in rate limiting and permissions

## Architecture

```
Frontend (Next.js) ←→ Appwrite Cloud ←→ Database
                              ↓
                         Google OAuth
```

## Services Used

- **Appwrite Auth** - Handles Google OAuth flow and session management
- **Appwrite Database** - Stores user profiles and application data
- **Appwrite Storage** - For future file uploads (avatars, documents)

## Configuration

All backend configuration is done through:
1. **Appwrite Console** - Web interface for managing services
2. **Environment Variables** - Configure endpoints and credentials
3. **Client Libraries** - `appwrite` (frontend) and `node-appwrite` (server)

## Future Extensions

When ready for advanced features, we can add:
- **FastAPI** server for custom AI/ML endpoints
- **Langchain** integration for document processing
- **Tavily** for real-time news aggregation
- **Mem0** for personalized recommendations

For now, Appwrite provides everything needed for authentication and data management. 