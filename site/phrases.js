// Члены предложения: цвет рамки и плашки
const TAGS = {
  Subject:    { color: "#d6923f", bg: "#8a5a22" },
  Verb:       { color: "#e0607e", bg: "#a23a57" },
  Object:     { color: "#6aa7ff", bg: "#2f5fa8" },
  Complement: { color: "#b48cff", bg: "#6a45b0" },
  Adverbial:  { color: "#5fcfa6", bg: "#2f7a64" },
  Connector:  { color: "#9aa7bd", bg: "#556178" },
  Greeting:   { color: "#ff9ec2", bg: "#b04a77" }
};

// Части речи: цвет линии под словом
const POS_COLOR = {
  pronoun: "#b48cff", verb: "#fbbf24", adverb: "#f6c445", determiner: "#9aa7bd", noun: "#34d399",
  adjective: "#60a5fa", preposition: "#2dd4bf", conjunction: "#f472b6", particle: "#94a3b8",
  interjection: "#fb7185", numeral: "#fb923c", "auxiliary verb": "#fbbf24", "modal verb": "#fbbf24",
  "pronoun + verb": "#b48cff", "proper noun": "#34d399"
};

// Словарь: слово → [транскрипция, часть речи]. Ключ "слово_x" — вариант для другого контекста.
const WORDS = {
  hello: ["/həˈloʊ/", "interjection"], thank: ["/θæŋk/", "verb"], you: ["/ju/", "pronoun"],
  good: ["/ɡʊd/", "adjective"], morning: ["/ˈmɔːrnɪŋ/", "noun"], night: ["/naɪt/", "noun"],
  see: ["/si/", "verb"], i: ["/aɪ/", "pronoun"], am: ["/æm/", "verb"], happy: ["/ˈhæpi/", "adjective"],
  how: ["/haʊ/", "adverb"], are: ["/ɑːr/", "verb"], nice: ["/naɪs/", "adjective"],
  to: ["/tu/", "particle"], to_p: ["/tu/", "preposition"], meet: ["/miːt/", "verb"],
  like: ["/laɪk/", "verb"], tea: ["/ti/", "noun"], where: ["/wɛr/", "adverb"], is: ["/ɪz/", "verb"],
  it: ["/ɪt/", "pronoun"], help: ["/hɛlp/", "verb"], me: ["/mi/", "pronoun"], please: ["/pliz/", "adverb"],
  my: ["/maɪ/", "determiner"], name: ["/neɪm/", "noun"], alex: ["/ˈælɪks/", "proper noun"],
  have: ["/hæv/", "verb"], a: ["/ə/", "determiner"], day: ["/deɪ/", "noun"],
  love: ["/lʌv/", "verb"], music: ["/ˈmjuːzɪk/", "noun"], too: ["/tu/", "adverb"],
  could: ["/kʊd/", "modal verb"], would: ["/wʊd/", "modal verb"], can: ["/kæn/", "modal verb"],
  cup: ["/kʌp/", "noun"], of: ["/ʌv/", "preposition"], coffee: ["/ˈkɔːfi/", "noun"],
  the: ["/ðə/", "determiner"], nearest: ["/ˈnɪrɪst/", "adjective"], station: ["/ˈsteɪʃn/", "noun"],
  what: ["/wʌt/", "determiner"], time: ["/taɪm/", "noun"], does: ["/dʌz/", "auxiliary verb"],
  start: ["/stɑːrt/", "verb"], "don't": ["/doʊnt/", "auxiliary verb"], understand: ["/ˌʌndərˈstænd/", "verb"],
  speak: ["/spiːk/", "verb"], more: ["/mɔːr/", "determiner"], more_adv: ["/mɔːr/", "adverb"],
  slowly: ["/ˈsloʊli/", "adverb"], much: ["/mʌtʃ/", "pronoun"], cost: ["/kɔːst/", "verb"],
  learning: ["/ˈlɝːnɪŋ/", "verb"], english: ["/ˈɪŋɡlɪʃ/", "proper noun"], "let's": ["/lɛts/", "verb"],
  tomorrow: ["/təˈmɑːroʊ/", "noun"], was: ["/wʌz/", "verb"], pleasure: ["/ˈplɛʒər/", "noun"],
  "i'm": ["/aɪm/", "pronoun + verb"], looking: ["/ˈlʊkɪŋ/", "verb"], for: ["/fɔːr/", "preposition"],
  keys: ["/kiz/", "noun"],
  practice: ["/ˈpræktɪs/", "noun"], makes: ["/meɪks/", "verb"], perfect: ["/ˈpɝːfɪkt/", "adjective"],
  so: ["/soʊ/", "conjunction"], keep: ["/kip/", "verb"], trying: ["/ˈtraɪɪŋ/", "verb"],
  every: ["/ˈɛvri/", "determiner"], single: ["/ˈsɪŋɡl/", "adjective"], been: ["/bɪn/", "verb"],
  two: ["/tu/", "numeral"], years: ["/jɪrz/", "noun"], and: ["/ænd/", "conjunction"], enjoy: ["/ɪnˈdʒɔɪ/", "verb"],
  tell: ["/tɛl/", "verb"], get: ["/ɡɛt/", "verb"], city: ["/ˈsɪti/", "noun"], center: ["/ˈsɛntər/", "noun"],
  if: ["/ɪf/", "conjunction"], had: ["/hæd/", "verb"], travel: ["/ˈtrævl/", "verb"],
  around: ["/əˈraʊnd/", "preposition"], world: ["/wɝːld/", "noun"],
  "it's": ["/ɪts/", "pronoun + verb"], better: ["/ˈbɛtər/", "adjective"], be: ["/bi/", "verb"],
  late: ["/leɪt/", "adjective"], than: ["/ðæn/", "conjunction"], never: ["/ˈnɛvər/", "adverb"],
  arrive: ["/əˈraɪv/", "verb"], at: ["/æt/", "preposition"], all: ["/ɔːl/", "pronoun"],
  worry: ["/ˈwɝːi/", "verb"], about: ["/əˈbaʊt/", "preposition"], mistakes: ["/mɪˈsteɪks/", "noun"],
  because: ["/bɪˈkɔːz/", "conjunction"], they: ["/ðeɪ/", "pronoun"], learn: ["/lɝːn/", "verb"],
  weather: ["/ˈwɛðər/", "noun"], wonderful: ["/ˈwʌndərfl/", "adjective"], today: ["/təˈdeɪ/", "adverb"],
  go: ["/ɡoʊ/", "verb"], walk: ["/wɔːk/", "noun"], really: ["/ˈrɪli/", "adverb"],
  forward: ["/ˈfɔːrwərd/", "adverb"], seeing: ["/ˈsiːɪŋ/", "verb"], next: ["/nɛkst/", "adjective"],
  weekend: ["/ˈwiːkɛnd/", "noun"], she: ["/ʃi/", "pronoun"], asked: ["/æskt/", "verb"],
  whether: ["/ˈwɛðər/", "conjunction"], send: ["/sɛnd/", "verb"], her: ["/hɝː/", "pronoun"],
  documents: ["/ˈdɑːkjəmənts/", "noun"], journey: ["/ˈdʒɝːni/", "noun"], begins: ["/bɪˈɡɪnz/", "verb"],
  with: ["/wɪð/", "preposition"], step: ["/stɛp/", "noun"]
};

