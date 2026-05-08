import type { Sticker } from "@/types";

// 48 qualified nations in Panini WC26 album order (Groups A → L)
const TEAMS: { code: string; name: string }[] = [
  { code: "MEX", name: "Mexique" },
  { code: "RSA", name: "Afrique du Sud" },
  { code: "KOR", name: "Corée du Sud" },
  { code: "CZE", name: "Rép. Tchèque" },
  { code: "CAN", name: "Canada" },
  { code: "BIH", name: "Bosnie-Herzégovine" },
  { code: "QAT", name: "Qatar" },
  { code: "SUI", name: "Suisse" },
  { code: "BRA", name: "Brésil" },
  { code: "MAR", name: "Maroc" },
  { code: "HAI", name: "Haïti" },
  { code: "SCO", name: "Écosse" },
  { code: "USA", name: "États-Unis" },
  { code: "PAR", name: "Paraguay" },
  { code: "AUS", name: "Australie" },
  { code: "TUR", name: "Turquie" },
  { code: "GER", name: "Allemagne" },
  { code: "CUW", name: "Curaçao" },
  { code: "CIV", name: "Côte d'Ivoire" },
  { code: "ECU", name: "Équateur" },
  { code: "NED", name: "Pays-Bas" },
  { code: "JPN", name: "Japon" },
  { code: "SWE", name: "Suède" },
  { code: "TUN", name: "Tunisie" },
  { code: "BEL", name: "Belgique" },
  { code: "EGY", name: "Égypte" },
  { code: "IRN", name: "Iran" },
  { code: "NZL", name: "Nouvelle-Zélande" },
  { code: "ESP", name: "Espagne" },
  { code: "CPV", name: "Cap-Vert" },
  { code: "KSA", name: "Arabie Saoudite" },
  { code: "URU", name: "Uruguay" },
  { code: "FRA", name: "France" },
  { code: "SEN", name: "Sénégal" },
  { code: "IRQ", name: "Irak" },
  { code: "NOR", name: "Norvège" },
  { code: "ARG", name: "Argentine" },
  { code: "ALG", name: "Algérie" },
  { code: "AUT", name: "Autriche" },
  { code: "JOR", name: "Jordanie" },
  { code: "POR", name: "Portugal" },
  { code: "COD", name: "RD Congo" },
  { code: "UZB", name: "Ouzbékistan" },
  { code: "COL", name: "Colombie" },
  { code: "ENG", name: "Angleterre" },
  { code: "CRO", name: "Croatie" },
  { code: "GHA", name: "Ghana" },
  { code: "PAN", name: "Panama" },
];

