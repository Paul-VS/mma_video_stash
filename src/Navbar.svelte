<script>

  import { currentPosition } from "./store.js"
  import { previousPosition } from "./store.js"

    function handleClick(position) {
      $previousPosition = $currentPosition  
      $currentPosition = position
    }

</script>

<!----------------------------------------------------------------->

  <div class="navbar">
    <a href="#home" class="title" on:click={() => handleClick("Home")}>MMA VIDEO STASH</a>     
    <svg width="51" height="51" viewBox="-10 0 70 51" class="icon" on:click={() => handleClick("Edit")} >
      <path d="M0 0h48v48h-48z" fill="none"/>
      <path fill="dimgrey" d="M38.86 25.95c.08-.64.14-1.29.14-1.95s-.06-1.31-.14-1.95l4.23-3.31c.38-.3.49-.84.24-1.28l-4-6.93c-.25-.43-.77-.61-1.22-.43l-4.98 2.01c-1.03-.79-2.16-1.46-3.38-1.97l-.75-5.3c-.09-.47-.5-.84-1-.84h-8c-.5 0-.91.37-.99.84l-.75 5.3c-1.22.51-2.35 1.17-3.38 1.97l-4.98-2.01c-.45-.17-.97 0-1.22.43l-4 6.93c-.25.43-.14.97.24 1.28l4.22 3.31c-.08.64-.14 1.29-.14 1.95s.06 1.31.14 1.95l-4.22 3.31c-.38.3-.49.84-.24 1.28l4 6.93c.25.43.77.61 1.22.43l4.98-2.01c1.03.79 2.16 1.46 3.38 1.97l.75 5.3c.08.47.49.84.99.84h8c.5 0 .91-.37.99-.84l.75-5.3c1.22-.51 2.35-1.17 3.38-1.97l4.98 2.01c.45.17.97 0 1.22-.43l4-6.93c.25-.43.14-.97-.24-1.28l-4.22-3.31zm-14.86 5.05c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
    </svg>
  </div> 

<!----------------------------------------------------------------->

<style>

  .navbar{
    max-width: 95vh;
    background-color: white;
    margin: 0 auto;
    margin-top: 5px;
    width: 98%;
    text-align: left;
    border: none;
    border-radius: 10px 10px 0px 0px;    
  }

  .title{
    font-size: larger;
    display:inline-block;
    padding: 14px;
    text-decoration: none;
    color: black;
    border: none;
    border-radius: 10px; 
  }

  .icon{
    float: right;
    border: none;
    border-radius: 10px; 
    }

  .navbar a:hover, .icon:hover {
    background-color: rgb(162, 219, 255);
    color: black;
  }

</style>

