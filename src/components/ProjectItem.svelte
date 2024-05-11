<script lang=ts>
    export let name: string;
    export let description: string;
    export let icon: string;
    export let href: string;
    export let tags: string[] = [];
</script>

<div class="flex flex-col justify-start group pb-8">
    <a href={href} target="_blank" rel="noopener noreferrer" class="flex flex-row items-center gap-3 underline decoration-1 underline-offset-8 hover:text-blue-600 mb-8">
        <img src={icon} alt={name} class="w-6 h-6 rounded overflow-hidden" />
        <span class="">{name}</span>
    </a>
    <p class="text-base opacity-75 mb-4">
        {description}
    </p>

    <div class="text-xs font-thin opacity-50">
        {#each tags as tag}
            <div class="inline-block text-sm border border-black border-opacity-10 p-1 rounded m-1 ml-0">{tag}</div>{' '}
        {/each}
    </div>
</div>