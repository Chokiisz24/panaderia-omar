import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Container, Row, Col, Table, InputGroup, Spinner } from 'react-bootstrap';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE}/api`;

export function GestionRecetas() {
  const [ingredientesDisponibles, setIngredientesDisponibles] = useState([]);
  const [nombreReceta, setNombreReceta] = useState('');
  
  // Lista de ingredientes agregados a la receta actual
  // Ejemplo: [{ ingrediente_id: 1, nombre: 'Harina MC', cantidad_requerida: 7500, unidad_medida: 'g' }]
  const [ingredientesReceta, setIngredientesReceta] = useState([]);

  // Campos para la selección actual
  const [ingredienteSeleccionado, setIngredienteSeleccionado] = useState('');
  const [cantidadGramos, setCantidadGramos] = useState('');

  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [guardando, setGuardando] = useState(false);

  // Cargar el catálogo global de ingredientes para el dropdown
  useEffect(() => {
    const cargarIngredientes = async () => {
      try {
        const res = await fetch(`${API_URL}/ingredientes`);
        const data = await res.json();
        setIngredientesDisponibles(data);
      } catch (err) {
        console.error('Error al cargar ingredientes:', err);
      }
    };
    cargarIngredientes();
  }, []);

  // ➕ Agregar ingrediente a la lista de la receta
  const handleAgregarIngrediente = () => {
    if (!ingredienteSeleccionado || !cantidadGramos || parseFloat(cantidadGramos) <= 0) return;

    const ingObj = ingredientesDisponibles.find((i) => i.id === parseInt(ingredienteSeleccionado));
    if (!ingObj) return;

    // Verificar si ya existe en la lista para actualizar o agregar
    const existeIndex = ingredientesReceta.findIndex((item) => item.ingrediente_id === ingObj.id);

    if (existeIndex >= 0) {
      const copia = [...ingredientesReceta];
      copia[existeIndex].cantidad_requerida = parseFloat(cantidadGramos);
      setIngredientesReceta(copia);
    } else {
      setIngredientesReceta([
        ...ingredientesReceta,
        {
          ingrediente_id: ingObj.id,
          nombre: ingObj.nombre,
          unidad_medida: ingObj.unidad_medida,
          cantidad_requerida: parseFloat(cantidadGramos)
        }
      ]);
    }

    // Resetear controles
    setIngredienteSeleccionado('');
    setCantidadGramos('');
  };

  // 🗑️ Quitar ingrediente de la receta
  const handleQuitarIngrediente = (id) => {
    setIngredientesReceta(ingredientesReceta.filter((item) => item.ingrediente_id !== id));
  };

  // ✏️ Cambiar cantidad directamente en la tabla
  const handleCambiarCantidadTabla = (id, nuevaCantidad) => {
    const val = parseFloat(nuevaCantidad) || 0;
    setIngredientesReceta(
      ingredientesReceta.map((item) =>
        item.ingrediente_id === id ? { ...item, cantidad_requerida: val } : item
      )
    );
  };

  // 💾 Guardar receta en el backend
  const handleGuardarReceta = async (e) => {
    e.preventDefault();

    if (!nombreReceta.trim()) {
      setMensaje({ tipo: 'warning', texto: 'Por favor ingresa el nombre de la receta.' });
      return;
    }

    if (ingredientesReceta.length === 0) {
      setMensaje({ tipo: 'warning', texto: 'Agrega al menos un ingrediente a la receta.' });
      return;
    }

    setGuardando(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      const payload = {
        nombre: nombreReceta,
        ingredientes: ingredientesReceta.map((item) => ({
          ingrediente_id: item.ingrediente_id,
          cantidad_requerida: item.cantidad_requerida
        }))
      };

      const res = await fetch(`${API_URL}/recetas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Error en el servidor al guardar receta');

      setMensaje({ tipo: 'success', texto: `¡Receta "${nombreReceta}" guardada con éxito!` });
      
      // Limpiar todo el formulario
      setNombreReceta('');
      setIngredientesReceta([]);
    } catch (err) {
      console.error('Error al guardar la receta:', err);
      setMensaje({ tipo: 'danger', texto: 'No se pudo guardar la receta. Revisa la consola o conexión.' });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Container className="py-3">
      <Row className="justify-content-center">
        <Col xs={12} lg={9}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-dark text-white text-center py-3">
              <h5 className="mb-0 fw-bold">📖 Crear / Modificar Recetas</h5>
            </Card.Header>
            <Card.Body className="p-4">
              {mensaje.texto && (
                <Alert variant={mensaje.tipo} dismissible onClose={() => setMensaje({ tipo: '', texto: '' })}>
                  {mensaje.texto}
                </Alert>
              )}

              <Form onSubmit={handleGuardarReceta}>
                {/* NOMBRE DE LA RECETA */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold fs-5">Nombre de la Receta</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ej. Biga, Brioche, Masa Baguette..."
                    value={nombreReceta}
                    onChange={(e) => setNombreReceta(e.target.value)}
                    disabled={guardando}
                    className="form-control-lg"
                    required
                  />
                </Form.Group>

                <hr />

                {/* SELECTOR DE INGREDIENTES Y GRAMOS */}
                <h6 className="fw-bold mb-3">Agregar Ingredientes a la Receta</h6>
                <Row className="g-2 mb-3 align-items-end">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small text-muted fw-bold">Ingrediente</Form.Label>
                      <Form.Select
                        value={ingredienteSeleccionado}
                        onChange={(e) => setIngredienteSeleccionado(e.target.value)}
                        disabled={guardando}
                      >
                        <option value="">-- Selecciona ingrediente --</option>
                        {ingredientesDisponibles.map((i) => (
                          <option key={i.id} value={i.id}>
                            {i.nombre} ({i.unidad_medida})
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="small text-muted fw-bold">Cantidad (Gramos / Unidades)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        placeholder="Ej. 7500"
                        value={cantidadGramos}
                        onChange={(e) => setCantidadGramos(e.target.value)}
                        disabled={guardando}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={2}>
                    <Button
                      variant="primary"
                      className="w-100 fw-bold"
                      onClick={handleAgregarIngrediente}
                      disabled={!ingredienteSeleccionado || !cantidadGramos || guardando}
                    >
                      ➕ Agregar
                    </Button>
                  </Col>
                </Row>

                {/* TABLA DE INGREDIENTES AGREGADOS */}
                <h6 className="fw-bold mt-4 mb-2">Composición de la Receta:</h6>
                {ingredientesReceta.length === 0 ? (
                  <Alert variant="light" className="text-center border text-muted py-3">
                    Aún no has agregado ingredientes a esta receta.
                  </Alert>
                ) : (
                  <Table responsive bordered align="middle" className="mb-4">
                    <thead className="table-light">
                      <tr>
                        <th>Ingrediente</th>
                        <th style={{ width: '200px' }}>Cantidad</th>
                        <th style={{ width: '80px' }} className="text-center">Quitar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ingredientesReceta.map((item) => (
                        <tr key={item.ingrediente_id}>
                          <td className="fw-bold">{item.nombre}</td>
                          <td>
                            <InputGroup size="sm">
                              <Form.Control
                                type="number"
                                step="0.1"
                                value={item.cantidad_requerida}
                                onChange={(e) => handleCambiarCantidadTabla(item.ingrediente_id, e.target.value)}
                                disabled={guardando}
                              />
                              <InputGroup.Text>{item.unidad_medida || 'g'}</InputGroup.Text>
                            </InputGroup>
                          </td>
                          <td className="text-center">
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleQuitarIngrediente(item.ingrediente_id)}
                              disabled={guardando}
                            >
                              🗑️
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}

                {/* BOTÓN GUARDAR RECETA COMPLETA */}
                <Button
                  variant="success"
                  size="lg"
                  type="submit"
                  className="w-100 fw-bold mt-2"
                  disabled={guardando || ingredientesReceta.length === 0}
                >
                  {guardando ? (
                    <>
                      <Spinner animation="border" size="sm" me={2} />
                      Guardando Receta...
                    </>
                  ) : (
                    '💾 Guardar Receta Completa'
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}