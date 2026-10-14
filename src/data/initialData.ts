import {
  ChurchSettings,
  User,
  LiveStreamData,
  OfficialDepartment,
  MediaScheduleItem,
  ChildRecord,
  EventItem,
  PrayerRequest,
  Contribution,
  PushNotification,
  DepartmentMembership,
  DepartmentChatMessage,
  AuditLogEntry,
  DepartmentId
} from '../types';

export const INITIAL_CHURCH_SETTINGS: ChurchSettings = {
  name: 'IGREJA GERAÇÃO ELEITA',
  acronym: 'IGEAD-MT',
  slogan: 'Conectado com o Céu , firme na terra',
  secondarySlogan: 'Jesus Cristo é o Centro',
  address: 'R. Dezessete, 38, Quadra 107, Pedra 90',
  neighborhood: 'Pedra 90',
  cityState: 'Cuiabá - MT',
  cep: '78099-085',
  phone: '(65) 3661-0000',
  whatsapp: '5565999999999',
  email: 'contato@igeadmt.com.br',
  youtube: 'https://www.youtube.com/@IGEAD_MT',
  youtubeLiveEmbedUrl: 'https://www.youtube.com/embed/live_stream?channel=@IGEAD_MT',
  instagram: '@igead_mt',
  pixKey: 'igeadmt@pix.com.br',
  pixKeyType: 'E-mail',
  pixBeneficiary: 'Igreja Geração Eleita — IGEAD-MT',
  pixBank: 'Banco Cooperativo Sicoob / Sicredi',
  primaryColor: 'amber',
  logoUrl: '/logo-igead.svg',
  bannerImageUrl: '/banner-igead.svg',
  bannerTitle: 'Conectado com o Céu , firme na terra',
  bannerSubtitle: 'Jesus Cristo é o Centro',
  serviceTimes: [
    { day: 'Domingo', time: '19:00', title: 'Culto de Celebração da Família' },
    { day: 'Terça-feira', time: '19:30', title: 'Culto de Oração & Intercessão' },
    { day: 'Quinta-feira', time: '19:30', title: 'Culto de Doutrina Bíblica' },
    { day: 'Sábado', time: '19:30', title: 'Culto do Grupo de Jovens' }
  ]
};

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    name: 'Administração Geral',
    email: 'admin@igeadmt.com.br',
    phone: '(65) 99999-0001',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    membershipId: 'IGEAD-0001',
    membershipDate: '01/01/2020',
    departmentIds: ['midia'],
    departmentNames: ['Grupo da Mídia'],
    address: 'Pedra 90, Cuiabá - MT'
  },
  {
    id: 'user-pastor',
    name: 'Liderança Pastoral',
    email: 'pastor@igeadmt.com.br',
    phone: '(65) 99999-0002',
    role: 'pastor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    membershipId: 'IGEAD-0002',
    membershipDate: '01/01/2020',
    departmentIds: ['homens'],
    departmentNames: ['Grupo de Homens'],
    address: 'Pedra 90, Cuiabá - MT'
  },
  {
    // EXEMPLO OBRIGATÓRIO: Líder da Mídia e Membro do Grupo de Homens
    id: 'user-leader-midia',
    name: 'Carlos Rocha (Líder Mídia & Membro Homens)',
    email: 'carlos.midia@igeadmt.com.br',
    phone: '(65) 99999-0005',
    role: 'member',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80',
    membershipId: 'IGEAD-0103',
    membershipDate: '20/06/2021',
    departmentIds: ['midia', 'homens'],
    departmentNames: ['Grupo da Mídia', 'Grupo de Homens'],
    address: 'Pedra 90, Cuiabá - MT'
  },
  {
    id: 'user-leader-homens',
    name: 'Marcos Oliveira (Líder Homens)',
    email: 'marcos.homens@igeadmt.com.br',
    phone: '(65) 99999-0003',
    role: 'member',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    membershipId: 'IGEAD-0101',
    membershipDate: '15/03/2021',
    departmentIds: ['homens'],
    departmentNames: ['Grupo de Homens'],
    address: 'Pedra 90, Cuiabá - MT'
  },
  {
    id: 'user-leader-mulheres',
    name: 'Ana Paula (Líder Mulheres)',
    email: 'ana.mulheres@igeadmt.com.br',
    phone: '(65) 99999-0004',
    role: 'member',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
    membershipId: 'IGEAD-0102',
    membershipDate: '15/03/2021',
    departmentIds: ['mulheres'],
    departmentNames: ['Grupo de Mulheres'],
    address: 'Pedra 90, Cuiabá - MT'
  },
  {
    id: 'user-leader-jovens',
    name: 'Gabriel Santos (Líder Jovens)',
    email: 'gabriel.jovens@igeadmt.com.br',
    phone: '(65) 99999-0006',
    role: 'member',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80',
    membershipId: 'IGEAD-0104',
    membershipDate: '01/08/2022',
    departmentIds: ['jovens'],
    departmentNames: ['Grupo de Jovens'],
    address: 'Pedra 90, Cuiabá - MT'
  },
  {
    id: 'user-leader-criancas',
    name: 'Débora Lima (Líder Crianças)',
    email: 'debora.criancas@igeadmt.com.br',
    phone: '(65) 99999-0007',
    role: 'member',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
    membershipId: 'IGEAD-0105',
    membershipDate: '10/02/2022',
    departmentIds: ['criancas'],
    departmentNames: ['Grupo de Crianças'],
    address: 'Pedra 90, Cuiabá - MT'
  },
  {
    id: 'user-member',
    name: 'Membro da Igreja',
    email: 'membro@igeadmt.com.br',
    phone: '(65) 99999-1234',
    role: 'member',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=250&q=80',
    membershipId: 'IGEAD-0842',
    membershipDate: '10/02/2022',
    baptismDate: '15/05/2022',
    departmentIds: ['midia'],
    departmentNames: ['Grupo da Mídia'],
    familyMembers: [
      {
        id: 'fam-1',
        name: 'Familiar Cadastrado',
        relationship: 'Cônjuge',
        birthDate: '14/08/1992'
      },
      {
        id: 'fam-2',
        name: 'Filho(a) Cadastrado',
        relationship: 'Filho',
        birthDate: '22/03/2019',
        isKidsMinistryCheckedIn: true,
        securityPin: 'KIDS-7741',
        parentAuthorized: true,
        allergiesOrMedicalNotes: 'Nenhuma alergia conhecida.'
      }
    ],
    address: 'R. Dezessete, Pedra 90, Cuiabá - MT'
  },
  {
    id: 'user-visitor',
    name: 'Visitante',
    email: 'visitante@email.com',
    phone: '(65) 98888-2222',
    role: 'visitor',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
    membershipId: 'VISIT-2026',
    membershipDate: '14/10/2026',
    address: 'Pedra 90, Cuiabá - MT'
  }
];

