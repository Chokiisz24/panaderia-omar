import React, { useEffect, useState } from 'react';
import { Table, Badge, Button, Container, Card, Modal, Form } from 'react-bootstrap';
import { getIngredientes, saveIngredientes } from '../utils/storage';

export function TablaInventario() {
  const [ingredientes, setIngredientes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [itemEditar, setItemEditar] = useState(null);
  const [cantidadAgregar, setCantidadAgregar] = useState('');

  const cargarInventario = () => {
    const data = getIngredientes();
    setIngredientes(data);
  };

  useEffect(() => {
    cargarInventario();
  }, []);

  const abrirModalSumar = (ingrediente) => {
    setItemEditar(ingrediente);
    setCantidadAgregar('');
    setShowModal(true);
  };

  const handleSumarStock = (e) => {
    e.preventDefault();
    if (!itemEditar || !cantidadAgregar) return;

    const listaActual = getIngredientes();
    const nuevaLista = listaActual.map((item) => {
      if (item.id === itemEditar.id) {
        return {
          ...item,
          stock_actual: item.stock_actual + parseFloat(cantidadAgregar)
        };
      }
      return item;
    });

    saveIngredientes(nuevaLista);
    setShowModal(false);
    cargarInventario();
  };

  return (
    <Container>
      <Card className="shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center bg-white">
          <h5 className="m-0">Stock de Ingredientes</h5>
          <Button variant="outline-primary" size="sm" onClick={cargarInventario}>
            Actualizar
          </Button>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive striped hover className="mb-0">
            <thead>
              <tr>
                <th>Ingrediente</th>
                <th>Stock Actual</th>
                <th>Mínimo</th>
                <th>Máximo</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {ingredientes.map((item) => {
                const bajoStock = item.stock_actual <= item.stock_minimo;
                const sobreStock = item.stock_actual >= item.stock_maximo && item.stock_maximo > 0;

                return (
                  <tr key={item.id}>
                    <td><strong>{item.nombre}</strong></td>
                    <td>{item.stock_actual} {item.unidad_medida}</td>
                    <td>{item.stock_minimo} {item.unidad_medida}</td>
                    <td>{item.stock_maximo} {item.unidad_medida}</td>
                    <td>
                      {bajoStock ? (
                        <Badge bg="danger">Reabastecer</Badge>
                      ) : sobreStock ? (
                        <Badge bg="warning" text="dark">Stock Máximo</Badge>
                      ) : (
                        <Badge bg="success">OK</Badge>
                      )}
                    </td>
                    <td>
                      <Button variant="primary" size="sm" onClick={() => abrirModalSumar(item)}>
                        + Agregar
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal para sumar inventario */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Stock: {itemEditar?.nombre}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSumarStock}>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Cantidad a añadir ({itemEditar?.unidad_medida})</Form.Label>
              <Form.Control 
                type="number" 
                step="any"
                value={cantidadAgregar} 
                onChange={(e) => setCantidadAgregar(e.target.value)} 
                placeholder="Ej. 5000"
                required 
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button variant="success" type="submit">Guardar Cambio</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}