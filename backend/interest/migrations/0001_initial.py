import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('content', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='ExpressionOfInterest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('full_name', models.CharField(max_length=150)),
                ('email', models.EmailField(max_length=254)),
                ('user_type', models.CharField(choices=[('student', 'Student'), ('parent', 'Parent or guardian'), ('teacher', 'Teacher or school')], max_length=10)),
                ('message', models.TextField(blank=True)),
                ('submitted_at', models.DateTimeField(auto_now_add=True)),
                ('pathway', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='expressions_of_interest', to='content.pathway')),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='expressions_of_interest', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'expression of interest',
                'verbose_name_plural': 'expressions of interest',
                'ordering': ['-submitted_at'],
            },
        ),
    ]
