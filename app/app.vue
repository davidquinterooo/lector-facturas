<script setup>
import { StreamBarcodeReader } from "@teckel/vue-barcode-reader";

const { buscarProducto } = useProductos();

const listaFactura = ref([]);

// Control de escaneo para que no escanee mas de la cuenta
const escanerBloqueado = ref(false);

const alDetectarCodigo = (valor) => {
  if (valor && !escanerBloqueado.value) {
    // Bloqueamos el escáner un momento
    escanerBloqueado.value = true;
    
    const producto = buscarProducto(valor);
    
    if (producto) {
      // Agregamos el producto a la lista con un ID único basado en el tiempo
      listaFactura.value.push({
        ...producto,
        idInterno: Date.now() 
      });
      console.log("Producto añadido:", producto.nombre);
    }

    // Liberamos el escáner tras 2 segundos
    setTimeout(() => {
      escanerBloqueado.value = false;
    }, 2000);
  }
};

// 'computed' se recalcula automáticamente cada vez que la lista cambia.
const totalFactura = computed(() => {
  return listaFactura.value.reduce((acc, p) => acc + p.precio, 0);
});

// Importamos el composable del módulo nuxt-pdfmake
const pdfMake = usePDFMake();

const pdfOpen = () => {
  // No se ejecuta si el pdf esta vacio
  if (listaFactura.value.length === 0) {
    alert("No hay productos en la factura");
    return;
  }
  const cuerpoTabla = [
    [
      { text: 'Producto', bold: true, color: 'white', fillColor: '#2C2C2C', margin: [5,0,0,0]},
      { text: 'Precio', bold: true, color: 'white', fillColor: '#2C2C2C',margin: [0,0,5,0] }
    ]
  ];

  // Empujamos cada producto de nuestra lista reactiva al cuerpo de la tabla
  listaFactura.value.forEach(item => {
    cuerpoTabla.push([
      item.nombre, 
      `$${item.precio.toFixed(2)}`,
    ]);
  });

  // fila del total al final
  cuerpoTabla.push([
    { text: 'TOTAL', bold: true},
    { text: `$${totalFactura.value.toFixed(2)}`, bold: true,}
  ]);

  // Definición del documento
  const docDefinition = {
    content: [
      { text: 'FACTURA DE VENTA', style: 'header', alignment: 'center' },
      { text: `Fecha: ${new Date().toLocaleDateString()}`, alignment: 'right' },
      { text: '\n' }, // Espacio en blanco
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto'], // '*' toma el resto del ancho, 'auto' se ajusta al contenido
          body: cuerpoTabla
        },
        layout: 'lightHorizontalLines'
      }
    ],
    styles: {
      header: {
        fontSize: 22,
        bold: true,
        margin: [0, 0, 0, 10]
      }
    }
  };
    // Si 'createPdf' falla, capturamos el error para que la app no se rompa.
  try {
    pdfMake.createPdf(docDefinition).open();
  } catch (error) {
    console.error("Error de pdfMake:", error);
  }
};


</script>

<template>
  <div class="container">
  <div class="container-camara">
    
    <div class="app-layout">
      <ClientOnly>
        <div :class="['visor-camara', { 'bloqueado': escanerBloqueado }]">
          <StreamBarcodeReader @decode="alDetectarCodigo" />
          <div v-if="escanerBloqueado" class="overlay">¡Producto Añadido!</div>
        </div>
      </ClientOnly>
    </div>

  </div>

  <div class="container-lista">
    
    <!-- 6. Listado de la Factura -->
    <section class="factura-seccion">
      <h3>Detalle de Factura</h3>

      <table class="tabla-factura">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Precio</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in listaFactura" :key="item.idInterno">
            <td>{{ item.nombre }}</td>
            <td>${{ item.precio.toFixed(2) }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td><strong>TOTAL</strong></td>
            <td><strong>${{ totalFactura.toFixed(2) }}</strong></td>
          </tr>
        </tfoot>
      </table>
  
      <!-- Botón para los pdf -->
      <button 
        v-if="listaFactura.length > 0" 
        class="btn-generar"
        @click="pdfOpen()"
      > 
        Descargar PDF
      </button>
      <button 
        v-if="listaFactura.length > 0" 
        class="btn-generar"
        @click="pdfOpen"
      >
        Abrir PDF
      </button>
      <button 
        v-if="listaFactura.length > 0" 
        class="btn-generar"
        @click="printPDF"
      >
        Imprimir PDF
      </button>
    </section>

  </div>    
  </div>


</template>

<style>
body{
  background-color: #2C2C2C;
  color: #FFF
}
</style>

<style scoped>

.video{
  border-radius: 50px;
}
.visor-camara { position: relative; border: 4px solid #ff0000; transition: border-color 0.3s; width: 50%; background: cyan; border-radius: 50px;}
.visor-camara.bloqueado { border-color: #fbbf24; opacity: 0.7; }

.overlay {
  position: relative; top: 50%; left: 50%; transform: translate(-50%, -50%); border-radius:50px ;
  background: rgba(0,0,0,0.7); color: white; padding: 1rem;
}

.tabla-factura { width: 100%; margin-top: 1rem; border-collapse: collapse; }
.tabla-factura th, .tabla-factura td { padding: 10px; border-bottom: 1px solid #ddd; text-align: left; }
.btn-generar { 
  margin-top: 20px; width: 100%; padding: 15px; background: #00dc82; 
  color: black; font-weight: bold; border: none; border-radius: 8px; cursor: pointer;
}
.container-camara{
  width: 50%;
}
.container-lista{
  text-align: right;
  width: 50%;
  min-height: 100%;
}
.container{
background: gray;
display: flex;
justify-content: flex-end;
}
</style>



