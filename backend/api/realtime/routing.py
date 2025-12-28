from django.urls import re_path
from .consumers import EditorConsumer

websocket_urlpatterns = [
    re_path(r"ws/editor/(?P<project_id>[^/]+)/$", EditorConsumer.as_asgi()),
]
