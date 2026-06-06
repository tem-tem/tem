import { API_BASE_URL } from '$env/static/private';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params, fetch, request }) => {
	const response = await fetch(`${API_BASE_URL}/api/projects/${params.id}/bg_video`);

	if (!response.ok) {
		return new Response(null, { status: 404 });
	}

	const raw = response.headers.get('Content-Type') ?? '';
	const contentType = raw.startsWith('video/') ? raw : 'video/mp4';
	const buffer = Buffer.from(await response.arrayBuffer());
	const total = buffer.byteLength;

	const rangeHeader = request.headers.get('Range');

	if (rangeHeader) {
		const match = rangeHeader.match(/bytes=(\d*)-(\d*)/);
		const start = match?.[1] ? parseInt(match[1]) : 0;
		const end = match?.[2] ? parseInt(match[2]) : total - 1;
		const chunkLength = end - start + 1;

		return new Response(buffer.subarray(start, end + 1), {
			status: 206,
			headers: {
				'Content-Type': contentType,
				'Content-Range': `bytes ${start}-${end}/${total}`,
				'Accept-Ranges': 'bytes',
				'Content-Length': String(chunkLength),
			}
		});
	}

	return new Response(buffer, {
		headers: {
			'Content-Type': contentType,
			'Accept-Ranges': 'bytes',
			'Content-Length': String(total),
			'Cache-Control': 'public, max-age=86400',
		}
	});
};
