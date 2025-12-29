const testData = [ //массив с данными
    {
        question: "А голос у него был не такой, как у почтальона Печкина, дохленький. У Гаврюши голосище был, как у электрички. Он _________ на ноги поднимал.",
        options: [
            { text: "Пол деревни, за раз", correct: false },
            { text: "Полдеревни, зараз", correct: true, explanation: "Правильно! Раздельно существительное будет писаться в случае наличия дополнительного слова между существительным и частицей. Правильный ответ: полдеревни пишется слитно. Зараз (ударение на второй слог) — это обстоятельственное наречие, пишется слитно. Означает быстро, одним махом." },
            { text: "Пол-деревни, за раз", correct: false }
        ]
    },
    {
        question: "А эти слова как пишутся?",
        options: [
            { text: "Капуччино и эспрессо", correct: false },
            { text: "Каппуччино и экспресо", correct: false },
            { text: "Капучино и эспрессо", correct: true, explanation: "Конечно! По орфографическим нормам русского языка единственно верным написанием будут «капучино» и «эспрессо»." }
        ]
    },
    {
        question: "Как нужно писать?",
        options: [
            { text: "Черезчур", correct: false },
            { text: "Черес-чур", correct: false },
            { text: "Чересчур", correct: true, explanation: "Да! Это слово появилось от соединения предлога «через» и древнего слова «чур», которое означает «граница», «край». Но слово претерпело изменения, так что правильное написание учим наизусть — «чересчур»." }
        ]
    },
    {
        question: "Где допущена ошибка?",
        options: [
            { text: "Аккордеон", correct: false },
            { text: "Белиберда", correct: false },
            { text: "Эпелепсия", correct: true, explanation: "Верно! Это слово пишется так: «эпИлепсия»." }
        ]
    }
];

//переменные состояния
let currentQuestions = [];
let currentQuestionIndex = 0;
let correctAnswers = 0;
let answeredQuestions = [];
let canSelectAnswer = true;

//Запуск теста при загрузке страницы
//назначение обработчика для кнопкии перезапуска
document.addEventListener('DOMContentLoaded', function() {
    initTest();
    document.getElementById('restart-btn').addEventListener('click', initTest);
});

// Инициализация теста
// Копирование исходных данных
// Перемешивание вопросов и ответов
// Сброс всех переменных состояния
function initTest() {
    currentQuestions = [...testData];
    shuffleArray(currentQuestions);
    currentQuestions.forEach(q => shuffleArray(q.options));

    currentQuestionIndex = 0;
    correctAnswers = 0;
    answeredQuestions = [];
    canSelectAnswer = true;
    
    document.getElementById('test-area').innerHTML = '';
    document.getElementById('no-questions').style.display = 'none';
    document.getElementById('results').style.display = 'none';
    
    console.log(answeredQuestions);
    
    showQuestion();
}

//перемешивание массива
//Алгоритм Фишера-Йейтса для случайного перемешивания
//Обеспечивает неповторяющийся порядок
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

//Функция показа вопроса
function showQuestion() {
    const testArea = document.getElementById('test-area');
    
    if (currentQuestionIndex < currentQuestions.length) {
        const question = currentQuestions[currentQuestionIndex];
        
        testArea.innerHTML = `
            <div class="question-container">
                <div class="question-header">
                    <div class="question-number">${currentQuestionIndex + 1}</div>
                    <div class="question-text">${question.question}</div>
                </div>
                <div class="answers-container">
                    ${question.options.map((option, index) => `
                        <div class="answer-option" data-index="${index}">
                            ${option.text}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        document.querySelectorAll('.answer-option').forEach(option => {
            option.addEventListener('click', function() {
                if (canSelectAnswer) {
                    selectAnswer(question.options[this.dataset.index], this);
                }
            });
        });
    } else {
        document.getElementById('no-questions').style.display = 'block';
        showResults();
    }
}

