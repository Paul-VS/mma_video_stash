<script>

  import { videos } from "./store.js"
  
  let data

   function loadData() {
      $videos = JSON.parse(document.getElementById('holder').value);
  }

</script>

<!----------------------------------------------------------------->

<main style="display:inline-block"> 

  <input type="file" onchange="readFile(this)">
  <button on:click={() => loadData()}> Load File</button> <br>
  <input id="holder" type="text" bind:value={data} hidden>

<script>
  function readFile(input) {
    let file = input.files[0];
  
    let reader = new FileReader();
  
    reader.readAsText(file);

    reader.onload = function() {
      document.getElementById('holder').value = reader.result;
    };
  
    reader.onerror = function() {
      console.log(reader.error);
    };
    
  }  
  </script>

</main>

<!----------------------------------------------------------------->