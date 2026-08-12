import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Container, Row, Col, Table, InputGroup, Spinner, Badge } from 'react-bootstrap';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE}/api`;

export function GestionRecetas() {
  const [ingredientesDisponibles, setIngredientesDisponibles] = useState([]);
  const [recetasExistentes, setRecetasExistentes] = useState([]);
  const [nombreReceta, setNombreReceta] = useState('');
  const [ingredientesReceta, setIngredientesReceta] = useState([]);

  const [nombreIngredienteInput, setNombreIngredienteInput] = useState('');
  const [unidadMedidaInput, setUnidadMedidaInput] = useState('g');
  const [cantidadGramos, setCantidadGramos] = useState('');

  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [guardando, setGuardando] = useState(false);

  const cargarDatos = async () => {
    try {
      const [resIng, resRec] = await Promise.all([
        fetch(`${API_URL}/ingredientes`),
        fetch(`${API_URL}/recetas`)
      ]);
      const dataIng = await resIng.json();
      const dataRec = await resRec.json();
      setIngredientesDisponibles(dataIng);
      setRecetasExistentes(dataRec);
    } catch (err) {
      console.error('Error al cargar datos:', err);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Alternar visibilidad de receta (Activar / Desactivar)
  const handleToggleEstadoReceta = async (id, estadoActual) => {
    const nuevoEstado = !estadoActual;
    try {
      const res = await fetch(`${API_URL}/recetas/${id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activa: nuevoEstado })
      });

      if (!res.ok) throw new Error('Error al actualizar estado');

      setRecetasExistentes((prev) =>
        prev.map((r) => (r.id === id ? { ...r, activa: nuevoEstado } : r))
      );
    } catch (err) {
      console.error(err);
      setMensaje({ tipo: 'danger', texto: 'No se pudo cambiar el estado de la receta.' });
    }
  };

  const handleCambioNombreIngrediente = (val) => {
    setNombreIngredienteInput(val);
    const coincidencia = ingredientesDisponibles.find(
      (i) => i.nombre.toLowerCase() === val.trim().toLowerCase()
    );
    if (coincidencia && coincidencia.unidad_medida) {
      setUnidadMedidaInput(coincidencia.unidad_medida);
    }
  };

  const handleAgregarIngrediente = async () => {
    const nombreLimpio = nombreIngredienteInput.trim();
    const cantVal = parseFloat(cantidadGramos);

    if (!nombreLimpio || isNaN(cantVal) || cantVal <= 0) return;

    let ingObj = ingredientesDisponibles.find(
      (i) => i.nombre.toLowerCase() === nombreLimpio.toLowerCase()
    );

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

        if (!res.ok) throw new Error('Error al crear ingrediente');
        ingObj = await res.json();
        setIngredientesDisponibles((prev) => [...prev, ingObj]);
      } catch (err) {
        console.error(err);
        setMensaje({ tipo: 'danger', texto: 'Error al registrar el ingrediente.' });
        setGuardando(false);
        return;
      } finally {
        setGuardando(false);
      }
    }

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

    setNombreIngredienteInput('');
    setCantidadGramos('');
    setUnidadMedidaInput('g');
  };

  const handleQuitarIngrediente = (id) => {
    setIngredientesReceta(ingredientesReceta.filter((item) => item.ingrediente_id !== id));
  };

  const handleGuardarReceta = async (e) => {
    e.preventDefault();

    if (!nombreReceta.trim() || ingredientesReceta.length === 0) return;

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

      setMensaje({ tipo: 'success', texto: `¡Receta "${nombreReceta}" guardada!` });
      setNombreReceta('');
      setIngredientesReceta([]);
      cargarDatos();
    } catch (err) {
      console.error(err);
      setMensaje({ tipo: 'danger', texto: 'Error al guardar la receta.' });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Container className="py-2 px-1">
      <Row className="justify-content-center">
        <Col xs={12} lg={9}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-dark text-white text-center py-3">
              <h5 className="mb-0 fw-bold">📖 Crear Nueva Receta</h5>
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
                    placeholder="Ej. Biga, Brioche..."
                    value={nombreReceta}
                    onChange={(e) => setNombreReceta(e.target.value)}
                    disabled={guardando}
                    className="form-control-lg"
                    required
                  />
                </Form.Group>

                <hr />

                <h6 className="fw-bold mb-3">Agregar Ingredientes</h6>
                <Row className="g-2 mb-3 align-items-end">
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

                {ingredientesReceta.length > 0 && (
                  <Table responsive bordered align="middle" className="mb-4">
                    <thead className="table-light">
                      <tr>
                        <th>Ingrediente</th>
                        <th>Cantidad</th>
                        <th className="text-center">Quitar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ingredientesReceta.map((item) => (
                        <tr key={item.ingrediente_id}>
                          <td className="fw-bold">{item.nombre}</td>
                          <td>{item.cantidad_requerida} {item.unidad_medida}</td>
                          <td className="text-center">
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleQuitarIngrediente(item.ingrediente_id)}
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
                  {guardando ? <Spinner animation="border" size="sm" /> : '💾 Guardar Receta'}
                </Button>
              </Form>
            </Card.Body>
          </Card>

          {/* LISTADO Y CONTROL DE ESTADO DE RECETAS */}
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-secondary text-white py-2">
              <h6 className="mb-0 fw-bold">⚙️ Activar / Desactivar Recetas para Producción</h6>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Receta</th>
                    <th className="text-center">Estado Producción</th>
                  </tr>
                </thead>
                <tbody>
                  {recetasExistentes.map((rec) => (
                    <tr key={rec.id}>
                      <td className="fw-bold">{rec.nombre}</td>
                      <td className="text-center">
                        <Form.Check
                          type="switch"
                          id={`switch-receta-${rec.id}`}
                          label={rec.activa ? <Badge bg="success">Muestra en Producción</Badge> : <Badge bg="secondary">Oculta</Badge>}
                          checked={rec.activa}
                          onChange={() => handleToggleEstadoReceta(rec.id, rec.activa)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}