<script lang="ts">
    export let name: string;
    export let description: string;
    export const icon: string = '';
    export let href: string;
    export let tags: string[] = [];
    export let status: string = 'current';
    export let id: number;
    export let has_bg_image: boolean = false;

    $: bgImageUrl = has_bg_image ? `/api/projects/${id}/bg_image` : null;
</script>

<a
    {href}
    target="_blank"
    rel="noopener noreferrer"
    class="group block aspect-square relative overflow-hidden border border-current/10 hover:border-current transition-colors"
>
    {#if bgImageUrl}
        <img
            src={bgImageUrl}
            alt=""
            class="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity"
        />
    {/if}

    <div class="relative h-full flex flex-col p-4 font-mono">
        <!-- top row: title + status -->
        <div class="flex items-start justify-between gap-2">
            <span class="font-bold leading-tight">{name}</span>
            {#if status}
                <span class="text-xs opacity-50 shrink-0 mt-px">{status}</span>
            {/if}
        </div>

        <!-- spacer -->
        <div class="flex-1"></div>

        <!-- bottom: description -->
        <p class="text-sm opacity-75 leading-snug mb-3">{description}</p>

        <!-- footer: tags -->
        {#if tags.length > 0}
            <div class="flex flex-wrap gap-1">
                {#each tags as tag}
                    <span class="text-xs opacity-50">{tag}</span>
                {/each}
            </div>
        {/if}
    </div>
</a>
