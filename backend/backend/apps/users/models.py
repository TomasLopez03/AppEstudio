from django.db import models
from django.contrib.auth.models import AbstractUser

# User model.
class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('client', 'Client'),
        ('employee', 'Employee'),
    ]

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='client')
    email = models.EmailField(unique=True, null=False)
    razon_social = models.CharField(max_length=100, null=True)
    celular = models.IntegerField(null=True)
    cuit = models.CharField(max_length=20, null=False, unique=True)

