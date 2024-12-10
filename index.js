require('dotenv').config();
const { Bot, GrammyError, HttpError } = require('grammy')
const fs = require('fs');
const cron = require('node-cron');
require('dotenv').config();
console.log('BOT_API_KEY: ', process.env.BOT_API_KEY);
if (!process.env.BOT_API_KEY) {
    throw new Error("Токен бота не найден")
}

const bot = new Bot(process.env.BOT_API_KEY);

const userStates = {}; // { user: {day: 1, stage: 'rules', progress: {} }}

bot.api.setMyCommands([
    {
        command: 'start',
        description: 'СТАРТ',
    },
    {
        command: 'help',
        description: 'ИНСТРУКЦИЯ',
    },
    {
        command: 'day1',
        description: 'Задания 16.12',
    },
    {
        command: 'day2',
        description: 'Задания 17.12',
    },
    {
        command: 'day3',
        description: 'Задания 18.12',
    },
    {
        command: 'day4',
        description: 'Задания 19.12',
    },
]);
// === Модуль Дня 1 ===
const day1Questions = [
    { question: 'Как тебя зовут?\nПроверим с той ли я связался)', answer: 'маша'}, 
    { question: 'Теперь вопрос для разгона.\nКакая планета самая большая в Солнечной системе?', answer: 'юпитер'}, 
    { question: 'Назови свой любимый напиток?', answer: 'кола'}, 
    { question: 'Маша, Арбуз или Дыня?', answer: 'дыня'}, 
    { question: 'Теперь вопросы по сложнее🧐:\nКак звали маму Македонского?', answer: 'олимпиада'},
    { question: 'Как называется прямая линия, у которой есть начало, но нет конца?', answer: 'луч'},
    { question: 'Скажи, а сколько у тебя сейчас постов в инсте?)', answer: '41'},
    { question: 'А какая твоя любимая еда?)', answer: 'хлеб'},
    { question: 'Сколько лет длилась столетняя война?', answer: '116'},
    { question: 'А в каком месяце у нас 28 дней?', answer: 'в каждом'},
    { question: 'Назови собаку, в пароде которой встречается звук падения капли...', answer: 'бульдог'},
    { question: 'Я загадал число от 1 до 10\nУгадай число)', answer: '9'},
    { question: '3 яйца варятся в кастрюле 9 минут, сколько будет вариться в этой же кастрюле одно яйцо?(напиши только число)', answer: '9'},
    { question: 'У меня есть зубы, но я не могу есть. Что я такое?', answer: 'расчёска'},
    { question: 'Как называются сережки для дурака?', answer: 'лапша'},
    { question: 'К тебе пришли гости. На столе стоит бутылка вина, шампанского, минералка и коробка конфет. Что ты откроешь первым делом?', answer: 'дверь'},
];
const handleDay1 = async (ctx) => {
    const userId = ctx.from.id;

    if (!userStates[userId]) {
        userStates[userId] = { day: 1, stage: null, progress: { currentQuestionIndex: 0 }, completed: false };
    }

    const userState = userStates[userId];

    if (userState.stage === null) {
        userState.stage = "awaiting-code";
        userState.progress.currentQuestionIndex = 0;
        await ctx.reply('Вроде с правилами разобрались)\n\n' +
            'Первое задание активное:\n' +
            'Отправляйся на тренировку в МетроФитнесс...\n\n' +
            'После тренировки ты придешь домой уже не с пустыми руками😊\n' +
            'В коробке лежит вещь, чтобы продолжить игру тебе надо разблокировать меня кодовым словом\n\n' +
            'Какое кодовое слово?\n\n' +
            'Введите кодовое слово для разблокировки: ');
        return;
    }

    const userAnswer = ctx.message.text.trim().toLowerCase();

    if (userState.stage === "awaiting-code") {
        if (userAnswer === "milfa") {
            userState.stage = "answering-questions";
            await ctx.reply(
                "Кодовое слово верное!\n" +
                "Теперь тебе предстоит ответить на несколько вопросов🙃:\n\n" + 
                "Первый вопрос:"
            );
            const firstQuestion = day1Questions[userState.progress.currentQuestionIndex].question;
            await ctx.reply(firstQuestion);
        } else {
            await ctx.reply("Неверное кодовое слово. Попробуй снова.");
        }
        return;
    }

    if (userState.stage === "answering-questions") {
        const currentQuestionIndex = userState.progress.currentQuestionIndex;
        const currentQuestion = day1Questions[currentQuestionIndex];

        if (userAnswer === currentQuestion.answer) {
            userState.progress.currentQuestionIndex += 1;

            if (userState.progress.currentQuestionIndex < day1Questions.length) {
                const nextQuestion = day1Questions[userState.progress.currentQuestionIndex].question;
                await ctx.reply(`Правильно! Следующий вопрос:\n${nextQuestion}`);
            } else {
                userState.stage = null;
                userState.completed = true;
                await ctx.reply("Поздравляю! Ты выполнила все задания на этот день!\n" +
                    "Сегодня были очень легкие задания, чтобы втянуть тебя в игру, не расслабляйся, дальше больше🙂\n\n" +
                    "Дождись завтра и открывай следующий блок с заданиями...");
            }
        } else {
            await ctx.reply("Неправильный ответ. Попробуй снова.");
        }
    }
};

