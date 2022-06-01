<script>

  import { videos } from "./store.js";
  import { currentPosition } from "./store.js";
  
  let selectedVideo = $videos.filter(function(video) { return video.position === $currentPosition; })[0];
  if (!selectedVideo) {
    selectedVideo = ""
  }

  $: $videos = $videos;

</script>

<!----------------------------------------------------------------->

<div id="video">
  <div id="select_container">
  <select bind:value={selectedVideo}>
    <option value="" selected> Choose a video >>> </option>
    {#each $videos as video}
      {#if video.position == $currentPosition}
        <option value={video}>
          {video.title}
        </option>            
      {/if}
    {/each}
  </select>
  </div> 

  <div id="iframe_container">
  {#if selectedVideo != ""}
    <iframe title="video" src={selectedVideo.url} loading="eager" frameBorder="0"/>
  {/if}
</div>
<div id="notes_container">
  {#if selectedVideo != ""}
    <textarea bind:value={selectedVideo.notes}/>
  {/if}
</div>
</div>  
   
<!----------------------------------------------------------------->

<style>

  #video {
    display: flex; 
    width: 100%; 
    height: 100%; 
    flex-direction: column; 
    background-color: white; 
    overflow: hidden;
    padding-bottom: 10px;
    padding-top: 5px;
    border-radius: 0px 0px 10px 10px;
  }

  #select_container {
    max-width: 80vh;
    width: 100%;
    text-align: left;
    margin: 0 auto;
    border: none;
    padding: 0px;
    box-sizing: border-box;
    
   }

  #iframe_container, #notes_container {
    display: inline-block;
    width: 100%;
    max-width: 80vh;      
    aspect-ratio: 16 / 9;    
    margin: 0 auto;
    padding: 0px;
    box-sizing: border-box;
    border: none;     
  }

  #notes_container {
    padding-right: 4px;    
  }

  iframe, textarea{
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0px;
    margin: auto;    
  }

</style>