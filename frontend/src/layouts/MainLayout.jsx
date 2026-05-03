// src/layouts/MainLayout.jsx
import { useState } from 'react'
import './MainLayout.css'

import Navbar    from '../components/Navbar/Navbar'
import Sidebar   from '../components/Sidebar/Sidebar'
import Footer    from '../components/Footer/Footer'
import FilterBar from '../components/FilterBar/FilterBar'
import Toast     from '../components/Toast/Toast'

function MainLayout({ children, showFilter = false, filterActive, onFilter }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="main-layout">
      <Navbar onToggleSidebar={() => setSidebarOpen(o => !o)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-layout__body">
        {/* Espacio que empuja el contenido cuando el sidebar está abierto */}
        <div className={`main-layout__sidebar-spacer ${sidebarOpen ? '' : 'main-layout__sidebar-spacer--closed'}`} />

        <div className="main-layout__content">
          {showFilter && (
            <FilterBar active={filterActive} onFilter={onFilter} />
          )}
          <main className="main-layout__page">
            {children}
          </main>
          <Footer />
        </div>
      </div>

      <Toast />
    </div>
  )
}

export default MainLayout
