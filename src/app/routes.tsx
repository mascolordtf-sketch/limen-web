import { Navigate, Route, Routes } from 'react-router-dom'

import { SiteLayout } from '../components/layout/SiteLayout'
import { CatalogPage } from '../pages/CatalogPage'
import { ContactPage } from '../pages/ContactPage'
import { DemoPage } from '../pages/DemoPage'
import { DesignDetailPage } from '../pages/DesignDetailPage'
import { HomePage } from '../pages/HomePage'
import { NotFoundPage } from '../pages/NotFoundPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="demo/:code" element={<DemoPage />} />

      <Route element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="catalogo" element={<CatalogPage />} />
        <Route path="disenos/:code" element={<DesignDetailPage />} />
        <Route path="contacto" element={<ContactPage />} />
        <Route path="404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  )
}
