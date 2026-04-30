<script setup>
import { StreamBarcodeReader } from "@teckel/vue-barcode-reader";
// 1. Creamos una variable reactiva (ref) para almacenar el código.
// 'ref' hace que Vue "vigile" esta variable. Si cambia, la pantalla se actualiza sola.
const codigoDetectado = ref("");

// 2. Función que se ejecuta cada vez que el escáner tiene éxito.
// La librería 'teckel' emite un string con el contenido del código. 
// Recibirlo en una función nos permite validarlo antes de mostrarlo.
const alDetectarCodigo = (valor) => {
  if (valor) {
    codigoDetectado.value = valor;
    console.log("¡Código capturado con éxito!", valor);
  }
};
</script>

<template>
  <div class="app-layout">
    <header>
      <h1>Lector de productos</h1>
    </header>

    <main>
      <ClientOnly>
        <div class="visor-camara">
          <!-- 3. Escuchamos el evento @decode -->
          <!-- '@decode' es el nombre del evento interno de la librería 
              que se dispara automáticamente cuando la cámara reconoce un patrón de barras. -->
          <StreamBarcodeReader @decode="alDetectarCodigo" />
        </div>
      </ClientOnly>

      <!-- 4. Renderizado condicional -->
      <!-- Usamos v-if para que este cuadro solo aparezca cuando realmente haya un dato.-->
      <section v-if="codigoDetectado" class="resultado-card">
        <h3>Producto detectado</h3>
        <div class="badge-codigo">
          {{ codigoDetectado }}
        </div>
        <button @click="codigoDetectado = ''" class="btn-reset">
          Escanear otro
        </button>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* 5. Diseño profesional y limpio */
.app-layout { font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 1rem; }
.visor-camara { border-radius: 20px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border: 2px solid #eee; }
.resultado-card { margin-top: 2rem; padding: 1.5rem; background: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb; text-align: center; }
.badge-codigo { display: inline-block; padding: 0.5rem 1rem; background: #00dc82; color: white; font-weight: bold; border-radius: 9999px; margin: 1rem 0; }
.btn-reset { display: block; width: 100%; padding: 0.75rem; border: none; background: #374151; color: white; border-radius: 8px; cursor: pointer; }
</style>