export const INITIAL_LIVE_STREAM: LiveStreamData = {
  isLive: false,
  title: 'Transmissão do Culto — IGREJA GERAÇÃO ELEITA',
  preacher: 'Liderança Pastoral IGEAD-MT',
  series: 'Mensagem Dominical',
  youtubeUrl: 'https://www.youtube.com/@IGEAD_MT',
  youtubeVideoId: '',
  viewersCount: 0,
  primaryScripture: '1 Pedro 2:9',
  notes: [
    'Texto Bíblico Principal: 1 Pedro 2:9 — "Mas vós sois a geração eleita, o sacerdócio real, a nação santa, o povo adquirido, para que anuncieis as virtudes daquele que vos chamou das trevas para a sua maravilhosa luz."',
    'Lema da Igreja: Conectado com o Céu, firme na terra.',
    'Princípio: Jesus Cristo é o Centro de todas as coisas.'
  ]
};

// 5 Departamentos Oficiais
export const INITIAL_DEPARTMENTS: OfficialDepartment[] = [
  {
    id: 'homens',
    name: 'Grupo de Homens',
    badge: 'Homens de Fé',
    description: 'Espaço de comunhão, oração e fortalecimento espiritual para os homens da igreja, incentivando o sacerdócio no lar, a retidão e o serviço ao Reino de Deus.',
    leaderTitle: 'Coordenação do Grupo de Homens',
    leaderName: 'Marcos Oliveira',
    meetingSchedule: 'Reuniões mensais e vigílias especiais (consulte a secretaria)',
    contactPhone: '(65) 3661-0000',
    contactWhatsapp: '5565999999999',
    activities: [
      'Estudo da Palavra e Oração dos Homens',
      'Café de Comunhão e Testemunhos',
      'Apoio prático e voluntariado nos cultos',
      'Projetos de apoio às famílias e à comunidade'
    ],
    volunteerRoles: ['Recepção', 'Intercessão dos Homens', 'Apoio Operacional'],
    announcements: [
      {
        id: 'ann-h1',
        title: 'Próximo Encontro de Oração dos Homens',
        date: 'Avisos da Semana',
        content: 'Fique atento aos anúncios no culto para a data do próximo café e reunião de oração dos homens.'
      }
    ]
  },
  {
    id: 'mulheres',
    name: 'Grupo de Mulheres',
    badge: 'Mulheres Virtuosas',
    description: 'Ministério voltado para a edificação, oração e discipulado das mulheres, promovendo comunhão bíblica, consolo mútuo e fortalecimento espiritual nos lares.',
    leaderTitle: 'Coordenação do Grupo de Mulheres',
    leaderName: 'Ana Paula',
    meetingSchedule: 'Tardes de oração e reuniões periódicas da liderança feminina',
    contactPhone: '(65) 3661-0000',
    contactWhatsapp: '5565999999999',
    activities: [
      'Círculo de Oração e Clamor pelas Famílias',
      'Encontros de Comunhão e Edificação Feminina',
      'Visitações e apoio espiritual a irmãs enfermas',
      'Organização de chás temáticos e palestras bíblicas'
    ],
    volunteerRoles: ['Intercessão', 'Acolhimento Feminino', 'Visitação'],
    announcements: [
      {
        id: 'ann-m1',
        title: 'Clamor pelas Famílias e Pelos Filhos',
        date: 'Avisos da Semana',
        content: 'Convidamos todas as irmãs a se unirem em oração diária pelo direcionamento de Deus em nossas famílias.'
      }
    ]
  },
  {
    id: 'jovens',
    name: 'Grupo de Jovens',
    badge: 'Geração Conectada',
    description: 'Juventude vibrante comprometida com a sã doutrina bíblica, adoração genuína e evangelismo. "Conectado com o Céu, firme na terra."',
    leaderTitle: 'Coordenação do Grupo de Jovens',
    leaderName: 'Gabriel Santos',
    meetingSchedule: 'Sábados às 19:30 no templo da IGEAD-MT',
    contactPhone: '(65) 3661-0000',
    contactWhatsapp: '5565999999999',
    activities: [
      'Culto Semanal dos Jovens aos Sábados',
      'Dinâmicas e debates bíblicos sobre vida cristã e vocação',
      'Evangelismo nos bairros e ações sociais',
      'Noites de adoração acústica e louvor'
    ],
    volunteerRoles: ['Louvor dos Jovens', 'Comunicação', 'Recepção Jovem', 'Evangelismo'],
    announcements: [
      {
        id: 'ann-j1',
        title: 'Culto de Jovens neste Sábado às 19:30',
        date: 'Todos os Sábados',
        content: 'Venha adorar a Deus conosco e traga um amigo para ouvir a Palavra viva de Jesus Cristo!'
      }
    ]
  },
  {
    id: 'criancas',
    name: 'Grupo de Crianças',
    badge: 'Herança do Senhor',
    description: 'Ensino da Palavra de Deus para os pequeninos com amor, fidelidade bíblica e rigorosa proteção física e emocional, em ambiente seguro com autorização e controle dos pais.',
    leaderTitle: 'Coordenação do Ministério Infantil',
    leaderName: 'Débora Lima',
    meetingSchedule: 'Aulas bíblicas durante os cultos dominicais',
    contactPhone: '(65) 3661-0000',
    contactWhatsapp: '5565999999999',
    activities: [
      'Salinhas bíblicas infantis com lições ilustradas',
      'Memorização de versículos das Escrituras',
      'Louvor infantil e teatro com princípios cristãos',
      'Check-in e check-out seguro com senha dos responsáveis'
    ],
    volunteerRoles: ['Professora Bíblica Infantil', 'Apoio e Cuidados', 'Portaria e Check-in Kids'],
    announcements: [
      {
        id: 'ann-c1',
        title: 'Segurança Infantil: Check-in Obrigatório',
        date: 'Segurança Permanente',
        content: 'Para a proteção de todas as crianças, a retirada dos pequenos após o culto somente é permitida ao responsável com o PIN de segurança gerado no aplicativo.'
      }
    ]
  },
  {
    id: 'midia',
    name: 'Grupo da Mídia',
    badge: 'Comunicação & Transmissão',
    description: 'Equipe dedicada a levar o Evangelho através dos recursos audiovisuais: som, iluminação, captura de vídeo, projeção bíblica de letras e transmissão oficial no canal do YouTube.',
    leaderTitle: 'Coordenação da Mídia',
    leaderName: 'Carlos Rocha',
    meetingSchedule: 'Plantões técnicos antes de cada culto oficial da igreja',
    contactPhone: '(65) 3661-0000',
    contactWhatsapp: '5565999999999',
    activities: [
      'Operação da mesa de som e equalização do louvor e pregação',
      'Transmissão ao vivo para o YouTube @IGEAD_MT',
      'Projeção de versículos bíblicos e letras de hinos no telão',
      'Fotografia, filmagem e manutenção dos equipamentos audiovisuais'
    ],
    volunteerRoles: ['Áudio', 'Vídeo', 'Câmeras', 'Transmissão', 'Projeção', 'Suporte Técnico'],
    announcements: [
      {
        id: 'ann-m1',
        title: 'Canal Oficial da Igreja no YouTube',
        date: 'Transmissões',
        content: 'Inscreva-se no canal oficial https://www.youtube.com/@IGEAD_MT para acompanhar os cultos e mensagens gravadas.'
      }
    ]
  }
];

