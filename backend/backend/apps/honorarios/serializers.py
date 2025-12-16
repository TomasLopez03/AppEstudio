from rest_framework import serializers
from .models import Honorario, Payment

# Serializador para el modelo Honorario
class HonorarioSerializer(serializers.ModelSerializer):
    razon_social = serializers.CharField(source='user.razon_social', read_only=True)
    class Meta:
        model = Honorario
        # incluimos razon_social como campo adicional de solo lectura
        fields = '__all__'

# Serializador para el modelo Payment
class PaymentSerializer(serializers.ModelSerializer):
    razon_social = serializers.CharField(source='user.razon_social', read_only=True)
    class Meta:
        model = Payment
        fields = '__all__'