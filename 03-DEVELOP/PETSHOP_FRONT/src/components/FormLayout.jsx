import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Componente reutilizable para el layout de los formularios de creación/edición.
 * Proporciona una estructura visual consistente con un título, subtítulo y botones de acción.
 *
 * @param {object} props
 * @param {string} props.title - El título principal del formulario (ej. "Creación de Usuario").
 * @param {string} props.subtitle - Un texto descriptivo debajo del título.
 * @param {React.ReactNode} props.children - El contenido del formulario (los inputs, selects, etc.).
 * @param {function} props.onSubmit - La función que se ejecuta al enviar el formulario.
 * @param {boolean} [props.loading=false] - Estado de carga para deshabilitar botones.
 * @param {string} [props.backToUrl] - URL a la que navegar al presionar "Cancelar". Si no se provee, no se muestra el botón.
 */
export default function FormLayout({ title, subtitle, children, onSubmit, loading = false, backToUrl }) {
  const navigate = useNavigate();

  return (
    <section
      className="form-section d-flex flex-column align-items-center justify-content-center"
      style={{ minHeight: '80vh', background: '#f6f8fa' }}
    >
      <div
        className="form-layout-card card shadow-lg p-5"
        style={{ maxWidth: '600px', width: '100%', minHeight: '520px', borderRadius: '24px', background: '#fff' }}
      >
        <div className="text-center mb-4">
          <h1 className="form-layout-title mb-2">{title}</h1>
          {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
        </div>

        <form onSubmit={onSubmit}>
          <div className="row g-3">{children}</div>
          <div className="row mt-4">
            <div className="col-12">
              <div className="d-flex justify-content-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-success fw-bold shadow-sm px-3 py-2"
                  style={{ minWidth: '120px', fontSize: '1.08rem' }}
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
                {backToUrl && (
                  <button
                    type="button"
                    className="btn btn-secondary fw-bold shadow-sm px-3 py-2"
                    style={{ minWidth: '120px', fontSize: '1.08rem' }}
                    onClick={() => navigate(backToUrl)}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
