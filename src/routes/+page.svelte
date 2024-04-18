<script>
	import ProjectItem from '../components/ProjectItem.svelte';
</script>

<div class="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 space-y-8 space-x-4 font-serif text-lg">
	<div class="md:col-span-3 sm:col-span-2 col-span-1">
	</div>
	<div class="md:col-span-3 sm:col-span-2 col-span-1 pb-4">
		<h1 class="text-4xl mb-4">tem</h1>
		<a href="https://x.com/@tem_dev" class="underline decoration-1 hover:text-blue-600 underline-offset-8">@tem_dev</a>
		<div class="text-base opacity-75 mt-4">Software Developer based in Chicago, IL</div>
	</div>

	<h2 class="md:col-span-3 sm:col-span-2 col-span-1 text-2xl">Ongoing Projects</h2>
	
	<ProjectItem
		name="Default Shortcuts"
		description="A collection of default keyboard shortcuts for popular applications."
		icon="https://defaultshortcuts.com/icon.png"
		href="https://defaultshortcuts.com"
	/>
	<ProjectItem
		name="Stop Working"
		description="A break reminder for macOS."
		icon="https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/90/ef/19/90ef1971-e7a0-8b46-4065-a2dcb3284298/AppIcon-85-220-4-2x.png/460x0w.webp"
		href="https://apps.apple.com/us/app/stop-working-break-reminder/id6446755293"
	/>
	<ProjectItem
		name="Ease"
		description="iOS Expense Tracker."
		icon="https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/9c/8e/5d/9c8e5ddd-c371-8ff2-4f98-c87cdfbd935b/AppIcon-0-0-1x_U007ephone-0-85-220.png/460x0w.webp"
		href="https://apps.apple.com/us/app/ease-expense-tracker/id6445955890"
	/>
	<ProjectItem
		name="Gas Alert"
		description="iOS App for tracking fees in crypto."
		icon="https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/8d/33/42/8d334268-6144-89c9-ddf1-2732fa63dd7d/AppIcon-0-0-1x_U007ephone-0-85-220.png/460x0w.webp"
		href="https://apps.apple.com/us/app/gas-alert-eth-btc-fee-tracker/id6446234870"
	/>
	<ProjectItem
		name="Peps Club"
		description="NFT Project with a drawing board."
		icon="https://www.peps.club/_next/image?url=%2Flogo.png&w=128&q=75"
		href="https://www.peps.club/"
	/>
	<div />
	<h2 class="md:col-span-3 sm:col-span-2 col-span-1 text-2xl pt-4">Past Projects</h2>
	<div class="flex flex-col justify-center gap-4">
		<ProjectItem
			name="Bedrock"
			description="Supercharged multiplayer workspace."
			icon="https://www.bedrock.computer/favicon.ico"
			href="https://www.bedrock.computer/"
		/>
	</div>
</div>
