export type TriviaQuestion = {
  id: string
  prompt: string
  options: { id: string; label: string }[]
  correctOptionId?: string
  correctFeedback: string
  incorrectFeedback?: string
  isPrediction?: boolean
}

export const origin01Trivia = {
  questions: [
    {
      id: 'q1', prompt: '¿Cuál sería el plan perfecto de Valentina para un sábado?', correctOptionId: 'b',
      options: [{ id: 'a', label: 'Salir a bailar' }, { id: 'b', label: 'Una tarde con amigas' }, { id: 'c', label: 'Maratón de películas' }, { id: 'd', label: 'Dormir hasta el domingo' }],
      correctFeedback: '¡La conocés bien! Con amigas cerca, cualquier tarde puede convertirse en un gran plan.',
      incorrectFeedback: 'Casi… puede disfrutar muchos planes, pero una tarde con amigas suele ganar.',
    },
    {
      id: 'q2', prompt: '¿Qué comida elegiría sin pensarlo?', correctOptionId: 'a',
      options: [{ id: 'a', label: 'Pizza' }, { id: 'b', label: 'Sushi' }, { id: 'c', label: 'Pastas' }, { id: 'd', label: 'Hamburguesas' }],
      correctFeedback: 'Punto para vos. Si hay pizza, Valentina difícilmente diga que no.',
      incorrectFeedback: 'Buena elección, aunque la pizza sigue ocupando un lugar difícil de superar.',
    },
    {
      id: 'q3', prompt: 'Cuando algo no sale como esperaba, ¿qué hace primero?', correctOptionId: 'b',
      options: [{ id: 'a', label: 'Se ríe' }, { id: 'b', label: 'Se enoja un ratito' }, { id: 'c', label: 'Llama a una amiga' }, { id: 'd', label: 'Finge que no pasó nada' }],
      correctFeedback: 'La conocés: primero necesita su momento… después vuelve todo a la normalidad.',
      incorrectFeedback: 'Buena teoría, pero primero necesita unos minutos para procesarlo.',
    },
    {
      id: 'q4', prompt: '¿Cuál es una frase muy de Valentina?', correctOptionId: 'c',
      options: [{ id: 'a', label: 'Tengo sueño' }, { id: 'b', label: 'Ya fue' }, { id: 'c', label: 'No sé qué ponerme' }, { id: 'd', label: 'Después veo' }],
      correctFeedback: 'Definitivamente sos parte del círculo cercano: esa frase aparece antes de cada plan.',
      incorrectFeedback: 'Podría decir cualquiera… pero “no sé qué ponerme” tiene ventaja.',
    },
    {
      id: 'q5', prompt: '¿Qué pensás que va a emocionarla más esa noche?', isPrediction: true,
      options: [{ id: 'a', label: 'Su entrada' }, { id: 'b', label: 'El video de su familia' }, { id: 'c', label: 'Las palabras de sus amigas' }, { id: 'd', label: 'La sorpresa final' }],
      correctFeedback: 'Tu intuición puede tener razón. Acá no hay respuestas equivocadas: esa noche lo vamos a descubrir juntos.',
    },
  ] satisfies TriviaQuestion[],
  resultTiers: [
    { minScore: 4, title: 'Cómplice oficial', message: 'Valentina probablemente ya sabe que no puede ocultarte demasiado.' },
    { minScore: 2, title: 'La conocés bastante', message: 'Estás cerca de su mundo y todavía puede sorprenderte.' },
    { minScore: 1, title: 'Hay mucho por descubrir', message: 'Esta noche puede ser una hermosa oportunidad para conocerla un poco más.' },
    { minScore: 0, title: 'Viniste por la fiesta, confesalo', message: 'No pasa nada: lo importante es estar para compartir lo que viene.' },
  ],
}
