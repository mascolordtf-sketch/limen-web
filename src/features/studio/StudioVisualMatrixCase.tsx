import { useParams } from 'react-router-dom'

import { origin01DemoData } from '../invitations/origin01/origin01DemoData'
import { resolveOrigin01VisualMatrixCase } from '../invitations/origin01/origin01VisualMatrix'
import './visualMatrixCase.css'

export function StudioVisualMatrixCase() {
  const { caseId } = useParams()
  const matrixCase = resolveOrigin01VisualMatrixCase(caseId, origin01DemoData)

  if (!matrixCase) {
    return <main className="limen-matrix-case"><h1>Caso de matriz no disponible</h1></main>
  }

  const source = `/demo/${origin01DemoData.code}?matriz=${encodeURIComponent(matrixCase.id)}`

  return (
    <main className="limen-matrix-case">
      <header className="limen-matrix-case__header">
        <div>
          <p>LIMEN · Matriz visual</p>
          <h1>{matrixCase.id}</h1>
        </div>
        <dl>
          <div><dt>Escena</dt><dd>{matrixCase.scene}</dd></div>
          <div><dt>Vista</dt><dd>{matrixCase.viewportId} · {matrixCase.viewport.width} × {matrixCase.viewport.height}</dd></div>
          <div><dt>Contenido</dt><dd>{matrixCase.contentProfile}</dd></div>
        </dl>
      </header>
      <div className="limen-matrix-case__viewport" role="region" aria-label="Viewport reproducible de la invitación">
        <iframe
          title={`Caso ${matrixCase.id}`}
          src={source}
          width={matrixCase.viewport.width}
          height={matrixCase.viewport.height}
        />
      </div>
    </main>
  )
}
