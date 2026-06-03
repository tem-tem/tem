import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, fetch }) => {
	const q = url.searchParams.get('q') ?? '';
	if (!q.trim()) return { results: [], q };

	const res = await fetch(
		`https://sip-search.tem.dev/search?q=${encodeURIComponent(q)}&limit=10`
	);
	const data = await res.json();
	const results = data.sort((a: any, b: any) => b.score - a.score);
	return { results, q };
};
