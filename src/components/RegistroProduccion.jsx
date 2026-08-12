import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Container, Row, Col, ListGroup, Badge, Modal, Spinner } from 'react-bootstrap';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE}/api`;

const LOTES_POR_DEFECTO = {
  'Masa Baguette': 15,
  'Brioche': 5.5,
  'Pizza': 10,
  'Biga': 10,
  'Brioche Caja': 20
};

export function RegistroProduccion() {
  const [recetas, setRecetas] = useState([]);
  const [ingredientes, setIngredientes] = useState([]);
  const [recetaSeleccionada, setRecetaSeleccionada] = useState('');
  const [recetaObjeto, setRecetaObjeto] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  
  // 💡 Nuevos estados para feedback visual inmediato
  const [procesando, setProcesando] = useState(false);
  const [mostrarModalExito, setMostrarModalExito] = useState(false);
  const [datosUltimoRegistro, setDatosUltimoRegistro] = useState(null);

  const cargarDatos = async () => {
    try {
      const [resRecetas, resIngredientes] = await Promise.all([
        fetch(`${API_URL}/recetas`),
        fetch(`${API_URL}/ingredientes`)
      ]);
      const dataRecetas = await resRecetas.json();
      const dataIngredientes = await resIngredientes.json();
      setRecetas(dataRecetas);
      setIngredientes(dataIngredientes);
    } catch (err) {
      console.error('Error al cargar datos:', err);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleCambioReceta = (id) => {
    setRecetaSeleccionada(id);
    if (!id) {
      setRecetaObjeto(null);
      setCantidad(1);
      return;
    }
    const seleccion = recetas.find((r) => r.id === parseInt(id));
    setRecetaObjeto(seleccion || null);

    if (seleccion) {
      const loteDefecto = LOTES_POR_DEFECTO[seleccion.nombre] || seleccion.total_recetas || 1;
      setCantidad(parseFloat(loteDefecto));
    } else {
      setCantidad(1);
    }
  };

  const handleProcesarProduccion = async (e) => {
    e.preventDefault();
    if (!recetaObjeto) return;

    setProcesando(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      const baseTotalRecetas = parseFloat(LOTES_POR_DEFECTO[recetaObjeto.nombre] || recetaObjeto.total_recetas || 1);

      // 1. Recorrer los ingredientes de la receta y descontar stock
      for (const item of recetaObjeto.ingredientes) {
        const ingActual = ingredientes.find((i) => i.id === item.ingrediente_id);
        if (ingActual) {
          const cantidadUnitaria = parseFloat(item.cantidad_requerida) / baseTotalRecetas;
          const descuento = cantidadUnitaria * parseFloat(cantidad || 0);
          const nuevoStock = parseFloat(ingActual.stock_actual) - descuento;

          await fetch(`${API_URL}/ingredientes/${ingActual.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stock_actual: nuevoStock })
          });
        }
      }

      // 2. Registrar en la tabla produccion_log
      const hoy = new Date();
      const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

      await fetch(`${API_URL}/produccion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receta_id: recetaObjeto.id,
          cantidad_producida: parseFloat(cantidad),
          fecha: fechaHoy
        })
      });

      // Guardar datos del registro exitoso para la ventana emergente
      setDatosUltimoRegistro({
        nombre: recetaObjeto.nombre,
        cantidad: cantidad
      });

      setMensaje({
        tipo: 'success',
        texto: `¡Producción de ${cantidad} x ${recetaObjeto.nombre} registrada correctamente!`
      });

      // Mostrar modal emergente
      setMostrarModalExito(true);

      // Limpieza de formulario
      setCantidad(1);
      setRecetaSeleccionada('');
      setRecetaObjeto(null);
      await cargarDatos();
    } catch (err) {
      console.error('Error al procesar la producción:', err);
      setMensaje({ tipo: 'danger', texto: 'Error al procesar la producción. Inténtalo de nuevo.' });
    } finally {
      setProcesando(false);
    }
  };

  const getDetalleIngrediente = (id) => {
    const ing = ingredientes.find((i) => i.id === id);
    return ing ? { nombre: ing.nombre, unidad: ing.unidad_medida } : { nombre: 'Desconocido', unidad: '' };
  };

  return (
    <Container className="py-2">
      <Row className="justify-content-center">
        <Col xs={12} md={7}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-primary text-white text-center py-3">
              <h5 className="mb-0 fw-bold">Registrar Producción Diaria</h5>
            </Card.Header>
            <Card.Body className="p-4">
              {mensaje.texto && (
                <Alert
                  variant={mensaje.tipo}
                  dismissible
                  onClose={() => setMensaje({ tipo: '', texto: '' })}
                  className="mb-3"
                >
                  {mensaje.texto}
                </Alert>
              )}

              <Form onSubmit={handleProcesarProduccion}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Seleccionar Receta</Form.Label>
                  <Form.Select 
                    value={recetaSeleccionada} 
                    onChange={(e) => handleCambioReceta(e.target.value)}
                    required
                    disabled={procesando}
                  >
                    <option value="">-- Selecciona una receta --</option>
                    {recetas.map((r) => (
                      <option key={r.id} value={r.id}>{r.nombre}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Número de Recetas a producir</Form.Label>
                  <Form.Control 
                    type="number" 
                    min="0.1" 
                    step="0.1"
                    value={cantidad} 
                    onChange={(e) => setCantidad(e.target.value)}
                    required
                    disabled={procesando}
                  />
                </Form.Group>

                {recetaObjeto && (
                  <Card className="mb-3 bg-light border-info">
                    <Card.Body className="p-3">
                      <h6 className="text-info-emphasis mb-2 fw-bold">
                        📋 Ingredientes que se descontarán ({cantidad} receta/s):
                      </h6>
                      <ListGroup variant="flush">
                        {recetaObjeto.ingredientes.map((item) => {
                          const detalle = getDetalleIngrediente(item.ingrediente_id);
                          const baseTotalRecetas = parseFloat(LOTES_POR_DEFECTO[recetaObjeto.nombre] || recetaObjeto.total_recetas || 1);
                          
                          const cantidadUnitaria = parseFloat(item.cantidad_requerida) / baseTotalRecetas;
                          const totalRequerido = cantidadUnitaria * parseFloat(cantidad || 0);

                          return (
                            <ListGroup.Item 
                              key={item.ingrediente_id} 
                              className="d-flex justify-content-between align-items-center bg-transparent py-1 px-0 border-0"
                            >
                              <span>{detalle.nombre}</span>
                              <Badge bg="secondary">
                                {totalRequerido.toLocaleString('es-MX', { maximumFractionDigits: 2 })} {detalle.unidad}
                              </Badge>
                            </ListGroup.Item>
                          );
                        })}
                      </ListGroup>
                    </Card.Body>
                  </Card>
                )}

                <Button 
                  variant="success" 
                  type="submit" 
                  className="w-100 btn-lg fw-bold d-flex align-items-center justify-content-center gap-2" 
                  disabled={!recetaObjeto || procesando}
                >
                  {procesando ? (
                    <>
                      <Spinner animation="border" size="sm" />
                      Descontando del inventario...
                    </>
                  ) : (
                    'Descontar del Inventario'
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 🟢 MODAL EMERGENTE DE CONFIRMACIÓN */}
      <Modal 
        show={mostrarModalExito} 
        onHide={() => setMostrarModalExito(false)} 
        centered
      >
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title className="h5 mb-0">¡Producción Registrada!</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          <div className="fs-1 text-success mb-2">✅</div>
          <h5 className="fw-bold">{datosUltimoRegistro?.nombre}</h5>
          <p className="mb-0 text-muted">
            Se registraron <strong>{datosUltimoRegistro?.cantidad}</strong> receta(s) y los insumos correspondientes han sido descontados correctamente del inventario.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" className="w-100 fw-bold" onClick={() => setMostrarModalExito(false)}>
            Aceptar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}