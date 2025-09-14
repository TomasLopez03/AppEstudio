from django.db import models
from users.models import User

# Modelo para gestionar honorarios y pagos asociados
class Honorario(models.Model):
    STATUS_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('pagado', 'Pagado'),
    ]

    id = models.AutoField(primary_key=True, auto_created=True)
    date = models.DateField(auto_now_add=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pendiente')
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    honorario_pdf = models.FileField(upload_to='honorarios/', null=True)

    def __str__(self):
        return f'Honorario {self.id} - {self.status} - {self.amount}'
    
class Payment(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('efectivo', 'Efectivo'),
        ('transferencia', 'Transferencia'),
        ('cheque', 'Cheque'),
    ]

    id = models.AutoField(primary_key=True, auto_created=True)
    honorario_id = models.ForeignKey(Honorario, on_delete=models.CASCADE)
    payment_date = models.DateField(auto_now_add=True)
    payment_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=15, choices=PAYMENT_METHOD_CHOICES)
    ticket_pdf = models.FileField(upload_to='tickets/', null=True)

    def __str__(self):
        return f'Payment {self.id} for Honorario {self.honorario.id} - {self.payment_amount}'