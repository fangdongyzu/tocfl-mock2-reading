let currentParts = [];
let currentPartIndex = 0;
let userAnswers = {};
let questionsByPart = {};

// DOM Elements
const partSelection = document.querySelector('.part-selection');
const quizContainer = document.getElementById('quiz-container');
const resultsContainer = document.getElementById('results-container');
const partTitle = document.getElementById('part-title');
const questionContainer = document.getElementById('question-container');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');
const restartBtn = document.getElementById('restart-btn');
const scoreElement = document.getElementById('score');
const totalElement = document.getElementById('total');
const percentageElement = document.getElementById('percentage');
const resultsDetails = document.getElementById('results-details');
const partBreakdownElement = document.getElementById('part-breakdown');
const startQuizBtn = document.getElementById('start-quiz-btn');

// Part information
const partInfo = {
    1: { name: "Part 1: Sentence Comprehension" },
    2: { name: "Part 2: Picture Description" },
    3: { name: "Part 3: Word Fill-in" },
    4: { name: "Part 4: Paragraph Completion" },
    5: { name: "Part 5: Reading Comprehension" }
};

// Event Listeners
startQuizBtn.addEventListener('click', startQuiz);
prevBtn.addEventListener('click', showPreviousPart);
nextBtn.addEventListener('click', showNextPart);
submitBtn.addEventListener('click', submitQuiz);
restartBtn.addEventListener('click', restartQuiz);

// Update start button state based on selection
document.querySelectorAll('.part-checkbox input').forEach(checkbox => {
    checkbox.addEventListener('change', updateStartButton);
});

function updateStartButton() {
    const selectedParts = Array.from(document.querySelectorAll('.part-checkbox input:checked'));
    startQuizBtn.disabled = selectedParts.length === 0;
}

function startQuiz() {
    const selectedCheckboxes = Array.from(document.querySelectorAll('.part-checkbox input:checked'));
    currentParts = selectedCheckboxes.map(cb => parseInt(cb.dataset.part)).sort();
    
    if (currentParts.length === 0) {
        alert('Please select at least one part to start the quiz!');
        return;
    }
    
    currentPartIndex = 0;
    userAnswers = {};
    
    // Organize questions by part
    questionsByPart = {};
    currentParts.forEach(part => {
        questionsByPart[part] = quizData.filter(q => q.part === part).sort((a, b) => a.id - b.id);
    });
    
    partSelection.classList.add('hidden');
    quizContainer.classList.remove('hidden');
    resultsContainer.classList.add('hidden');
    
    showCurrentPart();
}

function showCurrentPart() {
    const currentPart = currentParts[currentPartIndex];
    const currentPartQuestions = questionsByPart[currentPart];
    
    partTitle.textContent = `${partInfo[currentPart].name}`;
    
    // Show all questions for current part
    showAllQuestions(currentPartQuestions);
    updateNavigationButtons();
}

function showAllQuestions(questions) {
    let questionsHTML = '';
    
    // 定義 41-45 題的短文內容
    const text41_45 = "林一正的孩子快要出生了 ，他覺得現在的家太小了 ，所以他在自己的公司附近 ___（41）___ 。那裡有很多商店，而且離房子走路五分鐘的地方， ___（42） ___。房子對面還有一個小公園，以後他和太太___（43） ___，雖然那裡的房子很貴，讓 （44） ，但是林一正覺得沒關係，因為 ___（45）___ ，林一正相信太太一定也很喜歡這間房子。";

    questions.forEach(question => {
        // --- 1. 在特定題號前，插入共用區塊 (圖片或文章) ---

        // Part 3: 31-35 題 (在 31 題上方顯示共用圖片)
        if (question.id === 31) {
            questionsHTML += `
                <div class="context-container">
                    <img src="images/31-35.png" alt="Reference for questions 31-35">
                </div>`;
        }
        
        // Part 4 (前半): 36-40 題 (在 36 題上方顯示共用圖片)
        if (question.id === 36) {
            questionsHTML += `
                <div class="context-container">
                    <img src="images/36-40.png" alt="Reference for questions 36-40">
                </div>`;
        }

        // Part 4 (後半): 41-45 題 (在 41 題上方顯示閱讀短文)
        if (question.id === 41) {
            questionsHTML += `
                <div class="context-container">
                    <div class="reading-passage">${text41_45}</div>
                </div>`;
        }

        // --- 2. 產生個別題目卡片 ---
        
        // 這裡統一呼叫 createStandardQuestion，
        // 如果您原本對 Part 4 有特殊的 HTML 結構需求，請改回呼叫 createPart4Question(question)
        if (question.part === 4) {
             questionsHTML += createStandardQuestion(question); 
        } else {
             questionsHTML += createStandardQuestion(question);
        }
    });
    
    questionContainer.innerHTML = questionsHTML;
    
    // 為所有選項加入點擊事件
    document.querySelectorAll('.option').forEach(option => {
        option.addEventListener('click', (e) => {
            const questionId = parseInt(e.currentTarget.dataset.questionId);
            const selectedOption = e.currentTarget.dataset.option;
            
            // 移除該題其他選項的選取狀態
            document.querySelectorAll(`.option[data-question-id="${questionId}"]`).forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // 標示當前選項
            e.currentTarget.classList.add('selected');
            
            // 儲存使用者答案
            userAnswers[questionId] = selectedOption;
        });
    });
    
    // 還原使用者之前的選擇 (如果有的話)
    questions.forEach(question => {
        if (userAnswers[question.id]) {
            const selectedOption = document.querySelector(`.option[data-question-id="${question.id}"][data-option="${userAnswers[question.id]}"]`);
            if (selectedOption) {
                selectedOption.classList.add('selected');
            }
        }
    });
}