// Sticker 1 = Logo (FOIL), sticker 13 = Photo d'équipe, others = players
// Array index 0 → sticker n°1, index 12 → sticker n°13, etc.
const PLAYER_NAMES: Record<string, string[]> = {
  MEX: ["Logo", "Luis Malagón", "Johan Vasquez", "Jorge Sánchez", "Cesar Montes", "Jesus Gallardo", "Israel Reyes", "Diego Lainez", "Carlos Rodriguez", "Edson Alvarez", "Orbelin Pineda", "Marcel Ruiz", "Photo d'équipe", "Érick Sánchez", "Hirving Lozano", "Santiago Giménez", "Raúl Jiménez", "Alexis Vega", "Roberto Alvarado", "Cesar Huerta"],
  RSA: ["Logo", "Ronwen Williams", "Sipho Chaine", "Aubrey Modiba", "Samukele Kabini", "Mbekezeli Mbokazi", "Khulumani Ndamane", "Siyabonga Ngezana", "Khuliso Mudau", "Nkosinathi Sibisi", "Teboho Mokoena", "Thalente Mbatha", "Photo d'équipe", "Bathasi Aubaas", "Yaya Sithole", "Sipho Mbule", "Lyle Foster", "Iqraam Rayners", "Mohau Nkota", "Oswin Appollis"],
  KOR: ["Logo", "Hyeon-woo Jo", "Seung-Gyu Kim", "Min-jae Kim", "Yu-min Cho", "Young-woo Seol", "Han-beom Lee", "Tae-seok Lee", "Myung-jae Lee", "Jae-sung Lee", "In-beom Hwang", "Kang-in Lee", "Photo d'équipe", "Seung-ho Paik", "Jens Castrop", "Dong-yeong Lee", "Gue-sung Cho", "Heung-min Son", "Hee-chan Hwang", "Hyeon-Gyu Oh"],
  CZE: ["Logo", "Matej Kovar", "Jindrich Stanek", "Ladislav Krejci", "Vladimir Coufal", "Jaroslav Zeleny", "Tomas Holes", "David Zima", "Michal Sadilek", "Lukas Provod", "Lukas Cerv", "Tomas Soucek", "Photo d'équipe", "Pavel Sulc", "Matej Vydra", "Vasil Kusej", "Tomas Chory", "Vaclav Cerny", "Adam Hlozek", "Patrik Schick"],
  CAN: ["Logo", "Dayne St. Clair", "Alphonso Davies", "Alistair Johnston", "Samuel Adekugbe", "Richie Laryea", "Derek Cornelius", "Moïse Bombito", "Kamal Miller", "Stephen Eustáquio", "Ismaël Koné", "Jonathan Osorio", "Photo d'équipe", "Jacob Shaffelburg", "Mathieu Choinière", "Niko Sigur", "Tajon Buchanan", "Liam Millar", "Cyle Larin", "Jonathan David"],
  BIH: ["Logo", "Nikola Vasilj", "Amer Dedic", "Sead Kolasinac", "Tarik Muharemovic", "Nihad Mujakic", "Nikola Katic", "Amir Hadziahmetovic", "Benjamin Tahirovic", "Armin Gigovic", "Ivan Sunjic", "Ivan Basic", "Photo d'équipe", "Dzenis Burnic", "Esmir Bajraktarevic", "Amar Memic", "Ermedin Demirovic", "Edin Dzeko", "Samed Bazdar", "Haris Tabakovic"],
  QAT: ["Logo", "Meshaal Barsham", "Sultan Albrake", "Lucas Mendes", "Homam Ahmed", "Boualem Khoukhi", "Pedro Miguel", "Tarek Salman", "Mohamed Al-Mannai", "Karim Boudiaf", "Assim Madibo", "Ahmed Fatehi", "Photo d'équipe", "Mohammed Waad", "Abdulaziz Hatem", "Hassan Al-Haydos", "Edmilson Junior", "Akram Hassan Afif", "Ahmed Al Ganehi", "Almoez Ali"],
  SUI: ["Logo", "Gregor Kobel", "Yvon Mvogo", "Manuel Akanji", "Ricardo Rodriguez", "Nico Elvedi", "Aurèle Amenda", "Silvan Widmer", "Granit Xhaka", "Denis Zakaria", "Remo Freuler", "Fabian Rieder", "Photo d'équipe", "Ardon Jashari", "Johan Manzambi", "Michel Aebischer", "Breel Embolo", "Ruben Vargas", "Dan Ndoye", "Zeki Amdouni"],
  BRA: ["Logo", "Alisson", "Bento", "Marquinhos", "Éder Militão", "Gabriel Magalhães", "Danilo", "Wesley", "Lucas Paquetá", "Casemiro", "Bruno Guimarães", "Luiz Henrique", "Photo d'équipe", "Vinicius Júnior", "Rodrygo", "João Pedro", "Matheus Cunha", "Gabriel Martinelli", "Raphinha", "Estévão"],
  MAR: ["Logo", "Yassine Bounou", "Munir El Kajoui", "Achraf Hakimi", "Noussair Mazraoui", "Nayef Aguerd", "Roman Saiss", "Jawad El Yamiq", "Adam Masina", "Sofyan Amrabat", "Azzedine Ounahi", "Eliesse Ben Seghir", "Photo d'équipe", "Bilal El Khannouss", "Ismael Saibari", "Youssef En-Nesyri", "Abde Ezzalzouli", "Soufiane Rahimi", "Brahim Diaz", "Ayoub El Kaabi"],
  HAI: ["Logo", "Johny Placide", "Carlens Arcus", "Martin Expérience", "Jean-Kevin Duverne", "Ricardo Adé", "Duke Lacroix", "Garven Metusala", "Hannes Delcroix", "Leverton Pierre", "Danley Jean Jacques", "Jean-Ricner Bellegarde", "Photo d'équipe", "Christopher Attys", "Derrick Etienne Jr", "Josue Casimir", "Ruben Providence", "Duckens Nazon", "Louicius Deedson", "Frantzdy Pierrot"],
  SCO: ["Logo", "Angus Gunn", "Jack Hendry", "Kieran Tierney", "Aaron Hickey", "Andrew Robertson", "Scott McKenna", "John Souttar", "Anthony Ralston", "Grant Hanley", "Scott McTominay", "Billy Gilmour", "Photo d'équipe", "Lewis Ferguson", "Ryan Christie", "Kenny McLean", "John McGinn", "Lyndon Dykes", "Che Adams", "Ben Doak"],
  USA: ["Logo", "Matt Freese", "Chris Richards", "Tim Ream", "Mark McKenzie", "Alex Freeman", "Antonee Robinson", "Tyler Adams", "Tanner Tessmann", "Weston McKennie", "Christian Roldan", "Timothy Weah", "Photo d'équipe", "Diego Luna", "Malik Tillman", "Christian Pulisic", "Brenden Aaronson", "Ricardo Pepi", "Haji Wright", "Folarin Balogun"],
  PAR: ["Logo", "Roberto Fernandez", "Orlando Gill", "Gustavo Gomez", "Fabián Balbuena", "Juan José Cáceres", "Omar Alderete", "Junior Alonso", "Mathías Villasanti", "Diego Gomez", "Damián Bobadilla", "Andres Cubas", "Photo d'équipe", "Matias Galarza Fonda", "Julio Enciso", "Alejandro Romero Gamarra", "Miguel Almirón", "Ramon Sosa", "Angel Romero", "Antonio Sanabria"],
  AUS: ["Logo", "Mathew Ryan", "Joe Gauci", "Harry Souttar", "Alessandro Circati", "Jordan Bos", "Aziz Behich", "Cameron Burgess", "Lewis Miller", "Milos Degenek", "Jackson Irvine", "Riley McGree", "Photo d'équipe", "Aiden O'Neill", "Connor Metcalfe", "Patrick Yazbek", "Craig Goodwin", "Kusini Yengi", "Nestory Irankunda", "Mohamed Toure"],
  TUR: ["Logo", "Ugurcan Cakir", "Mert Muldur", "Zeki Celik", "Abdulkerim Bardakci", "Caglar Soyuncu", "Merih Demiral", "Ferdi Kadioglu", "Kaan Ayhan", "Ismail Yuksek", "Hakan Calhanoglu", "Orkun Kokcu", "Photo d'équipe", "Arda Guler", "Irfan Can Kahveci", "Yunus Akgun", "Can Uzun", "Baris Alper Yilmaz", "Kerem Akturkoglu", "Kenan Yildiz"],
  GER: ["Logo", "Marc-André ter Stegen", "Jonathan Tah", "David Raum", "Nico Schlotterbeck", "Antonio Rüdiger", "Waldemar Anton", "Ridle Baku", "Maximilian Mittelstadt", "Joshua Kimmich", "Florian Wirtz", "Felix Nmecha", "Photo d'équipe", "Leon Goretzka", "Jamal Musiala", "Serge Gnabry", "Kai Havertz", "Leroy Sane", "Karim Adeyemi", "Nick Woltemade"],
  CUW: ["Logo", "Eloy Room", "Armando Obispo", "Sherel Floranus", "Jurien Gaari", "Joshua Brenet", "Roshon Van Eijma", "Shurandy Sambo", "Livano Comenencia", "Godfried Roemeratoe", "Juninho Bacuna", "Leandro Bacuna", "Photo d'équipe", "Tahith Chong", "Kenji Gorre", "Jearl Margaritha", "Jurgen Locadia", "Jeremy Antonisse", "Gervane Kastaneer", "Sontje Hansen"],
  CIV: ["Logo", "Yahia Fofana", "Ghislain Konan", "Wilfried Singo", "Odilon Kossounou", "Evan Ndicka", "Willy Boly", "Emmanuel Agbadou", "Ousmane Diomande", "Franck Kessie", "Seko Fofana", "Ibrahim Sangare", "Photo d'équipe", "Jean-Philippe Gbamin", "Amad Diallo", "Sébastien Haller", "Simon Adingra", "Yan Diomande", "Evann Guessand", "Oumar Diakite"],
  ECU: ["Logo", "Hernán Galíndez", "Gonzalo Valle", "Piero Hincapié", "Pervis Estupiñán", "Willian Pacho", "Ángelo Preciado", "Joel Ordóñez", "Moises Caicedo", "Alan Franco", "Kendry Paez", "Pedro Vite", "Photo d'équipe", "John Yeboah", "Leonardo Campana", "Gonzalo Plata", "Nilson Angulo", "Alan Minda", "Kevin Rodriguez", "Enner Valencia"],
  NED: ["Logo", "Bart Verbruggen", "Virgil van Dijk", "Micky van de Ven", "Jurrien Timber", "Denzel Dumfries", "Nathan Aké", "Jeremie Frimpong", "Jan Paul van Hecke", "Tijjani Reijnders", "Ryan Gravenberch", "Teun Koopmeiners", "Photo d'équipe", "Frenkie de Jong", "Xavi Simons", "Justin Kluivert", "Memphis Depay", "Donyell Malen", "Wout Weghorst", "Cody Gakpo"],
  JPN: ["Logo", "Zion Suzuki", "Hiroki Mochizuki", "Ayumu Seko", "Junnosuke Suzuki", "Shogo Taniguchi", "Tsuyoshi Watanabe", "Kaishu Sano", "Yuki Soma", "Ao Tanaka", "Daichi Kamada", "Takefusa Kubo", "Photo d'équipe", "Ritsu Doan", "Keito Nakamura", "Takumi Minamino", "Shuto Machino", "Junya Ito", "Koki Ogawa", "Ayase Ueda"],
  SWE: ["Logo", "Victor Johansson", "Isak Hien", "Gabriel Gudmundsson", "Emil Holm", "Victor Nilsson Lindelöf", "Gustaf Lagerbielke", "Lucas Bergvall", "Hugo Larsson", "Jesper Karlström", "Yasin Ayari", "Mattias Svanberg", "Photo d'équipe", "Daniel Svensson", "Ken Sema", "Roony Bardghji", "Dejan Kulusevski", "Anthony Elanga", "Alexander Isak", "Viktor Gyökeres"],
  TUN: ["Logo", "Bechir Ben Said", "Aymen Dahmen", "Yan Valery", "Montassar Talbi", "Yassine Meriah", "Ali Abdi", "Dylan Bronn", "Ellyes Skhiri", "Aissa Laidouni", "Ferjani Sassi", "Mohamed Ali Ben Romdhane", "Photo d'équipe", "Hannibal Mejbri", "Elias Achouri", "Elias Saad", "Hazem Mastouri", "Ismael Gharbi", "Sayfallah Ltaief", "Naim Sliti"],
  BEL: ["Logo", "Thibaut Courtois", "Arthur Theate", "Timothy Castagne", "Zeno Debast", "Brandon Mechele", "Maxim De Cuyper", "Thomas Meunier", "Youri Tielemans", "Amadou Onana", "Nicolas Raskin", "Alexis Saelemaekers", "Photo d'équipe", "Hans Vanaken", "Kevin De Bruyne", "Jérémy Doku", "Charles De Ketelaere", "Leandro Trossard", "Loïs Openda", "Romelu Lukaku"],
  EGY: ["Logo", "Mohamed El Shenawy", "Mohamed Hany", "Mohamed Hamdy", "Yasser Ibrahim", "Khaled Sobhi", "Ramy Rabia", "Hossam Abdelmaguid", "Ahmed Fatouh", "Marwan Attia", "Zizo", "Hamdy Fathy", "Photo d'équipe", "Mohamed Lasheen", "Emam Ashour", "Osama Faisal", "Mohamed Salah", "Mostafa Mohamed", "Trezeguet", "Omar Marmoush"],
  IRN: ["Logo", "Alireza Beiranvand", "Morteza Pouraliganji", "Ehsan Hajsafi", "Milad Mohammadi", "Shojae Khalilzadeh", "Ramin Rezaeian", "Hossein Kanaani", "Sadegh Moharrami", "Saleh Hardani", "Saeed Ezatolahi", "Saman Ghoddos", "Photo d'équipe", "Omid Noorafkan", "Roozbeh Cheshmi", "Mohammad Mohebi", "Sardar Azmoun", "Mehdi Taremi", "Alireza Jahanbakhsh", "Ali Gholizadeh"],
  NZL: ["Logo", "Max Crocombe", "Alex Paulsen", "Michael Boxall", "Liberato Cacace", "Tim Payne", "Tyler Bindon", "Francis de Vries", "Finn Surman", "Joe Bell", "Sarpreet Singh", "Ryan Thomas", "Photo d'équipe", "Matthew Garbett", "Marko Stamenić", "Ben Old", "Chris Wood", "Elijah Just", "Callum McCowatt", "Kosta Barbarouses"],
  ESP: ["Logo", "Unai Simon", "Robin Le Normand", "Aymeric Laporte", "Dean Huijsen", "Pedro Porro", "Dani Carvajal", "Marc Cucurella", "Martín Zubimendi", "Rodri", "Pedri", "Fabian Ruiz", "Photo d'équipe", "Mikel Merino", "Lamine Yamal", "Dani Olmo", "Nico Williams", "Ferran Torres", "Álvaro Morata", "Mikel Oyarzabal"],
  CPV: ["Logo", "Vozinha", "Logan Costa", "Pico", "Diney", "Steven Moreira", "Wagner Pina", "Joao Paulo", "Yannick Semedo", "Kevin Pina", "Patrick Andrade", "Jamiro Monteiro", "Photo d'équipe", "Deroy Duarte", "Garry Rodrigues", "Jovane Cabral", "Ryan Mendes", "Dailon Livramento", "Willy Semedo", "Bebé"],
  KSA: ["Logo", "Nawaf Alaqidi", "Abdulrahman Al-Sanbi", "Saud Abdulhamid", "Nawaf Buwashl", "Jihad Thakri", "Moteb Al-Harbi", "Hassan Altambakti", "Musab Aljuwayr", "Ziyad Aljohani", "Abdullah Alkhaibari", "Nasser Aldawsari", "Photo d'équipe", "Saleh Abu Alshamat", "Marwan Alsahafi", "Salem Aldawsari", "Abdulrahman Al-Aboud", "Feras Akbrikan", "Saleh Alshehri", "Abdullah Al-Hamdan"],
  URU: ["Logo", "Sergio Rochet", "Santiago Mele", "Ronald Araujo", "José María Giménez", "Sebastian Caceres", "Mathias Olivera", "Guillermo Varela", "Nahitan Nandez", "Federico Valverde", "Giorgian De Arrascaeta", "Rodrigo Bentancur", "Photo d'équipe", "Manuel Ugarte", "Nicolás de la Cruz", "Maxi Araujo", "Darwin Núñez", "Federico Viñas", "Rodrigo Aguirre", "Facundo Pellistri"],
  FRA: ["Logo", "Mike Maignan", "Theo Hernandez", "William Saliba", "Jules Kounde", "Ibrahima Konate", "Dayot Upamecano", "Lucas Digne", "Aurélien Tchouaméni", "Eduardo Camavinga", "Manu Kone", "Adrien Rabiot", "Photo d'équipe", "Michael Olise", "Ousmane Dembele", "Bradley Barcola", "Désiré Doué", "Kingsley Coman", "Hugo Ekitike", "Kylian Mbappe"],
  SEN: ["Logo", "Edouard Mendy", "Yehvann Diouf", "Moussa Niakhaté", "Abdoulaye Seck", "Ismail Jakobs", "El Hadji Malick Diouf", "Kalidou Koulibaly", "Idrissa Gana Gueye", "Pape Matar Sarr", "Pape Gueye", "Habib Diarra", "Photo d'équipe", "Lamine Camara", "Sadio Mane", "Ismaïla Sarr", "Boulaye Dia", "Iliman Ndiaye", "Nicolas Jackson", "Krepin Diatta"],
  IRQ: ["Logo", "Jalal Hassan", "Rebin Sulaka", "Hussein Ali", "Akam Hashem", "Merchas Doski", "Zaid Tahseen", "Manaf Younis", "Zidane Iqbal", "Amir Al-Ammari", "Ibrahim Bavesh", "Ali Jasim", "Photo d'équipe", "Youssef Amyn", "Aimar Sher", "Marko Farji", "Osama Rashid", "Ali Al-Hamadi", "Aymen Hussein", "Mohanad Ali"],
  NOR: ["Logo", "Orjan Nyland", "Julian Ryerson", "Leo Ostigård", "Kristoffer Ajer", "Marcus Holmgren Pedersen", "David Møller Wolfe", "Torbjørn Heggem", "Morten Thorsby", "Martin Ødegaard", "Sander Berge", "Andreas Schjelderup", "Photo d'équipe", "Patrick Berg", "Erling Haaland", "Alexander Sørloth", "Aron Dønnum", "Jørgen Strand Larsen", "Antonio Nusa", "Oscar Bobb"],
  ARG: ["Logo", "Emiliano Martinez", "Nahuel Molina", "Cristian Romero", "Nicolas Otamendi", "Nicolas Tagliafico", "Leonardo Balerdi", "Enzo Fernandez", "Alexis Mac Allister", "Rodrigo De Paul", "Exequiel Palacios", "Leandro Paredes", "Photo d'équipe", "Nico Paz", "Franco Mastantuono", "Nico Gonzalez", "Lionel Messi", "Lautaro Martinez", "Julian Alvarez", "Giuliano Simeone"],
  ALG: ["Logo", "Alexis Guendouz", "Ramy Bensebaini", "Youcef Atal", "Rayan Aït-Nouri", "Mohamed Amine Tougai", "Aïssa Mandi", "Ismael Bennacer", "Houssem Aouar", "Hicham Boudaoui", "Ramiz Zerrouki", "Nabil Bentalab", "Photo d'équipe", "Farés Chaibi", "Riyad Mahrez", "Said Benrahma", "Anis Hadj Moussa", "Amine Gouiri", "Baghdad Bounedjah", "Mohammed Amoura"],
  AUT: ["Logo", "Alexander Schlager", "Patrick Pentz", "David Alaba", "Kevin Danso", "Philipp Lienhart", "Stefan Posch", "Philipp Mwene", "Alexander Prass", "Xaver Schlager", "Marcel Sabitzer", "Konrad Laimer", "Photo d'équipe", "Florian Grillitsch", "Nicolas Seiwald", "Romano Schmid", "Patrick Wimmer", "Christoph Baumgartner", "Michael Gregoritsch", "Marko Arnautović"],
  JOR: ["Logo", "Yazeed Abulaila", "Ihsan Haddad", "Mohammad Abu Hashish", "Yazan Al-Arab", "Abdallah Nasib", "Saleem Obaid", "Mohammad Abualnadi", "Ibrahim Saadeh", "Nizar Al-Rashdan", "Noor Al-Rawabdeh", "Mohannad Abu Taha", "Photo d'équipe", "Amer Jamous", "Musa Al-Taamari", "Yazan Al-Naimat", "Mahmoud Al-Mardi", "Ali Olwan", "Mohammad Abu Zrayq", "Ibrahim Sabra"],
  POR: ["Logo", "Diogo Costa", "José Sá", "Ruben Dias", "João Cancelo", "Diogo Dalot", "Nuno Mendes", "Gonçalo Inácio", "Bernardo Silva", "Bruno Fernandes", "Ruben Neves", "Vitinha", "Photo d'équipe", "João Neves", "Cristiano Ronaldo", "Francisco Trincao", "João Felix", "Gonçalo Ramos", "Pedro Neto", "Rafael Leão"],
  COD: ["Logo", "Lionel Mpasi", "Aaron Wan-Bissaka", "Axel Tuanzebe", "Arthur Masuaku", "Chancel Mbemba", "Joris Kayembe", "Charles Pickel", "Ngal'ayel Mukau", "Edo Kayembe", "Samuel Moutoussamy", "Noah Sadiki", "Photo d'équipe", "Théo Bongonda", "Meschak Elia", "Yoane Wissa", "Brian Cipenga", "Fiston Mayele", "Cédric Bakambu", "Nathanaël Mbuku"],
  UZB: ["Logo", "Utkir Yusupov", "Farrukh Savfiev", "Sherzod Nasrullaev", "Umar Eshmurodov", "Husniddin Aliqulov", "Rustamjon Ashurmatov", "Khojiakbar Alijonov", "Abdukodir Khusanov", "Odiljon Hamrobekov", "Otabek Shukurov", "Jamshid Iskanderov", "Photo d'équipe", "Azizbek Turgunboev", "Khojimat Erkinov", "Eldor Shomurodov", "Oston Urunov", "Jaloliddin Masharipov", "Igor Sergeev", "Abbosbek Fayzullaev"],
  COL: ["Logo", "Camilo Vargas", "David Ospina", "Dávinson Sánchez", "Yerry Mina", "Daniel Munoz", "Johan Mojica", "Jhon Lucumí", "Santiago Arias", "Jefferson Lerma", "Kevin Castaño", "Richard Rios", "Photo d'équipe", "James Rodriguez", "Juan Fernando Quintero", "Jorge Carrascal", "Jon Arias", "Jhon Cordova", "Luis Suarez", "Luis Diaz"],
  ENG: ["Logo", "Jordan Pickford", "John Stones", "Marc Guéhi", "Ezri Konsa", "Trent Alexander-Arnold", "Reece James", "Dan Burn", "Jordan Henderson", "Declan Rice", "Jude Bellingham", "Cole Palmer", "Photo d'équipe", "Morgan Rogers", "Anthony Gordon", "Phil Foden", "Bukayo Saka", "Harry Kane", "Marcus Rashford", "Ollie Watkins"],
  CRO: ["Logo", "Dominik Livaković", "Duje Caleta-Car", "Josko Gvardiol", "Josip Stanišić", "Luka Vušković", "Josip Sutalo", "Kristijan Jakic", "Luka Modrić", "Mateo Kovacic", "Martin Baturina", "Lovro Majer", "Photo d'équipe", "Mario Pasalic", "Petar Sucic", "Ivan Perišić", "Marco Pasalic", "Ante Budimir", "Andrej Kramarić", "Franjo Ivanovic"],
  GHA: ["Logo", "Lawrence Ati Zigi", "Tariq Lamptey", "Mohammed Salisu", "Alidu Seidu", "Alexander Djiku", "Gideon Mensah", "Caleb Yirenkyi", "Abdul Fatawu", "Thomas Partey", "Salis Abdul Samed", "Kamaldeen Sulemana", "Photo d'équipe", "Mohammed Kudus", "Iñaki Williams", "Jordan Ayew", "André Ayew", "Joseph Paintsil", "Osman Bukari", "Antoine Semenyo"],
  PAN: ["Logo", "Orlando Mosquera", "Luis Mejia", "Fidel Escobar", "Andres Andrade", "Michael Amir Murillo", "Eric Davis", "Jose Cordoba", "Cesar Blackman", "Cristian Martinez", "Aníbal Godoy", "Adalberto Carrasquilla", "Photo d'équipe", "Édgar Bárcenas", "Carlos Harvey", "Ismael Díaz", "Jose Fajardo", "Cecilio Waterman", "Jose Luiz Rodriguez", "Alberto Quintero"],
};

