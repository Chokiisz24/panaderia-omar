import React, { useState } from 'react';
import { Container, Nav, Navbar, Card } from 'react-bootstrap';
import { RegistroProduccion } from './components/RegistroProduccion';
import { TablaInventario } from './components/TablaInventario';
import { RegistroMermas } from './components/RegistroMermas';

export default function App() {
  const [tabActiva, setTabActiva] = useState('produccion');

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* Header Fijo */}
      <Navbar bg="dark" variant="dark" sticky="top" className="shadow-sm px-3">
        <Navbar.Brand className="fw-bold fs-6 mx-auto">
          🥖 Panadería - Control Móvil
        </Navbar.Brand>
      </Navbar>

      {/* Área Principal de Contenido */}
      <Container className="flex-grow-1 py-3 px-2 mb-5">
        <Card className="shadow-sm border-0">
          <Card.Body className="p-2">
            {tabActiva === 'produccion' && <RegistroProduccion />}
            {tabActiva === 'inventario' && <TablaInventario />}
            {tabActiva === 'mermas' && <RegistroMermas />}
          </Card.Body>
        </Card>
      </Container>

      {/* Barra de Navegación Inferior Estilo App Móvil */}
      <Navbar
        fixed="bottom"
        bg="white"
        className="border-top shadow-lg justify-content-around py-1"
      >
        <Nav className="w-100 d-flex justify-content-around text-center">
          <Nav.Link
            onClick={() => setTabActiva('produccion')}
            className={`flex-fill py-1 ${
              tabActiva === 'produccion' ? 'text-primary fw-bold' : 'text-muted'
            }`}
          >
            <div style={{ fontSize: '1.2rem' }}>👨‍🍳</div>
            <span style={{ fontSize: '0.75rem' }}>Producción</span>
          </Nav.Link>

          <Nav.Link
            onClick={() => setTabActiva('inventario')}
            className={`flex-fill py-1 ${
              tabActiva === 'inventario' ? 'text-primary fw-bold' : 'text-muted'
            }`}
          >
            <div style={{ fontSize: '1.2rem' }}>📦</div>
            <span style={{ fontSize: '0.75rem' }}>Inventario</span>
          </Nav.Link>

          <Nav.Link
            onClick={() => setTabActiva('mermas')}
            className={`flex-fill py-1 ${
              tabActiva === 'mermas' ? 'text-primary fw-bold' : 'text-muted'
            }`}
          >
            <div style={{ fontSize: '1.2rem' }}>⚠️</div>
            <span style={{ fontSize: '0.75rem' }}>Mermas</span>
          </Nav.Link>
        </Nav>
      </Navbar>
    </div>
  );
}