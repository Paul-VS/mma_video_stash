<script>

  import { currentPosition } from "./store.js"
  import { previousPosition } from "./store.js"

  function handleClick(position) {
    $previousPosition = $currentPosition  
    $currentPosition = position
  }
  
</script>

<!----------------------------------------------------------------->

<div id="home">
  <button class="position" on:click={() => handleClick("Standing")}>STANDING</button>
  <button class="position" on:click={() => handleClick("Clinch")}>CLINCH</button>
  <button class="position" on:click={() => handleClick("Fence")}>FENCE</button>
  <button class="position" on:click={() => handleClick("Guard")}>GUARD</button>
  <button class="position" on:click={() => handleClick("Turtle")}>TURTLE</button>
  <img src="mma.svg" alt="Connor vs Khabib" width="100%">
</div>

<!----------------------------------------------------------------->

<style>

  .position {
    display:inline-block;
    background-color: white;
    border-style: solid;
    border-width: thin;
    border-radius: 5px;
    border-color: lightgrey;
    font-size: medium;
    color: black;
  }

  .position:hover {
    background-color: whitesmoke;
    cursor: pointer;
    /* font-weight: bold; */
  }

  img {
    filter: drop-shadow(0px 3px 3px rgba(0, 0, 0, 0.6));
    transition:all 0.6s;
    padding:15px;
    box-sizing: border-box;
    max-height: 85vh; 
  }

  img:hover {
    filter: drop-shadow(0px 3px 3px red);
  }

  #home { 
    padding: 5px;  
  }

</style>