function generateTeamStickers(): Sticker[] {
  const stickers: Sticker[] = [];
  for (const team of TEAMS) {
    const names = PLAYER_NAMES[team.code];
    for (let i = 1; i <= 20; i++) {
      stickers.push({
        id: `${team.code}${i}`,
        name: names[i - 1],
        team: team.name,
        isFoil: i === 1,
      });
    }
  }
  return stickers;
}

const INTRO_STICKERS: Sticker[] = [
  { id: "00",    name: "Logo Panini",                    team: "Intro", isFoil: true },
  { id: "FWC1",  name: "Emblème Officiel",               team: "Intro", isFoil: true },
  { id: "FWC2",  name: "Emblème Officiel",               team: "Intro", isFoil: true },
  { id: "FWC3",  name: "Mascottes Officielles",          team: "Intro", isFoil: true },
  { id: "FWC4",  name: "Slogan Officiel",                team: "Intro", isFoil: true },
  { id: "FWC5",  name: "Ballon Officiel",                team: "Intro", isFoil: true },
  { id: "FWC6",  name: "Canada — Villes Hôtes",         team: "Intro", isFoil: true },
  { id: "FWC7",  name: "Mexique — Villes Hôtes",        team: "Intro", isFoil: true },
  { id: "FWC8",  name: "États-Unis — Villes Hôtes",     team: "Intro", isFoil: true },
];

