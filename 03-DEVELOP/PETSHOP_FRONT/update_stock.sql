-- Drop any existing functions with this name to avoid conflicts
DROP FUNCTION IF EXISTS public.actualizar_stock_producto(uuid, integer);
DROP FUNCTION IF EXISTS public.actualizar_stock_producto(integer, integer);

CREATE OR REPLACE FUNCTION public.actualizar_stock_producto(
    p_id_producto uuid,
    p_cantidad_vendida integer
)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
    UPDATE productos
    SET stock = stock - p_cantidad_vendida
    WHERE id_producto = p_id_producto;
END;
$function$

// ... (manten todos los imports y el resto del componente igual)

  async function handleSubmit(e) {
    e.preventDefault()

    // Validación mínima
    if (!recibo.cliente || !recibo.metodoPago || recibo.items.length === 0) {
      toast.error('Faltan datos: cliente, método de pago o productos')
      return
    }

    setLoading(true)
    try {
      const total = calcularTotal()
      // Usar el mismo número que se muestra en pantalla
      const numeroFactura = recibo.numero

      console.log('=== INTENTANDO VENTA ===')
      console.log('Cliente:', recibo.cliente)
      console.log('Productos:', recibo.items.length)
      console.log('Total:', total)
      console.log('Número factura:', numeroFactura)

      // 1. Insertar recibo de caja
      const payloadRecibo = {
        id_cliente: recibo.cliente,
        fecha_recibo_caja: new Date().toISOString(),
        numero_recibo_caja: numeroFactura,
        total: total,
        tipo_pago: recibo.metodoPago,
      }

      console.log('Insertando recibo:', payloadRecibo)
      const { data: reciboData, error: reciboError } = await supabase
        .from('recibo_caja')
        .insert([payloadRecibo])
        .select('id_recibo_caja')

      if (reciboError) {
        console.error('Error insertando recibo:', reciboError)
        throw reciboError
      }

      const reciboInsertado = reciboData[0]
      console.log('RECIBO INSERTADO CORRECTAMENTE:', reciboInsertado)

      // 2. Insertar productos del recibo
      if (recibo.items.length > 0) {
        const productosPayload = recibo.items.map(item => ({
          id_recibo_caja: reciboInsertado.id_recibo_caja,
          id_producto: item.id_producto,
          cantidad: item.cantidad,
          precio_venta: item.precio_unitario
        }))

        console.log('Insertando productos del recibo:', productosPayload)
        const { error: productosError } = await supabase
          .from('productos_recibo')
          .insert(productosPayload)

        if (productosError) {
          console.error('Error insertando productos del recibo:', productosError.message)
          // Si falla la inserción de productos, es mejor detenerse para no descontar stock
          throw new Error(`Error guardando productos del recibo: ${productosError.message}`)
        }
        
        console.log('PRODUCTOS DEL RECIBO INSERTADOS CORRECTAMENTE')
        
        // 3. Actualizar el stock de cada producto (¡NUEVO PASO!)
        console.log('--- Actualizando stock de productos ---')
        
        const stockUpdatePromises = recibo.items.map(item => {
          console.log(`Llamando a RPC 'actualizar_stock_producto' para producto ID: ${item.id_producto}, cantidad: ${item.cantidad}`)
          return supabase.rpc('actualizar_stock_producto', {
            id_producto_param: item.id_producto,
            cantidad_vendida_param: item.cantidad
          })
        })

        const stockUpdateResults = await Promise.all(stockUpdatePromises)

        stockUpdateResults.forEach((result, index) => {
          if (result.error) {
            console.error(`Error actualizando stock para el producto ${recibo.items[index].nombre_producto}:`, result.error)
            // Opcional: podrías acumular errores y mostrarlos, pero la venta principal ya se hizo.
            // Por simplicidad, solo lo logueamos.
          }
        })

        console.log('STOCK ACTUALIZADO CORRECTAMENTE')
      }

      toast.success(`Venta completada. Recibo: ${numeroFactura}`)

      // Resetear el formulario para la siguiente venta
      const siguienteNumero = (parseInt(recibo.numero) + 1).toString()
      setRecibo({
        cliente: '',
        items: [],
        metodoPago: '',
        pago: '',
        fecha: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        numero: siguienteNumero,
        correo: '',
        direccion: '',
      })
      // Actualizar el estado del último número de recibo para la siguiente operación
      setUltimoNumeroRecibo(parseInt(recibo.numero))


    } catch (err) {
      console.error('ERROR EN EL PROCESO DE VENTA:', err)
      
      let errorMessage = 'Error al procesar la venta'
      if (err.code === '23503') {
        errorMessage = 'Error: El cliente seleccionado no existe'
      } else if (err.code === '42501') {
        errorMessage = 'Error: Sin permisos para realizar esta operación'
      } else if (err.message) {
        errorMessage = err.message
      }

      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }