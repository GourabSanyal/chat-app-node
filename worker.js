import { Router } from 'itty-router';
import { createServer } from 'socket.io';

// Create a new router
const router = Router();

// Define a route
router.get('/', () => {
  return new Response(
    fetch('https://example.com/public/index.html'), 
    {
      headers: {
        'Content-Type': 'text/html;charset=UTF-8',
      },
    }
  );
});

// Additional routes for your API
router.all('*', () => new Response('Not Found', { status: 404 }));

// Handle the request
export default {
  async fetch(request, env, ctx) {
    return router.handle(request);
  },
};