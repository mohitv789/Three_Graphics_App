from django.core.management.base import BaseCommand
from projects.models import ProjectEntity


class Command(BaseCommand):
    help = "Remove transforms from object payloads"

    def handle(self, *args, **options):
        qs = ProjectEntity.objects.filter(entity_type="object")

        count = 0
        for obj in qs:
            payload = obj.payload or {}

            changed = False
            for key in ("position", "rotation", "scale"):
                if key in payload:
                    payload.pop(key)
                    changed = True

            if changed:
                obj.payload = payload
                obj.save(update_fields=["payload"])
                count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Cleaned payloads for {count} objects"
            )
        )
