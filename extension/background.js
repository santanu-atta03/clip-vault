// Create context menu items when installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "inject-text",
    title: "Inject to Vault (Text)",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "inject-image",
    title: "Inject to Vault (Image)",
    contexts: ["image"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const settings = await chrome.storage.local.get(['apiUrl', 'token']);
  
  if (!settings.apiUrl || !settings.token) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon128.png',
      title: 'ClipVault: Neural Snatcher',
      message: 'Please log in to the extension popup first.'
    });
    return;
  }

  let data = {};
  if (info.menuItemId === "inject-text") {
    data = {
      content: info.selectionText,
      title: `Snatch from ${new URL(tab.url).hostname}`,
      tags: ['snatched', 'text']
    };
  } else if (info.menuItemId === "inject-image") {
    data = {
      content: `Snatched image from ${new URL(tab.url).hostname}`,
      imageUrl: info.srcUrl,
      title: `Image: ${new URL(tab.url).hostname}`,
      tags: ['snatched', 'image']
    };
  }

  try {
    const response = await fetch(`${settings.apiUrl}/api/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.token}`
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon128.png',
        title: 'Snatch Successful',
        message: 'Intelligence successfully injected into your vault.'
      });
    } else {
      const errData = await response.json();
      throw new Error(errData.message || 'Injection failed');
    }
  } catch (error) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon128.png',
      title: 'Snatch Failed',
      message: `Error: ${error.message}`
    });
  }
});
