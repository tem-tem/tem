<script lang="ts">
    export let name: string;
    export let description: string;
    export const icon: string = '';
    export let href: string;
    export let tags: string[] = [];
    export let status: string = 'current';
    export let id: number;
    export let has_bg_image: boolean = false;
    export let has_bg_video: boolean = false;
    export let updated_at: string | undefined = undefined;

    $: v = updated_at ? `?v=${encodeURIComponent(updated_at)}` : '';
    $: bgVideoUrl = has_bg_video ? `/api/projects/${id}/bg_video${v}` : null;
    $: bgImageUrl = !has_bg_video && has_bg_image ? `/api/projects/${id}/bg_image${v}` : null;
</script>

<a
    {href}
    target="_blank"
    rel="noopener noreferrer"
    class="group block aspect-square flex flex-col"
>
    <!-- Headline row -->
    <div class="flex items-start justify-between gap-2 p-3 uppercase text-2xl">
        <span class="font-bold leading-tight bg-white text-black px-1 [box-decoration-break:clone]">{name}</span>
    </div>

    <!-- Divider -->
    <div class="border-t-4 border-black mx-3 my-2"></div>

    <!-- Content block: bg media + overlaid text at bottom-left -->
    <div class="relative flex-1 overflow-hidden bg-gray-100 mx-3">
        {#if bgVideoUrl}
            <video
                src={bgVideoUrl}
                autoplay
                muted
                loop
                playsinline
                class="absolute inset-0 w-full h-full object-cover pointer-events-none"
            ></video>
        {:else if bgImageUrl}
            <img
                src={bgImageUrl}
                alt=""
                class="absolute inset-0 w-full h-full object-cover"
            />
        {/if}

        <div class="absolute bottom-0 left-0 right-0 p-3 flex flex-col items-start gap-1">
            <p class="text-sm leading-snug">
                <span class="bg-white text-black px-1 [box-decoration-break:clone]">{description}</span>
            </p>
            {#if tags.length > 0}
                <div class="flex flex-wrap gap-1">
                    {#each tags as tag}
                        <span class="text-xs bg-white/80 text-black px-1">{tag}</span>
                    {/each}
                </div>
            {/if}
        </div>
    </div>
</a>
