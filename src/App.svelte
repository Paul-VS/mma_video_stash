<script>

	import Navbar from './Navbar.svelte'
  import Home from './Home.svelte'
  import Video from './Video.svelte'
	import Edit from './Edit.svelte'

  import { currentPosition } from "./store.js"

</script>

<!----------------------------------------------------------------->

  <Navbar/>

  <div id="content">
    {#if $currentPosition == "Home"}
      <Home/>
    {:else if $currentPosition == "Edit"}
      <Edit/>
    {:else}
      <Video/>
    {/if}
  </div>

<!----------------------------------------------------------------->

<style>

#content{
    background-color: white;
    margin: 0 auto;
    width: 98%;
    height: 98%;
    text-align: center;
    border: none;
    border-radius: 0px 0px 10px 10px;
    max-width: 95vh;
}

</style>