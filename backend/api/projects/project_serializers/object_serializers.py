from rest_framework import serializers

class ObjectPayloadSerializer(serializers.Serializer):
    type = serializers.CharField()
    geometry = serializers.CharField()
    material = serializers.DictField()
