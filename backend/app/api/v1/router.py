from fastapi import APIRouter

from app.api.v1 import auth, properties, saved_searches, favorites, enquiries
from app.api.v1.admin import sources, ingestion, users, dashboard, audit

api_v1_router = APIRouter()

# Public / authenticated routes
api_v1_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_v1_router.include_router(properties.router, prefix="/properties", tags=["Properties"])
api_v1_router.include_router(saved_searches.router, prefix="/saved-searches", tags=["Saved Searches"])
api_v1_router.include_router(favorites.router, prefix="/favorites", tags=["Favorites"])
api_v1_router.include_router(enquiries.router, prefix="/enquiries", tags=["Enquiries"])

# Admin routes
api_v1_router.include_router(sources.router, prefix="/admin/sources", tags=["Admin - Sources"])
api_v1_router.include_router(ingestion.router, prefix="/admin/ingestion", tags=["Admin - Ingestion"])
api_v1_router.include_router(users.router, prefix="/admin/users", tags=["Admin - Users"])
api_v1_router.include_router(dashboard.router, prefix="/admin/dashboard", tags=["Admin - Dashboard"])
api_v1_router.include_router(audit.router, prefix="/admin/audit", tags=["Admin - Audit"])
