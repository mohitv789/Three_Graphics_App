from rest_framework import serializers

class GeometrySerializer(serializers.Serializer):
    type = serializers.ChoiceField(choices=["box", "sphere", "cylinder"])
    params = serializers.DictField()

class MaterialSerializer(serializers.Serializer):
    type = serializers.ChoiceField(choices=["standard", "lambert"])
    color = serializers.CharField()

class ObjectPayloadSerializer(serializers.Serializer):
    kind = serializers.ChoiceField(choices=["mesh"])
    geometry = GeometrySerializer()
    material = MaterialSerializer()
    schema_version = serializers.IntegerField()

