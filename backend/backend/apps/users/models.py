from django.db import models
from django.contrib.auth.models import AbstractUser

# User model.
class User(AbstractUser ,models.Model):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('client', 'Client'),
        ('employee', 'Employee'),
    ]

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='client')
    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True, null=False)
    password = models.CharField(max_length=128)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    razon_social = models.CharField(max_length=100, null=True)
    celular = models.IntegerField(null=True)
    cuit = models.CharField(max_length=20, null=False, unique=True)
    is_active = models.BooleanField(default=True)

