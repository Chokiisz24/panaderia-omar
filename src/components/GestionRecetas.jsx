import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Container, Row, Col, Table, InputGroup, Spinner } from 'react-bootstrap';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE}/api`;

export function GestionRecetas() {
  const [ingredientesDisponibles, setIngredientesDisponibles] = useState([]);
  const [nombreReceta, setNombreReceta] = useState('');
  const [ingredientesReceta, setIngredientesReceta] = useState([]);

  // Estados para el campo de texto de ingredientes
  const [nombreIngredienteInput, setNombreIngredienteInput] = useState('');
  const [unidadMedidaInput, setUnidadMedidaInput] = useState('g');
  const [cantidadGramos, setCantidadGramos] = useState('');

  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [guardando, setGuardando] = useState(false);

  // Cargar ingredientes existentes al montar el componente
  const cargarIngredientes = async () => {
    try {
      const res = await fetch(`${API_URL}/ingredientes`);
      const data = await res.json();
      setIngredientesDisponibles(data);
    } catch (err) {
      console.error('Error al cargar ingredientes:', err);
    }
  };

  useEffect(() => {
    cargarIngredientes();
  }, []);

  // Al escribir o seleccionar del datalist, detectamos si ya existe para sugerir su unidad de medida
  const handleCambioNombreIngrediente = (val) => {
    setNombreIngredienteInput(val);
    const coincidencia = ingredientesDisponibles.find(
      (i) => i.nombre.toLowerCase() === val.trim().toLowerCase()
    );
    if (coincidencia && coincidencia.unidad_medida) {
      setUnidadMedidaInput(coincidencia.unidad_medida);
    }
  };

  // ➕ Agregar ingrediente (crea uno nuevo en la BD si no existe)
  const handleAgregarIngrediente = async () => {
    const nombreLimpio = nombreIngredienteInput.trim();
    const cantVal = parseFloat(cantidadGramos);

    if (!nombreLimpio || isNaN(cantVal) || cantVal <= 0) return;

    let ingObj = ingredientesDisponibles.find(
      (i) => i.nombre.toLowerCase() === nombreLimpio.toLowerCase()
    );

    // Si el ingrediente NO existe en la base de datos, lo creamos primero en la tabla ingredientes
    if (!ingObj) {
      try {
        setGuardando(true);
        const res = await fetch(`${API_URL}/ingredientes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: nombreLimpio,
            unidad_medida: unidadMedidaInput,
            stock_actual: 0,
            stock_minimo: 0
          })
        });

        if (!res.ok) throw new Error('No se pudo crear el ingrediente');
        ingObj = await res.json();

        // Actualizamos la lista local de catálogo
        setIngredientesDisponibles((prev) => [...prev, ingObj]);
      } catch (err) {
        console.error(err);
        setMensaje({ tipo: 'danger', texto: 'Error al guardar el nuevo ingrediente en el inventario.' });
        setGuardando(false);
        return;
      } finally {
        setGuardando(false);
      }
    }

    // Agregar o actualizar en la tabla de la receta actual
    const existeIndex = ingredientesReceta.findIndex((item) => item.ingrediente_id === ingObj.id);

    if (existeIndex >= 0) {
      const copia = [...ingredientesReceta];
      copia[existeIndex].cantidad_requerida = cantVal;
      setIngredientesReceta(copia);
    } else {
      setIngredientesReceta([
        ...ingredientesReceta,
        {
          ingrediente_id: ingObj.id,
          nombre: ingObj.nombre,
          unidad_medida: ingObj.unidad_medida || unidadMedidaInput,
          cantidad_requerida: cantVal
        }
      ]);
    }

    // Resetear formulario de ingrediente
    setNombreIngredienteInput('');
    setCantidadGramos('');
    setUnidadMedidaInput('g');
  };

  // 🗑️ Quitar ingrediente de la lista temporal
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

  // 💾 Guardar receta completa en PostgreSQL
  const handleGuardarReceta = async (e) => {
    e.preventDefault();

    if (!nombreReceta.trim()) {
      setMensaje({ tipo: 'warning', texto: 'Ingresa el nombre de la receta.' });
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
        nombre: nombreReceta.trim(),
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

      if (!res.ok) throw new Error('Error al guardar la receta');

      setMensaje({ tipo: 'success', texto: `¡Receta "${nombreReceta}" guardada con éxito!` });
      setNombreReceta('');
      setIngredientesReceta([]);
    } catch (err) {
      console.error('Error al guardar la receta:', err);
      setMensaje({ tipo: 'danger', texto: 'Error al guardar la receta en el servidor.' });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Container className="py-2 px-1">
      <Row className="justify-content-center">
        <Col xs={12} lg={9}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-dark text-white text-center py-3">
              <h5 className="mb-0 fw-bold">📖 Crear / Modificar Receta</h5>
            </Card.Header>
            <Card.Body className="p-3">
              {mensaje.texto && (
                <Alert variant={mensaje.tipo} dismissible onClose={() => setMensaje({ tipo: '', texto: '' })}>
                  {mensaje.texto}
                </Alert>
              )}

              <Form onSubmit={handleGuardarReceta}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold fs-5">Nombre de la Receta</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ej. Biga, Brioche, Pizza..."
                    value={nombreReceta}
                    onChange={(e) => setNombreReceta(e.target.value)}
                    disabled={guardando}
                    className="form-control-lg"
                    required
                  />
                </Form.Group>

                <hr />

                <h6 className="fw-bold mb-3">Agregar Ingrediente</h6>
                <Row className="g-2 mb-3 align-items-end">
                  {/* Entrada de texto libre con autocompletado datalist */}
                  <Col md={5} xs={12}>
                    <Form.Group>
                      <Form.Label className="small text-muted fw-bold">Ingrediente</Form.Label>
                      <Form.Control
                        type="text"
                        list="lista-ingredientes-autocompletar"
                        placeholder="Escribe o selecciona..."
                        value={nombreIngredienteInput}
                        onChange={(e) => handleCambioNombreIngrediente(e.target.value)}
                        disabled={guardando}
                      />
                      <datalist id="lista-ingredientes-autocompletar">
                        {ingredientesDisponibles.map((i) => (
                          <option key={i.id} value={i.nombre} />
                        ))}
                      </datalist>
                    </Form.Group>
                  </Col>

                  {/* Cantidad */}
                  <Col md={3} xs={6}>
                    <Form.Group>
                      <Form.Label className="small text-muted fw-bold">Cantidad</Form.Label>
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

                  {/* Unidad de medida */}
                  <Col md={2} xs={6}>
                    <Form.Group>
                      <Form.Label className="small text-muted fw-bold">Unidad</Form.Label>
                      <Form.Select
                        value={unidadMedidaInput}
                        onChange={(e) => setUnidadMedidaInput(e.target.value)}
                        disabled={guardando}
                      >
                        <option value="g">g</option>
                        <option value="ml">ml</option>
                        <option value="pza">pza</option>
                        <option value="kg">kg</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={2} xs={12}>
                    <Button
                      variant="primary"
                      className="w-100 fw-bold"
                      onClick={handleAgregarIngrediente}
                      disabled={!nombreIngredienteInput.trim() || !cantidadGramos || guardando}
                    >
                      ➕ Agregar
                    </Button>
                  </Col>
                </Row>

                <h6 className="fw-bold mt-4 mb-2">Ingredientes añadidos a la receta:</h6>
                {ingredientesReceta.length === 0 ? (
                  <Alert variant="light" className="text-center border text-muted py-3">
                    Aún no has agregado ingredientes a esta receta.
                  </Alert>
                ) : (
                  <Table responsive bordered align="middle" className="mb-4">
                    <thead className="table-light">
                      <tr>
                        <th>Ingrediente</th>
                        <th style={{ width: '180px' }}>Cantidad</th>
                        <th style={{ width: '70px' }} className="text-center">Quitar</th>
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

                <Button
                  variant="success"
                  size="lg"
                  type="submit"
                  className="w-100 fw-bold mt-2"
                  disabled={guardando || ingredientesReceta.length === 0}
                >
                  {guardando ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
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