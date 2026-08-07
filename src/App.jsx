import React, { useState } from 'react';
import { NavbarApp } from './components/NavbarApp';
import { RegistroProduccion } from './components/RegistroProduccion';
import { TablaInventario } from './components/TablaInventario';
import { RegistroMermas } from './components/RegistroMermas';

export default function App() {
  const [moduloActual, setModuloActual] = useState('produccion');

  return (
    <div className="min-vh-100 bg-light">
      <NavbarApp moduloActual={moduloActual} setModuloActual={setModuloActual} />
      
      <main className="pb-5">
        {moduloActual === 'produccion' && <RegistroProduccion />}
        {moduloActual === 'inventario' && <TablaInventario />}
        {moduloActual === 'mermas' && <RegistroMermas />}
      </main>
    </div>
  );
}