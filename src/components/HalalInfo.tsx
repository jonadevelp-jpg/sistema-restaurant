import { useState } from 'react';

export default function HalalInfo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gold-600 hover:bg-gold-500 text-black px-4 py-2 rounded-full shadow-lg transition-all duration-300 flex items-center gap-2 font-semibold text-sm"
        title="Información sobre Carne Halal"
      >
        <span className="text-lg">🕌</span>
        <span className="hidden sm:inline">Carne Halal</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-black/95 border-2 border-gold-600 rounded-lg p-4 shadow-2xl backdrop-blur-sm">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-cinzel text-gold-400 text-lg font-bold flex items-center gap-2">
              <span>🕌</span>
              Carne Halal Certificada
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gold-400 hover:text-gold-300 text-xl leading-none"
            >
              ×
            </button>
          </div>
          <p className="text-gold-200/90 text-sm leading-relaxed">
            En <strong className="text-gold-400">Gourmet Árabe</strong> trabajamos exclusivamente con <strong className="text-gold-400">carne halal</strong>, 
            que es carne de animales criados y sacrificados según las leyes islámicas. 
            Esto incluye un trato ético del animal, dieta vegetariana sin hormonas ni antibióticos, 
            y un método de sacrificio ritual respetuoso.
          </p>
          <div className="mt-3 pt-3 border-t border-gold-600/30">
            <p className="text-gold-300/70 text-xs italic">
              Todos nuestros platos con carne están preparados con carne halal certificada.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}


