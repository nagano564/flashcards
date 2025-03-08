document.addEventListener('DOMContentLoaded', () => {
    // JSON Import Elements
    const jsonFileInput = document.getElementById('json-file');
    const importJsonBtn = document.getElementById('import-json');

    // Handle JSON import
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
                
                // Convert JSON object to cards
                Object.entries(jsonData).forEach(([key, value]) => {
                    cards.push({
                        term: key,
                        definition: value
                    });
                });

                // Save to localStorage and update display
                localStorage.setItem('flashcards', JSON.stringify(cards));
                displayCards();
                jsonFileInput.value = ''; // Reset file input
                alert('Cards imported successfully!');
            } catch (error) {
                alert('Error reading JSON file. Please make sure it\'s a valid JSON file with key-value pairs.');
                console.error('JSON import error:', error);
            }
        };
        reader.readAsText(file);
    });

    // State
    let cards = JSON.parse(localStorage.getItem('flashcards')) || [];
    let currentCardIndex = 0;
    let isFlipped = false;
    let showDefinitionFirst = true; // New state to track which side to show first

    // DOM Elements
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

    // Tab Switching
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

    // Form Submission
    cardForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const term = document.getElementById('term').value;
        const definition = document.getElementById('definition').value;
        
        cards.push({ term, definition });
        localStorage.setItem('flashcards', JSON.stringify(cards));
        
        cardForm.reset();
        displayCards();
    });

    // Display saved cards
    function displayCards() {
        cardsContainer.innerHTML = cards.map((card, index) => `
            <div class="saved-card">
                <strong>Term:</strong> ${card.term}
                <br>
                <strong>Definition:</strong> ${card.definition}
                <br>
                <button onclick="deleteCard(${index})">Delete</button>
            </div>
        `).join('');
    }

    // Delete card
    window.deleteCard = (index) => {
        cards.splice(index, 1);
        localStorage.setItem('flashcards', JSON.stringify(cards));
        displayCards();
    };

    // Study mode functions
    function updateStudyCard() {
        if (cards.length === 0) {
            cardFront.textContent = 'No cards available!';
            cardBack.textContent = 'Add some cards first!';
            return;
        }
        
        // Show either definition or term on front based on showDefinitionFirst
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

    // Flip card on button click or card click
    function flipCard() {
        if (cards.length > 0) {
            isFlipped = !isFlipped;
            studyCard.classList.toggle('flipped');
        }
    }

    flipBtn.addEventListener('click', flipCard);
    studyCardContainer.addEventListener('click', (e) => {
        // Only flip if clicking the card itself, not the navigation buttons
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

    // Shuffle cards function
    function shuffleCards() {
        if (cards.length <= 1) {
            alert('Need at least 2 cards to shuffle!');
            return;
        }

        // Fisher-Yates shuffle algorithm
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }

        // Reset to first card and update display
        currentCardIndex = 0;
        updateStudyCard();
        localStorage.setItem('flashcards', JSON.stringify(cards));
    }

    shuffleBtn.addEventListener('click', shuffleCards);

    // Toggle display button
    const toggleDisplayBtn = document.getElementById('toggle-display');
    toggleDisplayBtn.addEventListener('click', () => {
        showDefinitionFirst = !showDefinitionFirst;
        updateStudyCard();
    });

    // Initial display
    displayCards();
});