// === Модуль Дня 2 ===
const emojiSongs = [
    { emoji: "🟩👀🚖", answer: "зеленоглазое такси"},
    { emoji: "😮‍💨😤🎮👩‍❤️‍👨", answer: "вдох-выдох" },
    { emoji: "👉🙎‍♂️🥴🍾🙋‍♀️👸", answer: "царица"},
    { emoji: "⬇️🙋‍♂️Ⓜ️5️⃣🛣️8️⃣", answer: "асфальт 8"},
    { emoji: "👫🚆🫂📭🫙🚉", answer: "поезда"},
    { emoji: "🙅‍♀️🗣️🙅‍♀️😱🚢 ", answer: "на титанике"},
    { emoji: "🙋‍♀️❄️➡️❤️", answer: "зима в сердце"},
    { emoji: "👵🌎⚪️🌳", answer: "матушка земля"}, 
    { emoji: "🌹🌹🌹🪟👀🫵", answer: "миллион алых роз"},
    { emoji: "🙋‍♂️🇷🇺", answer: "я русский"},
];

const handleDay2 = async (ctx) => {
    const userId = ctx.from.id;

    if (!userStates[userId]) {
        userStates[userId] = { day: 1, stage: null, progress: {}, completed: false };
    }

    const userState = userStates[userId];

    if (!userState.completed) {
        await ctx.reply("Сначала пройди День 1.");
        return;
    }

    if (userState.day < 2) {
        userState.day = 2;
        userState.stage = null;
        userState.progress = { currentIndex: 0 };
    }

    const userAnswer = ctx.message.text.trim().toLowerCase();

    if (userState.stage === null) {
        userState.stage = "emoji-game";
        userState.progress.currentIndex = 0;
        const firstSong = emojiSongs[0];
        await ctx.reply(`Очень надеюсь, что сегодня 17 число🙃\nЕсли да, то супер! Давай поиграем?\n\nЧтобы получать и дальше задания ты должна угадать все песни)\nВводи коректные названия песен!(на русском языке)\nПоехали!\n\nУгадай песню:\n${firstSong.emoji}`);
        return;
    }

    if (userState.stage === "emoji-game") {
        const currentSong = emojiSongs[userState.progress.currentIndex];

        if (userAnswer === currentSong.answer) {
            userState.progress.currentIndex += 1;

            if (userState.progress.currentIndex < emojiSongs.length) {
                const nextSong = emojiSongs[userState.progress.currentIndex].emoji;
                await ctx.reply(`Правильно! Следующая песня:\n${nextSong}`);
            } else {
                userState.stage = "awaiting-name";
                await ctx.reply(
                    'У тебя есть забавная история, которая связывает эту песню с конкретным человеком🙂\n\n' +
                    'Ты поняла про кого я?\n\n' +
                    'Напиши имя того, про кого я говорю...'
                );
            }
        } else {
            await ctx.reply("Неправильный ответ. Попробуй снова.");
        }
        return;
    }

    if (userState.stage === "awaiting-name") {
        if (userAnswer === "егор") {
            userState.stage = "awaiting-code";
            await ctx.reply(
                "Все верно, я говорил про Егора, готовься выполнить активное задание)\n\n" +
                "Активное задание:\n\n" +
                "Найди сегодня Егора и напиши мне кодовое слово:"
            );
        } else {
            await ctx.reply("Нет, это неправильный ответ. Подумай ещё.");
        }
        return;
    }

    if (userState.stage === "awaiting-code") {
        if (userAnswer === "аляска") {
            userState.stage = null;
            userState.completed = true;
            await ctx.reply("Поздравляю!🥳 Ты завершила задания на сегодня, дальше только сложнее😉\n\n" +
                "Жди завтра и открывай новый блок заданий)"
            );
        } else {
            await ctx.reply("Неправильное кодовое слово. Попробуй снова.");
        }
    }
};

