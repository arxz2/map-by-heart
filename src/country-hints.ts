import { capitals } from './country-capitals'
import type { HintPhotoId } from './hint-photos'

export type HintKind = 'capital' | 'center' | 'landmark' | 'person' | 'character' | 'animation' | 'history' | 'myth' | 'music'
type LocalizedText = Readonly<Record<string, string>> & { en: string; ru: string }
type Hint = { kind: HintKind; name: LocalizedText; note?: LocalizedText; photoId?: HintPhotoId }

function hint(kind: Exclude<HintKind, 'capital'>, en: string, ru: string, enNote: string, ruNote: string, photoId?: HintPhotoId): Hint {
  return { kind, name: { en, ru }, note: { en: enNote, ru: ruNote }, photoId }
}

const paddington = hint('character', 'Paddington Bear', 'Медвежонок Паддингтон',
  'The marmalade-loving bear in Michael Bond’s books comes from Peru and moves to London.',
  'Любитель мармелада из книг Майкла Бонда родом из Перу и переезжает в Лондон.', 'paddington')

// Keep clues easy to recognize. Add as many entries as needed within each category.
const extraHints: Partial<Record<string, readonly Hint[]>> = {
  AE: [hint('landmark', 'Burj Khalifa', 'Бурдж-Халифа', 'This skyscraper in Dubai is 828 meters tall. Sometimes the clouds are below its top.', 'В Дубае стоит небоскрёб высотой 828 метров. Даже облака иногда оказываются ниже его вершины.')],
  AR: [hint('person', 'Lionel Messi', 'Лионель Месси', 'The footballer from Rosario lifted the 2022 World Cup trophy as captain of his team.', 'Футболист из Росарио в 2022 году поднял Кубок мира как капитан своей сборной.', 'messi')],
  AT: [hint('person', 'Wolfgang Amadeus Mozart', 'Вольфганг Амадей Моцарт', 'The composer was born in Salzburg and wrote music as a child.', 'Композитор родился в Зальцбурге и сочинял музыку уже в детстве.', 'mozart')],
  AU: [
    hint('landmark', 'Sydney Opera House', 'Сиднейский оперный театр', 'Its white roofs look like sails on the harbor.', 'Его белые крыши похожи на паруса над гаванью.', 'sydney-opera-house'),
    hint('landmark', 'Great Barrier Reef', 'Большой Барьерный риф', 'A huge system of coral reefs off the northeast coast.', 'Огромная система коралловых рифов у северо-восточного побережья.', 'reef'),
    hint('character', 'Bluey', 'Блуи', 'The animated puppy lives with her family in Brisbane.', 'Щенок из мультсериала живёт с семьёй в Брисбене.'),
    hint('animation', 'Finding Nemo', 'В поисках Немо', 'Nemo lives on the Great Barrier Reef, and his dad looks for him in Sydney.', 'Немо живёт на Большом Барьерном рифе, а папа ищет его в Сиднее.'),
    hint('music', 'AC/DC', 'AC/DC', 'The rock band started in Sydney. Guitarist Angus Young takes the stage in a school uniform.', 'Рок-группа начинала в Сиднее. Её гитарист Ангус Янг выходил на сцену в школьной форме.', 'acdc'),
  ],
  BE: [
    hint('character', 'The Smurfs', 'Смурфики', 'The little blue characters were created by the cartoonist Peyo, born in Brussels.', 'Маленьких синих героев придумал художник Пейо, родившийся в Брюсселе.'),
    hint('character', 'Tintin', 'Тинтин', 'The Brussels artist Hergé created a reporter who travels with his dog Snowy.', 'Художник Эрже из Брюсселя придумал репортёра Тинтина, который путешествует со своим псом Милу.'),
  ],
  BO: [hint('landmark', 'A mirror made of salt', 'Соляное зеркало', 'Uyuni is a huge white plain made of salt. After rain, a thin layer of water reflects the sky.', 'Уюни — огромная белая равнина из соли. После дождя в тонком слое воды отражается небо.', 'uyuni')],
  BR: [
    hint('landmark', 'Christ the Redeemer', 'Статуя Христа-Искупителя', 'The giant statue stretches its arms above Rio de Janeiro.', 'Огромная статуя раскинула руки над Рио-де-Жанейро.', 'christ-redeemer'),
    hint('animation', 'Rio', 'Рио', 'Blu the blue macaw arrives in Rio de Janeiro during Carnival.', 'Синий попугай Голубчик прилетает в Рио-де-Жанейро и попадает на карнавал.'),
  ],
  BS: [hint('landmark', 'Swimming pigs', 'Плавающие поросята', 'On one of the Exuma islands, pigs go into the sea and swim up to boats.', 'На одном из островов Эксума свиньи заходят в море и подплывают к лодкам.', 'pigs')],
  CA: [
    hint('landmark', 'Niagara Falls', 'Ниагарский водопад', 'Horseshoe Falls curves between Ontario and New York State.', 'Водопад «Подкова» находится на границе провинции Онтарио и штата Нью-Йорк.', 'niagara'),
    hint('history', 'Vikings in America', 'Викинги в Америке', 'About a thousand years ago, Vikings crossed the Atlantic and settled on the island of Newfoundland.', 'Около тысячи лет назад викинги переплыли Атлантику и поселились на острове Ньюфаундленд.', 'vikings-newfoundland'),
    hint('music', 'Céline Dion', 'Селин Дион', 'The singer from Quebec performed “My Heart Will Go On”, the song from Titanic.', 'Певица из Квебека исполнила «My Heart Will Go On», песню из фильма «Титаник».', 'dion'),
    hint('animation', 'Turning Red', 'Я краснею', 'Mei lives in Toronto and turns into a giant red panda when she gets worked up.', 'Мэй живёт в Торонто и превращается в огромную красную панду, когда сильно волнуется.'),
  ],
  CH: [
    hint('character', 'Heidi', 'Хайди', 'The girl in Johanna Spyri’s novel lives with her grandfather in the Alps.', 'Героиня книги Йоханны Шпири живёт с дедушкой в Альпах.', 'heidi'),
    hint('history', 'Milk chocolate', 'Молочный шоколад', 'In the town of Vevey, chocolatier Daniel Peter figured out how to combine chocolate with milk.', 'В городе Веве шоколатье Даниэль Петер придумал, как смешать шоколад с молоком.', 'chocolate'),
    hint('landmark', 'The Alps', 'Альпы', 'Above the village of Zermatt rises the Matterhorn, a mountain shaped like a pyramid.', 'Над деревней Церматт возвышается Маттерхорн — гора, похожая на пирамиду.', 'matterhorn'),
  ],
  CL: [hint('landmark', 'Moai on Rapa Nui', 'Моаи на острове Пасхи', 'The island is famous for giant stone figures with long faces.', 'Остров знаменит огромными каменными фигурами с вытянутыми лицами.', 'moai')],
  CN: [
    hint('landmark', 'Great Wall', 'Великая стена', 'A network of walls and watchtowers crosses mountains in the north.', 'Сеть стен и сторожевых башен тянется по горам на севере страны.', 'great-wall'),
    hint('landmark', 'Terracotta Army', 'Терракотовая армия', 'Thousands of life-size clay figures were buried near Xi’an.', 'Тысячи глиняных фигур в человеческий рост нашли неподалёку от Сианя.', 'terracotta'),
    hint('history', 'Paper from bark and straw', 'Бумага из коры и соломы', 'Artisans in Anhui make this paper by hand. It absorbs ink well, so it works well for brush painting.', 'В провинции Аньхой мастера делают такую бумагу вручную. Она хорошо впитывает тушь, поэтому на ней удобно рисовать кистью.', 'paper'),
  ],
  CO: [
    hint('music', 'Shakira', 'Шакира', 'The singer from Barranquilla performed “Waka Waka”, the song of the 2010 football World Cup.', 'Певица из Барранкильи исполнила «Waka Waka» — песню чемпионата мира по футболу 2010 года.', 'shakira'),
    hint('animation', 'Encanto', 'Энканто', 'Mirabel and her family live in a magical house tucked away in the mountains.', 'Мирабель и её семья живут в волшебном доме среди гор.'),
  ],
  CR: [hint('landmark', 'Sloths', 'Ленивцы', 'In the rainforest you can spot sloths hanging upside down and slowly moving from tree to tree.', 'В тропических лесах здесь можно увидеть ленивцев. Они подолгу висят на ветках вниз головой и медленно перебираются с дерева на дерево.', 'sloth')],
  CZ: [hint('character', 'The Little Mole', 'Кротик', 'The animated mole was created by illustrator Zdeněk Miler.', 'Героя мультфильмов придумал художник Зденек Милер.')],
  DE: [
    hint('landmark', 'Neuschwanstein Castle', 'Замок Нойшванштайн', 'A fairytale-like castle with tall towers in the Bavarian Alps.', 'Замок с высокими башнями в Баварских Альпах похож на сказочный.', 'neuschwanstein'),
    hint('person', 'Brothers Grimm', 'Братья Гримм', 'Jacob and Wilhelm collected fairy tales such as “Hansel and Gretel”.', 'Якоб и Вильгельм собрали народные сказки, среди которых «Гензель и Гретель».', 'grimm'),
    hint('person', 'Albert Einstein', 'Альберт Эйнштейн', 'The physicist born in Ulm developed the theory of relativity.', 'Физик, родившийся в Ульме, создал теорию относительности.', 'einstein'),
    hint('history', 'Johannes Gutenberg', 'Иоганн Гутенберг', 'In Mainz he printed books with metal letters that could be rearranged to make new pages.', 'В Майнце он печатал книги с помощью отдельных металлических букв. Из них можно было снова и снова собирать новые страницы.', 'gutenberg'),
  ],
  DK: [
    hint('landmark', 'The Little Mermaid statue', 'Статуя Русалочки', 'A bronze mermaid sits on a rock by Copenhagen’s harbor.', 'Бронзовая русалочка сидит на камне у гавани Копенгагена.'),
    hint('person', 'Hans Christian Andersen', 'Ханс Кристиан Андерсен', 'The writer from Odense wrote “The Ugly Duckling” and “The Snow Queen”.', 'Сказочник из Оденсе написал «Гадкого утёнка» и «Снежную королеву».', 'andersen'),
    hint('history', 'LEGO', 'LEGO', 'A carpenter in Billund began making wooden toys. His workshop grew into the LEGO company.', 'В городе Биллунн мастер начал делать деревянные игрушки. Из его мастерской выросла компания LEGO.', 'lego'),
  ],
  EC: [hint('landmark', 'Galápagos giant tortoises', 'Галапагосские черепахи', 'Giant land tortoises live on these volcanic islands in the Pacific Ocean.', 'На этих вулканических островах в Тихом океане живут гигантские сухопутные черепахи.', 'galapagos-tortoise')],
  EG: [
    hint('landmark', 'Pyramids of Giza', 'Пирамиды Гизы', 'Ancient stone tombs near Cairo stand beside the Great Sphinx.', 'Древние каменные гробницы рядом с Каиром охраняет Большой сфинкс.', 'giza-pyramids'),
    hint('history', 'The pharaohs', 'Фараоны', 'Pharaohs ruled along the Nile. A gold mask was found in the tomb of one of them, Tutankhamun.', 'Фараоны правили землями вдоль Нила. В гробнице одного из них, Тутанхамона, нашли золотую маску.', 'pharaoh'),
  ],
  EH: [hint('landmark', 'Atlantic coast of the Sahara', 'Атлантическое побережье Сахары', 'Along this territory, the edge of the desert meets the Atlantic Ocean.', 'Вдоль этой территории пустыня Сахара выходит к Атлантическому океану.', 'sahara-coast')],
  ES: [
    hint('landmark', 'Sagrada Família', 'Саграда-Фамилия', 'Antoni Gaudí designed this church in Barcelona with towers that rise above the city.', 'Антонио Гауди спроектировал этот храм с высокими башнями в Барселоне.', 'sagrada'),
    hint('music', 'Flamenco', 'Фламенко', 'In Andalusia, performers sing and clap to guitar music while dancers beat out the rhythm with their heels.', 'В Андалусии под гитару поют, хлопают в ладоши и отбивают ритм каблуками.', 'flamenco'),
  ],
  FI: [
    hint('person', 'Tove Jansson', 'Туве Янссон', 'The writer and illustrator from Helsinki created the Moomins.', 'Писательница и художница из Хельсинки придумала муми-троллей.', 'tove'),
    hint('character', 'Moomintroll', 'Муми-тролль', 'The friendly character lives in the fictional Moominvalley in Tove Jansson’s books.', 'Добродушный герой книг Туве Янссон живёт в вымышленной Муми-долине.'),
    hint('landmark', 'Santa Claus Village', 'Деревня Санта-Клауса', 'In Rovaniemi at the Arctic Circle, you can visit Santa and send a postcard from his post office.', 'В Рованиеми у Полярного круга можно побывать в гостях у Санты и отправить открытку из его почтового отделения.', 'santa'),
  ],
  FK: [hint('center', 'Stanley', 'Стэнли', 'The administrative center sits on East Falkland.', 'Административный центр находится на острове Восточный Фолкленд.', 'stanley')],
  FR: [
    hint('landmark', 'Eiffel Tower', 'Эйфелева башня', 'The iron tower was built in Paris for the 1889 World’s Fair.', 'Железную башню построили в Париже к Всемирной выставке 1889 года.', 'eiffel-tower'),
    hint('landmark', 'Mont-Saint-Michel', 'Мон-Сен-Мишель', 'An abbey crowns a rocky island surrounded by the sea at high tide.', 'На вершине скалистого острова стоит аббатство. Во время прилива остров окружает море.', 'mont-saint-michel'),
    hint('person', 'Jules Verne', 'Жюль Верн', 'The writer from Nantes imagined a submarine adventure in “Twenty Thousand Leagues Under the Seas”.', 'Писатель из Нанта придумал приключение на подводной лодке в романе «Двадцать тысяч лье под водой».', 'verne'),
    hint('animation', 'Ratatouille', 'Рататуй', 'Remy the rat dreams of being a chef and cooks in a Paris restaurant.', 'Крысёнок Реми мечтает стать поваром и готовит в парижском ресторане.'),
  ],
  GB: [
    hint('landmark', 'Big Ben', 'Биг-Бен', 'A famous clock tower in London with a giant bell inside.', 'Знаменитая башня с часами в Лондоне. Внутри звенит огромный колокол.', 'big-ben'),
    hint('landmark', 'Stonehenge', 'Стоунхендж', 'Huge prehistoric stones form a circle in southern England.', 'На юге Англии стоит древний круг из огромных камней.', 'stonehenge'),
    hint('person', 'Beatrix Potter', 'Беатрис Поттер', 'The writer and illustrator created Peter Rabbit.', 'Писательница и художница придумала кролика Питера.', 'potter'),
    paddington,
    hint('character', 'Harry Potter', 'Гарри Поттер', 'The train to Hogwarts leaves from secret platform 9¾ at London’s King’s Cross station.', 'Поезд в Хогвартс отправляется с секретной платформы 9¾ на лондонском вокзале Кингс-Кросс.'),
    hint('music', 'The Beatles', 'The Beatles', 'Four musicians from Liverpool became one of the best-known bands in the world.', 'Четверо музыкантов из Ливерпуля стали одной из самых известных групп в мире.', 'beatles'),
    hint('animation', 'Brave', 'Храбрая сердцем', 'Red-haired Merida rides her horse and shoots arrows in the Scottish Highlands.', 'Рыжая Мерида скачет на коне и стреляет из лука среди шотландских гор.'),
  ],
  GE: [hint('history', 'Khachapuri boats', 'Хачапури-лодочка', 'In Batumi, people bake boat-shaped bread with melted cheese and an egg inside.', 'В Батуми пекут хачапури в форме лодочки. Внутри — расплавленный сыр и яйцо.', 'khachapuri')],
  GF: [hint('center', 'Cayenne', 'Кайенна', 'This city is the administrative center on the Atlantic coast.', 'Этот город на берегу Атлантики служит административным центром.', 'cayenne')],
  GL: [hint('center', 'Nuuk', 'Нуук', 'This city is the seat of the island’s government.', 'В этом городе находится правительство острова.', 'nuuk')],
  GR: [
    hint('landmark', 'Acropolis of Athens', 'Афинский акрополь', 'The Parthenon stands on a rocky hill above Athens.', 'Парфенон стоит на скалистом холме над Афинами.', 'parthenon'),
    hint('myth', 'Athena and Poseidon', 'Афина и Посейдон', 'In the myth, Athena and Poseidon competed to protect Athens. Athena gave the city an olive tree.', 'По мифу, Афина и Посейдон спорили, кто станет покровителем Афин. Афина подарила городу оливковое дерево.', 'athena'),
  ],
  GT: [hint('landmark', 'Tikal', 'Тикаль', 'Tall stone temples rise above the jungle. The ancient Maya built them.', 'Среди джунглей стоят высокие каменные храмы. Их построили древние майя.', 'tikal')],
  HU: [hint('history', 'Rubik’s Cube', 'Кубик Рубика', 'A teacher from Budapest invented this cube with twisting faces. Can you make each side a single color?', 'Преподаватель из Будапешта придумал кубик, у которого можно крутить грани. Попробуй собрать каждую сторону одним цветом!', 'rubik')],
  ID: [hint('landmark', 'Komodo dragons', 'Комодские драконы', 'The world’s largest lizards live on Komodo Island. Some grow up to three meters long.', 'На острове Комодо живут самые большие ящерицы в мире. Некоторые вырастают до трёх метров.', 'komodo-dragon')],
  IE: [hint('history', 'Samhain', 'Самайн', 'Halloween has roots in an old autumn festival. People here carved scary faces into turnips to make lanterns.', 'У Хэллоуина есть корни в старинном осеннем празднике. Для фонариков здесь вырезали страшные рожицы из репы.', 'samhain')],
  IN: [hint('landmark', 'Taj Mahal', 'Тадж-Махал', 'A white marble monument with a great dome in Agra.', 'Беломраморный мавзолей с большим куполом в Агре.', 'taj-mahal')],
  IQ: [hint('history', 'Writing on clay', 'Письмо на глине', 'In ancient Mesopotamia, people pressed a reed into soft clay tablets. The marks looked like tiny wedges.', 'В древней Месопотамии знаки выдавливали палочкой на мягких глиняных табличках. Следы были похожи на маленькие клинышки.', 'cuneiform')],
  IS: [hint('landmark', 'Strokkur geyser', 'Гейзер Строккюр', 'Every few minutes a fountain of hot water bursts out of the ground.', 'Раз в несколько минут из земли вырывается фонтан горячей воды.', 'strokkur')],
  IT: [
    hint('landmark', 'Colosseum', 'Колизей', 'The ancient Roman amphitheater has rows of stone arches.', 'У древнеримского амфитеатра несколько ярусов каменных арок.', 'colosseum'),
    hint('landmark', 'Leaning Tower of Pisa', 'Пизанская башня', 'This bell tower is famous for its tilt.', 'Эта колокольня знаменита своим наклоном.', 'pisa'),
    hint('person', 'Leonardo da Vinci', 'Леонардо да Винчи', 'The artist from Vinci painted the Mona Lisa and sketched flying machines.', 'Художник из Винчи написал «Мону Лизу» и рисовал проекты летательных аппаратов.', 'leonardo'),
    hint('person', 'Galileo Galilei', 'Галилео Галилей', 'He pointed his telescope at Jupiter and saw four tiny dots that turned out to be moons.', 'Он направил телескоп на Юпитер и увидел четыре маленькие точки. Это оказались спутники планеты.', 'galileo'),
    hint('character', 'Pinocchio', 'Пиноккио', 'Carlo Collodi’s wooden puppet dreams of becoming a real boy.', 'Деревянная кукла из книги Карло Коллоди мечтает стать настоящим мальчиком.', 'pinocchio'),
    hint('animation', 'Luca', 'Лука', 'Luca and Alberto spend their summer in seaside Portorosso, eating gelato and dreaming of a scooter.', 'Лука и Альберто проводят лето в приморском городке Портороссо, едят мороженое и мечтают о мотороллере.'),
  ],
  JM: [
    hint('music', 'Bob Marley', 'Боб Марли', 'His song “One Love” introduced many listeners to reggae.', 'Его песня «One Love» познакомила многих слушателей с музыкой регги.', 'marley'),
    hint('person', 'Usain Bolt', 'Усэйн Болт', 'At a race in Berlin, he ran 100 meters in 9.58 seconds.', 'На соревнованиях в Берлине он пробежал сто метров за 9,58 секунды.', 'bolt'),
  ],
  JO: [hint('landmark', 'Petra', 'Петра', 'Buildings in this ancient city were carved into rose-colored rock.', 'Здания этого древнего города высекли прямо в розовых скалах.', 'petra')],
  JP: [
    hint('landmark', 'Mount Fuji', 'Гора Фудзи', 'A volcano with a nearly symmetrical cone rises west of Tokyo.', 'К западу от Токио возвышается вулкан с почти симметричным конусом.', 'fuji'),
    hint('animation', 'My Neighbor Totoro', 'Мой сосед Тоторо', 'Sisters Satsuki and Mei move to the countryside near Tokorozawa and meet a furry forest giant.', 'Сёстры Сацуки и Мэй переезжают в деревню недалеко от Токородзавы и встречают пушистого лесного великана.'),
    hint('history', 'Pokémon', 'Покемоны', 'The first games where you could catch and train Pokémon came out in 1996 for the Game Boy.', 'Первые игры, где можно ловить и тренировать покемонов, вышли в 1996 году на карманной приставке Game Boy.'),
  ],
  KH: [hint('landmark', 'Angkor Wat', 'Ангкор-Ват', 'The towers of this temple also appear on the national flag.', 'Башни этого храма можно увидеть и на флаге страны.', 'angkor')],
  KR: [
    hint('music', 'BTS', 'BTS', 'Seven performers helped bring K-pop to more fans around the world. One of their songs is “Dynamite”.', 'Семеро музыкантов сделали K-pop ещё популярнее во всём мире. Одна из их песен — «Dynamite».', 'bts'),
    hint('music', 'BLACKPINK', 'BLACKPINK', 'The four members of this K-pop group perform “How You Like That” and “Pink Venom”.', 'Четыре участницы этой K-pop-группы исполняют «How You Like That» и «Pink Venom».', 'blackpink'),
    hint('animation', 'KPop Demon Hunters', 'Кей-поп-охотницы на демонов', 'Rumi, Mira and Zoey sing “Golden” and fight demons in Seoul.', 'Руми, Мира и Зои поют «Golden» и сражаются с демонами в Сеуле.'),
  ],
  KZ: [hint('history', 'Baikonur', 'Байконур', 'In the middle of the steppe there is a spaceport. Yuri Gagarin launched into space from here.', 'Посреди степи есть космодром. Именно отсюда Юрий Гагарин отправился в свой первый полёт в космос.', 'baikonur')],
  MC: [hint('landmark', 'A race through city streets', 'Гонки по городу', 'Formula 1 cars race along ordinary city streets, past the harbor and through a tunnel.', 'Болиды Формулы-1 мчатся по обычным городским улицам, вдоль гавани и через тоннель.', 'monaco-race')],
  MG: [hint('animation', 'An island of lemurs', 'Остров лемуров', 'Alex, Marty, Gloria and Melman wash up on an island and meet the king of the lemurs.', 'Алекс, Марти, Глория и Мелман попадают на остров, где встречают короля лемуров.')],
  MN: [hint('history', 'Genghis Khan', 'Чингисхан', 'His name was Temüjin. In 1206 he united the Mongol tribes and became Great Khan.', 'Его звали Тэмуджин. В 1206 году он объединил монгольские племена и стал великим ханом.', 'genghis')],
  MX: [
    hint('landmark', 'Chichén Itzá', 'Чичен-Ица', 'A stepped pyramid stands in this ancient Maya city in Yucatán.', 'В этом древнем городе майя на Юкатане стоит ступенчатая пирамида.', 'chichen'),
    hint('animation', 'Coco', 'Тайна Коко', 'On the Day of the Dead, Miguel takes his guitar on a trip to the land of his ancestors.', 'В День мёртвых Мигель с гитарой отправляется в мир своих предков.'),
  ],
  MY: [hint('landmark', 'A bridge between skyscrapers', 'Мост между небоскрёбами', 'The two identical Petronas Towers in Kuala Lumpur are linked by a two-story bridge high above the ground.', 'В Куала-Лумпуре стоят две одинаковые башни Петронас. Высоко над землёй их соединяет двухэтажный мост.', 'petronas')],
  NL: [
    hint('landmark', 'Kinderdijk windmills', 'Мельницы Киндердейка', 'Rows of windmills helped pump water away from low-lying land.', 'Ряды ветряных мельниц помогали откачивать воду с низких земель.', 'kinderdijk'),
    hint('person', 'Vincent van Gogh', 'Винсент ван Гог', 'The painter born in Zundert is known for “Sunflowers” and “The Starry Night”.', 'Художник из Зюндерта известен картинами «Подсолнухи» и «Звёздная ночь».', 'van-gogh'),
    hint('character', 'Miffy', 'Крольчиха Миффи', 'The artist Dick Bruna from Utrecht drew a little white rabbit with long ears and an X-shaped mouth.', 'Художник Дик Брюна из Утрехта придумал маленькую белую крольчиху с длинными ушками и ртом-крестиком.'),
  ],
  NO: [
    hint('history', 'Roald Amundsen', 'Руаль Амундсен', 'In 1911, he and his team were the first to reach the South Pole. They crossed the snow on dog sleds.', 'В 1911 году он и его команда первыми добрались до Южного полюса. По снегу они ехали на собачьих упряжках.', 'amundsen'),
    hint('music', 'a-ha', 'a-ha', 'In the video for “Take On Me”, the characters move between the real world and a pencil-drawn comic.', 'В клипе на «Take On Me» герои переходят из реального мира в комикс, нарисованный карандашом.', 'aha'),
  ],
  NP: [hint('landmark', 'Mount Everest', 'Эверест', 'You can approach the world’s highest peak from the south here. Its local name is Sagarmatha.', 'Здесь можно подойти к высочайшей вершине мира с южной стороны. Местное название горы — Сагарматха.', 'everest')],
  NR: [hint('center', 'Yaren', 'Ярен', 'Many government offices are in this district.', 'В этом округе находится много правительственных учреждений.', 'yaren')],
  NZ: [hint('landmark', 'Hobbiton', 'Хоббитон', 'Near Matamata, the filmmakers built a hobbit village with round doors in the hills for The Lord of the Rings.', 'Возле города Матамата для «Властелина колец» построили деревню хоббитов с круглыми дверями в холмах.', 'hobbiton')],
  PA: [hint('landmark', 'A canal between two oceans', 'Канал между океанами', 'Ships can cross from the Atlantic to the Pacific here. Locks raise and lower them like water elevators.', 'Здесь корабли могут пройти из Атлантического океана в Тихий. Шлюзы поднимают и опускают их, как водяные лифты.', 'panama')],
  PE: [hint('landmark', 'Machu Picchu', 'Мачу-Пикчу', 'The Incas built this stone city high in the Andes.', 'Инки построили этот каменный город высоко в Андах.', 'machu-picchu'), paddington],
  PH: [hint('landmark', 'Chocolate Hills', 'Шоколадные холмы', 'On the island of Bohol, the grass on the round hills turns brown in the dry season. They look like chocolate candies.', 'На острове Бохоль много круглых холмов. В сухой сезон трава буреет, и холмы становятся похожи на шоколадные конфеты.', 'chocolate-hills')],
  PL: [
    hint('person', 'Marie Skłodowska Curie', 'Мария Склодовская-Кюри', 'The scientist born in Warsaw studied radioactivity and won two Nobel Prizes.', 'Учёная родилась в Варшаве, изучала радиоактивность и получила две Нобелевские премии.', 'curie'),
    hint('music', 'Frédéric Chopin', 'Фридерик Шопен', 'The composer was born near Warsaw. His piano mazurkas use the rhythms of a folk dance.', 'Композитор родился под Варшавой и писал для фортепиано мазурки — пьесы в ритме народного танца.', 'chopin'),
  ],
  PT: [hint('person', 'Cristiano Ronaldo', 'Криштиану Роналду', 'Fans call this footballer CR7. He grew up on the island of Madeira.', 'Футболист, которого болельщики называют CR7, вырос на острове Мадейра.', 'ronaldo')],
  RS: [hint('person', 'Nikola Tesla', 'Никола Тесла', 'The inventor built a motor that runs on alternating current. There’s a museum about him in Belgrade.', 'Изобретатель создал двигатель, работающий на переменном токе. В Белграде есть музей, где можно узнать о его изобретениях.', 'tesla')],
  RU: [
    hint('landmark', 'Saint Basil’s Cathedral', 'Храм Василия Блаженного', 'Its colorful onion domes stand above Red Square.', 'Его разноцветные купола возвышаются над Красной площадью.', 'saint-basil'),
    hint('person', 'Leo Tolstoy', 'Лев Толстой', 'He wrote “War and Peace” and “Filipok”, a story about a boy who really wanted to go to school.', 'Написал «Войну и мир» и «Филипка» — рассказ о мальчике, который очень хотел пойти в школу.', 'tolstoy'),
    hint('history', 'Yuri Gagarin', 'Юрий Гагарин', 'In 1961 he became the first person in space and orbited Earth aboard Vostok 1.', 'В 1961 году он стал первым человеком в космосе и облетел Землю на корабле «Восток-1».', 'gagarin'),
    hint('character', 'Cheburashka', 'Чебурашка', 'The big-eared character from Eduard Uspensky’s books is friends with Gena the Crocodile.', 'Ушастый герой книг Эдуарда Успенского дружит с крокодилом Геной.'),
  ],
  SE: [
    hint('music', 'ABBA', 'ABBA', 'Four musicians won the 1974 Eurovision Song Contest with “Waterloo”.', 'Четверо музыкантов выиграли «Евровидение» в 1974 году с песней «Waterloo».', 'abba'),
    hint('person', 'Astrid Lindgren', 'Астрид Линдгрен', 'The writer from Vimmerby wrote stories about Pippi and Karlsson-on-the-Roof.', 'Писательница из Виммербю написала истории о Пеппи и Карлсоне.', 'lindgren'),
    hint('character', 'Pippi Longstocking', 'Пеппи Длинныйчулок', 'Astrid Lindgren’s red-haired heroine is strong enough to lift her horse.', 'Рыжая героиня Астрид Линдгрен такая сильная, что может поднять свою лошадь.', 'pippi'),
  ],
  SG: [hint('landmark', 'Supertrees', 'Супердеревья', 'Huge metal trees in a city garden are covered in living plants. In the evening, they light up to music.', 'В городском саду стоят огромные деревья из металла, по которым вьются живые растения. Вечером они светятся под музыку.', 'supertrees')],
  SI: [hint('landmark', 'An island in a lake', 'Остров посреди озера', 'A boat can take you to a tiny island on Lake Bled. There is a church where people ring a bell and make a wish.', 'На озере Блед можно доплыть на лодке до маленького острова. На нём стоит церковь с колоколом, в который звонят, загадывая желание.', 'bled-island')],
  TR: [
    hint('landmark', 'Cappadocia', 'Каппадокия', 'Hot-air balloons fly over unusual rock formations and homes carved into stone.', 'Над причудливыми скалами и вырубленными в камне жилищами летают воздушные шары.', 'cappadocia'),
    hint('myth', 'The Trojan Horse', 'Троянский конь', 'In the legend, warriors hid inside a huge wooden horse. The ruins of ancient Troy are near the Dardanelles.', 'По легенде, воины спрятались внутри огромного деревянного коня. Руины древней Трои находятся недалеко от пролива Дарданеллы.', 'troy'),
  ],
  TT: [hint('music', 'Music from a steel drum', 'Музыка на стальной бочке', 'The steelpan was invented here using steel barrels. Tapping different spots on the metal plays different notes.', 'Здесь придумали стилпан — инструмент из стальной бочки. Если ударять по разным участкам металла, получаются разные ноты.', 'steelpan')],
  TZ: [hint('landmark', 'Kilimanjaro', 'Килиманджаро', 'Africa’s highest mountain has snow near its summit, even though it is close to the equator.', 'На вершине самой высокой горы Африки лежит снег, хотя гора находится недалеко от экватора.', 'kilimanjaro')],
  UA: [hint('history', 'Pysanky', 'Писанки', 'Draw patterns on an egg with wax, then dip it in dye. The color under the wax stays the same.', 'На яйце рисуют узоры воском, а потом опускают его в краску. Под воском цвет не меняется.', 'pysanka')],
  US: [
    hint('landmark', 'Statue of Liberty', 'Статуя Свободы', 'The figure with a torch stands on an island in New York Harbor.', 'Фигура с факелом стоит на острове в бухте Нью-Йорка.', 'statue-of-liberty'),
    hint('landmark', 'Grand Canyon', 'Гранд-Каньон', 'The Colorado River carved this deep canyon through layers of red rock.', 'Река Колорадо прорезала глубокий каньон в слоях красных скал.', 'grand-canyon'),
    hint('history', 'The Wright brothers', 'Братья Райт', 'Their plane took off in North Carolina in 1903. Its first flight lasted just 12 seconds.', 'В 1903 году их самолёт поднялся в воздух в Северной Каролине. Первый полёт длился всего 12 секунд.', 'wright'),
    hint('person', 'Walt Disney', 'Уолт Дисней', 'The animator born in Chicago helped create Mickey Mouse.', 'Мультипликатор из Чикаго участвовал в создании Микки Мауса.', 'disney'),
    hint('animation', 'Lilo & Stitch', 'Лило и Стич', 'On Hawaii, Lilo brings home a funny little “puppy” who came from outer space.', 'На Гавайях девочка Лило берёт домой забавного «щенка», который прилетел из космоса.'),
  ],
  UZ: [hint('history', 'The Silk Road', 'Великий шёлковый путь', 'Caravans carried goods through Samarkand, where merchants from many lands met.', 'Через Самарканд проходили караваны с товарами. Здесь встречались купцы из разных стран.', 'silk')],
  VN: [hint('history', 'Puppets on water', 'Куклы на воде', 'The stage for this show is a pool. Puppeteers move the puppets with poles hidden under the water.', 'В этом театре сцена — бассейн. Куклы скользят по воде, а кукловоды управляют ими с помощью спрятанных под водой шестов.', 'water-puppets')],
  ZA: [hint('landmark', 'Table Mountain', 'Столовая гора', 'Its flat summit rises above Cape Town.', 'Её плоская вершина возвышается над Кейптауном.', 'table-mountain')],
}

export function countryHints(code: string, locale: string) {
  const capital = capitals[code]
  const hints = [...(extraHints[code] ?? [])]
  if (capital) hints.unshift({ kind: 'capital', name: { en: capital[0], ru: capital[1] } })
  return hints.map(({ kind, name, note, photoId }) => ({
    kind, name: name[locale] ?? name.en, note: note && (note[locale] ?? note.en), photoId,
  }))
}

export function shuffleHintOrder(hints: readonly Pick<Hint, 'kind'>[]) {
  const order = hints.map((_, index) => index)
  const first = hints[0]?.kind
  const start = first === 'capital' || first === 'center' ? 1 : 0
  for (let index = order.length - 1; index > start; index--) {
    const swapIndex = start + Math.floor(Math.random() * (index - start + 1))
    const current = order[index]
    order[index] = order[swapIndex]
    order[swapIndex] = current
  }
  return order
}
