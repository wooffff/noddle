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
    'spanish': ['SA'],
    'history': ['HI'],
    'biology': ['BI'],
    'physics': ['PH'],
    'economics': ['EC'],
    'dt': ['TE'],
    'business': ['BS'],
    'global politics': ['GP'],
    // ess
    // sports science
    // geography
    // visual art
    // theatre
    // music

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
    'backBtnActive',
    'redirectActive', 
    'compactActive', 
    'prioritizeClassesActive',
    'preloadActive',
    'scrollBtnActive',
    'folderBtnActive'
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
    injectScrollButton(extensionSettings.scrollBtnActive);
    injectFolderButton(extensionSettings.folderBtnActive);
    fixBackButton(extensionSettings.autoOpenActive);

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
        if (noDueTab) noDueTab.remove();
    }

    // remove notif popup
    if (extensionSettings.hideNotifPopupActive !== false) {
        const notifPopup = document.querySelector('[id^="walkme-visual-design"]');
        if (notifPopup) notifPopup.remove(); 
    }

    // open documents in new tabs
    if (extensionSettings.autoOpenActive !== false && !isProcessing) {
        const openInNewTabBtn = document.querySelector('[data-test-id="classFlow-theatreMode-openInNewTab-button"]');
        const iframe = document.querySelector('iframe[src*="toddleapp.com/viewer"], iframe[src*="google.com"]:not([src*="docs.google.com/picker"])');
        if (openInNewTabBtn || (iframe && iframe.src && iframe.src !== 'about:blank')) {
            isProcessing = true;

            // open in new tab
            if (openInNewTabBtn) {
                openInNewTabBtn.click();
            } else if (iframe) {
                window.open(iframe.src, '_blank');
            }

            // close the viewer
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

function injectScrollButton(isActive) {
    const existingBtn = document.getElementById('custom-scroll-to-bottom-btn');
    if (!isActive) {
        if (existingBtn) {
            existingBtn.parentElement.remove(); 
        }
        return; 
    }
    if (existingBtn) return;

    const statusBtn = document.querySelector('[data-test-id="classFlow-filterHeader-studentStatus-button"]');
    if (!statusBtn) return; 
    
    const statusWrapper = statusBtn.parentElement.parentElement;
    const btnDiv = document.createElement('div');
    const scrollBtn = document.createElement('button');
    
    scrollBtn.id = 'custom-scroll-to-bottom-btn'; 

    btnDiv.style.marginRight = 'auto'; 
    btnDiv.style.marginLeft = '16px'; 
    btnDiv.style.display = 'flex';
    btnDiv.style.alignItems = 'center';

    scrollBtn.textContent = 'Scroll to Bottom'; 
    scrollBtn.style.padding = '0 16px';
    scrollBtn.style.height = '36px'; 
    scrollBtn.style.minWidth = 'max-content'; 
    scrollBtn.style.flexShrink = '0'; 
    scrollBtn.style.border = '1px solid #dcdcdc';
    scrollBtn.style.borderRadius = '6px';
    scrollBtn.style.background = '#fff';
    scrollBtn.style.color = '#333';
    scrollBtn.style.cursor = 'pointer';
    scrollBtn.style.fontWeight = '500';
    scrollBtn.style.whiteSpace = 'nowrap';
    
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

        let animationFrameId;
        let isUserScrolling = false;

        const stopAnimation = () => {
            isUserScrolling = true;
            cancelAnimationFrame(animationFrameId);
            scrollBox.removeEventListener('wheel', stopAnimation);
            scrollBox.removeEventListener('touchstart', stopAnimation);
        };

        scrollBox.addEventListener('wheel', stopAnimation, { passive: true });
        scrollBox.addEventListener('touchstart', stopAnimation, { passive: true });

        function animateScroll(currentTime) {
            if (isUserScrolling) return; 

            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3); 
            
            scrollBox.scrollTop = start + (change * easeProgress);

            if (elapsed < duration) {
                animationFrameId = requestAnimationFrame(animateScroll);
            } else {
                scrollBox.removeEventListener('wheel', stopAnimation);
                scrollBox.removeEventListener('touchstart', stopAnimation);
            }
        }
        
        animationFrameId = requestAnimationFrame(animateScroll);
    };

    btnDiv.appendChild(scrollBtn);
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

function injectFolderButton(isActive) {
    if (!isActive) {
        const existingBtn = document.getElementById('custom-folder-toggle-btn');
        if (existingBtn) existingBtn.remove();
        return;
    }

    if (document.getElementById('custom-folder-toggle-btn')) return;

    const statusBtn = document.querySelector('[data-test-id="classFlow-filterHeader-studentStatus-button"]');
    if (!statusBtn) return; 
    const statusWrapper = statusBtn.parentElement.parentElement;
    
    const folderBtn = document.createElement('button');
    folderBtn.id = 'custom-folder-toggle-btn';
    
    folderBtn.style.padding = '0 10px';
    folderBtn.style.height = '36px'; 
    folderBtn.style.flexShrink = '0'; 
    folderBtn.style.border = '1px solid #dcdcdc';
    folderBtn.style.borderRadius = '6px';
    folderBtn.style.background = '#fff';
    folderBtn.style.color = '#333';
    folderBtn.style.cursor = 'pointer';
    folderBtn.style.display = 'flex';
    folderBtn.style.alignItems = 'center';
    folderBtn.style.justifyContent = 'center';
    folderBtn.style.transition = 'background 0.2s';
    folderBtn.onmouseover = () => folderBtn.style.background = '#f5f5f5';
    folderBtn.onmouseout = () => folderBtn.style.background = '#fff';

    const svgFolderOpen = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#3a3a3a"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h240l80 80h320q33 0 56.5 23.5T880-640v400q0 33-23.5 56.5T800-160H160Zm0-80h640v-400H447l-80-80H160v480Zm0 0v-480 480Z"/></svg>`;
    const svgFolderClosed = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#3a3a3a"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h240l80 80h320q33 0 56.5 23.5T880-640H447l-80-80H160v480l96-320h684L837-217q-8 26-29.5 41.5T760-160H160Zm84-80h516l72-240H316l-72 240Zm0 0 72-240-72 240Zm-84-400v-80 80Z"/></svg>`;

    let isShowingOpenIcon = true;
    folderBtn.innerHTML = svgFolderOpen;

    folderBtn.onclick = async () => {
        const targetAction = isShowingOpenIcon ? 'open' : 'close';
        
        isShowingOpenIcon = !isShowingOpenIcon;
        folderBtn.innerHTML = isShowingOpenIcon ? svgFolderClosed : svgFolderOpen;

        const allFolderButtons = document.querySelectorAll('[data-test-id*="-accordionToggle-button"]');
        
        for (let i = 0; i < allFolderButtons.length; i++) {
            const btnId = allFolderButtons[i].getAttribute('data-test-id');
            const freshBtn = document.querySelector(`[data-test-id="${btnId}"]`);
            
            if (freshBtn) {
                const isClosed = freshBtn.className.includes('AccordionItem__toggleButtonCollapsed');
                const isOpen = !isClosed;

                if ((targetAction === 'open' && isClosed) || (targetAction === 'close' && isOpen)) {
                    freshBtn.click();
                    await new Promise(resolve => setTimeout(resolve, 0)); 
                }
            }
        }
    };

    const allButtons = Array.from(document.querySelectorAll('button'));
    const scrollBtnNode = allButtons.find(btn => btn.textContent.includes('Scroll'));

    if (scrollBtnNode) {
        scrollBtnNode.parentNode.insertBefore(folderBtn, scrollBtnNode.nextSibling);
        folderBtn.style.marginLeft = '8px'; 
        folderBtn.style.marginRight = '16px'; 
    } else {
        statusWrapper.parentNode.insertBefore(folderBtn, statusWrapper);
        folderBtn.style.marginRight = '16px'; 
    }
}

function fixBackButton(isActive) {
    if (isActive === false) return;

    const backButton = document.querySelector('button[aria-label="go back"]');
    
    if (backButton && !backButton.dataset.fixed) {
        backButton.dataset.fixed = "true";

        backButton.addEventListener('click', function(e) {
            
            // check if user came from toddle or url
            if (!document.referrer.includes(window.location.host)) {
                const currentUrl = window.location.href;
            
                // regex to find the course url
                const courseMatch = currentUrl.match(/(.*\/courses\/\d+)/);
                
                if (courseMatch) {
                    e.preventDefault();
                    e.stopPropagation(); // stops Toddle's broken router from firing
                    
                    const fallbackUrl = courseMatch[1] + '/class-flow'; 
                    window.location.href = fallbackUrl; 
                }
            }
        }, true);
    }
}