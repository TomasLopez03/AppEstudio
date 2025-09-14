from rest_framework import serializers
from .models import User

# User serializer.
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'razon_social', 'celular', 'cuit', 'is_active']
        extra_kwargs = {
            'password': {'write_only': True}
        }