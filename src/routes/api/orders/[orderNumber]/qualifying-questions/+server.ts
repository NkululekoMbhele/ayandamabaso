import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { BACKEND_API_URL, BACKEND_API_KEY } from '$env/static/private';

interface QualifyingQuestionsBody {
	goals: string;
	targets: string;
	business_nature: string;
	struggles: string;
	submitted_at: string;
}

export const POST: RequestHandler = async ({ params, request }) => {
	const { orderNumber } = params;

	try {
		// Validate request body
		const body: QualifyingQuestionsBody = await request.json();

		if (!body.goals?.trim() || !body.targets?.trim() || !body.business_nature?.trim() || !body.struggles?.trim()) {
			return json(
				{ error: 'All fields are required' },
				{ status: 400 }
			);
		}

		// Call backend API to store qualifying questions
		const response = await fetch(
			`${BACKEND_API_URL}/api/external/v1/orders/${orderNumber}/qualifying-questions`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-API-Key': BACKEND_API_KEY || ''
				},
				body: JSON.stringify(body)
			}
		);

		if (!response.ok) {
			console.error(`Backend API error: ${response.status}`, await response.text());
			return json(
				{ error: 'Failed to submit qualifying questions' },
				{ status: response.status }
			);
		}

		const result = await response.json();
		return json(result);
	} catch (error) {
		console.error('Error submitting qualifying questions:', error);
		return json(
			{ error: 'An unexpected error occurred' },
			{ status: 500 }
		);
	}
};
