import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Pathway',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(choices=[('Digital', 'Digital'), ('Business', 'Business'), ('Media', 'Media'), ('Finance', 'Finance'), ('Engineering', 'Engineering')], max_length=20, unique=True)),
                ('slug', models.SlugField(unique=True)),
                ('summary', models.CharField(max_length=255)),
                ('description', models.TextField()),
            ],
            options={
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='ContentItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('slug', models.SlugField(max_length=200, unique=True)),
                ('description', models.TextField()),
                ('content_type', models.CharField(choices=[('guide', 'Guide'), ('document', 'Document'), ('video', 'Video'), ('prep_pack', 'Prep pack'), ('class_pack', 'Class pack')], max_length=20)),
                ('access_level', models.CharField(choices=[('free', 'Free'), ('signup', 'Sign-up (needs an account)')], default='free', max_length=10)),
                ('audience', models.CharField(choices=[('all', 'Everyone'), ('student', 'Students'), ('parent', 'Parents and guardians'), ('teacher', 'Teachers and schools')], default='all', max_length=10)),
                ('file', models.FileField(blank=True, null=True, upload_to='content/')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('pathway', models.ForeignKey(blank=True, help_text='Leave empty if this applies to all pathways.', null=True, on_delete=django.db.models.deletion.PROTECT, related_name='content_items', to='content.pathway')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]
