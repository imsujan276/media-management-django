
from django.urls import path

from apps.user_media.api.views import upload_files, media_list, delete_media

urlpatterns = [
    path('media_list/', media_list, name='list'),
    path('upload_files/', upload_files, name='upload_files'),
    path('delete_media/<int:id>/', delete_media, name='delete_media'),
]