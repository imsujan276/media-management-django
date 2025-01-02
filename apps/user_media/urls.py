
from django.urls import path

from apps.user_media.views import index

urlpatterns = [
    path('', index, name='index'),

]