// === Модуль Дня 3 ===
const secretWord = "принц";

const handleDay3 = async (ctx) => {
    const userId = ctx.from.id;

    if (!userStates[userId]) {
        userStates[userId] = { day: 1, stage: null, progress: {}, completed: false };
    }

    const userState = userStates[userId];

    if (!userState.completed) {
        await ctx.reply("Сначала пройди День 2.");
        return;
    }

    if (userState.day < 3) {
        userState.day = 3;
        userState.stage = null;
        userState.progress = { attempts: 0 };
    }

    // Проверяем, есть ли текст в сообщении
    const userAnswer = ctx.message.text ? ctx.message.text.trim().toLowerCase() : null;

    if (userState.stage === null) {
        userState.stage = "guessing-word";
        await ctx.reply(
            "Новый день - новые задания!🎉\n" +
            "Поиграем в очень знакомую игру УГАДАЙ СЛОВО ИЗ 5 БУКВ)\n\n" +
            "Загадываю слово из 5 букв. Попробуй отгадать!"
        );
        return;
    }

    if (userState.stage === "guessing-word") {
        // Проверяем, есть ли текст и равен ли он 5 символам
        if (!userAnswer || userAnswer.length !== 5) {
            await ctx.reply("Слово должно состоять ровно из 5 букв.");
            return;
        }

        userState.progress.attempts += 1;

        // Проверка на совпадения
        let feedback = "";
        let guessedCorrectly = true;

        for (let i = 0; i < 5; i++) {
            const userChar = userAnswer[i];
            const secretChar = secretWord[i];

            if (userChar === secretChar) {
                feedback += `Буква ${userChar.toUpperCase()} на своем месте. `;
            } else if (secretWord.includes(userChar)) {
                feedback += `Буква ${userChar.toUpperCase()} есть в слове, но не на своем месте. `;
                guessedCorrectly = false;
            } else {
                guessedCorrectly = false;
            }
        }

        if (guessedCorrectly) {
            userState.stage = "active-task";
            await ctx.reply(`Поздравляю! Ты угадал слово ${secretWord.toUpperCase()} за ${userState.progress.attempts} попыток!`);
            await ctx.reply(
                "Теперь активное задание:\nВыйди на улицу и сфотографируй красный автомобиль. Отправь фото сюда, чтобы завершить День 3!"
            );
        } else {
            await ctx.reply(feedback || "Все мимо😡");
        }
        return;
    }

    if (userState.stage === "active-task") {
        // Проверяем, отправил ли пользователь фото
        if (ctx.message.photo) {
            userState.stage = null;
            userState.completed = true;
            await ctx.reply("Отлично!🤩🤩🤩\n\nТы справилась с активным заданием!\n\nНа сегодня все😔\nЖди новых заданий завтра!");
        } else {
            await ctx.reply("Это не фото!😡 Пожалуйста, отправь фотографию красного автомобиля.");
        }
    }
};

