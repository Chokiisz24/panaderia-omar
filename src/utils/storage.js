const STORAGE_KEY_INGREDIENTES = 'panaderia_ingredientes';
const STORAGE_KEY_RECETAS = 'panaderia_recetas';
const STORAGE_KEY_MERMAS = 'panaderia_mermas';

// Datos iniciales si la memoria está vacía
const ingredientesIniciales = [
  { id: 1, nombre: 'ELOTE AMARILLO', stock_actual: 50000, stock_minimo: 10000, stock_maximo: 100000, unidad_medida: 'g' },
  { id: 2, nombre: 'HUEVO', stock_actual: 40000, stock_minimo: 5000, stock_maximo: 80000, unidad_medida: 'g' },
  { id: 3, nombre: 'ROYAL', stock_actual: 5000, stock_minimo: 1000, stock_maximo: 10000, unidad_medida: 'g' },
  { id: 4, nombre: 'MANTEQUILLA', stock_actual: 20000, stock_minimo: 4000, stock_maximo: 50000, unidad_medida: 'g' },
  { id: 5, nombre: 'VAINILLA', stock_actual: 3000, stock_minimo: 500, stock_maximo: 5000, unidad_medida: 'ml' },
  { id: 6, nombre: 'LECHERA', stock_actual: 30000, stock_minimo: 5000, stock_maximo: 60000, unidad_medida: 'g' },
  { id: 7, nombre: 'HARINA BLANCA', stock_actual: 50000, stock_minimo: 10000, stock_maximo: 100000, unidad_medida: 'g' },
  { id: 8, nombre: 'AZUCAR', stock_actual: 40000, stock_minimo: 8000, stock_maximo: 80000, unidad_medida: 'g' },
  { id: 9, nombre: 'ACEITE', stock_actual: 20000, stock_minimo: 3000, stock_maximo: 40000, unidad_medida: 'ml' },
  { id: 10, nombre: 'PLATANO MADURO', stock_actual: 30000, stock_minimo: 5000, stock_maximo: 50000, unidad_medida: 'g' },
  { id: 11, nombre: 'BICARBONATO', stock_actual: 2000, stock_minimo: 500, stock_maximo: 5000, unidad_medida: 'g' }
];

const recetasIniciales = [
  {
    id: 1,
    nombre: 'Pan Elote',
    ingredientes: [
      { ingrediente_id: 1, cantidad_requerida: 6000 },
      { ingrediente_id: 2, cantidad_requerida: 4000 },
      { ingrediente_id: 3, cantidad_requerida: 110 },
      { ingrediente_id: 4, cantidad_requerida: 1800 },
      { ingrediente_id: 5, cantidad_requerida: 100 },
      { ingrediente_id: 6, cantidad_requerida: 7000 }
    ]
  },
  {
    id: 2,
    nombre: 'Pan Plátano',
    ingredientes: [
      { ingrediente_id: 7, cantidad_requerida: 3333 },
      { ingrediente_id: 2, cantidad_requerida: 3333 },
      { ingrediente_id: 8, cantidad_requerida: 3333 },
      { ingrediente_id: 9, cantidad_requerida: 3333 },
      { ingrediente_id: 10, cantidad_requerida: 5000 },
      { ingrediente_id: 11, cantidad_requerida: 67 },
      { ingrediente_id: 3, cantidad_requerida: 67 }
    ]
  }
];

export const getIngredientes = () => {
  const data = localStorage.getItem(STORAGE_KEY_INGREDIENTES);
  if (!data) {
    localStorage.setItem(STORAGE_KEY_INGREDIENTES, JSON.stringify(ingredientesIniciales));
    return ingredientesIniciales;
  }
  return JSON.parse(data);
};

export const saveIngredientes = (ingredientes) => {
  localStorage.setItem(STORAGE_KEY_INGREDIENTES, JSON.stringify(ingredientes));
};

export const getRecetas = () => {
  const data = localStorage.getItem(STORAGE_KEY_RECETAS);
  if (!data) {
    localStorage.setItem(STORAGE_KEY_RECETAS, JSON.stringify(recetasIniciales));
    return recetasIniciales;
  }
  return JSON.parse(data);
};

export const saveMerma = (merma) => {
  const data = localStorage.getItem(STORAGE_KEY_MERMAS);
  const mermas = data ? JSON.parse(data) : [];
  mermas.push({ ...merma, fecha: new Date().toISOString() });
  localStorage.setItem(STORAGE_KEY_MERMAS, JSON.stringify(mermas));
};