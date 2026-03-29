from django.urls import path
from .views import *

urlpatterns = [
    # Define your API endpoints here
    # Example:
    path("login/", login_user, name="login"),
    path("register/", register_user, name="register"),
    path("properties/", get_properties, name="get-properties"),
    # path('properties/', PropertyList.as_view(), name='property-list'),
    # path('favourites/', FavouriteList.as_view(), name='favourite-list'),
]
