import type { InvitationData } from '../types'

export const origin01Invitation: InvitationData = {
  code: 'LMN-015-001',
  demoLabel: 'Demostración LIMEN',
  thresholdPhrase: 'Hay momentos que comienzan mucho antes de llegar.',
  mainPhrase: 'Antes era un sueño. Ahora empieza.',
  welcome: {
    title: 'Hola, Valentina.',
    body: 'Durante mucho tiempo imaginaste este momento. Hoy empieza a hacerse real.',
  },
  personalMessage:
    'Hay sueños que se construyen durante años. Quiero compartir con vos la noche en que uno de los míos comienza a hacerse realidad.',
  closing: 'Gracias por ser parte de la historia que empieza acá.',
  event: {
    name: 'Valentina',
    celebration: 'Mis 15',
    startsAt: '2027-03-20T21:00:00-03:00',
    endsAt: '2027-03-21T02:00:00-03:00',
    timeZone: 'America/Argentina/Buenos_Aires',
    dateLabel: '20 de marzo de 2027',
    timeLabel: '21:00',
    venue: 'Palacio del Lago',
    address: 'Av. del Encuentro 1540, Buenos Aires',
    dressCode: 'Elegante',
  },
  gallery: [
    {
      src: '/images/origin-01/hero-valentina.webp',
      alt: 'Retrato editorial de Valentina con vestido rosa dorado y luz cálida',
      title: 'El sueño',
    },
    {
      src: '/images/origin-01/dress-detail.webp',
      alt: 'Detalle del vestido rosa dorado iluminado suavemente',
      title: 'La espera',
    },
    {
      src: '/images/origin-01/closing-valentina.webp',
      alt: 'Valentina sonriendo bajo una luz cálida al final de la invitación',
      title: 'El comienzo',
    },
  ],
  rsvp: {
    message: 'Hola, confirmo mi asistencia a Mis 15 de Valentina.',
    demoNote: 'Demo pública: se abrirá WhatsApp con un mensaje prellenado, sin destinatario real.',
  },
  music: {
    title: 'Música de fondo',
  },
  gift: {
    title: 'Regalo',
    description: 'Si querés acompañar este momento con un detalle, dejamos una referencia ficticia para esta demo.',
    accountLabel: 'Alias de demostración',
    accountValue: 'VALENTINA.DEMO.LIMEN',
    demoNote: 'Datos de ejemplo. No corresponden a una cuenta real.',
    image: {
      src: '/images/origin-01/gift-still-life.webp',
      alt: 'Caja de regalo rosa champagne con cinta satinada y luces cálidas',
    },
  },
  trivia: {
    title: '¿Cuánto la conocés?',
    subtitle: 'Cinco preguntas para descubrir cuán cerca estás de Valentina.',
    questions: [
      {
        prompt: '¿Cuál es el color favorito de Valentina?',
        options: ['Azul marino', 'Rosa dorado', 'Verde esmeralda', 'Violeta'],
        answerIndex: 1,
      },
      {
        prompt: '¿Qué instrumento tocaba Valentina de chica?',
        options: ['Piano', 'Violín', 'Guitarra', 'Flauta'],
        answerIndex: 0,
      },
      {
        prompt: '¿Cuál es el postre que Valentina no puede resistir?',
        options: ['Tiramisú', 'Macarons', 'Chocotorta', 'Helado de frutilla'],
        answerIndex: 2,
      },
      {
        prompt: '¿Qué sueña Valentina para su futuro?',
        options: ['Viajar por el mundo', 'Estudiar arte', 'Ser diseñadora', 'Vivir en la playa'],
        answerIndex: 0,
      },
      {
        prompt: '¿Con quién quiere bailar Valentina esta noche?',
        options: ['Con su mamá', 'Con su mejor amiga', 'Con todos', 'Con su papá'],
        answerIndex: 2,
      },
    ],
    resultTiers: [
      {
        minScore: 5,
        title: '¡La conocés de memoria!',
        message: 'Sos parte del corazón más cercano de Valentina. No hay secreto que se te escape.',
      },
      {
        minScore: 3,
        title: '¡La conocés bien!',
        message: 'Sabés mucho sobre Valentina. Algunas cosas todavía quedan para descubrir juntas esta noche.',
      },
      {
        minScore: 1,
        title: 'Hay mucho por descubrir',
        message: 'Valentina tiene un mundo entero para compartir con vos. Esta noche es el comienzo perfecto.',
      },
      {
        minScore: 0,
        title: '¡A ponerse al día!',
        message: 'No pasa nada. Esta noche es la oportunidad ideal para conocer a Valentina como nunca.',
      },
    ],
  },
}
