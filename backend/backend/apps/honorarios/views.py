from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.filters import OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, NotFound
from django.db.models import Sum
from drf_spectacular.utils import extend_schema
from rest_framework.pagination import PageNumberPagination

from .models import Honorario, Payment
from .serializers import HonorarioSerializer, PaymentSerializer
from .permissions import HonorarioPermission, PaymentPermission

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50

@extend_schema(tags=["Honorarios"])
class HonorarioViewSet(viewsets.ModelViewSet):
	"""CRUD para Honorario.

	- `admin` y `employee` pueden listar/crear/actualizar/eliminar honorarios.
	- `client` sólo puede ver sus propios honorarios.
	- El campo `honorario` acepta subida (PDF) usando multipart/form-data.
	"""
	queryset = Honorario.objects.all()
	serializer_class = HonorarioSerializer
	permission_classes = (IsAuthenticated, HonorarioPermission)
	parser_classes = (MultiPartParser, FormParser, JSONParser)
	filter_backends = (DjangoFilterBackend, OrderingFilter)
	filterset_fields = ("status", "user", "user__razon_social")
	ordering_fields = ("date",)
	ordering = ("date",)
	pagination_class = StandardResultsSetPagination

	def get_queryset(self):
		user = self.request.user
		if user.role in ("admin", "employee"):
			return Honorario.objects.all()
		return Honorario.objects.filter(user=user)

	def perform_create(self, serializer):
		user = self.request.user
		if user.role not in ("admin", "employee"):
			raise PermissionDenied("Only admin or employee can create honorarios.")

		target_user = serializer.validated_data.get("user")
		if target_user and getattr(target_user, "role", None) != "client":
			raise PermissionDenied("Honorario must be assigned to a client.")

		honorario_file = serializer.validated_data.get("honorario")
		if honorario_file and not honorario_file.name.lower().endswith(".pdf"):
			raise PermissionDenied("Honorario file must be a PDF.")

		serializer.save()

	def perform_update(self, serializer):
		user = self.request.user
		if user.role not in ("admin", "employee"):
			raise PermissionDenied("Only admin or employee can update honorarios.")

		honorario_file = serializer.validated_data.get("honorario")
		if honorario_file and not honorario_file.name.lower().endswith(".pdf"):
			raise PermissionDenied("Honorario file must be a PDF.")

		serializer.save()

	def destroy(self, request, *args, **kwargs):
		user = request.user
		if user.role not in ("admin", "employee"):
			raise PermissionDenied("Only admin or employee can delete honorarios.")
		return super().destroy(request, *args, **kwargs)

@extend_schema(tags=["Payments"])
class PaymentViewSet(viewsets.ModelViewSet):
	"""Endpoints para pagos.

	- `client` puede crear pagos sólo para sus honorarios.
	- `admin` y `employee` pueden ver todos los pagos.
	- Al crear un pago, si el total pagado >= monto del honorario se marca como `pagado`.
	- Soporta subida de `ticket_pdf` (PDF) vía multipart/form-data.
	"""
	queryset = Payment.objects.all()
	serializer_class = PaymentSerializer
	permission_classes = (IsAuthenticated, PaymentPermission)
	parser_classes = (MultiPartParser, FormParser, JSONParser)
	filter_backends = (DjangoFilterBackend, OrderingFilter)
	# permitir filtrar por método de pago, fecha, honorario, user (id) y razon_social del user
	filterset_fields = ("payment_method", "payment_date", "honorario", "user", "user__razon_social")
	ordering_fields = ("payment_date",)
	ordering = ("payment_date",)
	pagination_class = StandardResultsSetPagination

	def get_queryset(self):
		user = self.request.user
		if user.role in ("admin", "employee"):
			return Payment.objects.all()
		return Payment.objects.filter(honorario__user=user)

	def perform_create(self, serializer):
		user = self.request.user
		honorario = serializer.validated_data.get("honorario")
		if not honorario:
			raise NotFound("Honorario is required for a payment.")

		# Clients can only pay their own honorarios
		if user.role == "client" and honorario.user != user:
			raise PermissionDenied("Clients can only pay their own honorarios.")

		ticket = serializer.validated_data.get("ticket_pdf")
		if ticket and not ticket.name.lower().endswith(".pdf"):
			raise PermissionDenied("Ticket must be a PDF.")

		payment = serializer.save()

		# Sumar payment_amount al paid_amount del honorario
		payment_amount = payment.payment_amount
		honorario.paid_amount += payment_amount

		# Verificar si el total pagado alcanza el monto adeudado
		if honorario.paid_amount >= honorario.amount:
			honorario.status = "pagado"

		honorario.save()

		return payment

