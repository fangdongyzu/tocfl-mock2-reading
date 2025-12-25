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
const selectedPartsElement = document.getElementById('selected-parts');
const partBreakdownElement = document.getElementById('part-breakdown');
const startQuizBtn = document.getElementById('start-quiz-btn');

// Part information
const partInfo = {
    1: { name: "Part 1: Sentence Comprehension", range: "1-15" },
    2: { name: "Part 2: Picture Description", range: "16-30" },
    3: { name: "Part 3: Word Fill-in", range: "31-35" },
    4: { name: "Part 4: Paragraph Completion", range: "36-45" },
    5: { name: "Part 5: Reading Comprehension", range: "46-50" }
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
    
    // Show all selected parts as tags with current part highlighted
    selectedPartsElement.innerHTML = '';
    currentParts.forEach((part, index) => {
        const partTag = document.createElement('span');
        partTag.className = `part-tag ${index === currentPartIndex ? 'current-part' : ''}`;
        partTag.textContent = `Part ${part}`;
        selectedPartsElement.appendChild(partTag);
    });
    
    // Show all questions for current part
    showAllQuestions(currentPartQuestions);
    updateNavigationButtons();
}

function showAllQuestions(questions) {
    let questionsHTML = '';
    
    questions.forEach(question => {
        if (question.part === 4) {
            questionsHTML += createPart4Question(question);
        } else {
            questionsHTML += createStandardQuestion(question);
        }
    });
    
    questionContainer.innerHTML = questionsHTML;
    
    // Add event listeners to all options
    document.querySelectorAll('.option').forEach(option => {
        option.addEventListener('click', (e) => {
            const questionId = parseInt(e.currentTarget.dataset.questionId);
            const selectedOption = e.currentTarget.dataset.option;
            
            // Remove selected class from all options for this question
            document.querySelectorAll(`.option[data-question-id="${questionId}"]`).forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // Add selected class to clicked option
            e.currentTarget.classList.add('selected');
            
            // Store user answer
            userAnswers[questionId] = selectedOption;
        });
    });
    
    // Restore previous selections
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
    return `
        <div class="question-item">
            <div class="question-text">${question.id}. ${question.question}</div>
            ${question.image ? `
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

function createPart4Question(question) {
    return `
        <div class="question-item">
            <div class="question-text">${question.id}. ${question.question}</div>
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
    percentageElement.textContent = Math.round((totalScore / totalQuestions) * 100);
    
    // Show part breakdown
    showPartBreakdown(partScores);
    
    // Show detailed results
    showDetailedResults();
    
    // Switch to results view
    quizContainer.classList.add('hidden');
    resultsContainer.classList.remove('hidden');
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