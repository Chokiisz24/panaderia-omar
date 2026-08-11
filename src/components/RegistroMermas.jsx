import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE}/api`;

export function RegistroMermas() {
  const [tipoItem, setTipoItem] = useState('producto_terminado');
  const [nombreItem, setNombreItem] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [motivo, setMotivo] = useState('');
  const [exito, setExito] = useState(false);
  const [error, setError] = useState('');

  const handleGuardarMerma = async (e) => {
    e.preventDefault();
    setExito(false);
    setError('');

    try {
      const res = await fetch(`${API_URL}/mermas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo_item: tipoItem,
          nombre_item: nombreItem,
          cantidad: parseFloat(cantidad),
          motivo: motivo
        })
      });

      if (res.ok) {
        setExito(true);
        setNombreItem('');
        setCantidad('');
        setMotivo('');
      } else {
        setError('Error al registrar la merma');
      }
    } catch (err) {
      console.error('Error enviando merma:', err);
      setError('Error de conexión con el servidor');
    }
  };

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col xs={12} md={6}>
          <Card className="shadow-sm">
            <Card.Header className="bg-warning text-dark text-center">
              <h5 className="m-0">Registro de Mermas / Desperdicios</h5>
            </Card.Header>
            <Card.Body>
              {exito && <Alert variant="success">Merma registrada correctamente.</Alert>}
              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleGuardarMerma}>
                <Form.Group className="mb-3">
                  <Form.Label>Tipo de Merma</Form.Label>
                  <Form.Select value={tipoItem} onChange={(e) => setTipoItem(e.target.value)}>
                    <option value="producto_terminado">Producto Terminado (ej. Croissants mal cocidos)</option>
                    <option value="ingrediente">Materia Prima (ej. Harina dañada)</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Descripción o Nombre del Ítem</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Ej. Croissant, Leche..." 
                    value={nombreItem} 
                    onChange={(e) => setNombreItem(e.target.value)} 
                    required 
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Cantidad Mermada</Form.Label>
                  <Form.Control 
                    type="number" 
                    step="any"
                    value={cantidad} 
                    onChange={(e) => setCantidad(e.target.value)} 
                    required 
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Motivo</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={2} 
                    placeholder="Ej. Se quemó en el horno" 
                    value={motivo} 
                    onChange={(e) => setMotivo(e.target.value)} 
                  />
                </Form.Group>

                <Button variant="warning" type="submit" className="w-100 btn-lg">
                  Registrar Merma
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}