//==День 4==
const day4Questions = [
    { question: "Зачем вода в стакане?", answer: "за стеклом" },
    { question: "Как называется наша планета?", answer: "земля" },
];

const day4EmojiSongs = [
    { emoji: "🕖7️⃣💺✈️🤔🧑‍✈️", answer: "прованс" },
    { emoji: "🫵👄💦🙅‍♀️", answer: "водица" },
];

const day4Words = ["отряд", "лавка"]; // Загаданные слова для игры из 5 букв

// Координаты торта, подсказки и кодовое слово
const cakeLocation = {
    coordinates: "В 22:30 Катя будет ждать тебя в гости)\nПриходи к Кате к нужному времени, а я напишу что тебя примерно ждет...",
    hints: [
        "Осталось только найти торт, а Катя знает как это сделать, слушай Катю внимательно и пройдешь квест полностью)",
        "После того, как найдешь торт, вернись к Кате, чтобы она дала тебе вторую часть подсказки...",
    ], 
};

const handleDay4 = async (ctx) => {
    const userId = ctx.from.id;

    if (!userStates[userId]) {
        userStates[userId] = { day: 1, stage: null, progress: {}, completed: false };
    }

    const userState = userStates[userId];

    if (!userState.completed) {
        await ctx.reply("Сначала пройди День 3.");
        return;
    }

    if (userState.day < 4) {
        userState.day = 4;
        userState.stage = "intro";
        userState.progress = { currentQuestionIndex: 0, currentSongIndex: 0, currentWordIndex: 0, attempts: 0, step: "questions" };
    }

    const userAnswer = ctx.message.text?.trim().toLowerCase();

    if (userState.stage === "intro") {
        await ctx.reply(
            "Молодец! Ты справилась со всеми моими испытаниями, осталось одно маленькое и все. Но сегодня последний день заданий! Завтра у тебя уже долгожданный день рождения, и там тебе будет не до бота. Поэтому сегодня я тебя не буду сильно мучать. Давай вспомним все, что мы делали:\n\n" +
            "1) Ты отвечала на вопросы и ходила на тренировку.\n" +
            "2) Ты отгадывала песню по эмодзи и искала Егора.\n" +
            "3) Играла в свою любимую игру из 5 букв и фотографировала для меня красную машину.\n\n" +
            "Но я прям чувствую, что чего-то не хватает! Давай выясним чего именно. Как? Повторение - мать учения."
        );
        userState.stage = "questions";
        await ctx.reply(`Вопрос 1: ${day4Questions[0].question}`);
        return;
    }

    if (userState.stage === "questions") {
        const currentIndex = userState.progress.currentQuestionIndex;
        const currentQuestion = day4Questions[currentIndex];

        if (userAnswer === currentQuestion.answer) {
            userState.progress.currentQuestionIndex += 1;

            if (userState.progress.currentQuestionIndex < day4Questions.length) {
                const nextQuestion = day4Questions[userState.progress.currentQuestionIndex].question;
                await ctx.reply(`Правильно! Следующий вопрос:\n${nextQuestion}`);
            } else {
                userState.stage = "emoji-songs";
                await ctx.reply(`Молодец! Теперь угадай песню по эмодзи:\n${day4EmojiSongs[0].emoji}`);
            }
        } else {
            await ctx.reply("Неправильный ответ. Попробуй снова.");
        }
        return;
    }

    if (userState.stage === "emoji-songs") {
        const currentIndex = userState.progress.currentSongIndex;
        const currentSong = day4EmojiSongs[currentIndex];

        if (userAnswer === currentSong.answer) {
            userState.progress.currentSongIndex += 1;

            if (userState.progress.currentSongIndex < day4EmojiSongs.length) {
                const nextSong = day4EmojiSongs[userState.progress.currentSongIndex].emoji;
                await ctx.reply(`Правильно! Следующая песня:\n${nextSong}`);
            } else {
                userState.stage = "word-game";
                await ctx.reply("Отлично! Теперь угадай слово из 5 букв. Напиши слово из 5 букв:");
            }
        } else {
            await ctx.reply("Неправильный ответ. Попробуй снова.");
        }
        return;
    }

    if (userState.stage === "word-game") {
        const currentIndex = userState.progress.currentWordIndex;
        const secretWord = day4Words[currentIndex];

        if (!userAnswer || userAnswer.length !== 5) {
            await ctx.reply("Слово должно состоять ровно из 5 букв.");
            return;
        }

        userState.progress.attempts += 1;
        let feedback = "";
        let guessedCorrectly = true;

        for (let i = 0; i < 5; i++) {
            const userChar = userAnswer[i];
            const secretChar = secretWord[i];

            if (userChar === secretChar) {
                feedback += `Буква ${userChar.toUpperCase()} на своём месте. `;
            } else if (secretWord.includes(userChar)) {
                feedback += `Буква ${userChar.toUpperCase()} есть в слове, но не на своём месте. `;
                guessedCorrectly = false;
            } else {
                guessedCorrectly = false;
            }
        }

        if (guessedCorrectly) {
            userState.progress.currentWordIndex += 1;

            if (userState.progress.currentWordIndex < day4Words.length) {
                await ctx.reply(`Правильно! Следующее слово. Напиши слово из 5 букв:`);
            } else {
                userState.stage = "cake-hunt";
                await ctx.reply(
                    "Отлично, ты совсем справилась! Я думаю, что не хватает, конечно же, торта! Какое день рождения без торта?! Давай поиграем в игру «Найди торт». Я тебе скажу, что делать, чтобы его найти!"
                );
                await ctx.reply(
                    `Задание: ${cakeLocation.coordinates}\n\nПодсказки:\n1. ${cakeLocation.hints[0]}\n2. ${cakeLocation.hints[1]}`
                );
                await ctx.reply("Когда найдёшь торт, возвращайся к Кате за второй половинкой подсказки и потом уже жди сюрприз у себя дома.");
                userState.stage = "enter-code-word";
            }
        } else {
            await ctx.reply(feedback || "Попробуй снова.");
        }
        return;
    }

    if (userState.stage === "enter-code-word") {
        if (userAnswer === cakeLocation.codeWord) {
            userState.stage = null;
            userState.completed = true;
            await ctx.reply(
                "Поздравляю! Ты прошла все мои задания и нашла торт! Теперь наслаждайся своим днём рождения. Спасибо, что играла со мной! 🎉🎂"
            );
        } else {
            await ctx.reply("Это неправильное кодовое слово. Попробуй снова.");
        }
    }
};

