# Generated by Django 3.1.6 on 2021-04-26 20:23

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('auctions', '0009_auto_20210426_1509'),
    ]

    operations = [
        migrations.AddField(
            model_name='listing',
            name='image',
            field=models.URLField(blank=True),
        ),
        migrations.AlterField(
            model_name='listing',
            name='pub_date',
            field=models.DateTimeField(default=datetime.datetime(2021, 4, 26, 16, 23, 7, 115760), verbose_name='listing date'),
        ),
    ]