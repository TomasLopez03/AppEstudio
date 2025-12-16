
from rest_framework import permissions

from .models import Honorario


class IsAdminOrEmployee(permissions.BasePermission):
	"""Permite acceso sólo a usuarios con role 'admin' o 'employee'."""

	def has_permission(self, request, view):
		return bool(request.user and request.user.is_authenticated and getattr(request.user, "role", None) in ("admin", "employee"))


class HonorarioPermission(permissions.BasePermission):
	"""Permisos para `Honorario`.

	- Lectura: `admin`/`employee` ven todo; `client` ve sólo sus propios honorarios.
	- Escritura (create/update/delete): sólo `admin` y `employee`.
	"""

	def has_permission(self, request, view):
		return bool(request.user and request.user.is_authenticated)

	def has_object_permission(self, request, view, obj):
		if request.method in permissions.SAFE_METHODS:
			if getattr(request.user, "role", None) in ("admin", "employee"):
				return True
			return obj.user == request.user

		# Métodos que modifican/eliminen: sólo staff (admin/employee)
		return getattr(request.user, "role", None) in ("admin", "employee")


class PaymentPermission(permissions.BasePermission):
	"""Permisos para `Payment`.

	- Lectura: `admin`/`employee` ven todo; `client` puede ver pagos relacionados a sus honorarios.
	- Creación: `client` sólo puede crear pagos para honorarios que le pertenezcan.
	"""

	def has_permission(self, request, view):
		user = request.user
		if not (user and user.is_authenticated):
			return False

		# Para POST, si es cliente comprobamos que el honorario pertenece al cliente
		if request.method == "POST" and getattr(user, "role", None) == "client":
			honorario_id = request.data.get("honorario")
			if not honorario_id:
				return False
			try:
				honorario = Honorario.objects.get(pk=honorario_id)
			except Exception:
				return False
			return honorario.user == user

		return True

	def has_object_permission(self, request, view, obj):
		# obj es un Payment
		if getattr(request.user, "role", None) in ("admin", "employee"):
			return True
		return obj.honorario.user == request.user

