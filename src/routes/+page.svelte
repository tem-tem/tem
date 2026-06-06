<script lang=ts>
	import ProjectItem from '../components/ProjectItem.svelte';
	import type { Project, Profile } from '../app.d.ts';

	export let data: { projects: Project[]; profile: Profile };

	$: projects = [...data.projects].sort((a, b) => {
		const aOrder = a.display_order ?? Infinity;
		const bOrder = b.display_order ?? Infinity;
		return aOrder - bOrder;
	});
	$: profile = data.profile;
</script>

<div class="grid grid-cols-1 container mx-auto px-4">
	<div class="pt-10 flex gap-2 pb-10 justify-between px-4 uppercase text-2xl">
		<div class="flex flex gap-2">
			<div class="font-bold">{profile.name}</div>
			<div class="">{profile.intro}</div>
		</div>

		<div class="flex gap-2">
			<a href={profile.twitter_url} class="opacity-75 hover:text-blue-600 underline-offset-8">{profile.twitter_label}</a>
		</div>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
		{#each projects as project}
			<ProjectItem
				id={project.id}
				name={project.name}
				description={project.description}
				icon={project.icon}
				href={project.href}
				tags={project.tags}
				status={project.status}
				has_bg_image={project.has_bg_image ?? false}
				has_bg_video={project.has_bg_video ?? false}
				updated_at={project.updated_at}
			/>
		{/each}
	</div>
</div>
