export const useProductos = () => {
    const dbProductos = {
        "048000410016": { nombre: "Coca-Cola 600ml", precio: 1.50 },
        "3608874833792": { nombre: "Galleta Oreo", precio: 2.00 },
        "5060166690380": { nombre: "Monster", precio: 3.00 },
        "5596400000009": { nombre: "Sardinas Omega 170G", precio: 5.00 },
        "8400000000017": { nombre: "Galleta Integrale 150G", precio: 2.50 },
        "6900020021112": { nombre: "Harina Pan Maiz 2KG", precio: 2.50 },
        "9780198601838": { nombre: "Lenteja 500G", precio: 2.50 },
        "9783894767112": { nombre: "Gelatina Fresa X 162GR", precio: 2.50 },  
    };

    const buscarProducto = (codigo) => {
        const producto = dbProductos[codigo];
        if (producto) {
        return { ...producto, codigo }; // Retornamos el producto con su código
        }
        
        console.log(`Producto no encontrado codigo: ${codigo}`)
        return null; // Si no existe, devolvemos null
    };

    return {
        buscarProducto
    };
};
