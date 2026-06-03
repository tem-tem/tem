<script lang=ts>
	import ProjectItem from '../components/ProjectItem.svelte';
	import type { Project, Profile } from '../app.d.ts';

	export let data: { projects: Project[]; profile: Profile };

	$: projects = data.projects;
	$: profile = data.profile;
</script>

<div class="grid grid-cols-1 space-y-4 space-x-4 font-mono">
	<div class="col-span-1">
	</div>
	<div class="col-span-1 pt-10 flex gap-2 font-mono">
		<div class="font-bold">I'm {profile.name}</div>
		<div class=""> - {profile.intro}</div>
	</div>
	
	<!-- <div class="col-span-1 pb-4 pt-12 text-2xl">Projects</div> -->
	<div class="flex flex-col justify-center gap-4 font-mono">
	{#each projects as project}
		<ProjectItem
			name={project.name}
			description={project.description}
			icon={project.icon}
			href={project.href}
			tags={project.tags}
			status={project.status}
		/>
	{/each}
	</div>

	<div class="col-span-1 flex gap-2">
		<a href={profile.twitter_url} class="opacity-75 hover:text-blue-600 underline-offset-8">{profile.twitter_label}</a>
	</div>
	<!-- <h2 class="col-span-1 text-2xl pt-12 pb-4">Work</h2>
	<div class="flex flex-col justify-center gap-4 font-mono">
		{#each work as project}
			<ProjectItem
				name={project.name}
				description={project.description}
				icon={project.icon}
				href={project.href}
			/>
		{/each}
	</div> -->
</div>
