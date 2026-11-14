import { capitals } from './country-capitals'

export type HintKind = 'capital' | 'center' | 'landmark' | 'person' | 'character' | 'animation'
type LocalizedText = Readonly<Record<string, string>> & { en: string; ru: string }
type Hint = { kind: HintKind; name: LocalizedText; note?: LocalizedText }

function hint(kind: Exclude<HintKind, 'capital'>, en: string, ru: string, enNote: string, ruNote: string): Hint {
  return { kind, name: { en, ru }, note: { en: enNote, ru: ruNote } }
}

const paddington = hint('character', 'Paddington Bear', 'Медвежонок Паддингтон',
  'The marmalade-loving bear in Michael Bond’s books comes from Peru and moves to London.',
  'Любитель мармелада из книг Майкла Бонда родом из Перу и переезжает в Лондон.')

// Keep clues easy to recognize. Add as many entries as needed within each category.
const extraHints: Partial<Record<string, readonly Hint[]>> = {
  AT: [hint('person', 'Wolfgang Amadeus Mozart', 'Вольфганг Амадей Моцарт', 'The composer was born in Salzburg and wrote music as a child.', 'Композитор родился в Зальцбурге и сочинял музыку уже в детстве.')],
  AU: [
    hint('landmark', 'Sydney Opera House', 'Сиднейский оперный театр', 'Its white roofs look like sails on the harbor.', 'Его белые крыши похожи на паруса над гаванью.'),
    hint('landmark', 'Great Barrier Reef', 'Большой Барьерный риф', 'A huge system of coral reefs off the northeast coast.', 'Огромная система коралловых рифов у северо-восточного побережья.'),
    hint('character', 'Bluey', 'Блуи', 'The animated puppy lives with her family in Brisbane.', 'Щенок из мультсериала живёт с семьёй в Брисбене.'),
    hint('animation', 'Finding Nemo', 'В поисках Немо', 'Nemo lives on the Great Barrier Reef, and his dad looks for him in Sydney.', 'Немо живёт на Большом Барьерном рифе, а папа ищет его в Сиднее.'),
  ],
  BE: [hint('character', 'The Smurfs', 'Смурфики', 'The little blue characters were created by the cartoonist Peyo, born in Brussels.', 'Маленьких синих героев придумал художник Пейо, родившийся в Брюсселе.')],
  BR: [
    hint('landmark', 'Christ the Redeemer', 'Статуя Христа-Искупителя', 'The giant statue stretches its arms above Rio de Janeiro.', 'Огромная статуя раскинула руки над Рио-де-Жанейро.'),
    hint('animation', 'Rio', 'Рио', 'Blu the blue macaw arrives in Rio de Janeiro during Carnival.', 'Синий попугай Голубчик прилетает в Рио-де-Жанейро и попадает на карнавал.'),
  ],
  CA: [
    hint('landmark', 'Niagara Falls', 'Ниагарский водопад', 'Horseshoe Falls curves between Ontario and New York State.', 'Водопад «Подкова» находится на границе провинции Онтарио и штата Нью-Йорк.'),
    hint('animation', 'Turning Red', 'Я краснею', 'Mei lives in Toronto and turns into a giant red panda when she gets worked up.', 'Мэй живёт в Торонто и превращается в огромную красную панду, когда сильно волнуется.'),
  ],
  CH: [hint('character', 'Heidi', 'Хайди', 'The girl in Johanna Spyri’s novel lives with her grandfather in the Alps.', 'Героиня книги Йоханны Шпири живёт с дедушкой в Альпах.')],
  CL: [hint('landmark', 'Moai on Rapa Nui', 'Моаи на острове Пасхи', 'The island is famous for giant stone figures with long faces.', 'Остров знаменит огромными каменными фигурами с вытянутыми лицами.')],
  CN: [
    hint('landmark', 'Great Wall', 'Великая стена', 'A network of walls and watchtowers crosses mountains in the north.', 'Сеть стен и сторожевых башен тянется по горам на севере страны.'),
    hint('landmark', 'Terracotta Army', 'Терракотовая армия', 'Thousands of life-size clay figures were buried near Xi’an.', 'Тысячи глиняных фигур в человеческий рост нашли неподалёку от Сианя.'),
  ],
  CO: [hint('animation', 'Encanto', 'Энканто', 'Mirabel and her family live in a magical house tucked away in the mountains.', 'Мирабель и её семья живут в волшебном доме среди гор.')],
  CZ: [hint('character', 'The Little Mole', 'Кротик', 'The animated mole was created by illustrator Zdeněk Miler.', 'Героя мультфильмов придумал художник Зденек Милер.')],
  DE: [
    hint('landmark', 'Neuschwanstein Castle', 'Замок Нойшванштайн', 'A fairytale-like castle with tall towers in the Bavarian Alps.', 'Замок с высокими башнями в Баварских Альпах похож на сказочный.'),
    hint('person', 'Brothers Grimm', 'Братья Гримм', 'Jacob and Wilhelm collected fairy tales such as “Hansel and Gretel”.', 'Якоб и Вильгельм собрали народные сказки, среди которых «Гензель и Гретель».'),
    hint('person', 'Albert Einstein', 'Альберт Эйнштейн', 'The physicist born in Ulm developed the theory of relativity.', 'Физик, родившийся в Ульме, создал теорию относительности.'),
  ],
  DK: [
    hint('landmark', 'The Little Mermaid statue', 'Статуя Русалочки', 'A bronze mermaid sits on a rock by Copenhagen’s harbor.', 'Бронзовая русалочка сидит на камне у гавани Копенгагена.'),
    hint('person', 'Hans Christian Andersen', 'Ханс Кристиан Андерсен', 'The writer from Odense wrote “The Ugly Duckling” and “The Snow Queen”.', 'Сказочник из Оденсе написал «Гадкого утёнка» и «Снежную королеву».'),
  ],
  EG: [hint('landmark', 'Pyramids of Giza', 'Пирамиды Гизы', 'Ancient stone tombs near Cairo stand beside the Great Sphinx.', 'Древние каменные гробницы рядом с Каиром охраняет Большой сфинкс.')],
  EH: [hint('landmark', 'Atlantic coast of the Sahara', 'Атлантическое побережье Сахары', 'Along this territory, the edge of the desert meets the Atlantic Ocean.', 'Вдоль этой территории пустыня Сахара выходит к Атлантическому океану.')],
  ES: [hint('landmark', 'Sagrada Família', 'Саграда-Фамилия', 'Antoni Gaudí designed this church in Barcelona with towers that rise above the city.', 'Антонио Гауди спроектировал этот храм с высокими башнями в Барселоне.')],
  FI: [
    hint('person', 'Tove Jansson', 'Туве Янссон', 'The writer and illustrator from Helsinki created the Moomins.', 'Писательница и художница из Хельсинки придумала муми-троллей.'),
    hint('character', 'Moomintroll', 'Муми-тролль', 'The friendly character lives in the fictional Moominvalley in Tove Jansson’s books.', 'Добродушный герой книг Туве Янссон живёт в вымышленной Муми-долине.'),
  ],
  FK: [hint('center', 'Stanley', 'Стэнли', 'The administrative center sits on East Falkland.', 'Административный центр находится на острове Восточный Фолкленд.')],
  FR: [
    hint('landmark', 'Eiffel Tower', 'Эйфелева башня', 'The iron tower was built in Paris for the 1889 World’s Fair.', 'Железную башню построили в Париже к Всемирной выставке 1889 года.'),
    hint('landmark', 'Mont-Saint-Michel', 'Мон-Сен-Мишель', 'An abbey crowns a rocky island surrounded by the sea at high tide.', 'На вершине скалистого острова стоит аббатство. Во время прилива остров окружает море.'),
    hint('person', 'Jules Verne', 'Жюль Верн', 'The writer from Nantes imagined a submarine adventure in “Twenty Thousand Leagues Under the Seas”.', 'Писатель из Нанта придумал приключение на подводной лодке в романе «Двадцать тысяч лье под водой».'),
    hint('animation', 'Ratatouille', 'Рататуй', 'Remy the rat dreams of being a chef and cooks in a Paris restaurant.', 'Крысёнок Реми мечтает стать поваром и готовит в парижском ресторане.'),
  ],
  GB: [
    hint('landmark', 'Big Ben', 'Биг-Бен', 'A famous clock tower in London with a giant bell inside.', 'Знаменитая башня с часами в Лондоне. Внутри звенит огромный колокол.'),
    hint('landmark', 'Stonehenge', 'Стоунхендж', 'Huge prehistoric stones form a circle in southern England.', 'На юге Англии стоит древний круг из огромных камней.'),
    hint('person', 'Beatrix Potter', 'Беатрис Поттер', 'The writer and illustrator created Peter Rabbit.', 'Писательница и художница придумала кролика Питера.'),
    paddington,
    hint('animation', 'Brave', 'Храбрая сердцем', 'Red-haired Merida rides her horse and shoots arrows in the Scottish Highlands.', 'Рыжая Мерида скачет на коне и стреляет из лука среди шотландских гор.'),
  ],
  GF: [hint('center', 'Cayenne', 'Кайенна', 'This city is the administrative center on the Atlantic coast.', 'Этот город на берегу Атлантики служит административным центром.')],
  GL: [hint('center', 'Nuuk', 'Нуук', 'This city is the seat of the island’s government.', 'В этом городе находится правительство острова.')],
  GR: [hint('landmark', 'Acropolis of Athens', 'Афинский акрополь', 'The Parthenon stands on a rocky hill above Athens.', 'Парфенон стоит на скалистом холме над Афинами.')],
  IN: [hint('landmark', 'Taj Mahal', 'Тадж-Махал', 'A white marble monument with a great dome in Agra.', 'Беломраморный мавзолей с большим куполом в Агре.')],
  IT: [
    hint('landmark', 'Colosseum', 'Колизей', 'The ancient Roman amphitheater has rows of stone arches.', 'У древнеримского амфитеатра несколько ярусов каменных арок.'),
    hint('landmark', 'Leaning Tower of Pisa', 'Пизанская башня', 'This bell tower is famous for its tilt.', 'Эта колокольня знаменита своим наклоном.'),
    hint('person', 'Leonardo da Vinci', 'Леонардо да Винчи', 'The artist from Vinci painted the Mona Lisa and sketched flying machines.', 'Художник из Винчи написал «Мону Лизу» и рисовал проекты летательных аппаратов.'),
    hint('character', 'Pinocchio', 'Пиноккио', 'Carlo Collodi’s wooden puppet dreams of becoming a real boy.', 'Деревянная кукла из книги Карло Коллоди мечтает стать настоящим мальчиком.'),
    hint('animation', 'Luca', 'Лука', 'Luca and Alberto spend their summer in seaside Portorosso, eating gelato and dreaming of a scooter.', 'Лука и Альберто проводят лето в приморском городке Портороссо, едят мороженое и мечтают о мотороллере.'),
  ],
  JO: [hint('landmark', 'Petra', 'Петра', 'Buildings in this ancient city were carved into rose-colored rock.', 'Здания этого древнего города высекли прямо в розовых скалах.')],
  JP: [
    hint('landmark', 'Mount Fuji', 'Гора Фудзи', 'A volcano with a nearly symmetrical cone rises west of Tokyo.', 'К западу от Токио возвышается вулкан с почти симметричным конусом.'),
    hint('animation', 'My Neighbor Totoro', 'Мой сосед Тоторо', 'Sisters Satsuki and Mei move to the countryside near Tokorozawa and meet a furry forest giant.', 'Сёстры Сацуки и Мэй переезжают в деревню недалеко от Токородзавы и встречают пушистого лесного великана.'),
  ],
  KH: [hint('landmark', 'Angkor Wat', 'Ангкор-Ват', 'The towers of this temple also appear on the national flag.', 'Башни этого храма можно увидеть и на флаге страны.')],
  MG: [hint('animation', 'An island of lemurs', 'Остров лемуров', 'Alex, Marty, Gloria and Melman wash up on an island and meet the king of the lemurs.', 'Алекс, Марти, Глория и Мелман попадают на остров, где встречают короля лемуров.')],
  MX: [
    hint('landmark', 'Chichén Itzá', 'Чичен-Ица', 'A stepped pyramid stands in this ancient Maya city in Yucatán.', 'В этом древнем городе майя на Юкатане стоит ступенчатая пирамида.'),
    hint('animation', 'Coco', 'Тайна Коко', 'On the Day of the Dead, Miguel takes his guitar on a trip to the land of his ancestors.', 'В День мёртвых Мигель с гитарой отправляется в мир своих предков.'),
  ],
  NL: [
    hint('landmark', 'Kinderdijk windmills', 'Мельницы Киндердейка', 'Rows of windmills helped pump water away from low-lying land.', 'Ряды ветряных мельниц помогали откачивать воду с низких земель.'),
    hint('person', 'Vincent van Gogh', 'Винсент ван Гог', 'The painter born in Zundert is known for “Sunflowers” and “The Starry Night”.', 'Художник из Зюндерта известен картинами «Подсолнухи» и «Звёздная ночь».'),
  ],
  NR: [hint('center', 'Yaren', 'Ярен', 'Many government offices are in this district.', 'В этом округе находится много правительственных учреждений.')],
  PE: [hint('landmark', 'Machu Picchu', 'Мачу-Пикчу', 'The Incas built this stone city high in the Andes.', 'Инки построили этот каменный город высоко в Андах.'), paddington],
  PL: [hint('person', 'Marie Skłodowska Curie', 'Мария Склодовская-Кюри', 'The scientist born in Warsaw studied radioactivity and won two Nobel Prizes.', 'Учёная родилась в Варшаве, изучала радиоактивность и получила две Нобелевские премии.')],
  RU: [
    hint('landmark', 'Saint Basil’s Cathedral', 'Храм Василия Блаженного', 'Its colorful onion domes stand above Red Square.', 'Его разноцветные купола возвышаются над Красной площадью.'),
    hint('person', 'Korney Chukovsky', 'Корней Чуковский', 'The children’s writer wrote “Moydodyr” and “The Fly’s Wedding”.', 'Детский писатель написал «Мойдодыра» и «Муху-Цокотуху».'),
    hint('character', 'Cheburashka', 'Чебурашка', 'The big-eared character from Eduard Uspensky’s books is friends with Gena the Crocodile.', 'Ушастый герой книг Эдуарда Успенского дружит с крокодилом Геной.'),
  ],
  SE: [
    hint('person', 'Astrid Lindgren', 'Астрид Линдгрен', 'The writer from Vimmerby wrote stories about Pippi and Karlsson-on-the-Roof.', 'Писательница из Виммербю написала истории о Пеппи и Карлсоне.'),
    hint('character', 'Pippi Longstocking', 'Пеппи Длинныйчулок', 'Astrid Lindgren’s red-haired heroine is strong enough to lift her horse.', 'Рыжая героиня Астрид Линдгрен такая сильная, что может поднять свою лошадь.'),
  ],
  TR: [hint('landmark', 'Cappadocia', 'Каппадокия', 'The region is known for tall rock formations and rooms carved into stone.', 'Этот край известен высокими скалами причудливой формы и вырубленными в камне жилищами.')],
  US: [
    hint('landmark', 'Statue of Liberty', 'Статуя Свободы', 'The figure with a torch stands on an island in New York Harbor.', 'Фигура с факелом стоит на острове в бухте Нью-Йорка.'),
    hint('landmark', 'Grand Canyon', 'Гранд-Каньон', 'The Colorado River carved this deep canyon through layers of red rock.', 'Река Колорадо прорезала глубокий каньон в слоях красных скал.'),
    hint('person', 'Walt Disney', 'Уолт Дисней', 'The animator born in Chicago helped create Mickey Mouse.', 'Мультипликатор из Чикаго участвовал в создании Микки Мауса.'),
    hint('animation', 'Lilo & Stitch', 'Лило и Стич', 'On Hawaii, Lilo brings home a funny little “puppy” who came from outer space.', 'На Гавайях девочка Лило берёт домой забавного «щенка», который прилетел из космоса.'),
  ],
  ZA: [hint('landmark', 'Table Mountain', 'Столовая гора', 'Its flat summit rises above Cape Town.', 'Её плоская вершина возвышается над Кейптауном.')],
}

const hintOrder: Record<HintKind, number> = { capital: 0, center: 0, landmark: 1, person: 2, character: 2, animation: 3 }

export function countryHints(code: string, locale: string) {
  const capital = capitals[code]
  const hints = [...(extraHints[code] ?? [])]
  if (capital) hints.push({ kind: 'capital', name: { en: capital[0], ru: capital[1] } })
  return hints.sort((a, b) => hintOrder[a.kind] - hintOrder[b.kind]).map(({ kind, name, note }) => ({
    kind, name: name[locale] ?? name.en, note: note && (note[locale] ?? note.en),
  }))
}
