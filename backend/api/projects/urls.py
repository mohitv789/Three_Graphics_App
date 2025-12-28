from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import ProjectEntityViewSet
from .project_views.project_views import (
    ProjectListCreateView,
    ProjectDetailView,
    ProjectSaveSceneView,
)
from .project_views.object_views import (
    ObjectListCreateView,
    ObjectUpdateView,
    ObjectDeleteView,
)

router = DefaultRouter()
router.register(
    r"entities",
    ProjectEntityViewSet,
    basename="project-entities"
)

urlpatterns = [
    # Project APIs (relative to /api/projects/)
    path("", ProjectListCreateView.as_view()),
    path("<str:project_id>/", ProjectDetailView.as_view()),
    path("<str:project_id>/scene/", ProjectSaveSceneView.as_view()),

    # Objects
    path("<str:project_id>/objects/", ObjectListCreateView.as_view()),
    path("<str:project_id>/objects/<str:object_id>/", ObjectUpdateView.as_view()),
    path("<str:project_id>/objects/<str:object_id>", ObjectDeleteView.as_view()),

    # Low-level entity APIs (internal/admin/debug)
    path("", include(router.urls)),
]