// Функция выбора ответа
// Блокировка повторных выборов
// Отложенное выполнение для анимаций
// Логика отображения правильных/неправильных ответов
function selectAnswer(option, answerElement) {
    canSelectAnswer = false;
    answerElement.classList.add('selected');
    
    const currentQuestion = currentQuestions[currentQuestionIndex];
    answeredQuestions.push({
        question: currentQuestion.question,
        selectedAnswer: option.text,
        correctAnswer: currentQuestion.options.find(opt => opt.correct).text,
        isCorrect: option.correct,
        explanation: option.explanation || ''
    });

    setTimeout(() => {
        const allAnswers = document.querySelectorAll('.answer-option');
        
        if (option.correct) {
            correctAnswers++;
            answerElement.classList.add('correct');
            answerElement.innerHTML += '<div class="marker correct-marker">✓</div>';
            
            if (option.explanation) {
                const explanation = document.createElement('div');
                explanation.className = 'explanation';
                explanation.textContent = option.explanation;
                explanation.style.display = 'block';
                answerElement.appendChild(explanation);
            }
            
            allAnswers.forEach(ans => {
                if (!ans.classList.contains('correct')) {
                    ans.classList.add('incorrect');
                    ans.innerHTML += '<div class="marker incorrect-marker">✗</div>';
                }
            });
        } else {
            answerElement.classList.add('incorrect');
            answerElement.innerHTML += '<div class="marker incorrect-marker">✗</div>';
            
            const correctOption = currentQuestion.options.find(opt => opt.correct);
            allAnswers.forEach(ans => {
                if (ans.textContent.includes(correctOption.text)) {
                    ans.classList.add('correct');
                    ans.innerHTML += '<div class="marker correct-marker">✓</div>';
                    if (correctOption.explanation) {
                        const explanation = document.createElement('div');
                        explanation.className = 'explanation';
                        explanation.textContent = correctOption.explanation;
                        explanation.style.display = 'block';
                        ans.appendChild(explanation);
                    }
                } else if (ans !== answerElement) {
                    ans.classList.add('incorrect');
                    ans.innerHTML += '<div class="marker incorrect-marker">✗</div>';
                }
            });
        }

        setTimeout(() => {
            allAnswers.forEach((ans, index) => {
                setTimeout(() => {
                    ans.classList.add('answer-move-down');
                }, index * 200);
            });
            
            setTimeout(() => {
                currentQuestionIndex++;
                canSelectAnswer = true;
                showQuestion();
            }, allAnswers.length * 200 + 500);
        }, 1500);
    }, 500);
}

// Функция показа результатов
// Вывод итоговой статистики
// Создание интерактивной истории ответов
function showResults() {
    document.getElementById('correct-count').textContent = correctAnswers;
    document.getElementById('total-count').textContent = testData.length;
    document.getElementById('results').style.display = 'block';
    
    const historyContainer = document.getElementById('question-history');
    historyContainer.innerHTML = '<h3>История ответов</h3>';
    
    answeredQuestions.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="question-header">
                <div class="question-number">${index + 1}</div>
                <div class="question-text">${item.question}</div>
            </div>
            <div class="history-answer">
                <p><strong>Ваш ответ:</strong> ${item.selectedAnswer} ${item.isCorrect ? '✓' : '✗'}</p>
                <p><strong>Правильный ответ:</strong> ${item.correctAnswer}</p>
                ${item.explanation ? `<p><strong>Пояснение:</strong> ${item.explanation}</p>` : ''}
            </div>
        `;
        
        historyItem.addEventListener('click', function() {
            document.querySelectorAll('.history-answer').forEach(ans => {
                if (ans !== this.querySelector('.history-answer')) {
                    ans.style.display = 'none';
                }
            });
            const answer = this.querySelector('.history-answer');
            answer.style.display = answer.style.display === 'block' ? 'none' : 'block';
        });
        
        historyContainer.appendChild(historyItem);
    });
}