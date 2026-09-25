"""
The fields the official registered-providers list carries, plus the flag that
says whether anyone has checked which subjects a provider actually runs.

Written by hand rather than prompted for: region and provider_type are not
nullable and every row gets a real value from the refreshed fixture, so the
one-off default here exists only to let the column be added, and is dropped
again by preserve_default=False.
"""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("providers", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="provider",
            name="region",
            field=models.CharField(
                choices=[
                    ("East Midlands", "East Midlands"),
                    ("East of England", "East of England"),
                    ("London", "London"),
                    ("North East", "North East"),
                    ("North West", "North West"),
                    ("South East", "South East"),
                    ("South West", "South West"),
                    ("West Midlands", "West Midlands"),
                    ("Yorkshire and the Humber", "Yorkshire and the Humber"),
                ],
                default="London",
                max_length=30,
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="provider",
            name="provider_type",
            field=models.CharField(
                choices=[
                    ("Academy", "Academy"),
                    ("Agricultural and Horticultural College", "Agricultural and Horticultural College"),
                    ("Art and Design College", "Art and Design College"),
                    ("General FE and Tertiary College", "General FE and Tertiary College"),
                    ("Higher Education Institution", "Higher Education Institution"),
                    ("Independent Learning Provider", "Independent Learning Provider"),
                    ("Local Authority", "Local Authority"),
                    (
                        "Local Authority Maintained School Sixth Form",
                        "Local Authority Maintained School Sixth Form",
                    ),
                    ("Sixth Form College", "Sixth Form College"),
                    ("Special Post-16 Institution", "Special Post-16 Institution"),
                    ("University Technical College", "University Technical College"),
                ],
                default="General FE and Tertiary College",
                max_length=60,
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="provider",
            name="foundation_year",
            field=models.BooleanField(
                default=False,
                help_text=(
                    "Offers the T-Level Foundation Year, the one-year course taken "
                    "before a T-Level."
                ),
            ),
        ),
        migrations.AddField(
            model_name="provider",
            name="pathways_confirmed",
            field=models.BooleanField(
                default=False,
                help_text=(
                    "Tick when the pathways above have actually been checked against the "
                    'provider. Left unticked, an empty pathway list reads as "not known '
                    'yet" rather than "none".'
                ),
            ),
        ),
        migrations.AlterField(
            model_name="provider",
            name="address",
            field=models.CharField(blank=True, max_length=255),
        ),
    ]
