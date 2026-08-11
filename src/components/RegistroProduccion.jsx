import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Container, Row, Col, ListGroup, Badge } from 'react-bootstrap';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE}/api`;

export function RegistroProduccion() {
  const [recetas, setRecetas] = useState([]);
  const [ingredientes, setIngredientes] = useState([]);
  const [recetaSeleccionada, setRecetaSeleccionada] = useState('');
  const [recetaObjeto, setRecetaObjeto] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

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

  // Asigna el total por defecto de la receta seleccionada
  if (seleccion && seleccion.total_recetas) {
    setCantidad(parseFloat(seleccion.total_recetas));
  } else {
    setCantidad(1);
  }
};

  const handleProcesarProduccion = async (e) => {
    e.preventDefault();
    if (!recetaObjeto) return;

    try {
      // Recorrer los ingredientes de la receta y actualizar cada uno en la base de datos
      for (const item of recetaObjeto.ingredientes) {
        const ingActual = ingredientes.find((i) => i.id === item.ingrediente_id);
        if (ingActual) {
          const descuento = item.cantidad_requerida * parseFloat(cantidad);
          const nuevoStock = parseFloat(ingActual.stock_actual) - descuento;

          await fetch(`${API_URL}/ingredientes/${ingActual.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stock_actual: nuevoStock })
          });
        }
      }

      setMensaje({ tipo: 'success', texto: '¡Producción registrada y stock descontado en Render!' });
      setCantidad(1);
      cargarDatos();
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: 'Error al procesar la producción.' });
    }
  };

  const getDetalleIngrediente = (id) => {
    const ing = ingredientes.find((i) => i.id === id);
    return ing ? { nombre: ing.nombre, unidad: ing.unidad_medida } : { nombre: 'Desconocido', unidad: '' };
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col xs={12} md={7}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white text-center">
              <h5 className="mb-0">Registrar Producción Diaria</h5>
            </Card.Header>
            <Card.Body>
              {mensaje.texto && <Alert variant={mensaje.tipo}>{mensaje.texto}</Alert>}
              
              <Form onSubmit={handleProcesarProduccion}>
                <Form.Group className="mb-3">
                  <Form.Label>Seleccionar Receta</Form.Label>
                  <Form.Select 
                    value={recetaSeleccionada} 
                    onChange={(e) => handleCambioReceta(e.target.value)}
                    required
                  >
                    <option value="">-- Selecciona una receta --</option>
                    {recetas.map((r) => (
                      <option key={r.id} value={r.id}>{r.nombre}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Número de Recetas / Batches a producir</Form.Label>
                  <Form.Control 
                    type="number" 
                    min="0.1" 
                    step="0.1"
                    value={cantidad} 
                    onChange={(e) => setCantidad(e.target.value)}
                    required
                  />
                </Form.Group>

                {recetaObjeto && (
                  <Card className="mb-3 bg-light border-info">
                    <Card.Body className="p-3">
                      <h6 className="text-info-emphasis mb-2">
                        📋 Ingredientes necesarios para {cantidad} receta(s):
                      </h6>
                      <ListGroup variant="flush">
                        {recetaObjeto.ingredientes.map((item) => {
                          const detalle = getDetalleIngrediente(item.ingrediente_id);
                          const totalRequerido = item.cantidad_requerida * parseFloat(cantidad || 0);

                          return (
                            <ListGroup.Item 
                              key={item.ingrediente_id} 
                              className="d-flex justify-content-between align-items-center bg-transparent py-1 px-0"
                            >
                              <span>{detalle.nombre}</span>
                              <Badge bg="secondary">
                                {totalRequerido.toLocaleString()} {detalle.unidad}
                              </Badge>
                            </ListGroup.Item>
                          );
                        })}
                      </ListGroup>
                    </Card.Body>
                  </Card>
                )}

                <Button variant="success" type="submit" className="w-100 btn-lg" disabled={!recetaObjeto}>
                  Descontar del Inventario
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}