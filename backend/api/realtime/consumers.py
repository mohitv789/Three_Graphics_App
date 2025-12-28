from channels.generic.websocket import AsyncJsonWebsocketConsumer

class EditorConsumer(AsyncJsonWebsocketConsumer):

    async def connect(self):
        self.project_id = self.scope["url_route"]["kwargs"]["project_id"]
        self.room = f"project_{self.project_id}"

        await self.channel_layer.group_add(self.room, self.channel_name)
        await self.accept()

    async def receive_json(self, content):
        await self.channel_layer.group_send(
            self.room,
            {"type": "broadcast", "data": content}
        )

    async def broadcast(self, event):
        await self.send_json(event["data"])
