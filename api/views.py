from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from django.contrib.auth.hashers import check_password
from rest_framework_simplejwt.tokens import RefreshToken
from api.models import User, Property, Favourite
from api.serializers import (
    PropertySerializer,
    CreatePropertySerializer,
    UserPublicSerializer,
    LoginSerializer,
    RegisterSerializer,
)
from api.pagination import CatalogPagination, FavouritesPagination
from api.responses import api_response


@api_view(["POST"])
@permission_classes([AllowAny])
def login_user(request):
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return api_response(
            "Validation failed",
            serializer.errors,
            status.HTTP_400_BAD_REQUEST,
        )
    email = serializer.validated_data["email"]
    password = serializer.validated_data["password"]
    try:
        user = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        return api_response("Invalid credentials", {}, status.HTTP_401_UNAUTHORIZED)
    if not check_password(password, user.password):
        return api_response("Invalid credentials", {}, status.HTTP_401_UNAUTHORIZED)

    refresh = RefreshToken.for_user(user)
    return api_response(
        "Login successful",
        {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": UserPublicSerializer(user).data,
        },
        status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def register_user(request):
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return api_response(
            "Validation failed",
            serializer.errors,
            status.HTTP_400_BAD_REQUEST,
        )
    serializer.save()
    return api_response(
        "User registered successfully",
        {},
        status.HTTP_201_CREATED,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user(request):
    return api_response(
        "Profile loaded",
        UserPublicSerializer(request.user).data,
        status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_property(request):
    serializer = CreatePropertySerializer(data=request.data)
    if not serializer.is_valid():
        return api_response(
            "Validation failed",
            serializer.errors,
            status.HTTP_400_BAD_REQUEST,
        )
    prop = serializer.save()
    return api_response(
        "Property created successfully",
        PropertySerializer(prop).data,
        status.HTTP_201_CREATED,
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def catalog_properties(request):
    queryset = Property.objects.all().order_by("-id")
    paginator = CatalogPagination()
    page = paginator.paginate_queryset(queryset, request)
    if page is not None:
        serializer = PropertySerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
    serializer = PropertySerializer(queryset, many=True)
    results = serializer.data
    return api_response(
        "Properties fetched successfully",
        {
            "count": len(results),
            "next": None,
            "previous": None,
            "results": results,
        },
        status.HTTP_200_OK,
    )


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def favourites(request):
    if request.method == "GET":
        try:
            queryset = (
                Property.objects.filter(favourite__user=request.user)
                .distinct()
                .order_by("-id")
            )
            paginator = FavouritesPagination()
            page = paginator.paginate_queryset(queryset, request)
            if page is not None:
                serializer = PropertySerializer(page, many=True)
                return paginator.get_paginated_response(serializer.data)
            serializer = PropertySerializer(queryset, many=True)
            results = serializer.data
            return api_response(
                "Favourites fetched successfully",
                {
                    "count": len(results),
                    "next": None,
                    "previous": None,
                    "results": results,
                },
                status.HTTP_200_OK,
            )
        except Exception as e:
            return api_response(
                str(e), {}, status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    property_id = request.data.get("property_id")
    liked = request.data.get("liked")

    if property_id is None or liked is None:
        return api_response(
            "property_id and liked are required",
            {},
            status.HTTP_400_BAD_REQUEST,
        )
    if not isinstance(liked, bool):
        return api_response(
            "liked must be a boolean", {}, status.HTTP_400_BAD_REQUEST
        )
    try:
        property_id = int(property_id)
    except (TypeError, ValueError):
        return api_response(
            "property_id must be a valid integer",
            {},
            status.HTTP_400_BAD_REQUEST,
        )

    try:
        prop = Property.objects.get(pk=property_id)
    except Property.DoesNotExist:
        return api_response("Property not found", {}, status.HTTP_404_NOT_FOUND)

    user = request.user

    if liked:
        if Favourite.objects.filter(user=user, property=prop).exists():
            return api_response("Already liked", {}, status.HTTP_200_OK)
        Favourite.objects.create(user=user, property=prop)
        return api_response(
            "Added to favourites", {}, status.HTTP_201_CREATED
        )

    deleted, _ = Favourite.objects.filter(user=user, property=prop).delete()
    if deleted == 0:
        return api_response("Not in favourites", {}, status.HTTP_200_OK)
    return api_response(
        "Removed from favourites", {}, status.HTTP_200_OK
    )
