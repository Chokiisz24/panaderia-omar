import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';

export function NavbarApp({ moduloActual, setModuloActual }) {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand href="#">🍞 Panadería Control</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link 
              active={moduloActual === 'produccion'} 
              onClick={() => setModuloActual('produccion')}
            >
              Producción
            </Nav.Link>
            <Nav.Link 
              active={moduloActual === 'inventario'} 
              onClick={() => setModuloActual('inventario')}
            >
              Inventario
            </Nav.Link>
            <Nav.Link 
              active={moduloActual === 'mermas'} 
              onClick={() => setModuloActual('mermas')}
            >
              Mermas
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}