import { getChapterFromLocalCache, saveChapterToLocalCache, BOOK_ID_TO_HELLOAO } from '../services/bibleService';

export interface BibleBookInfo {
  id: string;
  name: string;
  abbrev: string;
  testament: 'AT' | 'NT';
  category: string;
  chaptersCount: number;
  helloAoId: string;
}

export interface BibleVerseItem {
  number: number;
  text: string;
}

export interface UserVerseNote {
  id: string;
  bookId: string;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  note: string;
  createdAt: string;
}

export interface UserVerseFavorite {
  id: string;
  bookId: string;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  savedAt: string;
}

// All 66 Books of the Christian Canon (39 AT + 27 NT) with official HelloAO mapping
export const BIBLE_66_BOOKS: BibleBookInfo[] = [
  // Antigo Testamento (39 Livros)
  // Pentateuco
  { id: 'gn', helloAoId: 'GEN', name: 'Gênesis', abbrev: 'Gn', testament: 'AT', category: 'Pentateuco', chaptersCount: 50 },
  { id: 'ex', helloAoId: 'EXO', name: 'Êxodo', abbrev: 'Êx', testament: 'AT', category: 'Pentateuco', chaptersCount: 40 },
  { id: 'lv', helloAoId: 'LEV', name: 'Levítico', abbrev: 'Lv', testament: 'AT', category: 'Pentateuco', chaptersCount: 27 },
  { id: 'nm', helloAoId: 'NUM', name: 'Números', abbrev: 'Nm', testament: 'AT', category: 'Pentateuco', chaptersCount: 36 },
  { id: 'dt', helloAoId: 'DEU', name: 'Deuteronômio', abbrev: 'Dt', testament: 'AT', category: 'Pentateuco', chaptersCount: 34 },
  // Históricos
  { id: 'js', helloAoId: 'JOS', name: 'Josué', abbrev: 'Js', testament: 'AT', category: 'Históricos', chaptersCount: 24 },
  { id: 'jz', helloAoId: 'JDG', name: 'Juízes', abbrev: 'Jz', testament: 'AT', category: 'Históricos', chaptersCount: 21 },
  { id: 'rt', helloAoId: 'RUT', name: 'Rute', abbrev: 'Rt', testament: 'AT', category: 'Históricos', chaptersCount: 4 },
  { id: '1sm', helloAoId: '1SA', name: '1 Samuel', abbrev: '1Sm', testament: 'AT', category: 'Históricos', chaptersCount: 31 },
  { id: '2sm', helloAoId: '2SA', name: '2 Samuel', abbrev: '2Sm', testament: 'AT', category: 'Históricos', chaptersCount: 24 },
  { id: '1rs', helloAoId: '1KI', name: '1 Reis', abbrev: '1Rs', testament: 'AT', category: 'Históricos', chaptersCount: 22 },
  { id: '2rs', helloAoId: '2KI', name: '2 Reis', abbrev: '2Rs', testament: 'AT', category: 'Históricos', chaptersCount: 25 },
  { id: '1cr', helloAoId: '1CH', name: '1 Crônicas', abbrev: '1Cr', testament: 'AT', category: 'Históricos', chaptersCount: 29 },
  { id: '2cr', helloAoId: '2CH', name: '2 Crônicas', abbrev: '2Cr', testament: 'AT', category: 'Históricos', chaptersCount: 36 },
  { id: 'ed', helloAoId: 'EZR', name: 'Esdras', abbrev: 'Ed', testament: 'AT', category: 'Históricos', chaptersCount: 10 },
  { id: 'ne', helloAoId: 'NEH', name: 'Neemias', abbrev: 'Ne', testament: 'AT', category: 'Históricos', chaptersCount: 13 },
  { id: 'et', helloAoId: 'EST', name: 'Ester', abbrev: 'Et', testament: 'AT', category: 'Históricos', chaptersCount: 10 },
  // Poéticos e Sabedoria
  { id: 'jo_at', helloAoId: 'JOB', name: 'Jó', abbrev: 'Jó', testament: 'AT', category: 'Poéticos', chaptersCount: 42 },
  { id: 'sl', helloAoId: 'PSA', name: 'Salmos', abbrev: 'Sl', testament: 'AT', category: 'Poéticos', chaptersCount: 150 },
  { id: 'pv', helloAoId: 'PRO', name: 'Provérbios', abbrev: 'Pv', testament: 'AT', category: 'Poéticos', chaptersCount: 31 },
  { id: 'ec', helloAoId: 'ECC', name: 'Eclesiastes', abbrev: 'Ec', testament: 'AT', category: 'Poéticos', chaptersCount: 12 },
  { id: 'ct', helloAoId: 'SNG', name: 'Cantares', abbrev: 'Ct', testament: 'AT', category: 'Poéticos', chaptersCount: 8 },
  // Profetas Maiores
  { id: 'is', helloAoId: 'ISA', name: 'Isaías', abbrev: 'Is', testament: 'AT', category: 'Profetas Maiores', chaptersCount: 66 },
  { id: 'jr', helloAoId: 'JER', name: 'Jeremias', abbrev: 'Jr', testament: 'AT', category: 'Profetas Maiores', chaptersCount: 52 },
  { id: 'lm', helloAoId: 'LAM', name: 'Lamentações', abbrev: 'Lm', testament: 'AT', category: 'Profetas Maiores', chaptersCount: 5 },
  { id: 'ez', helloAoId: 'EZK', name: 'Ezequiel', abbrev: 'Ez', testament: 'AT', category: 'Profetas Maiores', chaptersCount: 48 },
  { id: 'dn', helloAoId: 'DAN', name: 'Daniel', abbrev: 'Dn', testament: 'AT', category: 'Profetas Maiores', chaptersCount: 12 },
  // Profetas Menores
  { id: 'os', helloAoId: 'HOS', name: 'Oseias', abbrev: 'Os', testament: 'AT', category: 'Profetas Menores', chaptersCount: 14 },
  { id: 'jl', helloAoId: 'JOL', name: 'Joel', abbrev: 'Jl', testament: 'AT', category: 'Profetas Menores', chaptersCount: 3 },
  { id: 'am', helloAoId: 'AMO', name: 'Amós', abbrev: 'Am', testament: 'AT', category: 'Profetas Menores', chaptersCount: 9 },
  { id: 'ob', helloAoId: 'OBA', name: 'Obadias', abbrev: 'Ob', testament: 'AT', category: 'Profetas Menores', chaptersCount: 1 },
  { id: 'jn', helloAoId: 'JON', name: 'Jonas', abbrev: 'Jn', testament: 'AT', category: 'Profetas Menores', chaptersCount: 4 },
  { id: 'mq', helloAoId: 'MIC', name: 'Miqueias', abbrev: 'Mq', testament: 'AT', category: 'Profetas Menores', chaptersCount: 7 },
  { id: 'na', helloAoId: 'NAM', name: 'Naum', abbrev: 'Na', testament: 'AT', category: 'Profetas Menores', chaptersCount: 3 },
  { id: 'hc', helloAoId: 'HAB', name: 'Habacuque', abbrev: 'Hc', testament: 'AT', category: 'Profetas Menores', chaptersCount: 3 },
  { id: 'sf', helloAoId: 'ZEP', name: 'Sofonias', abbrev: 'Sf', testament: 'AT', category: 'Profetas Menores', chaptersCount: 3 },
  { id: 'ag', helloAoId: 'HAG', name: 'Ageu', abbrev: 'Ag', testament: 'AT', category: 'Profetas Menores', chaptersCount: 2 },
  { id: 'zc', helloAoId: 'ZEC', name: 'Zacarias', abbrev: 'Zc', testament: 'AT', category: 'Profetas Menores', chaptersCount: 14 },
  { id: 'ml', helloAoId: 'MAL', name: 'Malaquias', abbrev: 'Ml', testament: 'AT', category: 'Profetas Menores', chaptersCount: 4 },

  // Novo Testamento (27 Livros)
  // Evangelhos
  { id: 'mt', helloAoId: 'MAT', name: 'Mateus', abbrev: 'Mt', testament: 'NT', category: 'Evangelhos', chaptersCount: 28 },
  { id: 'mc', helloAoId: 'MRK', name: 'Marcos', abbrev: 'Mc', testament: 'NT', category: 'Evangelhos', chaptersCount: 16 },
  { id: 'lc', helloAoId: 'LUK', name: 'Lucas', abbrev: 'Lc', testament: 'NT', category: 'Evangelhos', chaptersCount: 24 },
  { id: 'jo', helloAoId: 'JHN', name: 'João', abbrev: 'Jo', testament: 'NT', category: 'Evangelhos', chaptersCount: 21 },
  // Histórico
  { id: 'at', helloAoId: 'ACT', name: 'Atos', abbrev: 'At', testament: 'NT', category: 'Histórico', chaptersCount: 28 },
  // Epístolas Paulinas
  { id: 'rm', helloAoId: 'ROM', name: 'Romanos', abbrev: 'Rm', testament: 'NT', category: 'Cartas Paulinas', chaptersCount: 16 },
  { id: '1co', helloAoId: '1CO', name: '1 Coríntios', abbrev: '1Co', testament: 'NT', category: 'Cartas Paulinas', chaptersCount: 16 },
  { id: '2co', helloAoId: '2CO', name: '2 Coríntios', abbrev: '2Co', testament: 'NT', category: 'Cartas Paulinas', chaptersCount: 13 },
  { id: 'gl', helloAoId: 'GAL', name: 'Gálatas', abbrev: 'Gl', testament: 'NT', category: 'Cartas Paulinas', chaptersCount: 6 },
  { id: 'ef', helloAoId: 'EPH', name: 'Efésios', abbrev: 'Ef', testament: 'NT', category: 'Cartas Paulinas', chaptersCount: 6 },
  { id: 'fp', helloAoId: 'PHP', name: 'Filipenses', abbrev: 'Fp', testament: 'NT', category: 'Cartas Paulinas', chaptersCount: 4 },
  { id: 'cl', helloAoId: 'COL', name: 'Colossenses', abbrev: 'Cl', testament: 'NT', category: 'Cartas Paulinas', chaptersCount: 4 },
  { id: '1ts', helloAoId: '1TH', name: '1 Tessalonicenses', abbrev: '1Ts', testament: 'NT', category: 'Cartas Paulinas', chaptersCount: 5 },
  { id: '2ts', helloAoId: '2TH', name: '2 Tessalonicenses', abbrev: '2Ts', testament: 'NT', category: 'Cartas Paulinas', chaptersCount: 3 },
  { id: '1tm', helloAoId: '1TI', name: '1 Timóteo', abbrev: '1Tm', testament: 'NT', category: 'Cartas Paulinas', chaptersCount: 6 },
  { id: '2tm', helloAoId: '2TI', name: '2 Timóteo', abbrev: '2Tm', testament: 'NT', category: 'Cartas Paulinas', chaptersCount: 4 },
  { id: 'tt', helloAoId: 'TIT', name: 'Tito', abbrev: 'Tt', testament: 'NT', category: 'Cartas Paulinas', chaptersCount: 3 },
  { id: 'fm', helloAoId: 'PHM', name: 'Filemom', abbrev: 'Fm', testament: 'NT', category: 'Cartas Paulinas', chaptersCount: 1 },
  // Epístolas Gerais
  { id: 'hb', helloAoId: 'HEB', name: 'Hebreus', abbrev: 'Hb', testament: 'NT', category: 'Cartas Gerais', chaptersCount: 13 },
  { id: 'tg', helloAoId: 'JAS', name: 'Tiago', abbrev: 'Tg', testament: 'NT', category: 'Cartas Gerais', chaptersCount: 5 },
  { id: '1pe', helloAoId: '1PE', name: '1 Pedro', abbrev: '1Pe', testament: 'NT', category: 'Cartas Gerais', chaptersCount: 5 },
  { id: '2pe', helloAoId: '2PE', name: '2 Pedro', abbrev: '2Pe', testament: 'NT', category: 'Cartas Gerais', chaptersCount: 3 },
  { id: '1jo', helloAoId: '1JN', name: '1 João', abbrev: '1Jo', testament: 'NT', category: 'Cartas Gerais', chaptersCount: 5 },
  { id: '2jo', helloAoId: '2JN', name: '2 João', abbrev: '2Jo', testament: 'NT', category: 'Cartas Gerais', chaptersCount: 1 },
  { id: '3jo', helloAoId: '3JN', name: '3 João', abbrev: '3Jo', testament: 'NT', category: 'Cartas Gerais', chaptersCount: 1 },
  { id: 'jd', helloAoId: 'JUD', name: 'Judas', abbrev: 'Jd', testament: 'NT', category: 'Cartas Gerais', chaptersCount: 1 },
  // Profético
  { id: 'ap', helloAoId: 'REV', name: 'Apocalipse', abbrev: 'Ap', testament: 'NT', category: 'Profético', chaptersCount: 22 }
];

