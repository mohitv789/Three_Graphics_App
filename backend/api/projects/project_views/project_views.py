import uuid
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from projects.models import ProjectEntity

class ProjectListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        projects = ProjectEntity.objects.filter(
            owner=request.user,
            entity_type="project",
            entity_id="project#meta"
        ).order_by("-updated_at")

        return Response([
            {
                "project_id": p.project_id,
                "name": p.payload.get("name"),
                "updated_at": p.updated_at
            }
            for p in projects
        ])

    def post(self, request):
        name = request.data.get("name")
        if not name:
            return Response(
                {"error": "Project name is required"},
                status=400
            )

        project_id = str(uuid.uuid4())

        ProjectEntity.objects.create(
            project_id=project_id,
            entity_id="project#meta",
            entity_type="project",
            owner=request.user,
            payload={
                "name": name,
                "active_scene_id": "scene#root"
            }
        )

        return Response(
            {"project_id": project_id},
            status=201
        )
class ProjectDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):
        entities = ProjectEntity.objects.filter(
            project_id=project_id,
            owner=request.user
        )

        if not entities.exists():
            return Response(
                {"error": "Project not found"},
                status=404
            )

        project = None
        scene = None

        for e in entities:
            if e.entity_id == "project#meta":
                project = e.payload
            elif e.entity_id == "scene#root":
                scene = e.payload

        return Response({
            "project": project,
            "scene": scene
        })

class ProjectSaveSceneView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, project_id):
        # 1. Ensure project exists and belongs to user
        if not ProjectEntity.objects.filter(
            project_id=project_id,
            owner=request.user,
            entity_type="project",
            entity_id="project#meta"
        ).exists():
            return Response(
                {"error": "Project not found"},
                status=404
            )

        # 2. Save raw scene payload
        ProjectEntity.objects.update_or_create(
            project_id=project_id,
            entity_id="scene#root",
            owner=request.user,   # <-- CRITICAL
            defaults={
                "entity_type": "scene",
                "payload": request.data
            }
        )

        return Response({"status": "saved"})
