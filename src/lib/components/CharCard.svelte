<script>
    let { img, name, desc, isAdmin, indice, editarPersonagem, removerPersonagem, moverPersonagem } = $props()
</script>

<div class="card m-3" style="width: 18rem;">
  <center><img src={img} class="card-img-top img-fluid mt-3" alt=""></center>
  <div class="card-body">
    <hr>
    <h5>{name}</h5>
    <hr>
    <p class="card-text">{desc}</p>
  </div>
  {#if isAdmin}
    <center><button class="btn btn-warning mb-3" onclick={() => editarPersonagem(indice)}>Editar</button></center>
    <center><button class="btn btn-danger mb-3" onclick={() => removerPersonagem(indice)}>Remover</button></center>
    <div>
      <button class="btn btn-primary m-2" style="position:relative; left:-25%;" onclick={() => moverPersonagem(indice, -1)}>{"<"}</button>
      <button class="btn btn-primary m-2" style="position:relative; right:-25%;" onclick={() => moverPersonagem(indice, 1)}>{">"}</button>
    </div>
  {/if}
</div>

<style>
    img {
        object-fit: contain;
        width: 13rem;
        height: 13rem;
    }
    p {
      max-height: 20dvh;
      overflow: auto;
      text-align: justify;
    }
</style>