// Фразы: [английский, перевод, разбор]. Разбор: [член предложения, "слова группы"].
// В слове можно указать вариант словаря: "to=to_p".
const PHRASES = {
  easy: [
    ["Hello.", "Привет.", [["Greeting", "Hello."]]],
    ["Thank you.", "Спасибо.", [["Verb", "Thank"], ["Object", "you."]]],
    ["Good morning.", "Доброе утро.", [["Greeting", "Good morning."]]],
    ["Good night.", "Спокойной ночи.", [["Greeting", "Good night."]]],
    ["See you.", "Увидимся.", [["Verb", "See"], ["Object", "you."]]],
    ["I am happy.", "Я счастлив.", [["Subject", "I"], ["Verb", "am"], ["Complement", "happy."]]],
    ["How are you?", "Как дела?", [["Adverbial", "How"], ["Verb", "are"], ["Subject", "you?"]]],
    ["Nice to meet you.", "Приятно познакомиться.", [["Complement", "Nice"], ["Verb", "to meet"], ["Object", "you."]]],
    ["I like tea.", "Я люблю чай.", [["Subject", "I"], ["Verb", "like"], ["Object", "tea."]]],
    ["Where is it?", "Где это?", [["Adverbial", "Where"], ["Verb", "is"], ["Subject", "it?"]]],
    ["Help me, please.", "Помогите мне, пожалуйста.", [["Verb", "Help"], ["Object", "me,"], ["Adverbial", "please."]]],
    ["My name is Alex.", "Меня зовут Алекс.", [["Subject", "My name"], ["Verb", "is"], ["Complement", "Alex."]]],
    ["Have a nice day.", "Хорошего дня.", [["Verb", "Have"], ["Object", "a nice day."]]],
    ["I love music.", "Я люблю музыку.", [["Subject", "I"], ["Verb", "love"], ["Object", "music."]]]
  ],
  medium: [
    ["Nice to meet you, too.", "Мне тоже приятно познакомиться.", [["Complement", "Nice"], ["Verb", "to meet"], ["Object", "you,"], ["Adverbial", "too."]]],
    ["Could you help me, please?", "Не могли бы вы мне помочь?", [["Verb", "Could"], ["Subject", "you"], ["Verb", "help"], ["Object", "me,"], ["Adverbial", "please?"]]],
    ["I would like a cup of coffee.", "Я бы хотел чашку кофе.", [["Subject", "I"], ["Verb", "would like"], ["Object", "a cup of coffee."]]],
    ["Where is the nearest station?", "Где ближайшая станция?", [["Adverbial", "Where"], ["Verb", "is"], ["Subject", "the nearest station?"]]],
    ["What time does it start?", "Во сколько это начинается?", [["Adverbial", "What time"], ["Verb", "does"], ["Subject", "it"], ["Verb", "start?"]]],
    ["I don't understand you.", "Я вас не понимаю.", [["Subject", "I"], ["Verb", "don't understand"], ["Object", "you."]]],
    ["Can you speak more slowly?", "Можете говорить медленнее?", [["Verb", "Can"], ["Subject", "you"], ["Verb", "speak"], ["Adverbial", "more=more_adv slowly?"]]],
    ["How much does it cost?", "Сколько это стоит?", [["Object", "How much"], ["Verb", "does"], ["Subject", "it"], ["Verb", "cost?"]]],
    ["I am learning English.", "Я учу английский.", [["Subject", "I"], ["Verb", "am learning"], ["Object", "English."]]],
    ["Let's meet tomorrow morning.", "Давай встретимся завтра утром.", [["Verb", "Let's meet"], ["Adverbial", "tomorrow morning."]]],
    ["It was a pleasure to see you.", "Было приятно вас видеть.", [["Subject", "It"], ["Verb", "was"], ["Complement", "a pleasure to=to_p see you."]]],
    ["I'm looking for my keys.", "Я ищу свои ключи.", [["Subject", "I'm"], ["Verb", "looking for"], ["Object", "my keys."]]]
  ],
  hard: [
    ["Practice makes perfect, so keep trying every single day.", "Практика ведёт к совершенству, так что пробуй каждый день.",
      [["Subject", "Practice"], ["Verb", "makes"], ["Complement", "perfect,"], ["Connector", "so"], ["Verb", "keep trying"], ["Adverbial", "every single day."]]],
    ["I have been learning English for two years and I enjoy it.", "Я учу английский два года, и мне это нравится.",
      [["Subject", "I"], ["Verb", "have been learning"], ["Object", "English"], ["Adverbial", "for two years"], ["Connector", "and"], ["Subject", "I"], ["Verb", "enjoy"], ["Object", "it."]]],
    ["Could you tell me how to get to the city center, please?", "Не подскажете, как добраться до центра города?",
      [["Verb", "Could"], ["Subject", "you"], ["Verb", "tell"], ["Object", "me"], ["Object", "how to get to=to_p the city center,"], ["Adverbial", "please?"]]],
    ["If I had more time, I would travel around the world.", "Будь у меня больше времени, я бы путешествовал по миру.",
      [["Connector", "If"], ["Subject", "I"], ["Verb", "had"], ["Object", "more time,"], ["Subject", "I"], ["Verb", "would travel"], ["Adverbial", "around the world."]]],
    ["It's better to be late than to never arrive at all.", "Лучше опоздать, чем не прийти вообще.",
      [["Subject", "It's"], ["Complement", "better to be late"], ["Connector", "than"], ["Complement", "to never arrive at all."]]],
    ["Don't worry about mistakes, because they help you learn.", "Не переживай из-за ошибок, они помогают учиться.",
      [["Verb", "Don't worry"], ["Adverbial", "about mistakes,"], ["Connector", "because"], ["Subject", "they"], ["Verb", "help"], ["Object", "you"], ["Verb", "learn."]]],
    ["The weather is wonderful today, so let's go for a walk.", "Сегодня чудесная погода, так что пойдём гулять.",
      [["Subject", "The weather"], ["Verb", "is"], ["Complement", "wonderful"], ["Adverbial", "today,"], ["Connector", "so"], ["Verb", "let's go"], ["Adverbial", "for a walk."]]],
    ["I am really looking forward to seeing you next weekend.", "Я очень жду встречи с тобой на следующих выходных.",
      [["Subject", "I"], ["Verb", "am really looking forward to=to_p"], ["Object", "seeing you"], ["Adverbial", "next weekend."]]],
    ["She asked me whether I could send her the documents today.", "Она спросила, смогу ли я отправить ей документы сегодня.",
      [["Subject", "She"], ["Verb", "asked"], ["Object", "me"], ["Connector", "whether"], ["Subject", "I"], ["Verb", "could send"], ["Object", "her the documents"], ["Adverbial", "today."]]],
    ["Every journey begins with a single step forward.", "Каждое путешествие начинается с одного шага вперёд.",
      [["Subject", "Every journey"], ["Verb", "begins"], ["Adverbial", "with a single step forward."]]]
  ]
};
