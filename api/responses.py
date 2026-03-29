from rest_framework.response import Response


def api_response(message="", data=None, code=200):
    """Uniform JSON: { \"code\", \"message\", \"data\" }."""
    if data is None:
        data = {}
    return Response(
        {"code": code, "message": message, "data": data},
        status=code,
    )
