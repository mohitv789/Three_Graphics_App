from rest_framework.viewsets import ModelViewSet
from rest_framework.filters import OrderingFilter
from rest_framework.permissions import IsAuthenticated

from .models import ProjectEntity
from .serializers import ProjectEntitySerializer


class ProjectEntityViewSet(ModelViewSet):
    serializer_class = ProjectEntitySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [OrderingFilter]
    ordering_fields = ["created_at", "updated_at"]

    def get_queryset(self):
        queryset = ProjectEntity.objects.filter(
            owner=self.request.user
        )

        project_id = self.request.query_params.get("project_id")
        entity_type = self.request.query_params.get("entity_type")

        if project_id:
            queryset = queryset.filter(project_id=project_id)

        if entity_type:
            queryset = queryset.filter(entity_type=entity_type)

        return queryset
