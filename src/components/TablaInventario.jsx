import React, { useEffect, useState } from 'react';
import { Table, Badge, Button, Container, Card } from 'react-bootstrap';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE}/api`;

export function TablaInventario() {
  const [ingredientes, setIngredientes] = useState([]);
  const [cargando, setCargando] = useState(true);

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

  return (
    <Container className="mt-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="m-0">📦 Inventario de Materia Prima</h5>
          <Button variant="light" size="sm" onClick={cargarInventario}>
            🔄 Actualizar
          </Button>
        </Card.Header>
        <Card.Body className="p-0">
          {cargando ? (
            <div className="text-center p-4">Cargando ingredientes...</div>
          ) : ingredientes.length === 0 ? (
            <div className="text-center p-4 text-muted">No hay ingredientes registrados.</div>
          ) : (
            <Table responsive hover className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Ingrediente</th>
                  <th>Stock Actual</th>
                  <th>Unidad</th>
                  <th>Stock Mínimo</th>
                  <th>Estado</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ingredientes.map((item) => {
                  const bajoStock = parseFloat(item.stock_actual) <= parseFloat(item.stock_minimo);
                  return (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td className="fw-bold">{item.nombre}</td>
                      <td>{item.stock_actual}</td>
                      <td>{item.unidad_medida}</td>
                      <td>{item.stock_minimo}</td>
                      <td>
                        {bajoStock ? (
                          <Badge bg="danger">Stock Bajo</Badge>
                        ) : (
                          <Badge bg="success">Suficiente</Badge>
                        )}
                      </td>
                      <td className="text-center">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-1"
                          onClick={() => {
                            const cantidad = prompt(`Añadir stock a ${item.nombre}:`, '1');
                            if (cantidad) {
                              actualizarStock(item.id, parseFloat(item.stock_actual) + parseFloat(cantidad));
                            }
                          }}
                        >
                          + Agregar
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}