const FIFA_MUSEUM_STICKERS: Sticker[] = [
  { id: "FWC9",  name: "Italie 1934",           team: "Histoire CM", isFoil: true },
  { id: "FWC10", name: "Uruguay 1950",           team: "Histoire CM", isFoil: true },
  { id: "FWC11", name: "Allemagne de l'Ouest 1954", team: "Histoire CM", isFoil: true },
  { id: "FWC12", name: "Brésil 1962",            team: "Histoire CM", isFoil: true },
  { id: "FWC13", name: "Allemagne de l'Ouest 1974", team: "Histoire CM", isFoil: true },
  { id: "FWC14", name: "Argentine 1986",         team: "Histoire CM", isFoil: true },
  { id: "FWC15", name: "Brésil 1994",            team: "Histoire CM", isFoil: true },
  { id: "FWC16", name: "Brésil 2002",            team: "Histoire CM", isFoil: true },
  { id: "FWC17", name: "Italie 2006",            team: "Histoire CM", isFoil: true },
  { id: "FWC18", name: "Allemagne 2014",         team: "Histoire CM", isFoil: true },
  { id: "FWC19", name: "Argentine 2022",         team: "Histoire CM", isFoil: true },
];

const COCA_COLA_STICKERS: Sticker[] = [
  { id: "CC1",  name: "Lamine Yamal",       team: "Coca-Cola", isFoil: false },
  { id: "CC2",  name: "Joshua Kimmich",     team: "Coca-Cola", isFoil: false },
  { id: "CC3",  name: "Harry Kane",         team: "Coca-Cola", isFoil: false },
  { id: "CC4",  name: "Santiago Giménez",   team: "Coca-Cola", isFoil: false },
  { id: "CC5",  name: "Antonee Robinson",   team: "Coca-Cola", isFoil: false },
  { id: "CC6",  name: "Jefferson Lerma",    team: "Coca-Cola", isFoil: false },
  { id: "CC7",  name: "Edson Álvarez",      team: "Coca-Cola", isFoil: false },
  { id: "CC8",  name: "Virgil van Dijk",    team: "Coca-Cola", isFoil: false },
  { id: "CC9",  name: "Alphonso Davies",    team: "Coca-Cola", isFoil: false },
  { id: "CC10", name: "Weston McKennie",    team: "Coca-Cola", isFoil: false },
  { id: "CC11", name: "Lautaro Martínez",   team: "Coca-Cola", isFoil: false },
  { id: "CC12", name: "Gabriel Magalhães",  team: "Coca-Cola", isFoil: false },
];

export const STICKERS: Sticker[] = [
  ...INTRO_STICKERS,
  ...generateTeamStickers(),
  ...FIFA_MUSEUM_STICKERS,
  ...COCA_COLA_STICKERS,
];

// Official album count (980) — Coca-Cola stickers are extras, excluded from progress
export const ALBUM_STICKER_COUNT = STICKERS.length - COCA_COLA_STICKERS.length;

export const STICKER_MAP = new Map<string, Sticker>(
  STICKERS.map((s) => [s.id, s])
);

export const STICKERS_BY_TEAM = STICKERS.reduce<Record<string, Sticker[]>>(
  (acc, s) => {
    (acc[s.team] ??= []).push(s);
    return acc;
  },
  {}
);

export const TEAM_ORDER = [
  "Intro",
  ...TEAMS.map((t) => t.name),
  "Histoire CM",
  "Coca-Cola",
];
