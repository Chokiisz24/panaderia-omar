import React, { useEffect, useState } from 'react';
import { Badge, Button, Container, Card, Row, Col, Form, Modal } from 'react-bootstrap';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE}/api`;

export function TablaInventario() {
  const [ingredientes, setIngredientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  
  // Estado para modal de actualización de stock móvil
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [cantidadSumar, setCantidadSumar] = useState('');

  const cargarInventario = async () => {
    try {
      setCargando(true);
      const res = await fetch(`${API_URL}/ingredientes`);
      const data = await res.json();
      setIngredientes(data);
    } catch (err) {
      console.error('Error cargando inventario:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarInventario();
  }, []);

  const actualizarStock = async (id, nuevoStock) => {
    try {
      await fetch(`${API_URL}/ingredientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock_actual: nuevoStock })
      });
      cargarInventario();
    } catch (err) {
      console.error('Error actualizando stock:', err);
    }
  };

  const handleOpenModal = (item) => {
    setSelectedItem(item);
    setCantidadSumar('');
    setShowModal(true);
  };

  const handleConfirmAdd = () => {
    if (selectedItem && cantidadSumar) {
      const nuevoTotal = parseFloat(selectedItem.stock_actual) + parseFloat(cantidadSumar);
      actualizarStock(selectedItem.id, nuevoTotal);
      setShowModal(false);
    }
  };

  const ingredientesFiltrados = ingredientes.filter(item =>
    item.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <Container className="px-1">
      {/* Barra de búsqueda y recarga */}
      <div className="d-flex gap-2 mb-3">
        <Form.Control
          type="text"
          placeholder="🔍 Buscar ingrediente..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="shadow-sm"
        />
        <Button variant="outline-primary" onClick={cargarInventario}>
          🔄
        </Button>
      </div>

      {cargando ? (
        <div className="text-center p-4">Cargando ingredientes...</div>
      ) : ingredientesFiltrados.length === 0 ? (
        <div className="text-center p-4 text-muted">No se encontraron ingredientes.</div>
      ) : (
        <Row className="g-2">
          {ingredientesFiltrados.map((item) => {
            const bajoStock = parseFloat(item.stock_actual) <= parseFloat(item.stock_minimo);
            return (
              <Col xs={12} key={item.id}>
                <Card className="shadow-sm border-0 border-start border-4 border-primary">
                  <Card.Body className="p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h6 className="fw-bold mb-0">{item.nombre}</h6>
                        <small className="text-muted">ID: #{item.id}</small>
                      </div>
                      {bajoStock ? (
                        <Badge bg="danger">Stock Bajo</Badge>
                      ) : (
                        <Badge bg="success">Suficiente</Badge>
                      )}
                    </div>

                    <div className="d-flex justify-content-between align-items-center bg-light p-2 rounded mb-2">
                      <div>
                        <small className="text-muted d-block">Stock Actual</small>
                        <span className="fw-bold fs-5 text-dark">
                          {item.stock_actual} {item.unidad_medida}
                        </span>
                      </div>
                      <div className="text-end">
                        <small className="text-muted d-block">Mínimo Requerido</small>
                        <span className="fw-semibold text-secondary">
                          {item.stock_minimo} {item.unidad_medida}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      className="w-100 py-2 fw-bold"
                      onClick={() => handleOpenModal(item)}
                    >
                      + Agregar Stock
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Modal táctil para ingresar nuevo stock en cel */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="sm">
        <Modal.Header closeButton>
          <Modal.Title className="fs-6">Agregar Stock</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <div>
              <p className="mb-2 fw-bold">{selectedItem.nombre}</p>
              <Form.Group>
                <Form.Label className="small text-muted">
                  Cantidad a añadir ({selectedItem.unidad_medida}):
                </Form.Label>
                <Form.Control
                  type="number"
                  step="any"
                  autoFocus
                  placeholder="Ej. 500"
                  value={cantidadSumar}
                  onChange={(e) => setCantidadSumar(e.target.value)}
                />
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="p-2">
          <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" onClick={handleConfirmAdd}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}