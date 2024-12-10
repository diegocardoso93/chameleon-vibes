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

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const APP_PUB_KEY = '0.0.5234801';
