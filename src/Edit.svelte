<script>
  import { videos } from "./store.js"
  import { saveAs } from 'file-saver'
  import { previousPosition } from "./store.js"
  import Import from './Import.svelte'

  function addVideo() { 
    $videos.push({title: "New video", position: $previousPosition, url: "https://www.example_url.com", notes: "this is a good video"})
    $videos = $videos
  }

  function deleteVideo(video) {
    var index = $videos.findIndex(data => data.url === video.url)
    $videos.splice(index, 1)
    $videos = $videos        
  }

  function saveLocalCopy() {
    var content = JSON.stringify($videos, null, 2); 
    var filename = "video_stash.json";
    var blob = new Blob([content], {
      type: "text/plain;charset=utf-8"
    });
    saveAs(blob, filename);
  }
</script>

<!----------------------------------------------------------------->
  
  <div id="edit">  
    {#each $videos as video}      
        <div id="edit_item">
          <input type="text" bind:value={video.title}>
          <select bind:value={video.position}>
            <option value="Standing" selected>Standing</option>
            <option value="Clinch" selected>Clinch</option>
            <option value="Fence" selected>Fence</option>
            <option value="Guard" selected>Guard</option>
            <option value="Turtle" selected>Turtle</option>
          </select>
          <!-- <input type="text" bind:value={video.position}> -->
          <input type="text" bind:value={video.url} size="36">
          <button on:click={deleteVideo(video)}>🗑️</button>          
        </div>
      
    {/each}
    <div style="padding:10px 5px 20px 5px">
      <button class="dark" on:click={addVideo}>Add Video</button>
      <button class="dark" on:click={saveLocalCopy}>Export</button>
    <Import/>
    </div>    
  </div>

<!-----------------------------------------------------------------> 

<style>
  #edit_item {
    padding: 2px;
    text-align: left;
    max-width:fit-content;
    margin: auto
  }
</style>