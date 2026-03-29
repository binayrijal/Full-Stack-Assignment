from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from django.contrib.auth.hashers import check_password, make_password
from rest_framework_simplejwt.tokens import RefreshToken
from api.models import User, Property, Favourite
from api.serializers import PropertySerializer
from api.pagination import CatalogPagination
from api.responses import api_response
import json


@api_view(["POST"])
def login_user(request):
    data = json.loads(request.body)
    email = data.get("email")
    password = data.get("password")
    try:
        user = User.objects.get(email=email)
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
        },
        status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([AllowAny])  # <-- Allow anyone to register
def register_user(request):
    try:
        data = request.data  # DRF automatically parses JSON
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")
        role = data.get("role", "buyer")  # default role if not provided

        if User.objects.filter(email=email).exists():
            return api_response(
                "Email already exists", {}, status.HTTP_400_BAD_REQUEST
            )

        # Create user and hash password
        user = User(
            name=name,
            email=email,
            password=make_password(password),  # Use make_password
            role=role,
        )
        user.save()

        return api_response(
            "User registered successfully", {}, status.HTTP_201_CREATED
        )

    except Exception as e:
        return api_response(str(e), {}, status.HTTP_400_BAD_REQUEST)


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
            properties = Property.objects.filter(
                favourite__user=request.user
            ).distinct()
            serializer = PropertySerializer(properties, many=True)
            return api_response(
                "Favourites fetched successfully",
                {"results": serializer.data},
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
