import './Sidebar.css'

function Sidebar({ children, onClose, showOverlay }) {
  return (
    <>
      {showOverlay && <div className="sidebar-overlay hidden" onClick={onClose} />}
      <div className="sidebar hidden">
        {children}
      </div>
    </>
  )
}

export default Sidebar
