<script lang="ts">
    import "./captionEffects.css";
    export let text: string;
    export let effect: string;
    export let disabled = false;
</script>

<div class={"subtitle " + (disabled ? "" : effect)} style={`--random-length: ${Math.random()}s`}>
    {#each text.split(/[ \n]/) as word, i}
        <div class="word" style={`animation-delay: -${Math.random() * 0.1}s; `}>
            {#each word.split("") as letter, j}
                <span style={`animation-delay: -${(i + j) * 0.52 % 5}s`}>{letter}</span>
            {/each}
        </div>
    {/each}
</div>


<style>
    .subtitle {
        max-width: 80%;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        font-size: 24px;
        background-color: rgba(0, 0, 0, 0.7);
    }
    .subtitle .word {
        display: inline-block;
        padding: 0 0.25ch;
    }
    .subtitle span {
        display: inline-block;
    }
    @media screen and (max-width: 700px) {
        .subtitle {
            font-size: 18px;
        }
    }
    @media screen and (min-width: 1200px) {
        .subtitle {
            font-size: 36px;
        }
    }
</style>