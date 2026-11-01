// Книги для режима чтения. Тексты — адаптированные отрывки произведений из общественного достояния.
// В тексте используются только символы, которые есть на клавиатуре тренажёра: буквы, пробел , . ? '
// Каждая глава — массив абзацев.
const BOOKS = [
  {
    id: "aesop",
    title: "Aesop's Fables",
    ru: "Басни Эзопа",
    author: "Aesop",
    level: "Лёгкий",
    cover: ["#fde68a", "#f59e0b"],
    icon: "🦊",
    chapters: [
      {
        title: "The Fox and the Grapes",
        ru: "Лиса и виноград",
        text: [
          "One hot summer day a hungry fox was walking through an old garden. Suddenly she saw a bunch of ripe grapes hanging from a high branch. The grapes looked sweet and full of juice, and the fox wanted them very much.",
          "She ran and jumped, but she could not reach them. She tried again and again, but the grapes were always too high. At last she was tired and sat down in the grass.",
          "Then the fox lifted her nose and walked away. I don't need them anyway, she said. I am sure those grapes are sour. It is easy to hate what you cannot have."
        ]
      },
      {
        title: "The Tortoise and the Hare",
        ru: "Черепаха и заяц",
        text: [
          "A hare was always laughing at a tortoise because he was so slow. One day the tortoise said, let's have a race, and we will see who is faster. The hare laughed and agreed at once.",
          "The race began, and the hare ran far ahead. Soon he could not even see the tortoise behind him. I have a lot of time, he thought, so I will sleep for a while under this tree.",
          "The tortoise kept walking slowly and never stopped. When the hare woke up, he ran as fast as he could, but it was too late. The tortoise was already at the finish. Slow and steady wins the race."
        ]
      },
      {
        title: "The Lion and the Mouse",
        ru: "Лев и мышь",
        text: [
          "A great lion was sleeping in the forest when a little mouse ran across his face. The lion woke up, caught the mouse with his huge paw and opened his mouth to eat it.",
          "Please let me go, cried the mouse. If you save my life today, one day I will help you. The lion laughed at the idea, but he was kind and let the little mouse go.",
          "A few days later hunters caught the lion in a strong net. He roared so loudly that the mouse heard him and came running. She chewed the ropes until the lion was free. Little friends can be great friends."
        ]
      }
    ]
  },
  {
    id: "alice",
    title: "Alice in Wonderland",
    ru: "Алиса в Стране чудес",
    author: "Lewis Carroll",
    level: "Средний",
    cover: ["#c4b5fd", "#7c3aed"],
    icon: "🐇",
    chapters: [
      {
        title: "Down the Rabbit Hole",
        ru: "В кроличьей норе",
        text: [
          "Alice was sitting with her sister by the river, and she was getting very tired of having nothing to do. Her sister was reading a book, but it had no pictures in it. What is the use of a book without pictures, thought Alice.",
          "Suddenly a White Rabbit with pink eyes ran close by her. There was nothing very strange in that, but then the Rabbit took a watch out of his pocket, looked at it and said, oh dear, I shall be late.",
          "Alice jumped up and ran across the field after it. She saw it go down a large rabbit hole under the hedge, and in another moment Alice went down after it, never once thinking how she would get out again."
        ]
      },
      {
        title: "The Pool of Tears",
        ru: "Море слёз",
        text: [
          "Curiouser and curiouser, cried Alice. She had eaten a little cake, and now she was growing taller and taller. Soon her head hit the roof of the hall, and she was more than nine feet high.",
          "Poor Alice could only look at the little door into the garden with one eye. She sat down and began to cry, and she cried so much that a large pool of tears formed all around her.",
          "Then she picked up the Rabbit's fan and began to fan herself. To her surprise, she started to shrink again. Before she knew it, she was so small that she slipped and fell into her own pool of tears."
        ]
      },
      {
        title: "A Mad Tea Party",
        ru: "Безумное чаепитие",
        text: [
          "The March Hare and the Hatter were having tea at a large table under a tree. A Dormouse was sitting between them, fast asleep. No room, no room, they cried when they saw Alice coming.",
          "There is plenty of room, said Alice, and she sat down in a big armchair at one end of the table. Your hair wants cutting, said the Hatter. Why is a raven like a writing desk?",
          "Alice thought for a while, but she could not find the answer. Have you guessed the riddle yet, asked the Hatter. No, I give it up, Alice replied. What is the answer? I haven't the slightest idea, said the Hatter."
        ]
      }
    ]
  },
  {
    id: "prince",
    title: "The Happy Prince",
    ru: "Счастливый принц",
    author: "Oscar Wilde",
    level: "Сложный",
    cover: ["#99f6e4", "#0d9488"],
    icon: "👑",
    chapters: [
      {
        title: "The Statue",
        ru: "Статуя",
        text: [
          "High above the city, on a tall column, stood the statue of the Happy Prince. He was covered all over with thin leaves of fine gold. For eyes he had two bright sapphires, and a large red ruby glowed on his sword.",
          "Everyone in the city admired him. He is as beautiful as a weathercock, said one of the town councillors. Why can't you be like the Happy Prince, a mother asked her little boy, who was crying for the moon."
        ]
      },
      {
        title: "The Little Swallow",
        ru: "Маленькая ласточка",
        text: [
          "One night a little swallow flew over the city. His friends had gone to Egypt six weeks before, but he had stayed behind. He was tired after the long day, and he decided to rest at the feet of the Happy Prince.",
          "Just as he was putting his head under his wing, a large drop of water fell on him. Then another drop fell. The swallow looked up and saw that the eyes of the Happy Prince were filled with tears.",
          "Who are you, asked the swallow. I am the Happy Prince, the statue answered. When I was alive, I did not know what tears were. Now I can see all the sadness of my city, and I cannot help crying."
        ]
      },
      {
        title: "The Gift",
        ru: "Подарок",
        text: [
          "Far away in a little street there is a poor house, said the Prince. A woman is sitting at a table, and her little boy is lying ill in the corner. Little swallow, will you not take her the ruby from my sword?",
          "The swallow did not want to stay, because winter was coming. But the Prince looked so sad that he agreed. He took the great ruby in his beak and flew over the roofs of the city to the poor house.",
          "He laid the ruby on the table and gently fanned the boy's forehead with his wings. How cool I feel, said the boy, I must be getting better. Then the swallow flew back to the Happy Prince and told him what he had done."
        ]
      }
    ]
  }
];
