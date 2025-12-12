import { createPortal } from 'react-dom';

/**
 * Portal Component - Renders children outside the normal DOM hierarchy
 * Used for modals, tooltips, and other overlay components that need to escape
 * parent container constraints (overflow, z-index, etc.)
 */
const Portal = ({ children, className = "" }) => {
  // Create portal root element if it doesn't exist
  let portalRoot = document.getElementById('portal-root');
  if (!portalRoot) {
    portalRoot = document.createElement('div');
    portalRoot.id = 'portal-root';
    document.body.appendChild(portalRoot);
  }

  return createPortal(
    <div className={`fixed inset-0 z-[1000] ${className}`}>
      {children}
    </div>,
    portalRoot
  );
};

export default Portal;