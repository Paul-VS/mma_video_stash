<script>
  import { videos } from "./data.js"
  
  function loadData() {
    $videos = JSON.parse(document.getElementById('holder').textContent);
  }
</script>

<main>    
  <div id="upload">
    <textarea id="holder" style="height:30px; width:300px"></textarea><br> 
    <button on:click={() => loadData()}> Load Data</button> 
  </div>

  <script>
    var holder = document.getElementById('holder');
  
    holder.ondragover = function() {
      this.className = 'hover';
      return false;
    }

    holder.ondragend = function() {
      this.className = '';
      return false;
    }

    holder.ondrop = function(e) {
      this.className = '';
      e.preventDefault();  
      var file = e.dataTransfer.files[0],
          reader = new FileReader();       
      reader.onload = function(event) {
        holder1.innerText = event.target.result;   
      };  
      reader.readAsText(file);
      return false;
    }
  </script>   
</main>