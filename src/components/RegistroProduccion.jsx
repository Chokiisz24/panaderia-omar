import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Container, Row, Col, ListGroup, Badge } from 'react-bootstrap';
import { getRecetas, getIngredientes, saveIngredientes } from '../utils/storage';

export function RegistroProduccion() {
  const [recetas, setRecetas] = useState([]);
  const [ingredientesBase, setIngredientesBase] = useState([]);
  const [recetaSeleccionada, setRecetaSeleccionada] = useState('');
  const [recetaObjeto, setRecetaObjeto] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    setRecetas(getRecetas());
    setIngredientesBase(getIngredientes());
  }, []);

  // Al cambiar la receta en el dropdown, buscamos los detalles completos
  const handleCambioReceta = (id) => {
    setRecetaSeleccionada(id);
    if (!id) {
      setRecetaObjeto(null);
      return;
    }
    const seleccion = recetas.find((r) => r.id === parseInt(id));
    setRecetaObjeto(seleccion || null);
  };

  const handleProcesarProduccion = (e) => {
    e.preventDefault();
    if (!recetaObjeto) return;

    let ingredientesActuales = getIngredientes();

    // Descontar cada ingrediente multiplicando por el número de recetas/batches
    recetaObjeto.ingredientes.forEach((item) => {
      const descuento = item.cantidad_requerida * parseFloat(cantidad);
      ingredientesActuales = ingredientesActuales.map((ing) => {
        if (ing.id === item.ingrediente_id) {
          return { ...ing, stock_actual: ing.stock_actual - descuento };
        }
        return ing;
      });
    });

    saveIngredientes(ingredientesActuales);
    setIngredientesBase(ingredientesActuales); // Actualizar estado local
    setMensaje({ tipo: 'success', texto: '¡Producción registrada y stock descontado con éxito!' });
    setCantidad(1);
  };

  // Función auxiliar para obtener el nombre y unidad del ingrediente por su ID
  const getDetalleIngrediente = (id) => {
    const ing = ingredientesBase.find((i) => i.id === id);
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

                {/* Vista previa de ingredientes de la receta seleccionada */}
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