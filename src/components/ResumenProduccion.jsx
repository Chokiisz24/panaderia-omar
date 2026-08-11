import React, { useEffect, useState } from 'react';
import { Card, Container, Form, Row, Col, Badge, Button, Alert } from 'react-bootstrap';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE}/api`;

export function ResumenProduccion() {
  // Fecha local exacta (YYYY-MM-DD)
  const hoy = new Date();
  const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

  const [fecha, setFecha] = useState(fechaHoy);
  const [resumen, setResumen] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargarResumen = async () => {
    try {
      setCargando(true);
      setError(null);

      const res = await fetch(`${API_URL}/produccion/resumen?fecha=${fecha}`);

      if (!res.ok) {
        throw new Error(`Error en el servidor (${res.status})`);
      }

      const data = await res.json();

      if (Array.isArray(data)) {
        // Filtramos para mostrar únicamente lo que se haya producido en el día
        setResumen(data);
      } else {
        console.error('La API no devolvió un array:', data);
        setResumen([]);
        setError('El formato de datos recibido no es válido.');
      }
    } catch (err) {
      console.error('Error cargando resumen de producción:', err);
      setError(err.message || 'No se pudo conectar con el servidor.');
      setResumen([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarResumen();
  }, [fecha]);

  return (
    <Container className="px-1">
      {/* Selector de fecha */}
      <Card className="shadow-sm border-0 mb-3 bg-white">
        <Card.Body className="p-3">
          <Form.Group className="d-flex align-items-center gap-2">
            <Form.Label className="mb-0 fw-bold text-nowrap">📅 Fecha:</Form.Label>
            <Form.Control
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="fw-bold"
            />
            <Button variant="outline-primary" onClick={cargarResumen}>
              🔄
            </Button>
          </Form.Group>
        </Card.Body>
      </Card>

      {/* Alerta de error si falla la petición */}
      {error && (
        <Alert variant="danger" className="py-2 text-center small mb-3">
          {error}
        </Alert>
      )}

      {/* Estado de carga / Lista de producción */}
      {cargando ? (
        <div className="text-center p-4 text-muted">Cargando producción del día...</div>
      ) : (
        <Row className="g-2">
          {resumen.filter((item) => parseFloat(item.total_producido || 0) > 0).length === 0 && !error && (
            <Col xs={12}>
              <div className="text-center p-3 text-muted">
                No hay producción registrada para esta fecha.
              </div>
            </Col>
          )}

          {resumen
            .filter((item) => parseFloat(item.total_producido || 0) > 0)
            .map((item) => {
              const producido = parseFloat(item.total_producido || 0);

              return (
                <Col xs={12} key={item.receta_id || item.nombre}>
                  <Card className="shadow-sm border-0 border-start border-4 border-primary">
                    <Card.Body className="p-3 d-flex justify-content-between align-items-center">
                      <h6 className="fw-bold mb-0">{item.nombre}</h6>
                      <Badge bg="primary" className="fs-6 px-3 py-2">
                        {producido}
                      </Badge>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
        </Row>
      )}
    </Container>
  );
}