// Vínculos Independentes entre Usuários e Departamentos (Relacionamento Oficial)
export const INITIAL_DEPARTMENT_MEMBERSHIPS: DepartmentMembership[] = [
  // 1. Grupo da Mídia
  {
    id: 'mem-midia-carlos',
    userId: 'user-leader-midia',
    userName: 'Carlos Rocha (Líder Mídia & Membro Homens)',
    userEmail: 'carlos.midia@igeadmt.com.br',
    userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80',
    departmentId: 'midia',
    departmentName: 'Grupo da Mídia',
    status: 'ATIVO',
    role: 'LÍDER',
    joinedAt: '20/06/2021',
    notes: 'Líder Oficial Ativo da Mídia designado pela Liderança Pastoral'
  },
  {
    id: 'mem-midia-member',
    userId: 'user-member',
    userName: 'Membro da Igreja',
    userEmail: 'membro@igeadmt.com.br',
    userAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=250&q=80',
    departmentId: 'midia',
    departmentName: 'Grupo da Mídia',
    status: 'ATIVO',
    role: 'MEMBRO',
    joinedAt: '10/02/2022',
    notes: 'Operador de câmera e transmissão ao vivo'
  },
  {
    id: 'mem-midia-admin',
    userId: 'user-admin',
    userName: 'Administração Geral',
    userEmail: 'admin@igeadmt.com.br',
    departmentId: 'midia',
    departmentName: 'Grupo da Mídia',
    status: 'ATIVO',
    role: 'MEMBRO',
    joinedAt: '01/01/2020',
    notes: 'Suporte institucional'
  },

  // 2. Grupo de Homens
  {
    id: 'mem-homens-marcos',
    userId: 'user-leader-homens',
    userName: 'Marcos Oliveira (Líder Homens)',
    userEmail: 'marcos.homens@igeadmt.com.br',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    departmentId: 'homens',
    departmentName: 'Grupo de Homens',
    status: 'ATIVO',
    role: 'LÍDER',
    joinedAt: '15/03/2021',
    notes: 'Líder Oficial Ativo do Grupo de Homens'
  },
  {
    // EXEMPLO OBRIGATÓRIO: Carlos é Líder da Mídia e Membro do Grupo de Homens!
    id: 'mem-homens-carlos',
    userId: 'user-leader-midia',
    userName: 'Carlos Rocha (Líder Mídia & Membro Homens)',
    userEmail: 'carlos.midia@igeadmt.com.br',
    userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80',
    departmentId: 'homens',
    departmentName: 'Grupo de Homens',
    status: 'ATIVO',
    role: 'MEMBRO',
    joinedAt: '10/01/2023',
    notes: 'Participante ativo do círculo de oração dos homens'
  },
  {
    id: 'mem-homens-pastor',
    userId: 'user-pastor',
    userName: 'Liderança Pastoral',
    userEmail: 'pastor@igeadmt.com.br',
    departmentId: 'homens',
    departmentName: 'Grupo de Homens',
    status: 'ATIVO',
    role: 'MEMBRO',
    joinedAt: '01/01/2020',
    notes: 'Conselheiro espiritual'
  },

  // 3. Grupo de Mulheres
  {
    id: 'mem-mulheres-ana',
    userId: 'user-leader-mulheres',
    userName: 'Ana Paula (Líder Mulheres)',
    userEmail: 'ana.mulheres@igeadmt.com.br',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
    departmentId: 'mulheres',
    departmentName: 'Grupo de Mulheres',
    status: 'ATIVO',
    role: 'LÍDER',
    joinedAt: '15/03/2021',
    notes: 'Líder Oficial Ativa do Círculo de Oração'
  },

  // 4. Grupo de Jovens
  {
    id: 'mem-jovens-gabriel',
    userId: 'user-leader-jovens',
    userName: 'Gabriel Santos (Líder Jovens)',
    userEmail: 'gabriel.jovens@igeadmt.com.br',
    userAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80',
    departmentId: 'jovens',
    departmentName: 'Grupo de Jovens',
    status: 'ATIVO',
    role: 'LÍDER',
    joinedAt: '01/08/2022',
    notes: 'Líder Oficial Ativo da Juventude'
  },

  // 5. Grupo de Crianças
  {
    id: 'mem-criancas-debora',
    userId: 'user-leader-criancas',
    userName: 'Débora Lima (Líder Crianças)',
    userEmail: 'debora.criancas@igeadmt.com.br',
    userAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
    departmentId: 'criancas',
    departmentName: 'Grupo de Crianças',
    status: 'ATIVO',
    role: 'LÍDER',
    joinedAt: '10/02/2022',
    notes: 'Coordenação Pedagógica e Segurança Infantil'
  }
];

