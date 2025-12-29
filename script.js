// Default users for first-time setup
const defaultUsers = [
    { firstName: 'Jane', lastName: 'Doe' },
    { firstName: 'John', lastName: 'Smith' },
    { firstName: 'Alice', lastName: 'Johnson' },
    { firstName: 'Bob', lastName: 'Williams' },
    { firstName: 'Charlie', lastName: 'Brown' }
];

// Simple storage functions that won't fail
function loadUsers() {
    try {
        // Try localStorage first (most reliable)
        const stored = localStorage.getItem('scrumUsers');
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.warn('localStorage not available');
    }

    // Return defaults if nothing stored
    return defaultUsers;
}

function saveUsersSync(users) {
    try {
        localStorage.setItem('scrumUsers', JSON.stringify(users));
    } catch (e) {
        console.warn('Could not save to localStorage');
    }
}

// Part B Items storage functions
function loadPartBItems() {
    try {
        const stored = localStorage.getItem('scrumPartBItems');
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.warn('Could not load Part B items from localStorage');
    }

    // Return empty array if nothing stored
    return [];
}

function savePartBItemsSync(items) {
    try {
        localStorage.setItem('scrumPartBItems', JSON.stringify(items));
    } catch (e) {
        console.warn('Could not save Part B items to localStorage');
    }
}

// Timer Functions
let timerInterval;

function formatTime(ms) {
    if (ms < 0) ms = 0;
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateTimerDisplay() {
    const timerDisplay = document.getElementById('timer-display');
    const progressBar = document.getElementById('timer-progress-bar');
    
    const storedEnd = localStorage.getItem('scrumTimerEnd');
    const storedDuration = localStorage.getItem('scrumTimerDuration');
    
    if (!storedEnd || !storedDuration) return;
    
    const endTime = parseInt(storedEnd, 10);
    const totalDurationMs = parseInt(storedDuration, 10);
    const now = Date.now();
    const remainingMs = endTime - now;
    
    // Update text
    if (remainingMs <= 0) {
        timerDisplay.textContent = "00:00";
        progressBar.style.width = "0%";
        progressBar.className = 'timer-progress-bar danger';
        
        // Optional: Play sound or flash?
        // For now, just stop the interval but keep the 00:00 state
        if (timerInterval) clearInterval(timerInterval);
        return;
    }
    
    timerDisplay.textContent = formatTime(remainingMs);
    
    // Update progress bar
    const percentage = (remainingMs / totalDurationMs) * 100;
    progressBar.style.width = `${percentage}%`;
    
    // Update color based on remaining time
    progressBar.className = 'timer-progress-bar';
    if (percentage < 10) {
        progressBar.classList.add('danger');
    } else if (percentage < 25) {
        progressBar.classList.add('warning');
    }
}

function startTimer() {
    const input = document.getElementById('timer-input');
    const minutes = parseInt(input.value, 10);
    
    if (isNaN(minutes) || minutes <= 0) return;
    
    const durationMs = minutes * 60 * 1000;
    const endTime = Date.now() + durationMs;
    
    localStorage.setItem('scrumTimerEnd', endTime.toString());
    localStorage.setItem('scrumTimerDuration', durationMs.toString());
    
    showRunningState();
    updateTimerDisplay();
    
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimerDisplay, 1000);
}

function stopTimer() {
    if (timerInterval) clearInterval(timerInterval);
    localStorage.removeItem('scrumTimerEnd');
    localStorage.removeItem('scrumTimerDuration');
    showSetupState();
}

function showRunningState() {
    document.getElementById('timer-setup').classList.add('hidden'); // Actually we used display:none in CSS via hidden class?
    // Wait, the CSS for .hidden is usually display: none.
    // Let's check popup.html structure again.
    // We have #timer-setup and #timer-running.
    
    document.getElementById('timer-setup').style.display = 'none';
    document.getElementById('timer-running').classList.remove('hidden');
    document.getElementById('timer-running').style.display = 'flex';
}

function showSetupState() {
    document.getElementById('timer-setup').style.display = 'flex';
    document.getElementById('timer-running').classList.add('hidden');
    document.getElementById('timer-running').style.display = 'none';
}

