from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings

from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import api_view, parser_classes
from rest_framework.response import Response
from rest_framework import status

from apps.user_media.models import UserMedia
from apps.user_media.serializers import UserMediaSerializer
from apps.user_media.utils import Utils

@api_view(['GET'])
def media_list(request):
    page = request.GET.get('page', 1)
    limit = request.GET.get('limit', 15)
    media = Utils.get_media_paginated(page, limit)
    serializer = UserMediaSerializer(media, many=True)
    return Response(serializer.data)


@csrf_exempt
@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def upload_files(request):
    if request.method == 'POST':
        files = request.FILES.getlist('files[]')
        if not Utils.validate_max_file_upload(files):
            return Response({'error': f'Maximum {settings.MAX_ALLOWED_FILES} files can be uploaded at a time!'}, status=status.HTTP_400_BAD_REQUEST)

        invalid_file_errors = []
        for file in files:
            media_type, content_type = file.content_type.split('/')

            file_error = Utils.validate_upload_file(file)
            if file_error:
                invalid_file_errors.append({file.name: file_error})
                continue

            media_object = UserMedia(
                file=file,
                file_name=file.name,
                size=file.size,
                type=file.content_type,
                category=media_type
            )
            media_object.save()
        
        message = 'Files uploaded successfully!'
        if len(invalid_file_errors) > 0:
            message = 'Files uploaded Successfully. But some files are invalid!'

        return Response({
            'message': message, 
            'invalid_file_errors': invalid_file_errors,
            }, status=status.HTTP_201_CREATED)
    return Response({'error': 'Invalid request method'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
def delete_media(request, id):
    try:
        media = UserMedia.objects.get(id=id)
        media.delete()
        # delete media file from storage
        default_storage.delete(media.file.name)
        return Response({'message': 'Media deleted successfully!'}, status=status.HTTP_200_OK)
    except UserMedia.DoesNotExist:
        return Response({'error': 'Media not found!'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)