import './Sidebar.css'

function Sidebar({ children, onClose, showOverlay, isHidden }) {
  return (
    <>
      {showOverlay && <div className={`sidebar-overlay ${isHidden && 'hidden'}`} onClick={onClose} />}
      <div className={`sidebar ${isHidden && 'hidden'}`}>
        {children}
      </div>
    </>
  )
}

export default Sidebar
