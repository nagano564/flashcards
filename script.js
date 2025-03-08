document.addEventListener('DOMContentLoaded', () => {
    let cards = JSON.parse(localStorage.getItem('flashcards')) || [];
    let currentCardIndex = 0;
    let isFlipped = false;
    let showDefinitionFirst = true;

    const tabBtns = document.querySelectorAll('.tab-btn');
    const sections = document.querySelectorAll('.section');
    const cardForm = document.getElementById('card-form');
    const cardsContainer = document.querySelector('.cards-container');
    const studyCard = document.querySelector('.card-inner');
    const studyCardContainer = document.querySelector('.study-card');
    const cardFront = document.querySelector('.card-front .card-text');
    const cardBack = document.querySelector('.card-back .card-text');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const flipBtn = document.getElementById('flip-btn');
    const shuffleBtn = document.getElementById('shuffle-btn');
    const deleteAllBtn = document.getElementById('delete-all-cards');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            tabBtns.forEach(b => b.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`${tabId}-section`).classList.add('active');
            if (tabId === 'study' && cards.length > 0) {
                updateStudyCard();
            }
        });
    });

    cardForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const term = document.getElementById('term').value;
        const definition = document.getElementById('definition').value;
        cards.push({ term, definition });
        localStorage.setItem('flashcards', JSON.stringify(cards));
        cardForm.reset();
        displayCards();
    });

    function displayCards() {
        cardsContainer.innerHTML = cards.map((card, index) => `
            <div class="saved-card">
                <strong>Term:</strong> ${card.term}<br>
                <strong>Definition:</strong> ${card.definition}<br>
                <button onclick="deleteCard(${index})">Delete</button>
            </div>
        `).join('');
    }

    window.deleteCard = (index) => {
        cards.splice(index, 1);
        localStorage.setItem('flashcards', JSON.stringify(cards));
        displayCards();
    };

    function updateStudyCard() {
        if (cards.length === 0) {
            cardFront.textContent = 'No cards available!';
            cardBack.textContent = 'Add some cards first!';
            return;
        }
        if (showDefinitionFirst) {
            cardFront.textContent = cards[currentCardIndex].definition;
            cardBack.textContent = cards[currentCardIndex].term;
        } else {
            cardFront.textContent = cards[currentCardIndex].term;
            cardBack.textContent = cards[currentCardIndex].definition;
        }
        isFlipped = false;
        studyCard.classList.remove('flipped');
    }

    function flipCard() {
        if (cards.length > 0) {
            isFlipped = !isFlipped;
            studyCard.classList.toggle('flipped');
        }
    }

    flipBtn.addEventListener('click', flipCard);
    studyCardContainer.addEventListener('click', (e) => {
        if (!e.target.closest('.study-controls')) {
            flipCard();
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentCardIndex > 0) {
            currentCardIndex--;
            updateStudyCard();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentCardIndex < cards.length - 1) {
            currentCardIndex++;
            updateStudyCard();
        }
    });

    function shuffleCards() {
        if (cards.length <= 1) {
            alert('Need at least 2 cards to shuffle!');
            return;
        }
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }
        currentCardIndex = 0;
        updateStudyCard();
        localStorage.setItem('flashcards', JSON.stringify(cards));
    }

    shuffleBtn.addEventListener('click', shuffleCards);

    deleteAllBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete all cards?')) {
            localStorage.removeItem('flashcards');
            cards = [];
            displayCards();
        }
    });

    document.getElementById('toggle-display').addEventListener('click', () => {
        showDefinitionFirst = !showDefinitionFirst;
        updateStudyCard();
    });

    displayCards();
});
