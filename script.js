const passwordOutput = document.getElementById('password-output');
const copyBtn = document.getElementById('copy-btn');
const strengthBar = document.getElementById('strength-bar');
const passwordLengthInput = document.getElementById('password-length');
const generateBtn = document.getElementById('generate-btn');

const includeUppercase = document.getElementById('include-uppercase');
const includeLowercase = document.getElementById('include-lowercase');
const includeNumbers = document.getElementById('include-numbers');
const includeSymbols = document.getElementById('include-symbols');

// New HTML elements for history feature
const historyList = document.getElementById('history-list');
const storageRadios = document.querySelectorAll('input[name="storage-type"]');
const clearHistoryBtn = document.getElementById('clear-history-btn');

function showToast(m, d = 5) {
  Toastify({
    text: m,
    duration: d * 1000,
  }).showToast();
}

const storageKey = 'passwordHistory';

// Character sets
const charSets = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*="
};

// Function to get the current storage object (localStorage or sessionStorage)
function getStorage() {
  const selectedStorage = document.querySelector('input[name="storage-type"]:checked').value;
  return selectedStorage === 'localStorage' ? localStorage : sessionStorage;
}

// Function to generate the password
function generatePassword() {
  let allChars = "";
  if (includeUppercase.checked) allChars += charSets.uppercase;
  if (includeLowercase.checked) allChars += charSets.lowercase;
  if (includeNumbers.checked) allChars += charSets.numbers;
  if (includeSymbols.checked) allChars += charSets.symbols;

  if (allChars.length === 0) {
    showToast("Please select at least one character type.");
    return "";
  }

  const passwordLength = passwordLengthInput.value;
  let newPassword = "";
  for (let i = 0; i < passwordLength; i++) {
    const randomIndex = Math.floor(Math.random() * allChars.length);
    newPassword += allChars[randomIndex];
  }
  return newPassword;
}

// Function to check password strength
function checkPasswordStrength(password) {
  let score = 0;
  const length = password.length;

  if (length >= 8) score += 20;
  if (length >= 12) score += 20;
  if (length >= 16) score += 20;

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSymbols = /[!@#$%^&*()_+~`|}{[\]:;?><,./-=]/.test(password);

  let charTypeCount = 0;
  if (hasUppercase) charTypeCount++;
  if (hasLowercase) charTypeCount++;
  if (hasNumbers) charTypeCount++;
  if (hasSymbols) charTypeCount++;

  if (charTypeCount >= 2) score += 10;
  if (charTypeCount >= 3) score += 10;
  if (charTypeCount >= 4) score += 10;

  return score;
}

// Function to update the strength indicator
function getScoreAnalysis(score) {
  let color;
  let text;
  let width;

  if (score < 40) {
    color = '#dc3545';
    text = 'Weak';
    width = '30%';
  } else if (score < 70) {
    color = '#ffc107';
    text = 'Medium';
    width = '60%';
  } else {
    color = '#28a745';
    text = 'Strong';
    width = '100%';
  }

  return {color, text, width};
}

// Function to update the strength indicator
function updateStrengthIndicator(score) {
  let {color, width} = getScoreAnalysis( score );

  strengthBar.style.backgroundColor = color;
  strengthBar.style.width = width;
}

// Function to load passwords from storage
function loadPasswordsFromStorage() {
  const storage = getStorage();
  const passwordsJSON = storage.getItem(storageKey);
  return passwordsJSON ? JSON.parse(passwordsJSON) : [];
}

// Function to save a password to storage
function savePasswordToStorage(password) {
  const storage = getStorage();
  const passwords = loadPasswordsFromStorage();
  passwords.unshift({"password": password, "score_analysis": getScoreAnalysis(checkPasswordStrength(password))}); // Add to the beginning of the array
  storage.setItem(storageKey, JSON.stringify(passwords));
}

// Function to render the history list
function renderHistory() {
  const passwords = loadPasswordsFromStorage();
  historyList.innerHTML = '';

  if (passwords.length === 0) {
    historyList.innerHTML = '<li>No history saved.</li>';
    return;
  }

  passwords.forEach(p => {
    const listItem = document.createElement('li');
    let span = document.createElement("span");
    span.textContent = p.password;
    listItem.style.color = p.score_analysis.color;

    let pCopy = document.createElement("button");
    pCopy.classList.add("copy-history-btn", "btn", "primary");
    pCopy.textContent = "Copy";

    listItem.appendChild(span);
    listItem.appendChild(pCopy);

    historyList.appendChild(listItem);
  });
}

function copyToClipboard( t ) {
  navigator.clipboard.writeText( t )
    .then(() => {
      showToast('Password copied to clipboard!');
    })
    .catch(err => {
      console.error('Failed to copy text: ', err);
      showToast('Failed to copy text: ' + err)
    });
}

// Event listeners
generateBtn.addEventListener('click', () => {
  const newPassword = generatePassword();
  if (newPassword) {
    passwordOutput.value = newPassword;
    const score = checkPasswordStrength(newPassword);
    updateStrengthIndicator(score);
    savePasswordToStorage(newPassword);
    renderHistory();
  }
});

copyBtn.addEventListener('click', () => {
  copyToClipboard(passwordOutput.value );
});

// Event delegation for copy buttons in the history list
historyList.addEventListener('click', (event) => {
  if (event.target.classList.contains('copy-history-btn')) {
    copyToClipboard(event.target.previousElementSibling.textContent);
  }
});

// Event listeners for storage choice
storageRadios.forEach(radio => {
  radio.addEventListener('change', () => {
    renderHistory();
  });
});

// Event listener for clear history button
clearHistoryBtn.addEventListener('click', () => {
  const storage = getStorage();
  storage.removeItem(storageKey);
  renderHistory();
});

// Initial load
renderHistory();

// Initial password generation on page load
const initialPassword = generatePassword();
if (initialPassword) {
  passwordOutput.value = initialPassword;
  const score = checkPasswordStrength(initialPassword);
  updateStrengthIndicator(score);
}