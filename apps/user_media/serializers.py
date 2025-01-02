from apps.user_media.models import UserMedia
from rest_framework import serializers

class UserMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserMedia
        fields = "__all__"
