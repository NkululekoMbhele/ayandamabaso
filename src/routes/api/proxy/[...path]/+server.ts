import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const BACKEND_API_URL = 'https://api.tredicik.com/api/v1';

export const GET: RequestHandler = async ({ params, url, request }) => {
	try {
		const path = '/' + (params.path || 'cart');
		const apiKey = request.headers.get('x-api-key') || 'pk_live_tenant_41';

		// Preserve query parameters
		const queryString = url.search;
		const fullUrl = `${BACKEND_API_URL}${path}${queryString}`;

		console.log('[Proxy] GET request to:', fullUrl);

		const response = await fetch(fullUrl, {
			method: 'GET',
			headers: {
				'X-API-Key': apiKey,
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			const text = await response.text();
			console.error('[Proxy] Error response:', response.status, text);
			return json({ error: `API request failed: ${response.status}` }, { status: response.status });
		}

		const data = await response.json();
		return json(data);
	} catch (error: any) {
		console.error('[Proxy] Error:', error);
		return json({ error: error.message }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ params, url, request }) => {
	try {
		const path = '/' + (params.path || 'cart');
		const apiKey = request.headers.get('x-api-key') || 'pk_live_tenant_41';
		const body = await request.json();

		const queryString = url.search;
		const fullUrl = `${BACKEND_API_URL}${path}${queryString}`;

		const response = await fetch(fullUrl, {
			method: 'POST',
			headers: {
				'X-API-Key': apiKey,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		});

		if (!response.ok) {
			const text = await response.text();
			console.error('[Proxy] Error response:', response.status, text);
			return json({ error: 'API request failed' }, { status: response.status });
		}

		const data = await response.json();
		return json(data);
	} catch (error: any) {
		console.error('[Proxy] Error:', error);
		return json({ error: error.message }, { status: 500 });
	}
};

export const PATCH: RequestHandler = async ({ params, url, request }) => {
	try {
		const path = '/' + (params.path || 'cart');
		const apiKey = request.headers.get('x-api-key') || 'pk_live_tenant_41';
		const body = await request.json();

		const queryString = url.search;
		const fullUrl = `${BACKEND_API_URL}${path}${queryString}`;

		const response = await fetch(fullUrl, {
			method: 'PATCH',
			headers: {
				'X-API-Key': apiKey,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		});

		if (!response.ok) {
			const text = await response.text();
			console.error('[Proxy] Error response:', response.status, text);
			return json({ error: 'API request failed' }, { status: response.status });
		}

		const data = await response.json();
		return json(data);
	} catch (error: any) {
		console.error('[Proxy] Error:', error);
		return json({ error: error.message }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params, url, request }) => {
	try {
		const path = '/' + (params.path || 'cart');
		const apiKey = request.headers.get('x-api-key') || 'pk_live_tenant_41';

		const queryString = url.search;
		const fullUrl = `${BACKEND_API_URL}${path}${queryString}`;

		const response = await fetch(fullUrl, {
			method: 'DELETE',
			headers: {
				'X-API-Key': apiKey,
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			const text = await response.text();
			console.error('[Proxy] Error response:', response.status, text);
			return json({ error: 'API request failed' }, { status: response.status });
		}

		const data = await response.json();
		return json(data);
	} catch (error: any) {
		console.error('[Proxy] Error:', error);
		return json({ error: error.message }, { status: 500 });
	}
};
