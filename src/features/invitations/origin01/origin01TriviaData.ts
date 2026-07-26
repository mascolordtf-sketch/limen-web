export type TriviaOption = {
  id: string
  label: string
}

export type TriviaQuestion = {
  id: string
  prompt: string
  options: TriviaOption[]
  correctOptionId?: string
  correctFeedback: string
  incorrectFeedback?: string
  isPrediction?: boolean
}

export type TriviaResultTier = {
  minScore: number
  title: string
  message: string
}

export type TriviaConfig = {
  protagonistName: string
  introEyebrow: string
  title: string
  description: string
  primaryAction: string
  meta: string
  nextLabel: string
  resultLabel: string
  replayLabel: string
  questions: TriviaQuestion[]
  resultTiers: TriviaResultTier[]
  revealTitle: string
  revealMessage: string
  revealSignature: string
}

export const origin01Trivia: TriviaConfig = {
  protagonistName: 'Valentina',
  introEyebrow: 'Entre nosotros…',
  title: '¿Cuánto conocés de verdad a Valentina?',
  description: 'Cinco preguntas, algunas pistas y una sola forma de descubrirlo.',
  primaryAction: 'Aceptar el desafío',
  meta: '5 preguntas · menos de un minuto',
  nextLabel: 'Siguiente',
  resultLabel: 'Ver resultados',
  replayLabel: 'Volver a jugar',
  questions: [
    {
      id: 'q1',
      prompt: '¿Cuál sería el plan perfecto de Valentina para un sábado?',
      options: [
        { id: 'a', label: 'Salir a bailar' },
        { id: 'b', label: 'Una tarde con amigas' },
        { id: 'c', label: 'Maratón de películas' },
        { id: 'd', label: 'Dormir hasta el domingo' },
      ],
      correctOptionId: 'b',
      correctFeedback:
        '¡La conocés bien! Con amigas cerca, cualquier tarde puede convertirse en un gran plan.',
      incorrectFeedback:
        'Casi… puede disfrutar muchos planes, pero una tarde con amigas suele ganar.',
    },
    {
      id: 'q2',
      prompt: '¿Qué comida podría repetir sin cansarse?',
      options: [
        { id: 'a', label: 'Pizza' },
        { id: 'b', label: 'Sushi' },
        { id: 'c', label: 'Pastas' },
        { id: 'd', label: 'Hamburguesas' },
      ],
      correctOptionId: 'a',
      correctFeedback:
        'Punto para vos. Si hay pizza, Valentina difícilmente diga que no.',
      incorrectFeedback:
        'No era esa. La pizza sigue ocupando un lugar difícil de superar.',
    },
    {
      id: 'q3',
      prompt: 'Cuando algo no sale como esperaba, ¿qué hace primero?',
      options: [
        { id: 'a', label: 'Se ríe' },
        { id: 'b', label: 'Se enoja un ratito' },
        { id: 'c', label: 'Llama a una amiga' },
        { id: 'd', label: 'Finge que no pasó nada' },
      ],
      correctOptionId: 'b',
      correctFeedback:
        'La conocés: primero necesita su momento… después vuelve todo a la normalidad.',
      incorrectFeedback:
        'Buena teoría, pero primero necesita unos minutos para procesarlo.',
    },
    {
      id: 'q4',
      prompt: '¿Cuál de estas cosas dice más seguido?',
      options: [
        { id: 'a', label: 'Tengo sueño' },
        { id: 'b', label: 'Ya fue' },
        { id: 'c', label: 'No sé qué ponerme' },
        { id: 'd', label: 'Después veo' },
      ],
      correctOptionId: 'c',
      correctFeedback: 'Definitivamente sos parte del círculo cercano.',
      incorrectFeedback:
        'Podría decir cualquiera… pero “no sé qué ponerme” tiene ventaja.',
    },
    {
      id: 'q5',
      prompt: '¿Qué momento creen que puede emocionarla más durante la fiesta?',
      options: [
        { id: 'a', label: 'La entrada' },
        { id: 'b', label: 'El video de su familia' },
        { id: 'c', label: 'Las palabras de sus amigos' },
        { id: 'd', label: 'La sorpresa final' },
      ],
      isPrediction: true,
      correctFeedback:
        'No hay una respuesta correcta. Esa noche vamos a descubrirlo juntos.',
    },
  ],
  resultTiers: [
    {
      minScore: 4,
      title: 'Cómplice oficial',
      message: 'Valentina probablemente ya sabe que no puede ocultarte demasiado.',
    },
    {
      minScore: 2,
      title: 'La conocés bastante',
      message:
        'Estás dentro del círculo de confianza, aunque todavía puede sorprenderte.',
    },
    {
      minScore: 1,
      title: 'Hay mucho por descubrir',
      message:
        'Esta fiesta puede ser una muy buena oportunidad para mejorar el puntaje.',
    },
    {
      minScore: 0,
      title: 'Viniste por la fiesta, confesalo',
      message: 'No pasa nada. Todavía estás a tiempo de conocerla un poco mejor.',
    },
  ],
  revealTitle: 'Gracias por jugar',
  revealMessage:
    'Ahora que ya sabés un poco más de mí, espero que estés ahí para compartir una de las noches más importantes de mi vida.',
  revealSignature: 'Valentina',
}
