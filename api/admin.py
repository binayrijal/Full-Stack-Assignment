from django.contrib import admin
from .models import User, Property, Favourite

# Register your models here.
admin.site.register(User)
admin.site.register(Property)
admin.site.register(Favourite)