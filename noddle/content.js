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

let extensionSettings = {};
let isProcessing = false;

chrome.storage.sync.get([
    'hideWalkMeActive', 
    'hideNoDueActive', 
    'hideNotifPopupActive',
    'autoOpenActive', 
    'aliasActive', 
    'redirectActive', 
    'compactActive', 
    'prioritizeClassesActive',
    'preloadActive'
    
], (settings) => {
    extensionSettings = settings;

    // observe only after webpage loads
    const observer = new MutationObserver(cleanPage);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    cleanPage();
});

// visual filter for search mod
function applyVisualFilter(query) {
    const courses = document.querySelectorAll('.CourseList__courseItemContainer___k7Ylq');
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) {
        courses.forEach(card => card.style.setProperty('display', 'flex', 'important'));
        return;
    }
    let matchedCodes = [];
    for (const [fullName, codes] of Object.entries(subjectAliases)) {
        if (fullName.startsWith(searchTerm)) {
            matchedCodes.push(...codes.map(c => c.toLowerCase()));
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
    applyCompactMode(extensionSettings.compactActive);
    applyClassPrioritization(extensionSettings.prioritizeClassesActive);
    injectScrollButton();

    //redirect user from igcse to ib
    if (extensionSettings.redirectActive !== false) {
        const igcseUrl = "https://web.toddleapp.com/platform/242745246163763771/courses";
        const ibUrl = "https://web.toddleapp.com/platform/242745246163763772/courses";
        if (window.location.href === igcseUrl || window.location.href === igcseUrl + "/") {
            window.location.replace(ibUrl);
            return; 
        }
    }

    // remove esf walk me button
    if (extensionSettings.hideWalkMeActive !== false) {
        const walkMe = document.getElementById('walkme-player');
        if (walkMe) walkMe.remove();
    }

    // remove no due date assignments tab
    if (extensionSettings.hideNoDueActive !== false) {
        const noDueTab = document.querySelector('[data-test-id="consolidatedDeadlinesWidget-tabs-tab-NODUE"]');
        if (noDueTab) noDueTab.style.setProperty('display', 'none', 'important');
    }

    // remove esf walk me button
    if (extensionSettings.hideNotifPopupActive !== false) {
        // Note: The original code used walkMe.remove() here, which might cause an error if walkMe wasn't defined in this scope. 
        // I fixed it to use notifPopup.remove()
        const notifPopup = document.querySelector('[id^="walkme-visual-design"]');
        if (notifPopup) notifPopup.remove(); 
    }

    // open documents in new tabs
    if (extensionSettings.autoOpenActive !== false && !isProcessing) {
        const openInNewTabBtn = document.querySelector('[data-test-id="classFlow-theatreMode-openInNewTab-button"]');
        const iframe = document.querySelector('iframe[src*="toddleapp.com/viewer"], iframe[src*="google.com"]');

        if (openInNewTabBtn || (iframe && iframe.src && iframe.src !== 'about:blank')) {
            isProcessing = true;

            // Open in new tab
            if (openInNewTabBtn) {
                openInNewTabBtn.click();
            } else if (iframe) {
                window.open(iframe.src, '_blank');
            }

            // Close the viewer
            setTimeout(() => {
                const allButtons = document.querySelectorAll('.UIButton__button___c_Dxi');
                const saveExitBtn = Array.from(allButtons).find(btn => 
                    btn.textContent.includes('Save & Exit')
                );

                if (saveExitBtn) {
                    saveExitBtn.click();
                } else {
                    const closeBtn = document.querySelector('[data-test-id*="theatremode-close-button"]');
                    if (closeBtn) closeBtn.click();
                }

                setTimeout(() => { 
                    isProcessing = false; 
                }, 1000);
            }, 500);
        }
    }

    // apply search mod
    if (extensionSettings.aliasActive !== false) {
        const searchBar = document.querySelector('.CourseList__searchIputBox___XJGG9');
        if (searchBar && !searchBar.dataset.hijacked) {
            searchBar.dataset.hijacked = "true";
            const ghostBar = searchBar.cloneNode(true);
            searchBar.style.display = 'none';
            searchBar.parentNode.insertBefore(ghostBar, searchBar.nextSibling);
            const innerInput = ghostBar.tagName.toLowerCase() === 'input' ? ghostBar : ghostBar.querySelector('input');
            if (innerInput) {
                innerInput.addEventListener('input', (e) => applyVisualFilter(e.target.value));
            }
        }
    }
}

function injectScrollButton() {
    // check if the button already exists, if not skip.
    if (document.getElementById('custom-scroll-to-bottom-btn')) return;
    const statusBtn = document.querySelector('[data-test-id="classFlow-filterHeader-studentStatus-button"]');
    if (!statusBtn) return; // if we aren't on the right page yet, just exit
    
    const statusWrapper = statusBtn.parentElement.parentElement;
    const btnDiv = document.createElement('div');
    const scrollBtn = document.createElement('button');
    
    scrollBtn.id = 'custom-scroll-to-bottom-btn'; 

    // Pushes it next to the search bar and keeps it centered
    btnDiv.style.marginRight = 'auto'; 
    btnDiv.style.marginLeft = '16px'; 
    btnDiv.style.display = 'flex';
    btnDiv.style.alignItems = 'center';

    scrollBtn.textContent = 'Scroll to Bottom'; 
    scrollBtn.style.padding = '0 16px';
    scrollBtn.style.height = '36px'; // Forces it to match search bar height
    scrollBtn.style.minWidth = 'max-content'; // Prevents text from hiding
    scrollBtn.style.flexShrink = '0'; // STOPS FLEXBOX FROM SQUISHING IT
    scrollBtn.style.border = '1px solid #dcdcdc';
    scrollBtn.style.borderRadius = '6px';
    scrollBtn.style.background = '#fff';
    scrollBtn.style.color = '#333';
    scrollBtn.style.cursor = 'pointer';
    scrollBtn.style.fontWeight = '500';
    scrollBtn.style.whiteSpace = 'nowrap';
    
    // Hover effect
    scrollBtn.style.transition = 'background 0.2s';
    scrollBtn.onmouseover = () => scrollBtn.style.background = '#f5f5f5';
    scrollBtn.onmouseout = () => scrollBtn.style.background = '#fff';

    scrollBtn.onclick = () => {
        const scrollBox = document.getElementById('classMaterials-innerContainer');
        if (!scrollBox) {
            alert("Couldn't find the scroll box! The ID might be wrong.");
            return;
        }

        const duration = 800; 
        const start = scrollBox.scrollTop;
        const end = scrollBox.scrollHeight - scrollBox.clientHeight;
        const change = end - start;
        const startTime = performance.now();

        // Variables for our interrupt system
        let animationFrameId;
        let isUserScrolling = false;

        // The function that slams on the brakes if the user scrolls
        const stopAnimation = () => {
            isUserScrolling = true;
            cancelAnimationFrame(animationFrameId);
            // Clean up the listeners so they don't pile up
            scrollBox.removeEventListener('wheel', stopAnimation);
            scrollBox.removeEventListener('touchstart', stopAnimation);
        };

        // Attach the listeners to detect user scrolling (mouse wheel or trackpad/touch)
        scrollBox.addEventListener('wheel', stopAnimation, { passive: true });
        scrollBox.addEventListener('touchstart', stopAnimation, { passive: true });

        function animateScroll(currentTime) {
            if (isUserScrolling) return; // Abort instantly if user took over

            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeProgress = 1 - Math.pow(1 - progress, 3); 
            
            scrollBox.scrollTop = start + (change * easeProgress);

            if (elapsed < duration) {
                animationFrameId = requestAnimationFrame(animateScroll);
            } else {
                // Animation finished naturally, clean up the listeners
                scrollBox.removeEventListener('wheel', stopAnimation);
                scrollBox.removeEventListener('touchstart', stopAnimation);
            }
        }
        
        animationFrameId = requestAnimationFrame(animateScroll);
    };

    btnDiv.appendChild(scrollBtn);

    // 6. Insert before Status Wrapper
    statusWrapper.parentNode.insertBefore(btnDiv, statusWrapper);
}

function applyCompactMode(isActive) {
    let styleTag = document.getElementById('toddle-compact-mode-styles');
    if (!isActive) { if (styleTag) styleTag.remove(); return; }
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'toddle-compact-mode-styles';
        styleTag.innerHTML = `
            .StudentCourses__announcementButtonContainer___GbzI4 { gap: 10px !important; }
            .ButtonCard__containerV2____83qk { height: 50px !important; min-height: 50px !important; }
            .ButtonCard__rightContainerV2___LW1YB { padding: 0px 12px !important; display: flex !important; align-items: center !important; }
            .ButtonCard__iconContainer___Cz3Fx { width: 32px !important; min-width: 32px !important; display: flex !important; justify-content: center !important; align-items: center !important; }
            .ButtonCard__iconContainer___Cz3Fx svg { width: 24px !important; height: 24px !important; }
            .ButtonCard__subLabel___237QL { display: none !important; }
            .MyClassList__courseCardsCon___hgzZp { grid-template-columns: repeat(3, 1fr) !important; margin-top: 16px !important; }
            .CourseList__courseItemContainer___k7Ylq { margin-bottom: 8px !important; }
            .GroupedProjectGroupList__groupedContainer___F_cps { grid-gap: 12px; !important; }
            .CourseList__courseItemContainer___k7Ylq {height: auto; !important; }
        `;
        document.head.appendChild(styleTag);
    }
}

// move classes up to the top in the homepage
function applyClassPrioritization(isActive) {
    let styleTag = document.getElementById('toddle-priority-styles');
    if (!isActive) { if (styleTag) styleTag.remove(); return; }
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'toddle-priority-styles';
        styleTag.innerHTML = `
            .StudentCourses__leftInnerContainer___lETNg { display: flex !important; flex-direction: column !important; padding: 0px !important; }
            .StudentCourses__classesContainer___KylQ0 { order: 1 !important; margin-bottom: 24px !important; }
            .StudentCourses__announcementButtonContainer___GbzI4 { order: 2 !important; }
            .MyClassList__container___AwDcQ { padding-top: 0px !important; }
            .GroupedProjectGroupList__container___AhHuD {order: 3 !important; }
        `;
        document.head.appendChild(styleTag);
    }
}