function checkTimerState() {
    const storedEnd = localStorage.getItem('scrumTimerEnd');
    if (storedEnd) {
        const endTime = parseInt(storedEnd, 10);
        if (endTime > Date.now()) {
            showRunningState();
            updateTimerDisplay();
            timerInterval = setInterval(updateTimerDisplay, 1000);
        } else {
            // Timer finished while closed?
            // We can show it as finished (00:00) or reset.
            // Let's show it as finished if it was recent (e.g. within last hour), otherwise reset.
            // For simplicity, let's just reset if it's long gone.
            if (Date.now() - endTime < 3600000) { // 1 hour
                 showRunningState();
                 updateTimerDisplay(); // Will show 00:00
            } else {
                stopTimer();
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    let users = [];
    let partBItems = [];

    // Initialize users from storage or use defaults
    function initializeUsers() {
       try {
           // Load users from storage
           const loadedUsers = loadUsers();
           users = loadedUsers.map(user => ({ ...user, spoken: false }));

           // If no users were loaded, save defaults
           if (users.length === 0) {
               users = defaultUsers.map(user => ({ ...user, spoken: false }));
               saveUsersSync(users);
           }

           // Render the users to display them
           renderUsers();
       } catch (error) {
           console.error('Error initializing users:', error);
           // Fallback to defaults
           users = defaultUsers.map(user => ({ ...user, spoken: false }));
           renderUsers();
       }
   }

   // Initialize Part B items from storage
   function initializePartBItems() {
       try {
           partBItems = loadPartBItems();
           renderPartBItems();
       } catch (error) {
           console.error('Error initializing Part B items:', error);
           partBItems = [];
           renderPartBItems();
       }
   }

   // Part B Items Management Functions
   function addPartBItem(text) {
       // Validation
       if (!text.trim()) {
           alert('Please enter a topic for Part B');
           return false;
       }

       if (text.length > 100) {
           alert('Part B topic must be 100 characters or less');
           return false;
       }

       // Check for duplicates
       const duplicate = partBItems.find(item =>
           item.text.toLowerCase() === text.toLowerCase().trim()
       );

       if (duplicate) {
           alert('This topic already exists in Part B items');
           return false;
       }

       // Add new item
       const newItem = {
           id: Date.now().toString(),
           text: text.trim(),
           completed: false,
           createdAt: new Date().toISOString()
       };

       partBItems.push(newItem);
       savePartBItemsSync(partBItems);
       renderPartBItems();

       return true;
   }

   function removePartBItem(id) {
       const itemToRemove = partBItems.find(item => item.id === id);
       if (confirm(`Remove "${itemToRemove.text}" from Part B items?`)) {
           partBItems = partBItems.filter(item => item.id !== id);
           savePartBItemsSync(partBItems);
           renderPartBItems();
           showToast(`"${itemToRemove.text}" removed from Part B`);
       }
   }

   function togglePartBItemComplete(id) {
       const item = partBItems.find(item => item.id === id);
       if (item) {
           item.completed = !item.completed;
           savePartBItemsSync(partBItems);
           renderPartBItems();
       }
   }

   function clearCompletedPartBItems() {
       const completedCount = partBItems.filter(item => item.completed).length;
       if (completedCount === 0) {
           showToast('No completed items to clear');
           return;
       }

       if (confirm(`Clear ${completedCount} completed Part B item(s)?`)) {
           partBItems = partBItems.filter(item => !item.completed);
           savePartBItemsSync(partBItems);
           renderPartBItems();
           showToast(`${completedCount} completed item(s) cleared`);
       }
   }

   function renderPartBItems() {
       const partBList = document.getElementById('part-b-list');
       const partBSection = document.getElementById('part-b-section');
       const clearButton = document.getElementById('clear-completed-part-b');

       if (partBItems.length === 0) {
           partBList.innerHTML = '<div class="part-b-empty">No Part B items yet. Use the input field above to add follow-up topics that need more discussion time.</div>';
           clearButton.style.display = 'none';
       } else {
           partBList.innerHTML = '';

           partBItems.forEach(item => {
               const itemContainer = document.createElement('div');
               itemContainer.className = `part-b-item ${item.completed ? 'completed' : ''}`;

               const checkbox = document.createElement('input');
               checkbox.type = 'checkbox';
               checkbox.className = 'part-b-checkbox';
               checkbox.checked = item.completed;
               checkbox.addEventListener('change', () => togglePartBItemComplete(item.id));

               const text = document.createElement('span');
               text.className = 'part-b-text';
               text.textContent = item.text;

               const removeButton = document.createElement('button');
               removeButton.className = 'part-b-remove';
               removeButton.textContent = '🗑';
               removeButton.title = 'Remove item';
               removeButton.addEventListener('click', () => removePartBItem(item.id));

               itemContainer.appendChild(checkbox);
               itemContainer.appendChild(text);
               itemContainer.appendChild(removeButton);

               partBList.appendChild(itemContainer);
           });

           // Show clear button if there are completed items
           const hasCompleted = partBItems.some(item => item.completed);
           clearButton.style.display = hasCompleted ? 'block' : 'none';
       }

       // Always show the section, just update the content
       partBSection.style.display = 'block';
       updatePartBCount();
   }

   const userList = document.getElementById('user-list');
   const spokenCountDisplay = document.getElementById('spoken-count-display');
   const partBCountDisplay = document.getElementById('part-b-count-display');
   const userSearchInput = document.getElementById('user-search-input');
   const resetButton = document.getElementById('reset-button');
   const shuffleButton = document.getElementById('shuffle-button');
   const firstNameInput = document.getElementById('first-name-input');
   const lastNameInput = document.getElementById('last-name-input');
   const addUserButton = document.getElementById('add-user-button');
   
   // User Manager Modal Elements
   const settingsTrigger = document.getElementById('settings-trigger');
   const userManagerModal = document.getElementById('user-manager-modal');
   const closeSettingsButton = document.getElementById('close-settings-button');
   const managerUserList = document.getElementById('manager-user-list');

   // Part B elements
    const partBSection = document.getElementById('part-b-section');
    const partBInput = document.getElementById('part-b-input');
    const addPartBButton = document.getElementById('add-part-b-button');
    const clearCompletedPartBButton = document.getElementById('clear-completed-part-b');

    // Random Picker elements
    const randomPickButton = document.getElementById('random-pick-button');
    const pickerOverlay = document.getElementById('picker-overlay');
    const pickerReel = document.getElementById('picker-reel');
    const pickerContent = document.querySelector('.picker-content');
    const pickerCloseButton = document.getElementById('picker-close-button');
    const pickerMarkSpokenButton = document.getElementById('picker-mark-spoken-button');

    let hasCelebrated = false; // Track if celebration has already been triggered
    let searchQuery = '';
    let searchTimeout;

     function getInitials(firstName, lastName) {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }

    function updateCounter(visibleCount = users.length) {
        const spokenCount = users.filter(user => user.spoken).length;
        
        if (spokenCountDisplay) {
            spokenCountDisplay.textContent = `${spokenCount}/${users.length}`;
        }
 
        // Check if all team members have spoken and trigger celebration
        if (spokenCount === users.length && users.length > 0 && !hasCelebrated) {
            triggerCelebration();
        }
    }

    function updatePartBCount() {
        if (partBCountDisplay) {
            const total = partBItems.length;
            const completed = partBItems.filter(item => item.completed).length;
            partBCountDisplay.textContent = `${completed}/${total}`;
        }
    }

    function renderUsers() {
        userList.innerHTML = ''; // Clear existing list
        let visibleCount = 0;
 
        users.forEach((user, index) => {
            const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
            if (searchQuery && !fullName.includes(searchQuery)) {
                return;
            }
 
            visibleCount++;
 
            const userContainer = document.createElement('div');
            userContainer.className = 'user-container' + (user.spoken ? ' spoken' : '');
 
            const userCircle = document.createElement('div');
            userCircle.className = 'user-circle';
 
            const initials = document.createElement('span');
            initials.className = 'initials';
            initials.textContent = getInitials(user.firstName, user.lastName);
 
            const checkmark = document.createElement('span');
            checkmark.className = 'checkmark';
            checkmark.textContent = '✓';
 
            userCircle.appendChild(initials);
            userCircle.appendChild(checkmark);
 
            const userName = document.createElement('div');
            userName.className = 'user-name';
            userName.textContent = `${user.firstName} ${user.lastName}`;
 
            userContainer.appendChild(userCircle);
            userContainer.appendChild(userName);
 
            userContainer.addEventListener('click', () => {
                user.spoken = !user.spoken;
                renderUsers();
            });
 
            userList.appendChild(userContainer);
        });
 
        if (visibleCount === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'user-list-empty';
            emptyState.textContent = searchQuery
                ? 'No team members match your search.'
                : 'No team members available.';
            userList.appendChild(emptyState);
        }
 
        updateCounter(visibleCount);
    }

    function renderUserManager() {
        managerUserList.innerHTML = '';
        
        if (users.length === 0) {
            managerUserList.innerHTML = '<div style="padding: 15px; text-align: center; color: #888;">No users yet.</div>';
            return;
        }

        users.forEach((user, index) => {
            const item = document.createElement('div');
            item.className = 'manager-user-item';

            const info = document.createElement('div');
            info.className = 'manager-user-info';

            const avatar = document.createElement('div');
            avatar.className = 'manager-user-avatar';
            avatar.textContent = getInitials(user.firstName, user.lastName);

            const name = document.createElement('span');
            name.textContent = `${user.firstName} ${user.lastName}`;

            info.appendChild(avatar);
            info.appendChild(name);

            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-user-button';
            removeBtn.textContent = '🗑';
            removeBtn.title = 'Remove user';
            removeBtn.addEventListener('click', () => removeUser(index));

            item.appendChild(info);
            item.appendChild(removeBtn);

            managerUserList.appendChild(item);
        });
    }
 
    function handleUserSearchInput(event) {
        searchQuery = event.target.value.trim().toLowerCase();
        renderUsers();

        // Clear existing timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // Set new timeout if there is a search query
        if (searchQuery) {
            searchTimeout = setTimeout(() => {
                searchQuery = '';
                userSearchInput.value = '';
                renderUsers();
            }, 8000);
        }
    }
 
     // Add new user function
    function addUser(firstName, lastName) {
        // Validation
        if (!firstName.trim() || !lastName.trim()) {
            alert('Please enter both first and last name');
            return false;
        }

        if (firstName.length > 20 || lastName.length > 20) {
            alert('Names must be 20 characters or less');
            return false;
        }

        // Check for duplicates
        const duplicate = users.find(user =>
            user.firstName.toLowerCase() === firstName.toLowerCase().trim() &&
            user.lastName.toLowerCase() === lastName.toLowerCase().trim()
        );

        if (duplicate) {
            alert('This user already exists in the list');
            return false;
        }

        // Add new user
        users.push({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            spoken: false
        });

        saveUsersSync(users);
        renderUsers();
        renderUserManager();

        // Clear inputs
        firstNameInput.value = '';
        lastNameInput.value = '';

        // Focus on first name input for next entry
        firstNameInput.focus();

        return true;
    }

    // Remove user function
    function removeUser(index) {
        const userToRemove = users[index];
        if (confirm(`Remove ${userToRemove.firstName} ${userToRemove.lastName} from the list?`)) {
            users.splice(index, 1);
            saveUsersSync(users);
            renderUsers();
            renderUserManager();
            showToast(`${userToRemove.firstName} ${userToRemove.lastName} removed`);
        }
    }

    function openSettings() {
        userManagerModal.classList.remove('hidden');
        renderUserManager();
    }

    function closeSettings() {
        userManagerModal.classList.add('hidden');
    }

    // Show toast notification
    function showToast(message) {
        // Remove existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);

        // Hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Confetti celebration functions
    function triggerCelebration() {
        hasCelebrated = true;
        createConfetti();

        // Add celebration effect to the body
        document.body.classList.add('celebration-active');

        // Show celebration toast
        showToast('🎉 All team members have spoken! 🎉');

        // Remove celebration class after animation
        setTimeout(() => {
            document.body.classList.remove('celebration-active');
        }, 600);
    }

    function createConfetti() {
        const confettiContainer = document.getElementById('confetti-container');
        const colors = ['color-1', 'color-2', 'color-3', 'color-4', 'color-5', 'color-6', 'color-7', 'color-8'];
        const shapes = ['circle', 'square', 'triangle'];

        // Create 100 confetti pieces
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = `confetti-piece ${shapes[Math.floor(Math.random() * shapes.length)]} ${colors[Math.floor(Math.random() * colors.length)]}`;

            // Random horizontal position
            confetti.style.left = Math.random() * 100 + '%';

            // Random animation delay
            confetti.style.animationDelay = Math.random() * 2 + 's';

            // Random duration between 2-4 seconds
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';

            confettiContainer.appendChild(confetti);
        }

        // Clean up confetti after animation
        setTimeout(() => {
            confettiContainer.innerHTML = '';
        }, 5000);
    }
    
    if (userSearchInput) {
        userSearchInput.addEventListener('input', handleUserSearchInput);
        userSearchInput.addEventListener('search', handleUserSearchInput);
    }
 
    // Settings Event Listeners
    settingsTrigger.addEventListener('click', openSettings);
    closeSettingsButton.addEventListener('click', closeSettings);
    
    // Close modal when clicking outside
    userManagerModal.addEventListener('click', (e) => {
        if (e.target === userManagerModal) {
            closeSettings();
        }
    });

    // Add user event listeners
    addUserButton.addEventListener('click', () => {
        const firstName = firstNameInput.value;
        const lastName = lastNameInput.value;
        if (addUser(firstName, lastName)) {
            showToast(`${firstName} ${lastName} added`);
        }
    });

    // Allow Enter key to add user
    firstNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const firstName = firstNameInput.value;
            const lastName = lastNameInput.value;
            if (addUser(firstName, lastName)) {
                showToast(`${firstName} ${lastName} added`);
            }
        }
    });

    lastNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const firstName = firstNameInput.value;
            const lastName = lastNameInput.value;
            if (addUser(firstName, lastName)) {
                showToast(`${firstName} ${lastName} added`);
            }
        }
    });

    // Note: Double-click shortcut removed in favor of visible edit button

    resetButton.addEventListener('click', () => {
        users.forEach(user => user.spoken = false);
        saveUsersSync(users);
        renderUsers();
        hasCelebrated = false; // Reset celebration flag
    });

    // Shuffle functionality
    function shuffleUsers() {
        for (let i = users.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [users[i], users[j]] = [users[j], users[i]];
        }
    }

    shuffleButton.addEventListener('click', () => {
        shuffleUsers();
        saveUsersSync(users);
        renderUsers();
    });

    // Import/Export Functions
    function exportTeam() {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(users, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "scrum_team.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    function importTeam(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedUsers = JSON.parse(e.target.result);
                // Basic validation
                if (Array.isArray(importedUsers) && importedUsers.every(u => u.firstName && u.lastName)) {
                    if (confirm(`Import ${importedUsers.length} users? This will replace the current list.`)) {
                        // Reset spoken state on import to be safe, or keep it if desired?
                        // Usually importing a team list implies a fresh start or sharing a roster.
                        // Let's reset spoken state to false.
                        users = importedUsers.map(u => ({
                            firstName: u.firstName,
                            lastName: u.lastName,
                            spoken: false
                        }));
                        saveUsersSync(users);
                        renderUsers();
                        renderUserManager();
                        showToast('Team list imported successfully');
                    }
                } else {
                    alert('Invalid file format. Expected a JSON array of users with firstName and lastName.');
                }
            } catch (error) {
                console.error(error);
                alert('Error parsing JSON file.');
            }
            // Reset input
            event.target.value = '';
        };
        reader.readAsText(file);
    }

    const exportButton = document.getElementById('export-button');
    const importButton = document.getElementById('import-button');
    const importFile = document.getElementById('import-file');

    if (exportButton) {
        exportButton.addEventListener('click', exportTeam);
    }

    if (importButton) {
        importButton.addEventListener('click', () => importFile.click());
    }

    if (importFile) {
        importFile.addEventListener('change', importTeam);
    }

    // Part B event listeners
    addPartBButton.addEventListener('click', () => {
        const text = partBInput.value;
        if (addPartBItem(text)) {
            partBInput.value = '';
            showToast(`"${text}" added to Part B`);
        }
    });

    // Allow Enter key to add Part B item
    partBInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const text = partBInput.value;
            if (addPartBItem(text)) {
                partBInput.value = '';
                showToast(`"${text}" added to Part B`);
            }
        }
    });

    clearCompletedPartBButton.addEventListener('click', clearCompletedPartBItems);

    // Random Picker Logic
    let selectedUserIndex = -1;
    let pickerTimeout;

    function pickRandomUser() {
        const unspokenUsers = users.filter(user => !user.spoken);
        
        if (unspokenUsers.length === 0) {
            showToast('Everyone has already spoken!');
            return;
        }

        // Reset UI
        pickerContent.classList.remove('winner-state');
        pickerCloseButton.classList.add('hidden');
        pickerMarkSpokenButton.classList.add('hidden');
        pickerOverlay.classList.add('active');
        
        // Remove any existing burst
        const existingBurst = document.querySelector('.winner-burst');
        if (existingBurst) existingBurst.remove();

        // Prepare the reel
        pickerReel.innerHTML = '';
        pickerReel.style.transition = 'none';
        pickerReel.style.transform = 'translateY(0)';
        
        // Create a long list of names for the reel
        // We want at least 50 items to scroll through
        const reelItems = [];
        const winnerIndex = 40 + Math.floor(Math.random() * 10); // Winner lands between 40 and 50
        
        // Select the winner
        const winner = unspokenUsers[Math.floor(Math.random() * unspokenUsers.length)];
        
        // Find the index in the main users array
        selectedUserIndex = users.findIndex(u =>
            u.firstName === winner.firstName && u.lastName === winner.lastName
        );

        // Populate reel items
        for (let i = 0; i <= winnerIndex + 5; i++) {
            let user;
            if (i === winnerIndex) {
                user = winner;
            } else {
                // Pick a random user from unspoken list
                user = unspokenUsers[Math.floor(Math.random() * unspokenUsers.length)];
            }
            
            const item = document.createElement('div');
            item.className = 'reel-item';
            if (i === winnerIndex) item.classList.add('winner-item');
            item.textContent = `${user.firstName} ${user.lastName}`;
            pickerReel.appendChild(item);
        }

        // Force reflow to ensure initial position is set
        pickerReel.offsetHeight;

        // Start animation
        // Height of one item is 80px (defined in CSS)
        const itemHeight = 80;
        const targetY = -(winnerIndex * itemHeight);
        
        // Add transition back
        pickerReel.style.transition = 'transform 4s cubic-bezier(0.15, 0.9, 0.3, 1)';
        
        // Trigger the slide
        setTimeout(() => {
            pickerReel.style.transform = `translateY(${targetY}px)`;
        }, 50);

        // Schedule finish
        if (pickerTimeout) clearTimeout(pickerTimeout);
        pickerTimeout = setTimeout(() => {
            finishPicker();
        }, 4050); // Slightly longer than transition to be safe
    }

    function finishPicker() {
        // Show winner state
        pickerContent.classList.add('winner-state');
        
        // Add burst effect
        const burst = document.createElement('div');
        burst.className = 'winner-burst';
        document.querySelector('.picker-window-container').appendChild(burst);

        // Show buttons
        pickerCloseButton.classList.remove('hidden');
        pickerMarkSpokenButton.classList.remove('hidden');
    }

    function closePicker() {
        pickerOverlay.classList.remove('active');
        if (pickerTimeout) clearTimeout(pickerTimeout);
    }

    function markSelectedAsSpoken() {
        if (selectedUserIndex !== -1 && users[selectedUserIndex]) {
            users[selectedUserIndex].spoken = true;
            saveUsersSync(users);
            renderUsers();
            closePicker();
            showToast(`${users[selectedUserIndex].firstName} marked as spoken`);
        }
    }

    // Picker Event Listeners
    randomPickButton.addEventListener('click', pickRandomUser);
    pickerCloseButton.addEventListener('click', closePicker);
    pickerMarkSpokenButton.addEventListener('click', markSelectedAsSpoken);
    
    // Close on click outside (optional, but good UX)
    pickerOverlay.addEventListener('click', (e) => {
        if (e.target === pickerOverlay && !pickerCloseButton.classList.contains('hidden')) {
            closePicker();
        }
    });

    // Initial setup
    initializeUsers();
    initializePartBItems();

    // Timer Event Listeners
    const timerInput = document.getElementById('timer-input');
    const timerMinus = document.getElementById('timer-minus');
    const timerPlus = document.getElementById('timer-plus');
    const timerStart = document.getElementById('timer-start');
    const timerReset = document.getElementById('timer-reset');

    if (timerMinus) {
        timerMinus.addEventListener('click', () => {
            let val = parseInt(timerInput.value, 10) || 0;
            val = Math.max(1, val - 5);
            timerInput.value = val;
        });
    }

    if (timerPlus) {
        timerPlus.addEventListener('click', () => {
            let val = parseInt(timerInput.value, 10) || 0;
            val = Math.min(180, val + 5);
            timerInput.value = val;
        });
    }

    if (timerStart) {
        timerStart.addEventListener('click', startTimer);
    }

    if (timerReset) {
        timerReset.addEventListener('click', stopTimer);
    }

    // Initialize timer state
    checkTimerState();
});