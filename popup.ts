document.addEventListener('DOMContentLoaded', () => {
    // Initialize the current date and time display
    const dateElement = document.querySelector('.glass p-2');
    if (dateElement) {
        const now = new Date();
        dateElement.textContent = now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    const timeElement = document.querySelector('.glass p-2:last-child');
    if (timeElement) {
        setInterval(() => {
            const now = new Date();
            timeElement.textContent = now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }, 1000);
    }

    // Add event listeners for sidebar icons
    const sidebarIcons = document.querySelectorAll('.sidebar img');
    sidebarIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            // Cast icon to HTMLImageElement to access 'alt' property
            const imgElement = icon as HTMLImageElement;
            switchContent(imgElement.alt);
        });
    });

    // Function to switch content based on the selected tab
    function switchContent(tabName: string) {
        const contentAreas = document.querySelectorAll('.content-area');
        contentAreas.forEach(area => {
            if (area.id === tabName) {
                area.classList.remove('hidden');
            } else {
                area.classList.add('hidden');
            }
        });
    }

    // Ensure icons load correctly
    const iconPaths = ['home', 'search', 'favorites', 'history', 'settings'];
    sidebarIcons.forEach((icon, index) => {
        const imgElement = icon as HTMLImageElement;
        imgElement.src = `icons/${iconPaths[index]}.svg`;
    });

    // Add event listeners for buttons
    document.querySelector('#Home button')?.addEventListener('click', () => {
        alert('Learn More about this Kanji');
    });

    document.querySelector('#Search button')?.addEventListener('click', () => {
        const searchInput = document.querySelector('#Search input') as HTMLInputElement;
        if (searchInput) {
            searchKanji(searchInput.value);
        }
    });

    document.querySelector('#Settings button')?.addEventListener('click', () => {
        alert('Toggle Dark Mode');
    });

    // Dummy functions for Kanji of the Day, search, favorites, and history
    function fetchKanjiOfTheDay() {
        // Placeholder for API call to fetch Kanji of the Day
        console.log('Fetching Kanji of the Day...');
    }

    function searchKanji(query: string) {
        // Placeholder for search functionality
        console.log(`Searching for kanji: ${query}`);
    }

    function addToFavorites(kanji: string) {
        // Placeholder for adding kanji to favorites
        console.log(`Adding ${kanji} to favorites`);
    }

    function viewHistory() {
        // Placeholder for viewing history
        console.log('Viewing history...');
    }

    // Initialize features
    fetchKanjiOfTheDay();
}); 