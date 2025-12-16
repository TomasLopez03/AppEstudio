from rest_framework import viewsets, generics
from rest_framework.permissions import IsAuthenticated
from .models import User
from .serializers import UserSerializer
from .permissions import IsAdmin, IsAdminOrEmployee
from rest_framework.pagination import PageNumberPagination
from drf_spectacular.utils import extend_schema

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50


# Create your views here.
@extend_schema(tags=["Employees"])
class EmployeeViewSet(viewsets.ModelViewSet):
    """
        CRUD para Employees.
        - `admin` puede listar/crear/actualizar/eliminar empleados.
    """
    queryset = User.objects.filter(role='employee')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated & IsAdmin]
    pagination_class = StandardResultsSetPagination

@extend_schema(tags=["Clients"])
class ClientViewSet(viewsets.ModelViewSet):
    """
        CRUD para Clients.
        - `admin` y `employee` pueden listar/crear/actualizar/eliminar clientes.
    """
    queryset = User.objects.filter(role='client')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated & IsAdminOrEmployee]
    pagination_class = StandardResultsSetPagination

@extend_schema(tags=["Profile"])
class ProfileViewSet(generics.RetrieveUpdateAPIView):
    """
        Perfil del usuario autenticado.
        - Permite al usuario ver y actualizar su propio perfil.
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
    