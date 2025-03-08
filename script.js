document.addEventListener('DOMContentLoaded', () => {
    let cards = JSON.parse(localStorage.getItem('flashcards')) || [];
    let currentCardIndex = 0;
    let isFlipped = false;
    let showDefinitionFirst = false;

    const toggleDisplayBtn = document.getElementById('toggle-display');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const sections = document.querySelectorAll('.section');
    const cardForm = document.getElementById('card-form');
    const cardsContainer = document.querySelector('.cards-container');
    const studyCard = document.querySelector('.card-inner');
    studyCard.addEventListener('click', () => {
        studyCard.classList.toggle('flipped');
        isFlipped = !isFlipped;
    });
    const studyCardContainer = document.querySelector('.study-card');
    const cardFront = document.querySelector('.card-front .card-text');
    const cardBack = document.querySelector('.card-back .card-text');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const flipBtn = document.getElementById('flip-btn');
    const shuffleBtn = document.getElementById('shuffle-btn');
    const deleteAllBtn = document.getElementById('delete-all-cards');
    const jsonFileInput = document.getElementById('json-file');
    const importJsonBtn = document.getElementById('import-json');

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

    importJsonBtn.addEventListener('click', () => {
        const file = jsonFileInput.files[0];
        if (!file) {
            alert('Please select a JSON file first');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonData = JSON.parse(e.target.result);
                
                if (Array.isArray(jsonData)) {
                    // Handle array of cards
                    jsonData.forEach(card => {
                        if (card.term && card.definition) {
                            cards.push(card);
                        }
                    });
                } else if (typeof jsonData === 'object' && jsonData !== null) {
                    // Handle dictionary format (your JSON format)
                    for (const [term, definition] of Object.entries(jsonData)) {
                        cards.push({ term, definition });
                    }
                } else {
                    throw new Error('Invalid format - must be object or array');
                }
                
                localStorage.setItem('flashcards', JSON.stringify(cards));
                displayCards();
                jsonFileInput.value = '';
                alert('Cards imported successfully!');
            } catch (error) {
                console.error('JSON import error:', error);
                alert('Error reading JSON file. The file must be either:\n1. A dictionary with terms as keys and definitions as values\n2. An array of objects with "term" and "definition" keys');
            }
        };
        reader.readAsText(file);
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

    deleteAllBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete all cards?')) {
            localStorage.removeItem('flashcards');
            cards = [];
            displayCards();
        }
    });

    toggleDisplayBtn.addEventListener('click', () => {
        showDefinitionFirst = !showDefinitionFirst;
        updateStudyCard();
    });

    // Study mode functions
    function updateStudyCard() {
        if (cards.length === 0) {
            studyCardContainer.innerHTML = '<div class="empty-state">No cards available to study</div>';
            return;
        }

        const currentCard = cards[currentCardIndex];
        if (showDefinitionFirst) {
            cardFront.textContent = currentCard.definition;
            cardBack.textContent = currentCard.term;
        } else {
            cardFront.textContent = currentCard.term;
            cardBack.textContent = currentCard.definition;
        }
        
        studyCard.classList.remove('flipped');
        isFlipped = false;
    }

    flipBtn.addEventListener('click', () => {
        studyCard.classList.toggle('flipped');
        isFlipped = !isFlipped;
    });

    prevBtn.addEventListener('click', () => {
        currentCardIndex = (currentCardIndex - 1 + cards.length) % cards.length;
        updateStudyCard();
    });

    nextBtn.addEventListener('click', () => {
        currentCardIndex = (currentCardIndex + 1) % cards.length;
        updateStudyCard();
    });

    shuffleBtn.addEventListener('click', () => {
        // Fisher-Yates shuffle algorithm
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }
        currentCardIndex = 0;
        updateStudyCard();
        localStorage.setItem('flashcards', JSON.stringify(cards));
    });

    displayCards();

    // Initialize study card if there are cards and we're in study mode
    if (cards.length > 0 && document.getElementById('study-section').classList.contains('active')) {
        updateStudyCard();
    }
});
