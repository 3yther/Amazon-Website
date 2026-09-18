from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class User(AbstractUser):

    user_types = {
        "student": "Student",
        "school": "School",
        "supporters": "Person around a student",
    }

    user_type = models.CharField(
        max_length=20,
        choices= user_types.items(),
        default="student",
    )

    def __str__(self):
        return self.username


    