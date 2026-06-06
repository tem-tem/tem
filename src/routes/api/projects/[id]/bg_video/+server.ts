import { API_BASE_URL } from '$env/static/private';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params, fetch }) => {
	const response = await fetch(`${API_BASE_URL}/api/projects/${params.id}/bg_video`);

	if (!response.ok) {
		return new Response(null, { status: 404 });
	}

	const contentType = response.headers.get('Content-Type') ?? 'video/mp4';
	const buffer = await response.arrayBuffer();

	return new Response(buffer, {
		headers: {
			'Content-Type': contentType,
			'Cache-Control': 'public, max-age=86400'
		}
	});
};