// Chats independentes persistidos por departamento
export const INITIAL_DEPARTMENT_CHATS: Record<DepartmentId, DepartmentChatMessage[]> = {
  midia: [
    {
      id: 'chat-m1',
      departmentId: 'midia',
      userId: 'user-leader-midia',
      userName: 'Carlos Rocha',
      userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80',
      userRoleBadge: 'Líder da Mídia',
      content: 'A paz do Senhor, equipe de mídia! No culto deste domingo vamos transmitir em 1080p e testar os novos microfones sem fio.',
      createdAt: 'Hoje às 10:30',
      isLeaderMessage: true
    },
    {
      id: 'chat-m2',
      departmentId: 'midia',
      userId: 'user-member',
      userName: 'Membro da Igreja',
      userAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=250&q=80',
      userRoleBadge: 'Membro da Mídia',
      content: 'Amém, irmão Carlos! Estarei no templo às 18:00 para posicionar a câmera principal e alinhar com a mesa de som.',
      createdAt: 'Hoje às 10:45'
    }
  ],
  homens: [
    {
      id: 'chat-h1',
      departmentId: 'homens',
      userId: 'user-leader-homens',
      userName: 'Marcos Oliveira',
      userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
      userRoleBadge: 'Líder dos Homens',
      content: 'Irmãos, nosso café e reunião de oração dos homens está confirmado para o próximo sábado às 07:30. Deus tem uma palavra para nossos lares!',
      createdAt: 'Ontem às 18:20',
      isLeaderMessage: true
    },
    {
      // Carlos participando como membro dos homens
      id: 'chat-h2',
      departmentId: 'homens',
      userId: 'user-leader-midia',
      userName: 'Carlos Rocha',
      userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80',
      userRoleBadge: 'Membro dos Homens',
      content: 'Amém, líder Marcos! Contem com minha presença em oração. Vamos buscar a presença de Deus juntos.',
      createdAt: 'Ontem às 19:00'
    }
  ],
  mulheres: [
    {
      id: 'chat-mu1',
      departmentId: 'mulheres',
      userId: 'user-leader-mulheres',
      userName: 'Ana Paula',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
      userRoleBadge: 'Líder das Mulheres',
      content: 'Graça e paz, queridas irmãs! O Círculo de Oração continua firme intercedendo por cada família e enfermo da IGEAD-MT.',
      createdAt: 'Hoje às 09:15',
      isLeaderMessage: true
    }
  ],
  jovens: [
    {
      id: 'chat-j1',
      departmentId: 'jovens',
      userId: 'user-leader-jovens',
      userName: 'Gabriel Santos',
      userAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80',
      userRoleBadge: 'Líder da Juventude',
      content: 'Fala galera da Geração Eleita! Neste sábado teremos culto acústico de adoração e testemunhos às 19:30. Convidem os amigos!',
      createdAt: 'Hoje às 11:00',
      isLeaderMessage: true
    }
  ],
  criancas: [
    {
      id: 'chat-c1',
      departmentId: 'criancas',
      userId: 'user-leader-criancas',
      userName: 'Débora Lima',
      userAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
      userRoleBadge: 'Líder Ministério Infantil',
      content: '🔒 AVISO DE PROTEÇÃO INFANTIL: Este canal é supervisionado e reservado a educadores infantis e responsáveis legais. Todas as crianças devem ter o check-in realizado na entrada com o PIN dos pais.',
      createdAt: 'Ontem às 14:00',
      isLeaderMessage: true,
      isSupervised: true
    }
  ]
};

