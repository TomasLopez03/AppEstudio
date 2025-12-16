from django.db import models
from apps.users.models import User

# Modelo para gestionar honorarios y pagos asociados
class Honorario(models.Model):
    STATUS_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('pagado', 'Pagado'),
        ('vencido', 'Vencido'),
    ]

    id = models.AutoField(primary_key=True, auto_created=True)
    date = models.DateField(auto_now_add=True)
    title = models.TextField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pendiente')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    honorario = models.FileField(upload_to='honorarios/', null=True)

    def __str__(self):
        return f'Honorario {self.id} - {self.status} - {self.amount}'
    
class Payment(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('efectivo', 'Efectivo'),
        ('transferencia', 'Transferencia'),
        ('cheque', 'Cheque'),
    ]

    id = models.AutoField(primary_key=True, auto_created=True)
    honorario = models.ForeignKey(Honorario, on_delete=models.CASCADE)
    payment_date = models.DateField(auto_now_add=True)
    payment_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=15, choices=PAYMENT_METHOD_CHOICES)
    ticket_pdf = models.FileField(upload_to='tickets/', null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return f'Payment {self.id} for Honorario {self.honorario.id} - {self.payment_amount}'