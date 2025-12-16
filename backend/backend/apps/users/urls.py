from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'v1/employees', views.EmployeeViewSet, basename='employee')
router.register(r'v1/clients', views.ClientViewSet, basename='client')

urlpatterns = router.urls