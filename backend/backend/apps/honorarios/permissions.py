from rest_framework.permissions import BasePermission

# Solo admin
class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'admin'
    

# Admin o Employee
class IsAdminOrEmployee(BasePermission):
    def has_permission(self, request, view):
        return request.user.role in ['admin', 'employee']
    
#Client
class IsClient(BasePermission):
    def has_permission(self, request, view, obj):
        return request.user.role == 'client' and request.user.id == obj.id
    
