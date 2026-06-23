import React, { useState, useEffect, useRef } from 'react';

/**
 * Un componente de select con búsqueda integrada.
 *
 * @param {object} props
 * @param {Array<{value: string|number, label: string}>} props.options - La lista de opciones a mostrar.
 * @param {string|number} props.value - El valor de la opción seleccionada.
 * @param {function(string|number): void} props.onChange - Callback que se ejecuta cuando se selecciona una opción.
 * @param {string} [props.placeholder='Buscar...'] - Placeholder para el campo de búsqueda.
 */
export default function SearchableSelect({ options, value, onChange, placeholder = 'Buscar...' }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const selectedOption = options.find(option => option.value === value);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Cerrar el dropdown si se hace clic fuera de él
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div className="searchable-select" ref={wrapperRef}>
      <div className="select-input-wrapper" onClick={() => setIsOpen(!isOpen)}>
        <input
          type="text"
          className="form-control"
          placeholder={selectedOption ? selectedOption.label : placeholder}
          value={isOpen ? searchTerm : (selectedOption ? selectedOption.label : '')}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
        />
        <i className={`bi bi-chevron-down select-arrow ${isOpen ? 'open' : ''}`}></i>
      </div>
      {isOpen && (
        <ul className="select-options-list list-group">
          {filteredOptions.length > 0 ? (
            filteredOptions.map(option => (
              <li
                key={option.value}
                className="list-group-item list-group-item-action"
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </li>
            ))
          ) : (
            <li className="list-group-item text-muted">No se encontraron resultados</li>
          )}
        </ul>
      )}
    </div>
  );
}
