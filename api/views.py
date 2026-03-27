from rest_framework.decorators import api_view,permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import check_password,make_password
from rest_framework_simplejwt.tokens import RefreshToken
from api.models import User
import json


@api_view(["POST"])
def login_user(request):
    data = json.loads(request.body)
    email = data.get("email")
    password = data.get("password")
    print(f"Login attempt for email: {email}")
    print(f"Password provided: {password}")
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response(
            {"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
        )
    print(f"User found: {user.email}")
    print(f"Stored password hash: {user.password}")
    if not check_password(password, user.password):
        return Response(
            {"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
        )

    refresh = RefreshToken.for_user(user)
    return Response(
        {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        },
        status=status.HTTP_200_OK,
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
            return Response(
                {"error": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Create user and hash password
        user = User(
            name=name,
            email=email,
            password=make_password(password),  # Use make_password
            role=role
        )
        user.save()

        return Response(
            {"message": "User registered successfully"}, status=status.HTTP_201_CREATED
        )

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)