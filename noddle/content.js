// 1. Update your aliases to use arrays
const subjectAliases = {
    'chemistry': ['CH'],
    'math': ['MA', 'MI'],
    'computer science': ['CP'],
    'psychology': ['PS'],
    'philosophy': ['PP'],
    'english': ['EU'],
    'tok': ['TK'],
    'chinese': ['CY'],
    'french': ['FR'],
    'japanese': ['JA'],
    'history': ['HI'],
    'biology': ['BI'],
    'physics': ['PH'],
    'spanish': ['SA'],
    'economics': ['EC'],
    'dt': ['TE'],
    // buisness
    // ess
    // sports science
    // geography
    // visual art
    // theatre
    // music
    // global politics
    
    // Houses
    'nansen': ['N'],
    'wilberforce': ['W'],
    'rutherford': ['R'],
    'einstein': ['E'],
    'da vinci': ['D'],
    'fleming': ['F'],
};

// ... [Keep your style injection exactly the same] ...

function applyVisualFilter(query) {
    const courses = document.querySelectorAll('.CourseList__courseItemContainer___k7Ylq');
    const searchTerm = query.toLowerCase().trim();

    if (!searchTerm) {
        courses.forEach(card => card.style.setProperty('display', 'flex', 'important'));
        return;
    }

    let matchedCodes = [];
    
    // 2. Adjust the loop to handle the arrays
    for (const [fullName, codes] of Object.entries(subjectAliases)) {
        if (fullName.startsWith(searchTerm)) {
            // Push all codes in the array to our matchedCodes list
            matchedCodes.push(...codes.map(c => c.toLowerCase()));
        }
    }

    courses.forEach(card => {
        const title = card.querySelector('.CourseList__courseTitle___acdCw')?.innerText.toLowerCase() || '';
        
        // Check if the title includes any of the matched codes OR the literal search term
        const isMatch = matchedCodes.some(code => title.includes(code)) || title.includes(searchTerm);

        if (isMatch) {
            card.style.setProperty('display', 'flex', 'important');
        } else {
            card.style.setProperty('display', 'none', 'important');
        }
    });
}

function cleanPage() {
    chrome.storage.sync.get(['walkMeActive', 'autoOpenActive', 'aliasActive', 'redirectActive'], (settings) => {
        
        // relocate igcse to ib
        if (settings.redirectActive !== false) {
            const igcseUrl = "https://web.toddleapp.com/platform/242745246163763771/courses";
            const ibUrl = "https://web.toddleapp.com/platform/242745246163763772/courses";

            if (window.location.href === igcseUrl || window.location.href === igcseUrl + "/") {
                window.location.replace(ibUrl);
                return; 
            }
        }

        // remove walkme button
        if (settings.walkMeActive !== false) {
            const walkMe = document.getElementById('walkme-player');
            if (walkMe) walkMe.remove();
        }

        // auto open to new tab
        if (settings.autoOpenActive !== false && !isProcessing) {
            const iframe = document.querySelector('iframe[src*="google.com"], iframe[src*="toddleapp.com/viewer"]');
            if (iframe && iframe.src) {
                isProcessing = true;
                window.open(iframe.src, '_blank');
                const closeBtn = document.querySelector('[data-test-id*="theatremode-close-button"]');
                if (closeBtn) closeBtn.click();
                setTimeout(() => { isProcessing = false; }, 1000);
            }
        }

        // replace search with our own recreation
        if (settings.aliasActive !== false) {
            const searchBar = document.querySelector('.CourseList__searchIputBox___XJGG9');
            if (searchBar && !searchBar.dataset.hijacked) {
                const ghostBar = searchBar.cloneNode(true);
                searchBar.parentNode.replaceChild(ghostBar, searchBar);
                ghostBar.dataset.hijacked = "true";
                ghostBar.addEventListener('input', (e) => applyVisualFilter(e.target.value));
                ghostBar.focus();
            }
        }
    });
}

const observer = new MutationObserver(cleanPage);
observer.observe(document.documentElement, { childList: true, subtree: true });