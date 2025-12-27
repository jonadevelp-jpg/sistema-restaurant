import { useState } from 'react';

export default function HalalInfo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-tomato-500 hover:bg-tomato-600 text-white px-4 py-2 rounded-full shadow-lg transition-all duration-300 flex items-center gap-2 font-semibold text-sm"
        title="Información sobre nuestros productos"
      >
        <span className="text-lg">🍽️</span>
        <span className="hidden sm:inline">Info</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-white/95 border-2 border-tomato-400 rounded-xl p-4 shadow-2xl backdrop-blur-sm">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-bold text-tomato-600 text-lg flex items-center gap-2">
              <span>🍽️</span>
              Productos Frescos
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-tomato-600 hover:text-tomato-700 text-xl leading-none"
            >
              ×
            </button>
          </div>
          <p className="text-slate-700 text-sm leading-relaxed">
            En <strong className="text-tomato-600">Completos & Churrascos</strong> trabajamos con <strong className="text-tomato-600">ingredientes frescos</strong> y de calidad, 
            preparados al momento para garantizar el mejor sabor. 
            Todos nuestros productos son seleccionados cuidadosamente para ofrecerte la mejor experiencia.
          </p>
          <div className="mt-3 pt-3 border-t border-tomato-300/30">
            <p className="text-slate-600 text-xs italic">
              Todos nuestros platos están preparados con ingredientes frescos y de calidad.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}




