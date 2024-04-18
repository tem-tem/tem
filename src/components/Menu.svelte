<script>
    import { activeIndex } from '../data/activeIndex';
    import projects from '../data/projects';
    $: console.log($activeIndex);
</script>

<div class="menu">
    {#each projects as project, i}
        <button
            class="menu-item"
            class:active={$activeIndex === i}
            on:click={() => activeIndex.set(i)}
        >
            {project.name}
        </button>
    {/each}
</div>

<style>
    .menu {
        /* display: flex; */
    }
    .menu-item {
        display: inline-block;
        border: none;
        background: transparent;
        /* color: #fff; */
        cursor: pointer;
        font-size: 1.5rem;
        font-family: inherit;
        font-weight: 100;
        padding: 0.5rem 1rem;
        /* text-transform: uppercase; */
    }

    .menu-item.active {
        background: var(--accent-color);
    }

    .menu-item:hover:not(.active) {
        background: rgba(0, 0, 0, 0.1);
    }
</style>
