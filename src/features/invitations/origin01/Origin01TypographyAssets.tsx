import { getOrigin01TypographyStylesheets } from './origin01Typography'
import type { Origin01TypographyCombination } from './origin01Typography'

export function Origin01TypographyAssets({ combination }: { combination?: Origin01TypographyCombination }) {
  if (!combination) return null
  return <>{getOrigin01TypographyStylesheets(combination).map((href) =>
    <link rel="stylesheet" href={href} precedence="limen-fonts" key={href} />)}</>
}
