<script lang="ts">
    export let name: string;
    export let description: string;
    export const icon: string = '';
    export let href: string;
    export let tags: string[] = [];
    export let status: string = 'current';
    export let id: number;
    export let has_logo: boolean = false;
    export let has_bg_image: boolean = false;
    export let has_bg_video: boolean = false;
    export let updated_at: string | undefined = undefined;

    $: v = updated_at ? `?v=${encodeURIComponent(updated_at)}` : '';
    $: logoUrl = has_logo ? `/api/projects/${id}/logo${v}` : null;
    $: bgVideoUrl = has_bg_video ? `/api/projects/${id}/bg_video${v}` : null;
    $: bgImageUrl = !has_bg_video && has_bg_image ? `/api/projects/${id}/bg_image${v}` : null;
    $: hasBgMedia = !!(bgVideoUrl || bgImageUrl);

    function bgVideo(node: HTMLVideoElement) {
        node.muted = true;
        node.play().catch(() => {});
    }
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

    <!-- Content block -->
    <div class="relative flex-1 overflow-hidden mx-3 mb-3 bg-white">
        <!-- Corner angles -->
        <!-- <span class="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-black z-10 pointer-events-none"></span>
        <span class="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-black z-10 pointer-events-none"></span>
        <span class="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-black z-10 pointer-events-none"></span>
        <span class="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-black z-10 pointer-events-none"></span> -->
        <!-- Dot grid + logo (default, fades on hover when bg media exists) -->
        <div
            class="absolute inset-0 flex items-center justify-center transition-opacity duration-300 {hasBgMedia ? 'group-hover:opacity-0' : ''}"
            style="background-image: radial-gradient(circle, #d1d5db 1px, transparent 1px); background-size: 18px 18px;"
        >
            {#if logoUrl}
                <img
                    src={logoUrl}
                    alt="{name} logo"
                    class="w-20 h-20 object-contain rounded-2xl"
                />
            {/if}
        </div>

        <!-- BG media (hidden by default, revealed on hover) -->
        {#if bgVideoUrl}
            <video
                autoplay
                muted
                loop
                playsinline
                preload="auto"
                class="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                use:bgVideo
            >
                <source src={bgVideoUrl} type="video/mp4" />
            </video>
        {:else if bgImageUrl}
            <img
                src={bgImageUrl}
                alt=""
                class="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
        {/if}

        <!-- Text overlay (visible on hover) -->
        <div class="absolute bottom-0 left-0 right-0 p-3 flex flex-col items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <p class="text-sm leading-snug">
                <span class="bg-white text-black px-1 [box-decoration-break:clone]">{description}</span>
            </p>
            <!-- {#if tags.length > 0}
                <div class="flex flex-wrap gap-1">
                    {#each tags as tag}
                        <span class="text-xs bg-white/80 text-black px-1">{tag}</span>
                    {/each}
                </div>
            {/if} -->
        </div>
    </div>
</a>
