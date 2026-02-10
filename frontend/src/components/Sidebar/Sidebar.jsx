import './Sidebar.css'

function Sidebar({ children, onClose, showOverlay, isHidden, title, action }) {
  return (
    <>
      {showOverlay && <div className={`sidebar-overlay ${isHidden ? 'hidden' : ''}`} onClick={onClose} />}
      <div className={`sidebar ${isHidden ? 'hidden' : ''}`}>
        <div className="sidebar-header">
          <h2>{title}</h2>
          {action && <div className="sidebar-header-action">{action}</div>}
        </div>
        {children}

      </div>
    </>
  )
}

export default Sidebar
