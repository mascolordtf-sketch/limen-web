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
    { alt: 'Retrato editorial abstracto en tonos marfil y arcilla', title: 'El sueño' },
    { alt: 'Detalle sereno de luz cálida sobre una superficie textil', title: 'La espera' },
    { alt: 'Composición editorial mínima con sombra suave', title: 'El comienzo' },
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
  },
}
