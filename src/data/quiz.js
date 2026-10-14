// Pytania quizu. Pierwsza odpowiedź w `a` jest poprawna (kolejność jest losowana w aplikacji).

export const QUIZ = [
  // Obwód i prąd
  {
    topic: 'Obwód',
    q: 'Prąd elektryczny to…',
    a: ['uporządkowany ruch ładunków elektrycznych', 'chaotyczny ruch atomów', 'ruch ciepła w przewodniku', 'drganie jonów w metalu'],
    why: 'Prąd to uporządkowany ruch ładunków – elektronów albo jonów.',
  },
  {
    topic: 'Obwód',
    q: 'Jakie elementy musi mieć najprostszy obwód, w którym świeci żarówka?',
    a: ['źródło napięcia, przewody i żarówkę (odbiornik), tworzące zamkniętą drogę', 'tylko żarówkę i przewód', 'baterię i wyłącznik otwarty', 'amperomierz i woltomierz'],
    why: 'Prąd płynie tylko w obwodzie zamkniętym ze źródłem napięcia.',
  },
  {
    topic: 'Obwód',
    q: 'Co się stanie po otwarciu wyłącznika w obwodzie z żarówką?',
    a: ['prąd przestanie płynąć i żarówka zgaśnie', 'żarówka zacznie świecić mocniej', 'prąd popłynie w drugą stronę', 'nic się nie zmieni'],
    why: 'Otwarty wyłącznik to przerwa w obwodzie.',
  },
  {
    topic: 'Obwód',
    q: 'Zwarcie to sytuacja, w której…',
    a: ['bieguny źródła są połączone przewodem z pominięciem odbiornika', 'obwód jest otwarty', 'żarówka jest przepalona', 'bateria jest rozładowana'],
    why: 'Przy zwarciu opór jest bardzo mały, a natężenie prądu bardzo duże – to niebezpieczne.',
  },
  {
    topic: 'Obwód',
    q: 'Na symbolu ogniwa biegun dodatni oznacza…',
    a: ['dłuższa, cienka kreska', 'krótsza, gruba kreska', 'kółko z krzyżykiem', 'prostokąt'],
    why: 'Dłuższa kreska to „+”, krótsza i grubsza to „−”.',
  },
  {
    topic: 'Obwód',
    q: 'Kółko z krzyżykiem w środku to symbol…',
    a: ['żarówki', 'amperomierza', 'silnika', 'wyłącznika'],
    why: 'Amperomierz to kółko z literą A, silnik – z literą M.',
  },
  {
    topic: 'Obwód',
    q: 'Amperomierz włączamy do obwodu…',
    a: ['szeregowo', 'równolegle', 'w dowolny sposób', 'tylko przy otwartym obwodzie'],
    why: 'Przez amperomierz musi płynąć ten sam prąd, co przez badany element.',
  },
  // Kierunki
  {
    topic: 'Kierunki',
    q: 'Umowny kierunek prądu w obwodzie to kierunek…',
    a: ['od bieguna dodatniego (+) do ujemnego (−)', 'od bieguna ujemnego (−) do dodatniego (+)', 'zawsze zgodny z ruchem wskazówek zegara', 'od żarówki do baterii'],
    why: 'Tak ustalono, zanim odkryto elektrony.',
  },
  {
    topic: 'Kierunki',
    q: 'Elektrony w przewodach obwodu poruszają się…',
    a: ['od „−” do „+”, przeciwnie do umownego kierunku prądu', 'od „+” do „−”, zgodnie z kierunkiem prądu', 'nie poruszają się wcale', 'raz w jedną, raz w drugą stronę'],
    why: 'Elektrony są naładowane ujemnie, więc przyciąga je biegun dodatni.',
  },
  {
    topic: 'Kierunki',
    q: 'Co się stanie z kierunkiem prądu, gdy odwrócimy baterię w obwodzie?',
    a: ['zmieni się na przeciwny', 'nie zmieni się', 'prąd przestanie płynąć', 'zmieni się tylko ruch elektronów'],
    why: 'Zamieniają się miejscami bieguny „+” i „−”, więc odwraca się i prąd, i ruch elektronów.',
  },
  // Ośrodki
  {
    topic: 'Ośrodki',
    q: 'W metalach prąd elektryczny to uporządkowany ruch…',
    a: ['elektronów swobodnych', 'jonów dodatnich', 'jonów dodatnich i ujemnych', 'protonów'],
    why: 'Jony w metalu są uwięzione w sieci krystalicznej.',
  },
  {
    topic: 'Ośrodki',
    q: 'W cieczach (elektrolitach) prąd to uporządkowany ruch…',
    a: ['jonów dodatnich i ujemnych', 'tylko elektronów', 'cząsteczek wody', 'protonów'],
    why: 'Np. w wodzie z solą płyną jony Na⁺ i Cl⁻.',
  },
  {
    topic: 'Ośrodki',
    q: 'W zjonizowanych gazach prąd to ruch…',
    a: ['jonów i elektronów', 'tylko jonów dodatnich', 'tylko cząsteczek gazu', 'fotonów'],
    why: 'Przykłady: błyskawica, neonówka, świetlówka.',
  },
  {
    topic: 'Ośrodki',
    q: 'Który z przykładów to przepływ prądu w gazie?',
    a: ['błyskawica', 'prąd w kablu ładowarki', 'ładowanie akumulatora', 'prąd w grafitowym ołówku'],
    why: 'Podczas burzy powietrze zostaje zjonizowane.',
  },
  // Skutki
  {
    topic: 'Skutki',
    q: 'Działanie czajnika elektrycznego wykorzystuje skutek…',
    a: ['cieplny', 'chemiczny', 'magnetyczny', 'dźwiękowy'],
    why: 'Grzałka zamienia energię elektryczną na ciepło.',
  },
  {
    topic: 'Skutki',
    q: 'Ładowanie akumulatora to przykład skutku…',
    a: ['chemicznego', 'świetlnego', 'mechanicznego', 'dźwiękowego'],
    why: 'W akumulatorze zachodzą reakcje chemiczne.',
  },
  {
    topic: 'Skutki',
    q: 'Wentylator wykorzystuje głównie skutek…',
    a: ['mechaniczny', 'cieplny', 'chemiczny', 'świetlny'],
    why: 'Silnik elektryczny wprawia łopatki w ruch.',
  },
  // Wielkości i jednostki
  {
    topic: 'Wzory',
    q: 'Napięcie elektryczne to…',
    a: [
      'iloraz energii potrzebnej do przeniesienia ładunku i wartości tego ładunku',
      'iloraz ładunku i czasu jego przepływu',
      'iloczyn natężenia i czasu',
      'szybkość ruchu elektronów',
    ],
    why: 'U = E / q.',
  },
  {
    topic: 'Wzory',
    q: 'Natężenie prądu to…',
    a: ['iloraz ładunku przepływającego przez przewodnik i czasu jego przepływu', 'iloraz energii i ładunku', 'iloczyn napięcia i ładunku', 'iloczyn mocy i czasu'],
    why: 'I = q / t.',
  },
  { topic: 'Wzory', q: 'Jednostką napięcia jest…', a: ['wolt (V)', 'amper (A)', 'kulomb (C)', 'wat (W)'] },
  { topic: 'Wzory', q: 'Jednostką natężenia prądu jest…', a: ['amper (A)', 'wolt (V)', 'dżul (J)', 'kulomb (C)'] },
  { topic: 'Wzory', q: 'Jednostką ładunku elektrycznego jest…', a: ['kulomb (C)', 'amper (A)', 'wat (W)', 'dżul (J)'] },
  { topic: 'Wzory', q: 'Jednostką mocy jest…', a: ['wat (W)', 'dżul (J)', 'wolt (V)', 'kilowatogodzina (kWh)'] },
  { topic: 'Wzory', q: '1 V to inaczej…', a: ['1 J / 1 C', '1 C / 1 s', '1 A · 1 s', '1 W · 1 s'], why: 'U = E / q, więc wolt = dżul na kulomb.' },
  { topic: 'Wzory', q: '1 A to inaczej…', a: ['1 C / 1 s', '1 J / 1 C', '1 V · 1 s', '1 W / 1 s'], why: 'I = q / t, więc amper = kulomb na sekundę.' },
  { topic: 'Wzory', q: 'Pracę prądu obliczamy ze wzoru…', a: ['W = U · I · t', 'W = U / I', 'W = q / t', 'W = U · q · t'] },
  { topic: 'Wzory', q: 'Moc prądu obliczamy ze wzoru…', a: ['P = U · I', 'P = U / I', 'P = I · t', 'P = q · t'] },
  { topic: 'Wzory', q: 'Kilowatogodzina (kWh) to jednostka…', a: ['energii (pracy)', 'mocy', 'napięcia', 'ładunku'], why: '1 kWh = 3 600 000 J.' },
  { topic: 'Wzory', q: 'Amperogodzina (Ah) to jednostka…', a: ['ładunku', 'natężenia', 'mocy', 'czasu'], why: '1 Ah = 3600 C – np. pojemność akumulatora.' },
  // Rachunki
  { topic: 'Rachunki', q: '50 mA to…', a: ['0,05 A', '0,005 A', '0,5 A', '5 A'], why: '50 · 0,001 A = 0,05 A.' },
  { topic: 'Rachunki', q: '2,5 kV to…', a: ['2500 V', '250 V', '25 000 V', '0,0025 V'] },
  { topic: 'Rachunki', q: '1 kWh to…', a: ['3 600 000 J', '1000 J', '3600 J', '360 000 J'], why: '1000 W · 3600 s = 3 600 000 J.' },
  { topic: 'Rachunki', q: '1 Ah to…', a: ['3600 C', '60 C', '1000 C', '1 C'], why: '1 A · 3600 s = 3600 C.' },
  { topic: 'Rachunki', q: 'Napięcie 12 V, ładunek 20 C. Ile wynosi energia?', a: ['240 J', '1,67 J', '32 J', '8 J'], why: 'E = U · q = 12 V · 20 C = 240 J.' },
  { topic: 'Rachunki', q: 'Natężenie 50 mA, czas 3 s. Jaki ładunek przepłynął?', a: ['0,15 C', '0,015 C', '150 C', '16,7 C'], why: 'q = I · t = 0,05 A · 3 s = 0,15 C.' },
  { topic: 'Rachunki', q: 'Żarówka 21 W zasilana napięciem 12 V. Jakie jest natężenie prądu?', a: ['1,75 A', '252 A', '0,57 A', '9 A'], why: 'I = P / U = 21 W : 12 V = 1,75 A.' },
  { topic: 'Rachunki', q: 'Natężenie 5 A, czas 1 h. Jaki ładunek przepłynął?', a: ['18 000 C', '5 C', '300 C', '720 C'], why: 'q = 5 A · 3600 s = 18 000 C.' },
  { topic: 'Rachunki', q: 'Czajnik o mocy 2 kW pracuje 30 minut. Ile energii zużyje?', a: ['1 kWh', '60 kWh', '2 kWh', '0,5 kWh'], why: 'W = P · t = 2 kW · 0,5 h = 1 kWh.' },
  { topic: 'Rachunki', q: 'Urządzenie: 230 V, 2 A. Jaka jest jego moc?', a: ['460 W', '115 W', '232 W', '0,0087 W'], why: 'P = U · I = 230 V · 2 A = 460 W.' },
]
