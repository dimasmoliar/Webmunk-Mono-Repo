const continueButton = document.getElementById('continueButton');
const emailInput = document.getElementById('emailInput');
const getStartedContainer = document.getElementById('getStartedContainer');
const studyExtensionContainer = document.getElementById('studyExtensionContainer');
const copyButton = document.getElementById('copyButton');
const randomIdentifier = document.getElementById('randomIdentifier');
let isPrivacyCheckSent = false;
let fullIdentifier = '';

getStartedContainer.style.display = 'block';
studyExtensionContainer.style.display = 'none';

continueButton.addEventListener('click', async () => {
  const email = emailInput.value.trim().toLowerCase();

  if (!email) {
    alert('E-Mail Required\nPlease enter an e-mail address to continue.');

    return;
  }

  const identifier = await getIdentifier(email);

  if (!identifier) {
    alert('Enrollment hiccup!\nPlease give it another shot a bit later. We appreciate your patience!');

    return;
  }

  if (!isPrivacyCheckSent) {
    chrome.runtime.sendMessage({ action: 'cookiesAppMgr.checkPrivacy' });
    isPrivacyCheckSent = true;
  }

  chrome.storage.local.set({ identifier: identifier }, () => {
    getStartedContainer.style.display = 'none';
    studyExtensionContainer.style.display = 'block';
    randomIdentifier.innerHTML = formatIdentifier(identifier);
    fullIdentifier = identifier;
  });
});

copyButton.addEventListener('click', async () => {
  await navigator.clipboard.writeText(fullIdentifier);
  alert('Identifier copied to clipboard');
});

async function getIdentifier(email) {
  try {
    const url = 'https://europe-west2-webmunk-427616.cloudfunctions.net/user-enroll';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: email })
    });

    const data = await response.json();
    return data.userId;
  } catch (e) {
    console.error(e);
    return null;
  }
}

function formatIdentifier(identifier) {
  const firstTenSymbols = identifier.substring(0, 10);
  const lastTenSymbols = identifier.substring(identifier.length - 10);

  return `${firstTenSymbols}...${lastTenSymbols}`;
}

function displayIdentifier() {
  chrome.storage.local.get('identifier', (result) => {
    const identifier = result.identifier;

    if (identifier) {
      getStartedContainer.style.display = 'none';
      studyExtensionContainer.style.display = 'block';
      randomIdentifier.innerHTML = formatIdentifier(identifier);
      fullIdentifier = identifier;
    }
  });
}

displayIdentifier();
