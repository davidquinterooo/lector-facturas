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
      // Buscamos si el producto YA está en nuestra lista de la factura
      const itemExistente = listaFactura.value.find(item => item.codigo === valor);

      if (itemExistente) {
        // Si ya existe, solo aumentamos la cantidad
        itemExistente.cantidad++;
      } else {
        // Si es nuevo, lo agregamos con cantidad 1
        listaFactura.value.push({
          ...producto,
          cantidad: 1,
          idInterno: Date.now()
        });
      }
      console.log(`Lista actualizada:`, listaFactura.value);
    } else {
      console.log("Código de barra no encontrado");
    }

    // Liberamos el escáner tras 2 segundos
    setTimeout(() => {
      escanerBloqueado.value = false;
    }, 2000);
  }
};

// 'computed' se recalcula automáticamente cada vez que la lista cambia.
const totalFactura = computed(() => {
  return listaFactura.value.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
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
      { text: 'SKU', bold: true, color: 'white', fillColor: '#2C2C2C', margin: [5,0,0,0]},
      { text: 'PRODUCTO', bold: true, color: 'white', fillColor: '#2C2C2C', margin: [5,0,0,0]},
      { text: 'CANTIDAD', bold: true, color: 'white', fillColor: '#2C2C2C', margin: [5,0,0,0]},
      { text: 'PRECIO', bold: true, color: 'white', fillColor: '#2C2C2C',margin: [0,0,5,0] }
    ]
  ];

  // Empujamos cada producto de nuestra lista reactiva al cuerpo de la tabla
  listaFactura.value.forEach(item => {
    cuerpoTabla.push([
      item.codigo,
      item.nombre, 
      item.cantidad,
      `$${item.precio.toFixed(2)}`,
    ]);
  });

  // fila del total al final
  cuerpoTabla.push([
    { text: 'TOTAL', bold: true},
    { text: '' },
    { text: '' },
    { text: `$${totalFactura.value.toFixed(2)}`, bold: true,}
  ]);

  // Definición del documento
  const docDefinition = {
    content: [
      { text: 'FACTURA DE VENTA', style: 'header', alignment: 'center' },
      { text: `Fecha: ${new Date().toLocaleDateString()}`, alignment: 'right' },
      { text: '\n' },
      {
        table: {
          headerRows: 1,
          widths: ['auto', '*', 'auto', 'auto'], // '*' toma el resto del ancho, 'auto' se ajusta al contenido
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

const pdfDownload = () => {
  // No se ejecuta si el pdf esta vacio
  if (listaFactura.value.length === 0) {
    alert("No hay productos en la factura");
    return;
  }
  const cuerpoTabla = [
    [
      { text: 'SKU', bold: true, color: 'white', fillColor: '#2C2C2C', margin: [5,0,0,0]},
      { text: 'PRODUCTO', bold: true, color: 'white', fillColor: '#2C2C2C', margin: [5,0,0,0]},
      { text: 'CANTIDAD', bold: true, color: 'white', fillColor: '#2C2C2C', margin: [5,0,0,0]},
      { text: 'PRECIO', bold: true, color: 'white', fillColor: '#2C2C2C',margin: [0,0,5,0] }
    ]
  ];

  // Empujamos cada producto de nuestra lista reactiva al cuerpo de la tabla
  listaFactura.value.forEach(item => {
    cuerpoTabla.push([
      item.codigo,
      item.nombre, 
      item.cantidad,
      `$${item.precio.toFixed(2)}`,
    ]);
  });

  // fila del total al final
  cuerpoTabla.push([
    { text: 'TOTAL', bold: true},
    { text: '' },
    { text: '' },
    { text: `$${totalFactura.value.toFixed(2)}`, bold: true,}
  ]);

  // Definición del documento
  const docDefinition = {
    content: [
      { text: 'FACTURA DE VENTA', style: 'header', alignment: 'center' },
      { text: `Fecha: ${new Date().toLocaleDateString()}`, alignment: 'right' },
      { text: '\n' },
      {
        table: {
          headerRows: 1,
          widths: ['auto', '*', 'auto', 'auto'], // '*' toma el resto del ancho, 'auto' se ajusta al contenido
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
    pdfMake.createPdf(docDefinition).download('Factura.pdf');
  } catch (error) {
    console.error("Error de pdfMake:", error);
  }
};

const pdfPrint = () => {
  // No se ejecuta si el pdf esta vacio
  if (listaFactura.value.length === 0) {
    alert("No hay productos en la factura");
    return;
  }
  const cuerpoTabla = [
    [
      { text: 'SKU', bold: true, color: 'white', fillColor: '#2C2C2C', margin: [5,0,0,0]},
      { text: 'PRODUCTO', bold: true, color: 'white', fillColor: '#2C2C2C', margin: [5,0,0,0]},
      { text: 'CANTIDAD', bold: true, color: 'white', fillColor: '#2C2C2C', margin: [5,0,0,0]},
      { text: 'PRECIO', bold: true, color: 'white', fillColor: '#2C2C2C',margin: [0,0,5,0] }
    ]
  ];

  // Empujamos cada producto de nuestra lista reactiva al cuerpo de la tabla
  listaFactura.value.forEach(item => {
    cuerpoTabla.push([
      item.codigo,
      item.nombre, 
      item.cantidad,
      `$${item.precio.toFixed(2)}`,
    ]);
  });

  // fila del total al final
  cuerpoTabla.push([
    { text: 'TOTAL', bold: true},
    { text: '' },
    { text: '' },
    { text: `$${totalFactura.value.toFixed(2)}`, bold: true,}
  ]);

  // Definición del documento
  const docDefinition = {
    content: [
      { text: 'FACTURA DE VENTA', style: 'header', alignment: 'center' },
      { text: `Fecha: ${new Date().toLocaleDateString()}`, alignment: 'right' },
      { text: '\n' },
      {
        table: {
          headerRows: 1,
          widths: ['auto', '*', 'auto', 'auto'], // '*' toma el resto del ancho, 'auto' se ajusta al contenido
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
    pdfMake.createPdf(docDefinition).print();
  } catch (error) {
    console.error("Error de pdfMake:", error);
  }
};

</script>

<template>
  <div class="container">

  <div class="container-camara">
    <ClientOnly>
      <div :class="['visor-camara', { 'bloqueado': escanerBloqueado }]">
        <StreamBarcodeReader @decode="alDetectarCodigo" />
        <div v-if="escanerBloqueado" class="overlay">Producto Escaneado</div>
      </div>
    </ClientOnly>
  </div>

  <div class="container-lista">
    
    <!-- 6. Listado de la Factura -->
    <section class="factura-seccion">
      <h1>Detalle de Factura</h1>

      <table class="tabla-factura">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in listaFactura" :key="item.idInterno">
            <td>{{ item.codigo }}</td>
            <td>{{ item.nombre }}</td>
            <td>{{ item.cantidad }}</td>
            <td>${{ item.precio.toFixed(2) }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td><strong>TOTAL</strong></td>
            <td></td>
            <td></td>
            <td><strong>${{ totalFactura.toFixed(2) }}</strong></td>
          </tr>
        </tfoot>
      </table>
  
      <!-- Botón para los pdf -->
      <div class="botones-container">
          <button  
            class="btn-generar"
            @click="pdfDownload"
          > 
            Descargar
          </button>
          <button  
            class="btn-generar"
            @click="pdfOpen"
          >
            Abrir
          </button>
          <button  
            class="btn-generar"
            @click="pdfPrint"
          >
            Imprimir
          </button>        
      </div>

    </section>
  </div>    
  </div>


</template>

<style>
body{
  background-color: #2C2C2C;
  color: #FFF;
  margin: 0;
  padding: 0;
}
</style>

<style scoped>
h1{
  color: #1a2e2a;
  font-size: 1.5em;
  font-weight: 700;
  text-align: center;
}

.container {
  display: flex;
  flex-direction: column;
  width: 80%;
  max-width: 900px;
  margin: 40px auto;
  background-color: #ffffff;
  border-radius: 16px; 
  overflow: hidden;
  box-shadow: 0 15px 35px rgba(0,0,0,0.3); 
}

.container-camara {
  width: 100%;
  background-color: #1a2e2a; 
  padding: 10px; 
  display: flex;
  justify-content: center;
}

.visor-camara { 
  width: 100%;
  max-width: 500px;
  border-radius: 12px; 
  overflow: hidden;
  border: 3px solid rgba(255,255,255,0.2); 
}

.container-lista {
  padding: 30px;
}

.tabla-factura { 
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.tabla-factura thead th { 
  background-color: transparent;
  color: #1a2e2a; /* Texto oscuro */
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 12px 15px;
  border-bottom: 2px solid #e0e0e0; 
  text-align: left;   
}

.tabla-factura tbody tr {
  border-bottom: 1px solid #f0f0f0;
}

.tabla-factura tbody tr:nth-child(even) {
  background-color: #fbfcfb; 
}

.tabla-factura td { 
  padding: 15px;
  color: #333;
}

.tabla-factura td:nth-child(1), /* SKU */
.tabla-factura td:nth-child(2), /* Producto */
.tabla-factura td:nth-child(3), /* Cantidad */
.tabla-factura td:nth-child(4) { /* Precio */
  font-family: 'Roboto Mono', monospace; 
  text-align: left;
}


.tabla-factura tfoot tr {
  background-color: #f8f9f8;
  font-weight: bold;
}

.tabla-factura tfoot td {
  padding: 20px 15px;
  font-size: 1.1rem;
  color: #1a2e2a;
  border-top: 2px solid #e0e0e0;
}

/* Contenedor de Botones (Sección de cierre) */
.botones-container {
  display: flex;
  width: 100%;
  margin-top: 0; /* Pegado al borde de la tarjeta */
}

/* 4. Botones unificados a ancho completo */
.btn-generar { 
  flex: 1; /* Todos ocupan el mismo espacio */
  padding: 18px;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  /* Usando tu color de botones Opción 1 */
  background-color: #2d5a4c; 
  color: #ffffff;
  border-right: 1px solid rgba(255,255,255,0.1); /* Separador sutil */
}

.btn-generar:last-child {
  border-right: none;
}

.btn-generar:hover { 
  background-color: #1e3d33;
  transform: translateY(-1px); /* Efecto sutil */
}
</style>