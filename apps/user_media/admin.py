from django.contrib import admin
from .models import UserMedia

class UserMediaAdmin(admin.ModelAdmin):
    list_display = ('file_name', 'formatted_size', 'type', 'date_uploaded', 'category')
    list_filter = ('type', 'category')
    search_fields = ('file_name', 'type')

    def formatted_size(self, obj):
        size = obj.size
        if size < 1024:
            return f"{size} B"
        elif size < 1024 * 1024:
            return f"{size / 1024:.2f} KB"
        else:
            return f"{size / (1024 * 1024):.2f} MB"
    formatted_size.short_description = 'Formatted Size'

admin.site.register(UserMedia, UserMediaAdmin)
