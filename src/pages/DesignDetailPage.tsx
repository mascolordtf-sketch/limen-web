import { useParams } from 'react-router-dom'

import { PlaceholderPage } from './PlaceholderPage'

export function DesignDetailPage() {
  const { code } = useParams()

  return (
    <PlaceholderPage
      title="Detalle del diseño"
      description="Esta página mostrará la información básica de un diseño específico sin cargar datos ficticios todavía."
      code={code}
    />
  )
}
