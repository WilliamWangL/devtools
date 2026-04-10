const CHARS = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-='
};

function updateLength(val) {
    document.getElementById('length-val').innerText = val;
    generatePassword(); // Generate as they slide
}

function generatePassword() {
    const length = parseInt(document.getElementById('length').value);
    const useUpper = document.getElementById('uppercase').checked;
    const useLower = document.getElementById('lowercase').checked;
    const useNum = document.getElementById('numbers').checked;
    const useSym = document.getElementById('symbols').checked;

    let charset = '';
    let requiredChars = []; // Ensure at least one of each selected

    if (useUpper) { charset += CHARS.uppercase; requiredChars.push(CHARS.uppercase); }
    if (useLower) { charset += CHARS.lowercase; requiredChars.push(CHARS.lowercase); }
    if (useNum) { charset += CHARS.numbers; requiredChars.push(CHARS.numbers); }
    if (useSym) { charset += CHARS.symbols; requiredChars.push(CHARS.symbols); }

    if (!charset) {
        document.getElementById('password-display').innerText = 'Select options';
        return;
    }

    let password = '';
    // Guarantee required chars
    requiredChars.forEach(set => {
        password += set[Math.floor(Math.random() * set.length)];
    });

    // Fill the rest
    for (let i = password.length; i < length; i++) {
        password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Shuffle the password
    password = password.split('').sort(() => 0.5 - Math.random()).join('');

    document.getElementById('password-display').innerText = password;
}

function copyPassword() {
    const val = document.getElementById('password-display').innerText;
    if (val && val !== 'Select options') {
        copyToClipboard(val);
    }
}

// Add listeners to checkboxes to regenerate
document.querySelectorAll('input[type=checkbox]').forEach(cb => {
    cb.addEventListener('change', generatePassword);
});

// Initial generation
generatePassword();
