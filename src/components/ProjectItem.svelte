<script>
    export let name;
    export let description;
    export let icon;
    export let href;
</script>

<div class="flex flex-col justify-start gap-4">
    <a href={href} target="_blank" rel="noopener noreferrer" class="flex flex-col items-start gap-2 underline decoration-1 underline-offset-8 hover:text-blue-600">
        <img src={icon} alt={name} class="w-8 h-8 rounded overflow-hidden" />
        <span class="w-full">{name}</span>
    </a>
    <p class="text-base opacity-75">
        {description}
    </p>
</div>