// Pre-seeded canonical verified passages from Free Use Bible / Bíblia Livre (CC BY 3.0 & Domínio Público)
// Guarantees zero blank screens on first offline launch before any network fetch
export const SEED_PASSAGES: Record<string, BibleVerseItem[]> = {
  // 1 Pedro 2 (Versículo-Chave da Igreja: Geração Eleita / Escolhida)
  '1pe-2': [
    { number: 1, text: 'Deixando, pois, toda a malícia, e todo o engano, e fingimentos, e invejas, e todas as murmurações,' },
    { number: 2, text: 'Desejai afetuosamente, como meninos recém-nascidos, o leite racional, não falsificado, para que por ele vades crescendo;' },
    { number: 3, text: 'Se é que já provastes que o Senhor é bom.' },
    { number: 4, text: 'E, chegando-vos para ele, pedra viva, reprovada, na verdade, pelos homens, mas para com Deus eleita e preciosa,' },
    { number: 5, text: 'Vós também, como pedras vivas, sois edificados casa espiritual e sacerdócio santo, para oferecer sacrifícios espirituais agradáveis a Deus por Jesus Cristo.' },
    { number: 6, text: 'Por isso também na Escritura se contém: Eis que ponho em Sião a pedra principal da esquina, eleita e preciosa; e quem nela crer não será confundido.' },
    { number: 7, text: 'E assim para vós, os que credes, é preciosa, mas, para os rebeldes, a pedra que os edificadores reprovaram, essa foi posta por cabeça da esquina;' },
    { number: 8, text: 'E uma pedra de tropeço e rocha de escândalo, para aqueles que tropeçam na palavra, sendo desobedientes; para o que também foram destinados.' },
    { number: 9, text: 'Mas vós sois a GERAÇÃO ELEITA, o sacerdócio real, a nação santa, o povo adquirido, para que anuncieis as virtudes daquele que vos chamou das trevas para a sua maravilhosa luz;' },
    { number: 10, text: 'Vós, que em outro tempo não éreis povo, mas agora sois povo de Deus; que não tínheis alcançado misericórdia, mas agora alcançastes misericórdia.' }
  ],
  // Salmos 23
  'sl-23': [
    { number: 1, text: 'O Senhor é o meu pastor, nada me faltará.' },
    { number: 2, text: 'Deitar-me faz em verdes pastos, guia-me mansamente a águas tranquilas.' },
    { number: 3, text: 'Refrigera a minha alma; guia-me pelas veredas da justiça, por amor do seu nome.' },
    { number: 4, text: 'Ainda que eu andasse pelo vale da sombra da morte, não temeria mal algum, porque tu estás comigo; a tua vara e o teu cajado me consolam.' },
    { number: 5, text: 'Preparas uma mesa perante mim na presença dos meus inimigos, unges a minha cabeça com óleo, o meu cálice transborda.' },
    { number: 6, text: 'Certamente que a bondade e a misericórdia me seguirão todos os dias da minha vida; e habitarei na casa do Senhor por longos dias.' }
  ],
  // Salmos 91
  'sl-91': [
    { number: 1, text: 'Aquele que habita no esconderijo do Altíssimo, à sombra do Onipotente descansará.' },
    { number: 2, text: 'Direi do Senhor: Ele é o meu refúgio e a minha fortaleza, o meu Deus, em quem confio.' },
    { number: 3, text: 'Porque ele te livrará do laço do passarinheiro, e da peste perniciosa.' },
    { number: 4, text: 'Ele te cobrirá com as suas penas, e debaixo das suas asas te confiarás; a sua verdade será o teu escudo e broquel.' },
    { number: 5, text: 'Não terás medo do terror de noite nem da seta que voa de dia.' },
    { number: 6, text: 'Nem da peste que anda na escuridão, nem da mortandade que assola ao meio-dia.' },
    { number: 7, text: 'Mil cairão ao teu lado, e dez mil à tua direita, mas não chegará a ti.' },
    { number: 11, text: 'Porque aos seus anjos dará ordem a teu respeito, para te guardarem em todos os teus caminhos.' },
    { number: 14, text: 'Porquanto tão encarecidamente me amou, também eu o livrarei; pô-lo-ei em retiro alto, porque conheceu o meu nome.' },
    { number: 15, text: 'Ele me invocará, e eu lhe responderei; estarei com ele na angústia; dela o retirarei, e o glorificarei.' },
    { number: 16, text: 'Fartá-lo-ei com longura de dias, e lhe mostrarei a minha salvação.' }
  ],
  // Salmos 121
  'sl-121': [
    { number: 1, text: 'Levantarei os meus olhos para os montes, de onde vem o meu socorro.' },
    { number: 2, text: 'O meu socorro vem do Senhor que fez o céu e a terra.' },
    { number: 3, text: 'Não deixará vacilar o teu pé; aquele que te guarda não tosquenejará.' },
    { number: 4, text: 'Eis que não tosquenejará nem dormirá o guarda de Israel.' },
    { number: 5, text: 'O Senhor é quem te guarda; o Senhor é a tua sombra à tua direita.' },
    { number: 6, text: 'O sol não te molestará de dia nem a lua de noite.' },
    { number: 7, text: 'O Senhor te guardará de todo o mal; guardará a tua alma.' },
    { number: 8, text: 'O Senhor guardará a tua entrada e a tua saída, desde agora e para sempre.' }
  ],
  // João 3
  'jo-3': [
    { number: 1, text: 'E havia entre os fariseus um homem, chamado Nicodemos, príncipe dos judeus.' },
    { number: 2, text: 'Este foi ter de noite com Jesus, e disse-lhe: Rabi, bem sabemos que és Mestre, vindo de Deus; porque ninguém pode fazer estes sinais que tu fazes, se Deus não for com ele.' },
    { number: 3, text: 'Jesus respondeu, e disse-lhe: Na verdade, na verdade te digo que aquele que não nascer de novo, não pode ver o reino de Deus.' },
    { number: 16, text: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.' },
    { number: 17, text: 'Porque Deus enviou o seu Filho ao mundo, não para que condenasse o mundo, mas para que o mundo fosse salvo por ele.' },
    { number: 18, text: 'Quem crê nele não é condenado; mas quem não crê já está condenado, porquanto não crê no nome do unigênito Filho de Deus.' }
  ],
  // Romanos 8
  'rm-8': [
    { number: 1, text: 'Portanto, agora nenhuma condenação há para os que estão em Cristo Jesus, que não andam segundo a carne, mas segundo o Espírito.' },
    { number: 14, text: 'Porque todos os que são guiados pelo Espírito de Deus esses são filhos de Deus.' },
    { number: 15, text: 'Porque não recebestes o espírito de escravidão, para outra vez estardes em temor, mas recebestes o Espírito de adoção de filhos, pelo qual clamamos: Aba, Pai.' },
    { number: 28, text: 'E sabemos que todas as coisas concorrem para o bem daqueles que amam a Deus, daqueles que são chamados segundo o seu propósito.' },
    { number: 31, text: 'Que diremos, pois, a estas coisas? Se Deus é por nós, quem será contra nós?' },
    { number: 37, text: 'Mas em todas estas coisas somos mais do que vencedores, por aquele que nos amou.' },
    { number: 38, text: 'Porque estou certo de que, nem a morte, nem a vida, nem os anjos, nem os principados, nem as potestades, nem o presente, nem o porvir,' },
    { number: 39, text: 'Nem a altura, nem a profundidade, nem alguma outra criatura nos poderá separar do amor de Deus, que está em Cristo Jesus nosso Senhor.' }
  ],
  // Filipenses 4
  'fp-4': [
    { number: 4, text: 'Regozijai-vos sempre no Senhor; outra vez digo, regozijai-vos.' },
    { number: 6, text: 'Não estejais inquietos por coisa alguma; antes as vossas petições sejam em tudo conhecidas diante de Deus pela oração e súplica, com ação de graças.' },
    { number: 7, text: 'E a paz de Deus, que excede todo o entendimento, guardará os vossos corações e os vossos sentimentos em Cristo Jesus.' },
    { number: 13, text: 'Posso todas as coisas em Cristo que me fortalece.' },
    { number: 19, text: 'O meu Deus, segundo as suas riquezas, suprirá todas as vossas necessidades em glória, por Cristo Jesus.' }
  ],
  // Mateus 5 (As Bem-Aventuranças)
  'mt-5': [
    { number: 1, text: 'E Jesus, vendo a multidão, subiu a um monte, e, assentando-se, chegaram-se a ele os seus discípulos;' },
    { number: 2, text: 'E, abrindo a sua boca, os ensinava, dizendo:' },
    { number: 3, text: 'Bem-aventurados os pobres de espírito, porque deles é o reino dos céus;' },
    { number: 4, text: 'Bem-aventurados os que choram, porque eles serão consolados;' },
    { number: 5, text: 'Bem-aventurados os mansos, porque eles herdarão a terra;' },
    { number: 6, text: 'Bem-aventurados os que têm fome e sede de justiça, porque eles serão fartos;' },
    { number: 7, text: 'Bem-aventurados os misericordiosos, porque eles alcançarão misericórdia;' },
    { number: 8, text: 'Bem-aventurados os limpos de coração, porque eles verão a Deus;' },
    { number: 9, text: 'Bem-aventurados os pacificadores, porque eles serão chamados filhos de Deus;' },
    { number: 10, text: 'Bem-aventurados os que sofrem perseguição por causa da justiça, porque deles é o reino dos céus;' },
    { number: 14, text: 'Vós sois a luz do mundo; não se pode esconder uma cidade edificada sobre um monte;' },
    { number: 16, text: 'Assim resplandeça a vossa luz diante dos homens, para que vejam as vossas boas obras e glorifiquem a vosso Pai, que está nos céus.' }
  ],
  // Mateus 6 (O Pai Nosso)
  'mt-6': [
    { number: 9, text: 'Portanto, vós orareis assim: Pai nosso, que estás nos céus, santificado seja o teu nome;' },
    { number: 10, text: 'Venha o teu reino, seja feita a tua vontade, assim na terra como no céu;' },
    { number: 11, text: 'O pão nosso de cada dia nos dá hoje;' },
    { number: 12, text: 'E perdoa-nos as nossas dívidas, assim como nós perdoamos aos nossos devedores;' },
    { number: 13, text: 'E não nos conduzas à tentação; mas livra-nos do mal; porque teu é o reino, e o poder, e a glória, para sempre. Amém.' }
  ],
  // 1 Coríntios 13
  '1co-13': [
    { number: 1, text: 'Ainda que eu falasse as línguas dos homens e dos anjos, e não tivesse amor, seria como o metal que soa ou como o sino que tine.' },
    { number: 4, text: 'O amor é sofredor, é benigno; o amor não é invejoso; o amor não trata com leviandade, não se ensoberbece.' },
    { number: 7, text: 'Tudo sofre, tudo crê, tudo espera, tudo suporta.' },
    { number: 8, text: 'O amor nunca falha; mas havendo profecias, serão aniquiladas; havendo línguas, cessarão; havendo ciência, desaparecerá;' },
    { number: 13, text: 'Agora, pois, permanecem a fé, a esperança e o amor, estes três, mas o maior destes é o amor.' }
  ],
  // Provérbios 3
  'pv-3': [
    { number: 1, text: 'Filho meu, não te esqueças da minha lei, e o teu coração guarde os meus mandamentos.' },
    { number: 3, text: 'Não te desamparem a benignidade e a fidelidade; ata-as ao teu pescoço; escreve-as na tábua do teu coração.' },
    { number: 5, text: 'Confia no Senhor de todo o teu coração, e não te estribes no teu próprio entendimento.' },
    { number: 6, text: 'Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas.' },
    { number: 9, text: 'Honra ao Senhor com a tua fazenda, e com as primícias de toda a tua renda;' },
    { number: 10, text: 'E se encherão os teus celeiros abundantemente, e trasbordarão de mosto os teus lagares.' }
  ],
  // Gênesis 1
  'gn-1': [
    { number: 1, text: 'No princípio criou Deus os céus e a terra.' },
    { number: 2, text: 'E a terra era sem forma e vazia; e havia trevas sobre a face do abismo; e o Espírito de Deus se movia sobre a face das águas.' },
    { number: 3, text: 'E disse Deus: Haja luz; e houve luz.' },
    { number: 4, text: 'E viu Deus que era boa a luz; e fez Deus separação entre a luz e as trevas.' },
    { number: 26, text: 'E disse Deus: Façamos o homem à nossa imagem, conforme a nossa semelhança; e domine sobre os peixes do mar, e sobre as aves dos céus, e sobre o gado, e sobre toda a terra.' },
    { number: 27, text: 'E criou Deus o homem à sua imagem; à imagem de Deus o criou; homem e mulher os criou.' }
  ],
  // Isaías 40
  'is-40': [
    { number: 28, text: 'Não sabes, não ouviste que o eterno Deus, o Senhor, o Criador dos fins da terra, nem se cansa nem se fatiga? É inescrutável o seu entendimento.' },
    { number: 29, text: 'Dá força ao cansado, e multiplica as forças ao que não tem nenhum vigor.' },
    { number: 30, text: 'Os jovens se cansarão e se fatigarão, e os moços certamente cairão;' },
    { number: 31, text: 'Mas os que esperam no Senhor renovarão as forças, subirão com asas como águias; correrão, e não se cansarão; caminharão, e não se fatigarão.' }
  ],
  // Efésios 6 (Armadura de Deus)
  'ef-6': [
    { number: 10, text: 'No demais, irmãos meus, fortalecei-vos no Senhor e na força do seu poder.' },
    { number: 11, text: 'Revesti-vos de toda a armadura de Deus, para que possais estar firmes contra as astutas ciladas do diabo.' },
    { number: 12, text: 'Porque não temos que lutar contra a carne e o sangue, mas, sim, contra os principados, contra as potestades, contra os príncipes das trevas deste século.' },
    { number: 14, text: 'Estai, pois, firmes, tendo cingidos os vossos lombos com a verdade, e vestida a couraça da justiça;' },
    { number: 17, text: 'Tomai também o capacete da salvação, e a espada do Espírito, que é a palavra de Deus.' }
  ]
};

// Automatically seed cache on initial import if not already populated
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  try {
    Object.entries(SEED_PASSAGES).forEach(([key, verses]) => {
      const [bookId, chStr] = key.split('-');
      const ch = parseInt(chStr, 10);
      if (!getChapterFromLocalCache('por_blj', bookId, ch)) {
        saveChapterToLocalCache('por_blj', bookId, ch, verses);
      }
    });
  } catch (e) {
    // LocalStorage might be restricted, continue gracefully
  }
}

