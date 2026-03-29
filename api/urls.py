from django.urls import path
from .views import *

urlpatterns = [
    path("login", login_user, name="login"),
    path("register", register_user, name="register"),
    path("catalog", catalog_properties, name="catalog-properties"),
    path("favourites", favourites, name="favourites"),
]
