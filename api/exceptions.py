from rest_framework.views import exception_handler
from rest_framework.response import Response


def api_exception_handler(exc, context):
    """Wrap DRF errors in {code, message, data}."""
    response = exception_handler(exc, context)
    if response is None:
        return response

    code = response.status_code
    payload = response.data
    message = "Request failed"
    data = {}

    if isinstance(payload, dict):
        if "detail" in payload:
            detail = payload["detail"]
            if isinstance(detail, list):
                message = str(detail[0]) if detail else message
            else:
                message = str(detail)
        else:
            message = "Validation failed"
            data = payload
    elif isinstance(payload, list):
        message = str(payload[0]) if payload else message
    else:
        message = str(payload)

    return Response(
        {"code": code, "message": message, "data": data},
        status=code,
    )
