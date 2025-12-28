from django.db import models
from django.conf import settings
from core.models import TimeStampedModel

class ProjectEntity(TimeStampedModel):
    ENTITY_TYPES = (
        ("project", "Project"),
        ("scene", "Scene"),
        ("object", "Object"),
        ("op", "Operation"),
    )

    project_id = models.CharField(max_length=64, db_index=True)
    entity_id = models.CharField(max_length=128, db_index=True)

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="project_entities",
        db_index=True,
    )

    entity_type = models.CharField(
        max_length=16,
        choices=ENTITY_TYPES
    )

    payload = models.JSONField()

    class Meta:
        db_table = "project_entities"
        unique_together = ("project_id", "entity_id")
        indexes = [
            models.Index(fields=["project_id", "entity_type"]),
        ]

    def __str__(self):
        return f"{self.project_id} :: {self.entity_type} :: {self.entity_id}"