//СТАРТ
// Команда /start
bot.command("start", async (ctx) => {
    const userId = ctx.from.id;
    userStates[userId] = { day: 1, stage: null, progress: {}, completed: false };

    await ctx.reply(
        'Привет, будущая именинница! 👋\n\n' + 
        'Дождалась? Вот тебе и сюрприз, правда уже не такой уж это и сюрприз , но все же какой есть) 🥲🎉\n\n' + 
        'Давай знакомиться, Я - бот, который придумал тебе несколько интересных заданий, которые ты должна пройти, задания будут делиться на дни (у меня не было времени протестить все, поэтому помогай), но делиться они будут условно, около твоей клавиатуры есть кнопка «menu» в которой и запрятаны задания на каждый день. Давай договоримся, что выполнив задания на сегодня, ты не будешь открывать задание на завтра, только когда наступить следующий день, ты нажмешь на нужную кнопку, пожалуйста 🙏!\n\n' +
        'Итак, мы немного познакомились, теперь давай начнем более тесное общение, для начала проверим как все работает, открывай «menu» и выбирай ИНСТРУКЦИЯ, где ты узнаешь правила!'
    );
});

//ИНСТРУКЦИЯ
bot.command('help', async (ctx) => {
    await ctx.reply(
        'ИНСТРУКЦИЯ:\n\n' +
        'Правила очень простые, выполняешь задание - переходишь к следующему. Как я уже и говорил, выполнять задания нужно строго в нужной последовательности и в нужную дату\nЗадания все легкие и делятся на две категории:\n1) активные 2) неактивные\n\n' +
        'Все просто, правда же?😊\n\n'+
        'Итак небольшой инструктаж:\n' +
        'Кнопка СТАРТ - запускает меня и начинает весь наш диалог сначала\n\n' +
        'Кнопка ИНСТРУКЦИЯ - отправляет тебе инструкцию , то есть данное сообщение\n\n' +
        'Кнопка Задания 16.12 - дает тебе задания на данное число\nС последующими датами все аналогично, нажимаешь кнопку - получаешь задание\n\n' +
        'Но не все так просто , иногда , чтобы продолжить , нужно выполнить активное задание, пока ты его выполняешь ничего не надо мне писать, как выполнишь - пиши.\n\n' +
        'Ну что, скоро твой любимый день рождение! Давай немного сделаем его не таким как все остальные)🥳🥳🥳\n\n' +
        'Желаю тебе удачи, нажимай на нужную дату и летс гоу!🍀\n\n' +
        'P.S: Нажать на кнопку 16.12 советую ночью, потому что задание там утреннее)'
    );
});

