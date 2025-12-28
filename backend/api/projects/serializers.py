from rest_framework import serializers
from .models import ProjectEntity


class ProjectEntitySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectEntity
        fields = "__all__"
        read_only_fields = ("created_at", "updated_at")
