from django.urls import path
from .views import *

urlpatterns = [
    path("login", login_user, name="login"),
    path("register", register_user, name="register"),
    path("me", current_user, name="current-user"),
    path("properties", create_property, name="create-property"),
    path("catalog", catalog_properties, name="catalog-properties"),
    path("favourites", favourites, name="favourites"),
]
