import uuid
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from projects.models import ProjectEntity
from projects.project_serializers.object_serializers import ObjectPayloadSerializer


class ObjectListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):
        objects = ProjectEntity.objects.filter(
            project_id=project_id,
            owner=request.user,
            entity_type="object"
        )

        return Response([
            {
                "object_id": o.entity_id,
                "payload": o.payload,
                "updated_at": o.updated_at
            }
            for o in objects
        ])

    def post(self, request, project_id):
        serializer = ObjectPayloadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        object_id = f"{uuid.uuid4()}"

        ProjectEntity.objects.create(
            project_id=project_id,
            entity_id=object_id,
            entity_type="object",
            owner=request.user,
            payload=serializer.validated_data
        )

        return Response(
            {
                "object_id": object_id,
                "payload": serializer.validated_data
            },
            status=201
        )

class ObjectUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, project_id, object_id):
        serializer = ObjectPayloadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        ProjectEntity.objects.filter(
            project_id=project_id,
            entity_id=object_id,
            owner=request.user,
            entity_type="object"
        ).update(payload=serializer.validated_data)

        return Response({"status": "updated"})

class ObjectDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, project_id, object_id):
        ProjectEntity.objects.filter(
            project_id=project_id,
            entity_id=object_id,
            owner=request.user,
            entity_type="object"
        ).delete()

        return Response({"status": "deleted"})

