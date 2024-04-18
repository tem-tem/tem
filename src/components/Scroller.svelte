<script>
    import { activeIndex } from '../data/activeIndex';
    import projects from '../data/projects';
</script>

<div class="scroller">
    {#each projects as project, i}
        <div class="scroller-item" class:active={$activeIndex === i}>
            <div class="scroller-item-content">
                <h1>{project.name}</h1>
                <p>{project.description}</p>
            </div>
        </div>
    {/each}
</div>

<style>
    .scroller {
        display: flex;
        overflow-x: scroll;
        scroll-snap-type: x mandatory;
        -webkit-overflow-scrolling: touch;
        max-height: 50vh;
        height: 100%;
        overflow-y: hidden;
    }

    .scroller-item {
        flex: 0 0 100%;
        scroll-snap-align: start;
        background: #fff;
        padding: 1rem;
        border-radius: 0.5rem;
        box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.1);
        margin: 0 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        font-size: 2rem;
        color: #333;
        font-family: inherit;
        font-weight: 100;
        text-transform: uppercase;
        min-width: 100%;
        height: 100%;
    }

    .scroller-item.active {
        background: var(--accent-color);
        color: #fff;
    }

    .scroller-item-content {
        max-width: 50rem;
        height: 100%;
    }
</style>