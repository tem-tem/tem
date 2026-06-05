<script lang="ts">
	export let data: { results: any[]; q: string };

	const videoUrl = (videoName: string) =>
		`https://cdn.spottedinprod.com/clips/${videoName}`;
</script>

<div class="wrap">
	<form method="GET" class="search-form">
		<input
			type="text"
			name="q"
			placeholder="Search clips..."
			value={data.q}
		/>
		<button type="submit">Search</button>
	</form>

	{#if data.q && data.results.length === 0}
		<p class="empty">No results found.</p>
	{:else if data.results.length > 0}
		<div class="results">
			{#each data.results as result}
				<article class="card">
					<a
						href="https://www.spottedinprod.com/clips/{result.postId}"
						target="_blank"
						rel="noopener noreferrer"
						class="video-link"
					>
						<video
							src={videoUrl(result.videoName)}
							autoplay
							muted
							loop
							playsinline
							preload="auto"
						></video>
					</a>
					<div class="meta">
						<a
							href="https://www.spottedinprod.com/clips/{result.postId}"
							target="_blank"
							rel="noopener noreferrer"
							class="clip-link"
						>{result.displayName}</a>
						<div class="sub">
							<a
								href="https://www.spottedinprod.com/apps/{result.appName}"
								target="_blank"
								rel="noopener noreferrer"
								class="app"
							>{result.appName}</a>
							<span class="chip">{(result.score * 100).toFixed(1)}%</span>
						</div>
					</div>
				</article>
			{/each}
		</div>
	{/if}

	<p class="disclaimer">
		This is an independent experiment in semantic search. It is not affiliated with, endorsed by, or intended to replicate or monetize <a href="https://www.spottedinprod.com" target="_blank" rel="noopener noreferrer">Spotted in Prod</a>. All clip content belongs to its respective owners.
	</p>
</div>

<style>
	.wrap {
		display: flex;
		flex-direction: column;
		gap: 24px;
		padding-top: 40px;
		font-family: monospace;
		min-height: 60vh;
	}

	.search-form {
		display: flex;
		gap: 8px;
	}

	.search-form input {
		flex: 1;
		padding: 10px 14px;
		font-size: 14px;
		font-family: monospace;
		border: 1px solid #d1d5db;
		border-radius: 0px;
		background: #ffffff12;
		outline: none;
		transition: border-color 0.15s, background 0.15s;
	}

	.search-form input:focus {
		background: #fff;
		border-color: #6b7280;
	}

	.search-form button {
		padding: 10px 18px;
		font-size: 14px;
		font-family: monospace;
		background: #111827;
		color: #fff;
		border: none;
		border-radius: 0px;
		cursor: pointer;
		transition: background 0.15s;
	}

	.search-form button:hover {
		background: #374151;
	}

	.results {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 20px;
	}

	.card {
		display: flex;
		flex-direction: column;
		gap: 8px;
		min-width: 0;
	}

	.video-link {
		display: block;
		aspect-ratio: 9 / 19.5;
		background: #f3f4f6;
		overflow: hidden;
	}

	.video-link video {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.meta {
		display: flex;
		flex-direction: column;
		gap: 4px;
		min-width: 0;
	}

	.sub {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}

	.clip-link {
		font-size: 13px;
		color: inherit;
		text-decoration: none;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.clip-link:hover {
		text-decoration: underline;
		text-underline-offset: 4px;
	}

	.app {
		font-size: 12px;
		color: #9ca3af;
		text-decoration: none;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.app:hover {
		text-decoration: underline;
		text-underline-offset: 4px;
	}

	.chip {
		font-size: 11px;
		background: #f3f4f6;
		color: #6b7280;
		padding: 2px 8px;
		border-radius: 999px;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.empty {
		font-size: 14px;
		color: #9ca3af;
		margin: 0;
	}

	.disclaimer {
		margin-top: auto;
		padding-top: 40px;
		font-size: 12px;
		color: #9ca3af;
		line-height: 1.6;
	}

	.disclaimer a {
		color: inherit;
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.disclaimer a:hover {
		color: #6b7280;
	}
</style>
