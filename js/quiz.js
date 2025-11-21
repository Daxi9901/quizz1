let questions = [];
let current = 0;
let score = 0;
let timerInterval;
let timeLeft = 30;

// UI elementi
const titleBox = document.getElementById("quiz-title");
const questionBox = document.getElementById("question");
const answersBox = document.getElementById("answers");
const nextBtn = document.getElementById("next-btn");
const progress = document.getElementById("progress");
const timer = document.getElementById("timer");
const explanationBox = document.getElementById("explanation-box");

const CATEGORY_NAMES = {
    logika: "Logika",
    matematika: "Matematika",
    istorija: "Istorija",
    geografija: "Geografija",
    nauka: "Nauka",
    kultura: "Kultura",
    kreativno: "Kreativno",
    zagonetke: "Zagonetke"
};



// Učitavanje kategorije
async function loadCategory() {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("cat");

    if (!category) {
        titleBox.textContent = "Greška!";
        questionBox.textContent = "Nije prosleđena kategorija.";
        return;
    }

    // Postavljanje tačnog naslova
    titleBox.textContent = CATEGORY_NAMES[category] ?? "Kviz";

    try {
        const res = await fetch(`data/${category}.json`);
        questions = await res.json();
        startQuiz();
    } catch (err) {
        questionBox.textContent = "Greška: ne mogu da učitam JSON!";
        console.error(err);
    }
}

function startQuiz() {
    current = 0;
    score = 0;

    nextBtn.style.display = "inline-block";
    progress.style.display = "block";
    timer.style.display = "block";

    showQuestion();
}

function showQuestion() {
    clearInterval(timerInterval);
    timeLeft = 30;
    startTimer();

    const q = questions[current];

    questionBox.textContent = q.question;
    progress.textContent = `Pitanje ${current + 1}/${questions.length}`;

    answersBox.innerHTML = "";
    explanationBox.style.display = "none";
    explanationBox.innerHTML = "";

    q.answers.forEach((ans, index) => {
        const btn = document.createElement("button");
        btn.textContent = ans;
        btn.dataset.index = index;
        btn.onclick = selectAnswer;
        answersBox.appendChild(btn);
    });

    nextBtn.disabled = true;
}

function selectAnswer(e) {
    clearInterval(timerInterval);

    const selected = e.target;
    const chosen = parseInt(selected.dataset.index);
    const correct = questions[current].correct;

    Array.from(answersBox.children).forEach(btn => {
        btn.disabled = true;
        if (parseInt(btn.dataset.index) === correct) {
            btn.classList.add("correct");
        }
    });

    if (chosen !== correct) {
        selected.classList.add("wrong");
    } else {
        score++;
    }

    explanationBox.innerHTML = questions[current].explanation;
    explanationBox.style.display = "block";

    nextBtn.disabled = false;
}

function startTimer() {
    timer.textContent = "00:" + (timeLeft < 10 ? "0" + timeLeft : timeLeft);

    timerInterval = setInterval(() => {
        timeLeft--;
        timer.textContent = "00:" + (timeLeft < 10 ? "0" + timeLeft : timeLeft);

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            autoFail();
        }
    }, 1000);
}

function autoFail() {
    const correct = questions[current].correct;

    Array.from(answersBox.children).forEach(btn => {
        btn.disabled = true;
        if (parseInt(btn.dataset.index) === correct) {
            btn.classList.add("correct");
        }
    });

    explanationBox.innerHTML = questions[current].explanation;
    explanationBox.style.display = "block";

    nextBtn.disabled = false;
}

nextBtn.onclick = () => {
    current++;

    if (current >= questions.length) {
        endQuiz();
    } else {
        showQuestion();
    }
};

function endQuiz() {
    questionBox.textContent = "Rezultat";
    answersBox.innerHTML = `<p>Tačni odgovori: <b>${score}</b> od ${questions.length}</p>
                            <a href=\"index.html\">Nazad na početnu</a>`;

    progress.textContent = "";
    timer.textContent = "";
    explanationBox.style.display = "none";

    nextBtn.style.display = "none";
}

// START
loadCategory();
