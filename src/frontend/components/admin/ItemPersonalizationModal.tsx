import { useState, useEffect } from 'react';

interface MenuItem {
  id: number;
  name: string;
  category_id?: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface PersonalizationData {
  agregado?: string; // Para menú del día
  salsas?: string[]; // Para shawarmas y promociones
  bebidas?: Array<{ nombre: string; sabor?: string }>; // Para promociones y bebidas
  sinIngredientes?: string[]; // Para shawarmas
  detalles?: string; // Notas adicionales
}

interface ItemPersonalizationModalProps {
  menuItem: MenuItem;
  category: Category | null;
  initialPersonalization?: PersonalizationData | null;
  onConfirm: (personalization: PersonalizationData) => void;
  onCancel: () => void;
}

// Lista de salsas disponibles
const SALSAS = [
  'Tahini',
  'Ajo',
  'Picante',
  'Yogurt',
  'Especial',
  'Mayonesa',
  'Mostaza',
  'Cilantro'
];

// Agregados para menú del día
const AGREGADOS = [
  'Arroz',
  'Cuscús',
  'Papas Fritas'
];

// Ingredientes que se pueden quitar en shawarmas
const INGREDIENTES_SHAWARMA = [
  'Lechuga',
  'Tomate',
  'Cebolla',
  'Pepino',
  'Zanahoria'
];

export default function ItemPersonalizationModal({
  menuItem,
  category,
  initialPersonalization,
  onConfirm,
  onCancel,
}: ItemPersonalizationModalProps) {
  const [personalization, setPersonalization] = useState<PersonalizationData>(initialPersonalization || {});
  const [bebidaSabor, setBebidaSabor] = useState<{ [key: number]: string }>(() => {
    const sabores: { [key: number]: string } = {};
    if (initialPersonalization?.bebidas) {
      initialPersonalization.bebidas.forEach((b, i) => {
        if (b.sabor) sabores[i] = b.sabor;
      });
    }
    return sabores;
  });

  const categorySlug = category?.slug?.toLowerCase() || '';
  const isMenuDelDia = categorySlug === 'menu-del-dia' || categorySlug === 'menu del dia';
  const isShawarma = categorySlug === 'shawarmas' || categorySlug === 'shawarma';
  const isPromocion = categorySlug === 'promociones' || categorySlug === 'promocion';
  const isBebida = categorySlug === 'bebestibles' || categorySlug === 'bebidas';

  const handleSalsaToggle = (salsa: string) => {
    const currentSalsas = personalization.salsas || [];
    const maxSalsas = isPromocion ? 2 : 1;
    
    if (currentSalsas.includes(salsa)) {
      setPersonalization({
        ...personalization,
        salsas: currentSalsas.filter(s => s !== salsa)
      });
    } else if (currentSalsas.length < maxSalsas) {
      setPersonalization({
        ...personalization,
        salsas: [...currentSalsas, salsa]
      });
    } else {
      alert(`Solo puedes seleccionar ${maxSalsas} salsa${maxSalsas > 1 ? 's' : ''}`);
    }
  };

  const handleIngredienteToggle = (ingrediente: string) => {
    const currentSin = personalization.sinIngredientes || [];
    if (currentSin.includes(ingrediente)) {
      setPersonalization({
        ...personalization,
        sinIngredientes: currentSin.filter(i => i !== ingrediente)
      });
    } else {
      setPersonalization({
        ...personalization,
        sinIngredientes: [...currentSin, ingrediente]
      });
    }
  };

  const handleBebidaAdd = () => {
    const bebidas = personalization.bebidas || [];
    setPersonalization({
      ...personalization,
      bebidas: [...bebidas, { nombre: '' }]
    });
  };

  const handleBebidaRemove = (index: number) => {
    const bebidas = personalization.bebidas || [];
    const newBebidas = bebidas.filter((_, i) => i !== index);
    const newSabores = { ...bebidaSabor };
    delete newSabores[index];
    setBebidaSabor(newSabores);
    setPersonalization({
      ...personalization,
      bebidas: newBebidas
    });
  };

  const handleBebidaChange = (index: number, nombre: string) => {
    const bebidas = personalization.bebidas || [];
    bebidas[index] = { ...bebidas[index], nombre };
    setPersonalization({
      ...personalization,
      bebidas
    });
  };

  const handleBebidaSaborChange = (index: number, sabor: string) => {
    setBebidaSabor({ ...bebidaSabor, [index]: sabor });
    const bebidas = personalization.bebidas || [];
    bebidas[index] = { ...bebidas[index], sabor };
    setPersonalization({
      ...personalization,
      bebidas
    });
  };

  const handleConfirm = () => {
    // Validaciones
    if (isMenuDelDia && !personalization.agregado) {
      alert('Por favor selecciona un agregado');
      return;
    }
    if (isShawarma && (!personalization.salsas || personalization.salsas.length === 0)) {
      alert('Por favor selecciona una salsa');
      return;
    }
    if (isPromocion) {
      if (!personalization.salsas || personalization.salsas.length !== 2) {
        alert('Por favor selecciona 2 salsas');
        return;
      }
      // Las bebidas no son requeridas en promociones, se agregan aparte desde bebestibles
    }
    if (isBebida && (!personalization.bebidas || personalization.bebidas.length === 0 || !personalization.bebidas[0].nombre)) {
      alert('Por favor selecciona una bebida');
      return;
    }

    onConfirm(personalization);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg sm:text-xl font-bold mb-4">Personalizar: {menuItem.name}</h2>

        {/* Menú del Día - Agregado */}
        {isMenuDelDia && (
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Agregado:</label>
            <div className="grid grid-cols-2 gap-2">
              {AGREGADOS.map((agregado) => (
                <button
                  key={agregado}
                  onClick={() => setPersonalization({ ...personalization, agregado })}
                  className={`p-2 border-2 rounded-lg text-sm ${
                    personalization.agregado === agregado
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {agregado}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Shawarmas - Salsa y ingredientes */}
        {isShawarma && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Salsa (1 a elección):</label>
              <div className="grid grid-cols-2 gap-2">
                {SALSAS.map((salsa) => (
                  <button
                    key={salsa}
                    onClick={() => handleSalsaToggle(salsa)}
                    className={`p-2 border-2 rounded-lg text-sm ${
                      personalization.salsas?.includes(salsa)
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    disabled={personalization.salsas?.length === 1 && !personalization.salsas.includes(salsa)}
                  >
                    {salsa}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Quitar ingredientes:</label>
              <div className="grid grid-cols-2 gap-2">
                {INGREDIENTES_SHAWARMA.map((ingrediente) => (
                  <button
                    key={ingrediente}
                    onClick={() => handleIngredienteToggle(ingrediente)}
                    className={`p-2 border-2 rounded-lg text-sm ${
                      personalization.sinIngredientes?.includes(ingrediente)
                        ? 'border-red-600 bg-red-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Sin {ingrediente}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Promociones - Solo 2 salsas (bebidas se agregan aparte desde bebestibles) */}
        {isPromocion && (
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Salsas (2 a elección):</label>
            <div className="grid grid-cols-2 gap-2">
              {SALSAS.map((salsa) => (
                <button
                  key={salsa}
                  onClick={() => handleSalsaToggle(salsa)}
                  className={`p-2 border-2 rounded-lg text-sm ${
                    personalization.salsas?.includes(salsa)
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  disabled={personalization.salsas?.length === 2 && !personalization.salsas.includes(salsa)}
                >
                  {salsa}
                </button>
              ))}
            </div>
            {personalization.salsas && personalization.salsas.length > 0 && (
              <p className="text-xs text-gray-600 mt-1">
                Seleccionadas: {personalization.salsas.join(', ')} ({personalization.salsas.length}/2)
              </p>
            )}
            <p className="text-xs text-gray-500 mt-2 italic">
              Nota: Las bebidas se agregan aparte desde la categoría de bebestibles
            </p>
          </div>
        )}

        {/* Bebidas individuales */}
        {isBebida && (
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Bebida:</label>
            <select
              value={personalization.bebidas?.[0]?.nombre || ''}
              onChange={(e) => {
                const bebidas = [{ nombre: e.target.value }];
                setPersonalization({ ...personalization, bebidas });
              }}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm mb-2"
            >
              <option value="">Selecciona bebida</option>
              <option value="Agua">Agua</option>
              <option value="Bebida en Lata">Bebida en Lata</option>
              <option value="Jugo Watts">Jugo Watts</option>
              <option value="Jugo Natural">Jugo Natural</option>
              <option value="Té Árabe">Té Árabe</option>
              <option value="Café">Café</option>
            </select>
            {(personalization.bebidas?.[0]?.nombre === 'Bebida en Lata' || 
              personalization.bebidas?.[0]?.nombre === 'Jugo Watts' || 
              personalization.bebidas?.[0]?.nombre === 'Jugo Natural') && (
              <input
                type="text"
                placeholder="Escribe el sabor o tipo (ej: Cola, Naranja, Piña, etc.)"
                value={personalization.bebidas[0].sabor || ''}
                onChange={(e) => {
                  const bebidas = [{ ...personalization.bebidas![0], sabor: e.target.value }];
                  setPersonalization({ ...personalization, bebidas });
                }}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              />
            )}
          </div>
        )}

        {/* Detalles adicionales */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Notas adicionales:</label>
          <textarea
            value={personalization.detalles || ''}
            onChange={(e) => setPersonalization({ ...personalization, detalles: e.target.value })}
            placeholder="Ej: Sin cebolla, extra picante, etc."
            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            rows={2}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

