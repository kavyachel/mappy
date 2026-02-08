import './Sidebar.css'

function Sidebar({ children, onClose }) {
  return (
    <>
      <div className="sidebar-overlay" onClick={onClose} />
      <div className="sidebar">
        {children}
      </div>
    </>
  )
}

export default Sidebar
