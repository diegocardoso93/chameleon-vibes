export class ErrorResponse {
  static new(message: string) {
    return new Response(JSON.stringify({ message, error: true }), {
      status: 400,
      headers: {"content-type": "application/json"},
    });
  }
}

export class SuccessResponse {
  static new(data: {}) {
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {"content-type": "application/json"},
    });
  }
}
