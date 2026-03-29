from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed, InvalidToken
from rest_framework_simplejwt.settings import api_settings

from api.models import User


class ApiUserJWTAuthentication(JWTAuthentication):
    """
    Resolve JWT `user_id` to `api.models.User`.
    Default SimpleJWT uses `auth.User`, which breaks FKs to our `User` model.
    """

    def get_user(self, validated_token):
        try:
            user_id = validated_token[api_settings.USER_ID_CLAIM]
        except KeyError:
            raise InvalidToken(
                "Token contained no recognizable user identification",
            )
        try:
            return User.objects.get(**{api_settings.USER_ID_FIELD: user_id})
        except User.DoesNotExist:
            raise AuthenticationFailed(
                "User not found",
                code="user_not_found",
            )