// Histórico de Auditoria Inicial (Audit Log)
export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'audit-001',
    timestamp: '20/06/2021 19:40',
    actorId: 'user-pastor',
    actorName: 'Liderança Pastoral',
    actorRole: 'LÍDER PASTORAL',
    action: 'LEADER_ASSIGNED',
    departmentId: 'midia',
    targetId: 'user-leader-midia',
    targetName: 'Carlos Rocha',
    details: 'Designação oficial de Carlos Rocha como Líder Ativo do Grupo da Mídia.',
    status: 'SUCCESS'
  },
  {
    id: 'audit-002',
    timestamp: '15/03/2021 20:00',
    actorId: 'user-pastor',
    actorName: 'Liderança Pastoral',
    actorRole: 'LÍDER PASTORAL',
    action: 'LEADER_ASSIGNED',
    departmentId: 'homens',
    targetId: 'user-leader-homens',
    targetName: 'Marcos Oliveira',
    details: 'Designação oficial de Marcos Oliveira como Líder Ativo do Grupo de Homens.',
    status: 'SUCCESS'
  },
  {
    id: 'audit-003',
    timestamp: '10/01/2023 18:30',
    actorId: 'user-leader-homens',
    actorName: 'Marcos Oliveira',
    actorRole: 'LÍDER DE DEPARTAMENTO (HOMENS)',
    action: 'MEMBERSHIP_APPROVED',
    departmentId: 'homens',
    targetId: 'user-leader-midia',
    targetName: 'Carlos Rocha',
    details: 'Aprovação de entrada de Carlos Rocha como MEMBRO do Grupo de Homens.',
    status: 'SUCCESS'
  }
];

