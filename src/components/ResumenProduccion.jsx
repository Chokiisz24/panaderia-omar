import React, { useEffect, useState } from 'react';
import { Card, Container, Form, Row, Col, ProgressBar, Badge, Button } from 'react-bootstrap';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE}/api`;

export function ResumenProduccion() {

const hoy = new Date();
const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
  const [fecha, setFecha] = useState(fechaHoy);
  const [resumen, setResumen] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarResumen = async () => {
    try {
      setCargando(true);
      const res = await fetch(`${API_URL}/produccion/resumen?fecha=${fecha}`);
      const data = await res.json();
      setResumen(data);
    } catch (err) {
      console.error('Error cargando resumen de producción:', err);
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

      {/* Lista de producción */}
      {cargando ? (
        <div className="text-center p-4">Cargando producción del día...</div>
      ) : (
        <Row className="g-2">
          {resumen.map((item) => {
            const producido = parseFloat(item.total_producido);
            const meta = parseFloat(item.meta_diaria);
            const porcentaje = meta > 0 ? Math.min((producido / meta) * 100, 100) : 0;
            const completado = producido >= meta && meta > 0;

            return (
              <Col xs={12} key={item.receta_id}>
                <Card className={`shadow-sm border-0 border-start border-4 ${completado ? 'border-success' : 'border-warning'}`}>
                  <Card.Body className="p-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <h6 className="fw-bold mb-0">{item.nombre}</h6>
                      <Badge bg={completado ? 'success' : 'secondary'}>
                        {producido} / {meta} tandas
                      </Badge>
                    </div>

                    <small className="text-muted d-block mb-2">
                      {meta > 0 
                        ? `Meta según hoja: ${meta} lote(s)`
                        : 'Sin meta definida'}
                    </small>

                    <ProgressBar
                      now={porcentaje}
                      variant={completado ? 'success' : 'warning'}
                      style={{ height: '8px' }}
                    />
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