/**
 * Synchronous resolver for initial UI render:
 * 1. Checks local cache for current translation
 * 2. Checks pre-seeded canonical passages
 * 3. Never produces synthetic placeholder text. Returns empty array if awaiting async fetch.
 */
export function getChapterVerses(
  bookId: string,
  chapter: number,
  translation: string = 'por_blj'
): BibleVerseItem[] {
  // 1. Check local persistent cache
  const cached = getChapterFromLocalCache(translation, bookId, chapter);
  if (cached && cached.length > 0) {
    return cached;
  }

  // 2. Check seed passages
  const key = `${bookId.toLowerCase()}-${chapter}`;
  if (SEED_PASSAGES[key]) {
    return SEED_PASSAGES[key];
  }

  // 3. Return empty array while waiting for async fetch (NO synthetic placeholder verses)
  return [];
}

/**
 * Robust Bible reference parser supporting all Portuguese book names,
 * abbreviations, and chapter:verse combinations.
 * Examples: "João 3:16", "1 Pedro 2:9", "Sl 23", "Gênesis 1:1", "Apocalipse 21"
 */
export function parseBiblicalReference(query: string): {
  book?: BibleBookInfo;
  chapter?: number;
  verse?: number;
} | null {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return null;

  // Normalize accents for fuzzy matching
  const normalize = (s: string) =>
    s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  const normQuery = normalize(trimmed);

  for (const book of BIBLE_66_BOOKS) {
    const normName = normalize(book.name);
    const normAbbrev = normalize(book.abbrev);

    // Also check common aliases (e.g. Salmo instead of Salmos, 1Pe instead of 1 Pedro)
    const aliases = [
      normName,
      normAbbrev,
      book.id.toLowerCase(),
      book.helloAoId.toLowerCase()
    ];
    if (normName === 'salmos') aliases.push('salmo', 'ps');
    if (normName === 'cantares') aliases.push('canticos', 'cantico');
    if (normName === 'apocalipse') aliases.push('revelacao', 'rev');

    for (const alias of aliases) {
      if (normQuery.startsWith(alias)) {
        const rest = normQuery.slice(alias.length).trim();
        // Match: "3:16" or "3, 16" or "3" or " 3:16"
        const match = rest.match(/^[:\s,]*(\d+)(?:[:,\s]+(\d+))?/);
        if (match) {
          const ch = parseInt(match[1], 10);
          const v = match[2] ? parseInt(match[2], 10) : undefined;
          return {
            book,
            chapter: Math.min(Math.max(ch, 1), book.chaptersCount),
            verse: v
          };
        }
        return { book, chapter: 1 };
      }
    }
  }

  return null;
}
