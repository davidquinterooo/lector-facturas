export const useProductos = () => {
    const dbProductos = {
        "048000410016": { nombre: "Coca-Cola 600ml", precio: 1.50 },
        "3608874833792": { nombre: "Galleta Oreo", precio: 2.00 },
        "5060166690380": { nombre: "Monster", precio: 3.00 },
    };

    const buscarProducto = (codigo) => {
        const producto = dbProductos[codigo];
        
        if (producto) {
        return { ...producto, codigo }; // Retornamos el producto con su código
        }
        
        return null; // Si no existe, devolvemos null
    };

    return {
        buscarProducto
    };
};
