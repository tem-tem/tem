<script lang=ts>
    export let name: string;
    export let description: string;
    export let icon: string;
    export let href: string;
</script>

<div class="flex flex-col justify-start group">
    
    <p class="opacity-75">
        <a href={href} target="_blank" rel="noopener noreferrer" class="items-center gap-3 decoration-1 underline-offset-8 hover:text-blue-600 mb-8 ">
            <span class="inline-block mr-1">
                <img src={icon} alt={name} class="w-3 h-3 rounded overflow-hidden" />
            </span>
            <span class="">{name}</span>
        </a>
        <span class="opacity-75 ml-1"> - </span>
        <span class="ml-1">
            {description}
        </span>
    </p>
</div>