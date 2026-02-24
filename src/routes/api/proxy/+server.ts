import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const BACKEND_API_URL = 'https://api.tredicik.com/api/v1';

export const GET: RequestHandler = async ({ url, request }) => {
	try {
		const path = url.searchParams.get('path') || '/cart';
		const apiKey = request.headers.get('x-api-key') || 'pk_live_tenant_41';

		const response = await fetch(`${BACKEND_API_URL}${path}`, {
			method: 'GET',
			headers: {
				'X-API-Key': apiKey,
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			return json({ error: 'API request failed' }, { status: response.status });
		}

		const data = await response.json();
		return json(data);
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ url, request }) => {
	try {
		const path = url.searchParams.get('path') || '/cart';
		const apiKey = request.headers.get('x-api-key') || 'pk_live_tenant_41';
		const body = await request.json();

		const response = await fetch(`${BACKEND_API_URL}${path}`, {
			method: 'POST',
			headers: {
				'X-API-Key': apiKey,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		});

		if (!response.ok) {
			return json({ error: 'API request failed' }, { status: response.status });
		}

		const data = await response.json();
		return json(data);
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};

export const PATCH: RequestHandler = async ({ url, request }) => {
	try {
		const path = url.searchParams.get('path') || '/cart';
		const apiKey = request.headers.get('x-api-key') || 'pk_live_tenant_41';
		const body = await request.json();

		const response = await fetch(`${BACKEND_API_URL}${path}`, {
			method: 'PATCH',
			headers: {
				'X-API-Key': apiKey,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		});

		if (!response.ok) {
			return json({ error: 'API request failed' }, { status: response.status });
		}

		const data = await response.json();
		return json(data);
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ url, request }) => {
	try {
		const path = url.searchParams.get('path') || '/cart';
		const apiKey = request.headers.get('x-api-key') || 'pk_live_tenant_41';

		const response = await fetch(`${BACKEND_API_URL}${path}`, {
			method: 'DELETE',
			headers: {
				'X-API-Key': apiKey,
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			return json({ error: 'API request failed' }, { status: response.status });
		}

		const data = await response.json();
		return json(data);
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};