export const INITIAL_MEDIA_SCHEDULES: MediaScheduleItem[] = [
  {
    id: 'sched-m1',
    serviceName: 'Culto de Celebração de Domingo',
    date: 'Próximo Domingo 19:00',
    role: 'Transmissão',
    volunteerId: 'user-member',
    volunteerName: 'Membro da Igreja',
    status: 'confirmed',
    notes: 'Iniciar o stream no canal @IGEAD_MT com 10 minutos de antecedência.'
  },
  {
    id: 'sched-m2',
    serviceName: 'Culto de Celebração de Domingo',
    date: 'Próximo Domingo 19:00',
    role: 'Áudio',
    volunteerId: 'user-admin',
    volunteerName: 'Operador de Som',
    status: 'confirmed',
    notes: 'Passagem de som e microfones do altar às 18:15.'
  },
  {
    id: 'sched-m3',
    serviceName: 'Culto de Celebração de Domingo',
    date: 'Próximo Domingo 19:00',
    role: 'Projeção',
    volunteerId: 'user-leader-midia',
    volunteerName: 'Carlos Rocha',
    status: 'confirmed',
    notes: 'Projeção dos versículos da Bíblia Digital e letras dos hinos.'
  },
  {
    id: 'sched-m4',
    serviceName: 'Culto de Oração de Terça',
    date: 'Próxima Terça 19:30',
    role: 'Câmeras',
    volunteerId: 'user-member',
    volunteerName: 'Membro da Igreja',
    status: 'pending',
    notes: 'Enquadramento principal do púlpito.'
  }
];

