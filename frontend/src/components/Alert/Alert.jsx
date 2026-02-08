import { createContext, useContext, useState, useCallback } from 'react'
import './Alert.css'

const AlertContext = createContext()

export function useAlert() {
  return useContext(AlertContext)
}

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([])

  const showAlert = useCallback((message, type = 'error') => {
    const id = Date.now()
    setAlerts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id))
    }, 4000)
  }, [])

  const removeAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id))
  }, [])

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <div className="alert-container">
        {alerts.map(alert => (
          <div key={alert.id} className={`alert alert-${alert.type}`}>
            <span>{alert.message}</span>
            <button className="alert-close" onClick={() => removeAlert(alert.id)}>×</button>
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  )
}
