from rest_framework import viewsets, generics
from rest_framework.permissions import IsAuthenticated
from .models import User
from .serializers import UserSerializer
from .permissions import IsAdmin, IsAdminOrEmployee


# Create your views here.
class EmployeeViewSet(viewsets.ModelViewSet):
    """
        ViewSet para el modelo Employee.
        Permite a los administradores gestionar empleados.
    """
    queryset = User.objects.filter(role='employee')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated & IsAdmin]


class ClientViewSet(viewsets.ModelViewSet):
    """
        ViewSet para el modelo Client.
        Permite a los administradores y empleados gestionar clientes.
    """
    queryset = User.objects.filter(role='client')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated & IsAdminOrEmployee]


class ProfileViewSet(generics.RetrieveUpdateAPIView):
    """
        ViewSet para que cada usuario gestione su propio perfil.
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
    