<script lang=ts>
	import ProjectItem from '../components/ProjectItem.svelte';

	let projects = [
		{
			name: 'Gas Alert',
			description: 'iOS App for tracking fees in crypto.',
			icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/8d/33/42/8d334268-6144-89c9-ddf1-2732fa63dd7d/AppIcon-0-0-1x_U007ephone-0-85-220.png/460x0w.webp',
			href: 'https://apps.apple.com/us/app/gas-alert-eth-btc-fee-tracker/id6446234870',
			tags: ['swift', 'ios', 'ethers.js', 'aws timestream', 'nodejs', 'sql', 'go', 'caching', 'redis']
		},
		{
			name: 'Stop Working',
			description: 'A break reminder for macOS.',
			icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/90/ef/19/90ef1971-e7a0-8b46-4065-a2dcb3284298/AppIcon-85-220-4-2x.png/460x0w.webp',
			href: 'https://apps.apple.com/us/app/stop-working-break-reminder/id6446755293',
			tags: ['swift', 'macos']
		},
		{
			name: 'Ease',
			description: 'iOS Expense Tracker.',
			icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/9c/8e/5d/9c8e5ddd-c371-8ff2-4f98-c87cdfbd935b/AppIcon-0-0-1x_U007ephone-0-85-220.png/460x0w.webp',
			href: 'https://apps.apple.com/us/app/ease-expense-tracker/id6445955890',
			tags: ['swift', 'ios', 'core data']
		},
		{
			name: 'Twitter Schedule Shortcut',
			description: 'Chrome extension that improves twitter\'s schedule UI.',
			icon: 'https://lh3.googleusercontent.com/Eci9LTxzeSlfzPA5ivrAqTpvWanpxzlEw39w2sT5e93uFjMW7fXSKjZ79S6LmG4RIw4i6YMsOUz5iM3xKD5shwFs=s120',
			href: 'https://chromewebstore.google.com/detail/twitter-schedule-shortcut/npncooiciiiahmamnkoejgmcoabopnkj',
			tags: ['react', 'typescript', 'chrome extension']
		},
		{
			name: 'Peps Club',
			description: 'NFT Project with a drawing board.',
			icon: 'https://www.peps.club/_next/image?url=%2Flogo.png&w=128&q=75',
			href: 'https://www.peps.club/',
			tags: ['react', 'typescript', 'nextjs', 'tailwind css', 'threejs']
		},
		{
			name: 'Infinite Filter',
			description: 'A UI component for React.',
			icon: 'https://avatars.githubusercontent.com/u/18738841?s=48&v=4',
			href: 'https://infinite-filter-demo.vercel.app/',
			tags: ['react', 'typescript', 'ui component']
		},
	]

	let pastProjects = [
		{
			name: 'Bedrock',
			description: 'Supercharged multiplayer workspace.',
			icon: 'https://www.bedrock.computer/favicon.ico',
			href: 'https://www.bedrock.computer/',
			tags: ['react', 'redux', 'typescript', 'nodejs', 'electron', 'websockets', 'kubernetes', 'docker', 'postgresql', 'graphql', 'ec2', 'route53', 's3', 'sentry']
		}
	];
</script>

<div class="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 space-y-8 space-x-4 font-garamond">
	<div class="md:col-span-3 sm:col-span-2 col-span-1">
	</div>
	<div class="md:col-span-3 sm:col-span-2 col-span-1 pt-10">
		<h1 class="">Tem - Software Developer based in Chicago, IL</h1>
		<a href="https://x.com/@tem_dev" class="opacity-75 underline decoration-1 hover:text-blue-600 underline-offset-8">@tem_dev</a>
	</div>
	
	<h2 class="md:col-span-3 sm:col-span-2 col-span-1 pb-10 pt-12 text-2xl">Projects</h2>
	{#each projects as project}
		<ProjectItem
			name={project.name}
			description={project.description}
			icon={project.icon}
			href={project.href}
			tags={project.tags}
		/>
	{/each}
	<div />
	<h2 class="md:col-span-3 sm:col-span-2 col-span-1 text-2xl pt-12 pb-8">Past Projects</h2>
	<div class="flex flex-col justify-center gap-4">
		{#each pastProjects as project}
			<ProjectItem
				name={project.name}
				description={project.description}
				icon={project.icon}
				href={project.href}
				tags={project.tags}
			/>
		{/each}
	</div>
</div>