export const INITIAL_CHILD_RECORDS: ChildRecord[] = [
  {
    id: 'child-1',
    childName: 'Criança Cadastrada',
    parentName: 'Membro da Igreja',
    parentPhone: '(65) 99999-1234',
    parentAuthorized: true,
    birthDate: '22/03/2019',
    securityPin: 'KIDS-7741',
    allergyOrNotes: 'Sem restrições alimentares conhecidas.',
    checkedIn: true,
    checkInTime: '18:50'
  }
];

export const INITIAL_EVENTS: EventItem[] = [
  {
    id: 'evt-1',
    title: 'Culto de Celebração da Família',
    category: 'culto',
    date: 'Todos os Domingos',
    time: '19:00',
    location: 'Templo Sede IGEAD-MT — Pedra 90',
    speaker: 'Liderança Pastoral IGEAD-MT',
    price: 0,
    maxAttendees: 500,
    registeredUserIds: ['user-member'],
    description: 'Noite de adoração, comunhão familiar e proclamação da Palavra de Deus.',
    isHighlighted: true,
    badgeText: 'Culto Semanal'
  },
  {
    id: 'evt-2',
    title: 'Culto de Oração & Intercessão',
    category: 'oracao',
    date: 'Terças-feiras',
    time: '19:30',
    location: 'Templo Sede IGEAD-MT',
    speaker: 'Equipe de Oração da Igreja',
    price: 0,
    maxAttendees: 300,
    registeredUserIds: [],
    description: 'Tempo dedicado à oração fervorosa pelas famílias, cura dos enfermos e pela nossa igreja.',
    badgeText: 'Intercessão'
  },
  {
    id: 'evt-3',
    title: 'Culto do Grupo de Jovens',
    category: 'jovens',
    date: 'Sábados',
    time: '19:30',
    location: 'Templo Sede IGEAD-MT',
    speaker: 'Coordenação da Juventude',
    price: 0,
    maxAttendees: 250,
    registeredUserIds: [],
    description: 'Reunião alegre e edificante com adoração, estudo bíblico e comunhão entre os jovens.',
    badgeText: 'Juventude'
  }
];

export const INITIAL_PRAYERS: PrayerRequest[] = [
  {
    id: 'pray-1',
    userId: 'user-member',
    userName: 'Membro da Igreja',
    isPrivate: false,
    targetGroup: 'publico',
    title: 'Oração pela saúde da minha família e livramento de Deus',
    content: 'Irmãos da IGEAD-MT, peço oração pela saúde da minha família e para que o Senhor continue nos sustentando com paz e fé.',
    createdAt: 'Hoje',
    prayerCount: 14,
    prayedByUserIds: ['user-admin', 'user-pastor'],
    status: 'em_oracao'
  },
  {
    id: 'pray-2',
    userId: 'user-visitor',
    userName: 'Visitante',
    isPrivate: false,
    targetGroup: 'publico',
    title: 'Direcionamento de Deus no trabalho e no lar',
    content: 'Peço que a igreja interceda por uma porta aberta de trabalho e paz no coração.',
    createdAt: 'Ontem',
    prayerCount: 22,
    prayedByUserIds: ['user-pastor', 'user-member'],
    status: 'em_oracao'
  }
];

export const INITIAL_CONTRIBUTIONS: Contribution[] = [
  {
    id: 'contrib-1',
    userId: 'user-member',
    userName: 'Membro da Igreja',
    category: 'dizimo',
    amount: 150.00,
    method: 'pix',
    date: '10/10/2026',
    status: 'aprovado',
    codeReceipt: 'PIX-IGEAD-202610-1011'
  }
];

export const INITIAL_NOTIFICATIONS: PushNotification[] = [
  {
    id: 'notif-1',
    title: 'Seja Bem-Vindo à IGEAD-MT!',
    message: 'Igreja Geração Eleita — Conectado com o Céu, firme na terra. Acompanhe os cultos e a Bíblia Digital pelo app.',
    time: 'Agora',
    read: false,
    type: 'general'
  },
  {
    id: 'notif-2',
    title: 'Canal Oficial no YouTube',
    message: 'Acesse https://www.youtube.com/@IGEAD_MT para assistir aos cultos e pregações.',
    time: 'Hoje',
    read: false,
    type: 'live'
  }
];
