from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'employees', views.EmployeeViewSet, basename='employee')
router.register(r'clients', views.ClientViewSet, basename='client')

urlpatterns = [
    path('employees/', include(router.urls)),
    path('clients/', include(router.urls)),
]