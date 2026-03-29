from django.urls import path
from .views import *

urlpatterns = [
    path("login", login_user, name="login"),
    path("login/", login_user, name="login-slash"),
    path("register", register_user, name="register"),
    path("register/", register_user, name="register-slash"),
    path("me", current_user, name="current-user"),
    path("me/", current_user, name="current-user-slash"),
    path("catalog", catalog_properties, name="catalog-properties"),
    path("catalog/", catalog_properties, name="catalog-properties-slash"),
    path("favourites", favourites, name="favourites"),
    path("favourites/", favourites, name="favourites-slash"),
]
