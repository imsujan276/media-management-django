from django.db import models

class UserMedia(models.Model):
    class MediaType(models.TextChoices):
        IMAGE = 'image', 'Image'
        VIDEO = 'video', 'Video'
        AUDIO = 'audio', 'Audio'

    id = models.AutoField(primary_key=True)
    file = models.FileField(upload_to='uploads/')
    file_name = models.CharField(max_length=255)
    size = models.IntegerField()
    type = models.CharField(max_length=255)
    category = models.CharField(max_length=5, choices=MediaType.choices)
    date_uploaded = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.file_name

    class Meta:
        verbose_name = "User Media"
        verbose_name_plural = "User Media"
        ordering = ["-date_uploaded"]
    