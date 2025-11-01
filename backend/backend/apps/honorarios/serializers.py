from rest_framework import serializers
from .models import Honorario, Payment

# Serializador para el modelo Honorario
class HonorarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Honorario
        fields = '__all__'

# Serializador para el modelo Payment
class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'