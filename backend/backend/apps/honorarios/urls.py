from rest_framework.routers import DefaultRouter
from . import views
from django.urls import path, include

router = DefaultRouter()
router.register(r'v1/honorario', views.HonorarioViewSet, basename='honorario')
router.register(r'v1/payment', views.PaymentViewSet, basename='payment')

urlpatterns = router.urls