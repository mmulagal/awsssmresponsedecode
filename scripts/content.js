/**
 * Created by: Murali Mulagalapati
 * Date: 4th Dec, 2024
 * This script is injected into the page to inflate the base64 encoded and compressed data.
 * Intended to work only on https://*.console.aws.amazon.com/systems-manager/run-command/*
 * It uses the pako library to inflate the data.
 */

const BASE64_REGEXP = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/;

const main = document.querySelector('main');

if (main) {
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                const code = main.querySelector('code');

                if (code) {
                    updateInflatedText(code);
                    observer.disconnect();
                }
            }
        });
    });

    // Start observing the main element for child node additions
    observer.observe(main, { childList: true, subtree: true });
} else {
    console.error('Main element not found');
}

function updateInflatedText(node) {
    try {
        if (node) {
            let base64String = node.textContent;
            // Regex didn't work as expected, so replacing all new lines and whitespaces
            base64String = base64String.replaceAll('\r\n', '').replaceAll('\r', '').replaceAll('\n', '');
            const isBase64 = BASE64_REGEXP.test(base64String);
            if (!base64String || !isBase64) {
                console.error('Invalid base64 string:', base64String);
                return base64String;
            }

            const decodedData = Uint8Array.from(atob(base64String), c => c.charCodeAt(0));
            const inflatedData = pako.inflateRaw(decodedData, { to: 'string' });
            node.textContent = inflatedData;
        }
    } catch (error) {
        console.error('Error inflating data:', error);
    }
}