function createStandardQuestion(question) {
    // 檢查是否為「共用圖片」的題號範圍 (31-40)
    // 31-35 和 36-40 都已在上方顯示大圖，所以卡片內部不需再顯示圖片
    const isSharedImageRange = (question.id >= 31 && question.id <= 40);
    
    // 決定是否在卡片內顯示圖片：
    // 條件：題目本身有圖片資料 AND 不在共用圖片的範圍內
    const showImageInCard = question.image && !isSharedImageRange;

    return `
        <div class="question-item">
            <div class="question-text">${question.id}. ${question.question}</div>
            ${showImageInCard ? `
                <div class="question-image">
                    <img src="${question.image}" alt="Question ${question.id} Image">
                </div>
            ` : ''}
            <div class="options">
                ${question.options.map((option, index) => {
                    const optionLetter = String.fromCharCode(65 + index);
                    return `
                        <div class="option" data-question-id="${question.id}" data-option="${optionLetter}">
                            <span class="option-letter">${optionLetter}</span>
                            <span class="option-text">${option}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}


function updateNavigationButtons() {
    const isFirstPart = currentPartIndex === 0;
    const isLastPart = currentPartIndex === currentParts.length - 1;
    
    prevBtn.style.display = isFirstPart ? 'none' : 'block';
    
    if (isLastPart) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'block';
    } else {
        nextBtn.style.display = 'block';
        submitBtn.style.display = 'none';
    }
    
    // Update button texts
    if (currentParts.length > 1) {
        prevBtn.textContent = 'Previous Part';
        nextBtn.textContent = 'Next Part';
    } else {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'block';
    }
}

function showPreviousPart() {
    if (currentPartIndex > 0) {
        currentPartIndex--;
        showCurrentPart();
    }
}

function showNextPart() {
    if (currentPartIndex < currentParts.length - 1) {
        currentPartIndex++;
        showCurrentPart();
    }
}

function submitQuiz() {
    let totalScore = 0;
    let totalQuestions = 0;
    
    // Calculate scores by part
    const partScores = {};
    currentParts.forEach(part => {
        const partQuestions = questionsByPart[part];
        const partTotal = partQuestions.length;
        let partScore = 0;
        
        partQuestions.forEach(question => {
            totalQuestions++;
            if (userAnswers[question.id] === question.answer) {
                partScore++;
                totalScore++;
            }
        });
        
        partScores[part] = {
            score: partScore,
            total: partTotal,
            percentage: Math.round((partScore / partTotal) * 100)
        };
    });
    
    // Display overall results
    scoreElement.textContent = totalScore;
    totalElement.textContent = totalQuestions;
    percentageElement.textContent = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
    
    // Show part breakdown
    showPartBreakdown(partScores);
    
    // Show detailed results
    showDetailedResults();
    
    // Switch to results view
    quizContainer.classList.add('hidden');
    resultsContainer.classList.remove('hidden');

  // JUMP TO TOP IMMEDIATELY (No scrolling effect)
    window.scrollTo(0, 0);
}

function showPartBreakdown(partScores) {
    partBreakdownElement.innerHTML = '<h3>Performance Analysis by Part</h3>';
    
    currentParts.forEach(part => {
        const scoreInfo = partScores[part];
        const breakdownItem = document.createElement('div');
        breakdownItem.className = 'breakdown-item';
        
        breakdownItem.innerHTML = `
            <h4>${partInfo[part].name}</h4>
            <div>Score: ${scoreInfo.score} / ${scoreInfo.total}</div>
            <div>Accuracy: ${scoreInfo.percentage}%</div>
        `;
        
        partBreakdownElement.appendChild(breakdownItem);
    });
}

function showDetailedResults() {
    resultsDetails.innerHTML = '<h3>Detailed Answer Results</h3>';
    
    currentParts.forEach(part => {
        const partQuestions = questionsByPart[part];
        
        partQuestions.forEach(question => {
            const userAnswer = userAnswers[question.id];
            const isCorrect = userAnswer === question.answer;
            const isAnswered = userAnswer !== undefined;
            
            const resultItem = document.createElement('div');
            resultItem.className = `result-item ${isCorrect ? 'correct' : isAnswered ? 'incorrect' : 'unanswered'}`;
            
            let statusText = '';
            if (isCorrect) {
                statusText = '✓ Correct';
            } else if (isAnswered) {
                statusText = '✗ Incorrect';
            } else {
                statusText = '○ Not Answered';
            }
            
            const userAnswerText = userAnswer ? `Your Answer: ${userAnswer}` : 'Not Answered';
            const correctAnswerText = `Correct Answer: ${question.answer}`;
            
            resultItem.innerHTML = `
                <div class="result-question">${partInfo[part].name} - Question ${question.id}: ${statusText}</div>
                <div class="result-answer">${userAnswerText} | ${correctAnswerText}</div>
            `;
            
            resultsDetails.appendChild(resultItem);
        });
    });
}

function restartQuiz() {
    resultsContainer.classList.add('hidden');
    partSelection.classList.remove('hidden');
    
    // Reset checkboxes
    document.querySelectorAll('.part-checkbox input').forEach(checkbox => {
        checkbox.checked = false;
    });
    updateStartButton();
    
    currentParts = [];
    currentPartIndex = 0;
    userAnswers = {};
    questionsByPart = {};
}

// Initialize
updateStartButton();