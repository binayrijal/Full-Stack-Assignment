from django.contrib.auth.hashers import make_password
from rest_framework import serializers

from api.models import Property, User


class PropertySerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = "__all__"


class UserPublicSerializer(serializers.ModelSerializer):
    """Safe user fields for responses (no password)."""

    class Meta:
        model = User
        fields = ("id", "name", "email", "role")


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        required=True,
        allow_blank=False,
        trim_whitespace=False,
    )


class RegisterSerializer(serializers.Serializer):
    name = serializers.CharField(
        required=True,
        max_length=100,
        trim_whitespace=True,
    )
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        required=True,
        write_only=True,
        min_length=8,
        max_length=128,
    )
    role = serializers.CharField(
        required=False,
        default="buyer",
        max_length=20,
    )

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Name cannot be empty.")
        return value.strip()

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value.strip()).exists():
            raise serializers.ValidationError("Email already exists.")
        return value.strip()

    def create(self, validated_data):
        raw_password = validated_data.pop("password")
        validated_data["password"] = make_password(raw_password)
        return User.objects.create(**validated_data)
