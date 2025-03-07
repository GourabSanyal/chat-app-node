export async function handler() {
    return {
      statusCode: 200,
      body: JSON.stringify({
        backendUrl: process.env.PROD_BACKEND_URL,
        frontendUrl: process.env.PROD_FRONTEND_URL,
        environment: process.env.NODE_ENV || 'production'
      }),
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    };
  }