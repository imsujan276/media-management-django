import os 
from django.conf import settings

def export_vars(request):
    data = {}
    # data['DEBUG'] = os.environ['DJANGO_SETTINGS_MODULE']
    data['DEBUG'] = settings.DEBUG
    data['APP_NAME'] = settings.APP_NAME
    data['MAX_ALLOWED_FILES'] = settings.MAX_ALLOWED_FILES
    data['ALLOWED_EXTENSIONS'] = settings.ALLOWED_EXTENSIONS
    return data