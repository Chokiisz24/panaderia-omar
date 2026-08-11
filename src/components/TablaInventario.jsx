import React, { useEffect, useState } from 'react';
import { Table, Badge, Button, Container, Card } from 'react-bootstrap';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function TablaInventario() {
  const [ingredientes, setIngredientes] = useState([]);

  const cargarInventario = async () => {
    try {
      const res = await fetch(`${API_URL}/ingredientes`);
      const data = await res.json();
      setIngredientes(data);
    } catch (err) {
      console.error('Error cargando inventario:', err);
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
    <Container>
      {/* Tu JSX existente para renderizar la tabla */}
    </Container>
  );
}