// Команда для Дня 1
bot.command("day1", async (ctx) => {
    userStates[ctx.from.id].day = 1;
    await handleDay1(ctx);

    await bot.api.getUpdates
});

// Команда для Дня 2
bot.command("day2", async (ctx) => {
    await handleDay2(ctx);
});

// Команда для Дня 3
bot.command("day3", async (ctx) => {
    await handleDay3(ctx);
});
// Обработка команды для Дня 4
bot.command("day4", async (ctx) => {
    await handleDay4(ctx);
});

bot.on("message:voice", async (ctx) => {
    const fileId = ctx.message.voice.file_id;
    console.log('Получен File_id гс:', fileId);
    await ctx.reply(`File ID: ${fileId}`);
})

const secretVoiceFileId = "AwACAgIAAxkBAAIKhWdYh0TkS7kUw48K_onFMULQN0NCAAL1awAC8WbJShYFg4x11QABnzYE"; // Замените на реальный file_id вашего голосового сообщения

bot.command("secret", async (ctx) => {
    try {
        // Отправляем текстовое сообщение
        await ctx.reply("Хлюююп🧸...");

        // Отправляем голосовое сообщение
        await ctx.replyWithVoice(secretVoiceFileId);
    } catch (error) {
        console.error("Ошибка при обработке команды /secret:", error);
        await ctx.reply("Произошла ошибка. Попробуй снова.");
    }
});


bot.on("message:text", async (ctx) => {
    const userId = ctx.from.id;
    const userState = userStates[userId];

    if (userState?.day === 1) {
        await handleDay1(ctx);
    } else if (userState?.day === 2) {
        await handleDay2(ctx);
    } else if (userState?.day === 3) {
        await handleDay3(ctx);
    } else if (userState?.day === 4 && userState?.stage) {
        await handleDay4(ctx);
    } else {
        await ctx.reply("Я пока не знаю, что с этим делать. Попробуй выбрать день из меню.");
    }
});

// Обработка сообщений
bot.on("message", async (ctx) => {
    const userId = ctx.from.id;
    const userState = userStates[userId];

    if (userState?.day === 3 && userState?.stage === "active-task") {
        // Если пользователь на этапе активного задания
        if (ctx.message.photo) {
            await handleDay3(ctx); // Обрабатываем фото
        } else {
            await ctx.reply("Это не фото! Пожалуйста, отправь фотографию красного автомобиля.");
        }
    } else if (userState?.day === 3) {
        await handleDay3(ctx); // Все остальные этапы Дня 3
    }
});

// === Обработка ошибок ===
bot.catch((err) => {
    const ctx = err.ctx;
    console.error("Error while handling update " + ctx.update.update_id);
    const e = err.error;

    if (e instanceof GrammyError) {
        console.error("Error in request:", e.description);
    } else if (e instanceof HttpError) {
        console.error("Could not contact Telegram:", e);
    } else {
        console.error("Unknown error:", e);
    }
});

// === Запуск бота ===
bot.start();
