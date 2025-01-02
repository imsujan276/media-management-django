from django.core.paginator import Paginator
from django.conf import settings

from apps.user_media.models import UserMedia

class Utils:

    def get_media_paginated(page=1, limit=15):
        """
        Get paginated media list
        :param page: int
        :param limit: int
        :return: QuerySet object
        """
        media_list = UserMedia.objects.all()
        paginator = Paginator(media_list, limit)
        paginated_media = paginator.get_page(page)
        return paginated_media

    def validate_max_file_upload(files) -> bool:
        """
        Validate max file upload limit
        :param files: list
        :return: bool
        """
        return len(files) <= int(settings.MAX_ALLOWED_FILES)

    def validate_upload_file(file) -> str | None:
        """
        Validate file before uploading
        :param file: File object
        :return: str | None
        """
        media_type, content_type = file.content_type.split('/')
        
        if not content_type or not media_type:
            return 'Invalid file'

        if content_type.lower() not in settings.ALLOWED_EXTENSIONS or media_type.lower() not in ['image', 'video', 'audio']:
            return 'Invalid file type'

        file_size_in_kb = file.size / 1024
        if file_size_in_kb > int(settings.MAX_FILE_SIZE):
            return f'File size exceeds the limit of {settings.MAX_FILE_SIZE}KB'
        
        if file_size_in_kb < int(settings.MIN_FILE_SIZE):
            return f'File size is too small to upload. Minimum file size is {settings.MIN_FILE_SIZE}KB'
        
        return None