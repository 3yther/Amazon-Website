import django.core.validators
import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("accounts", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="profile",
            name="phone",
            field=models.CharField(blank=True, default="", max_length=32),
        ),
        migrations.AddField(
            model_name="profile",
            name="is_deactivated",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="profile",
            name="deactivated_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="profile",
            name="last_password_changed",
            # One-off default for existing rows: the migration's run time,
            # since the real change date was never recorded before this.
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.CreateModel(
            name="UserPreference",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "font_size_scale",
                    models.IntegerField(
                        default=100,
                        validators=[
                            django.core.validators.MinValueValidator(80),
                            django.core.validators.MaxValueValidator(150),
                        ],
                    ),
                ),
                ("high_contrast", models.BooleanField(default=False)),
                (
                    "text_spacing_level",
                    models.IntegerField(
                        default=0,
                        validators=[
                            django.core.validators.MinValueValidator(0),
                            django.core.validators.MaxValueValidator(3),
                        ],
                    ),
                ),
                (
                    "color_blindness_type",
                    models.CharField(
                        choices=[
                            ("none", "None"),
                            ("protanopia", "Protanopia"),
                            ("deuteranopia", "Deuteranopia"),
                            ("tritanopia", "Tritanopia"),
                        ],
                        default="none",
                        max_length=20,
                    ),
                ),
                ("text_to_speech", models.BooleanField(default=False)),
                ("reduce_motion", models.BooleanField(default=False)),
                (
                    "theme",
                    models.CharField(
                        choices=[("light", "Light"), ("dark", "Dark"), ("system", "Match system")],
                        default="system",
                        max_length=10,
                    ),
                ),
                ("button_outline_style", models.CharField(default="default", max_length=20)),
                ("page_background", models.CharField(default="white", max_length=20)),
                ("language", models.CharField(default="en", max_length=10)),
                ("date_format", models.CharField(default="MM/DD/YYYY", max_length=20)),
                ("number_format", models.CharField(default="US", max_length=10)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "user",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="preferences",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
    ]
