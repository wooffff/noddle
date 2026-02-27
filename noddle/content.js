let isProcessing = false;

const subjectAliases = {
    'chemistry': 'CH',
    'math': 'MA',
    'computer science': 'CP',
    'psychology': 'PS',
    'english': 'EU',
    'tok': 'TK',
    'chinese': 'CY',
    'nansen': 'N',
};

// css for filter
const style = document.createElement('style');
style.innerHTML = `
    [class*="noResults"], [class*="NoResults"], [class*="EmptyState"] {
        display: none !important;
    }
    .CourseList__courseListContainer___KfY01 {
        display: block !important;
        visibility: visible !important;
        width: 100% !important;
    }
    .CourseList__courseItemContainer___k7Ylq {
        margin-bottom: 0px !important;
        width: 100% !important;
    }
`;
document.head.appendChild(style);

// toggles elements' display as if they were searched.
function applyVisualFilter(query) {
    const courses = document.querySelectorAll('.CourseList__courseItemContainer___k7Ylq');
    const searchTerm = query.toLowerCase().trim();

    if (!searchTerm) {
        courses.forEach(card => card.style.setProperty('display', 'flex', 'important'));
        return;
    }

    let matchedCodes = [];
    for (const [fullName, code] of Object.entries(subjectAliases)) {
        if (fullName.startsWith(searchTerm)) {
            matchedCodes.push(code.toLowerCase());
        }
    }

    courses.forEach(card => {
        const title = card.querySelector('.CourseList__courseTitle___acdCw')?.innerText.toLowerCase() || '';
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