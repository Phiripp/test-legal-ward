# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('conflict_detector', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='descubrimientoconflicto',
            name='estado',
            field=models.CharField(
                choices=[
                    ('PENDING', 'Pendiente'),
                    ('TRACKING', 'En Seguimiento'),
                    ('DISCARDED', 'Descartado')
                ],
                default='PENDING',
                help_text='Estado del descubrimiento: Pendiente, En Seguimiento o Descartado',
                max_length=20
            ),
        ),
    ]

