// URL Shortener with Ad Support
class URLShortener {
    constructor() {
        this.urlDatabase = this.loadUrls();
        this.adNetworks = this.initializeAdNetworks();
        this.initializeAds();
    }

    loadUrls() {
        const saved = localStorage.getItem('ffUrlDatabase');
        return saved ? JSON.parse(saved) : {};
    }

    saveUrls() {
        localStorage.setItem('ffUrlDatabase', JSON.stringify(this.urlDatabase));
    }

    initializeAdNetworks() {
        return {
            propeller: {
                active: true,
                code: `<!-- Propeller Ads Code -->
                <script type="text/javascript" src="//upgulpinon.com/1/02/6f/01266f1f8c9f3c18c1f42c5b4c6ceb67.js"></script>`
            },
            adsterra: {
                active: false,
                code: `<!-- Adsterra Code -->`
            }
        };
    }

    initializeAds() {
        const adContainer = document.getElementById('adContainer');
        if (this.adNetworks.propeller.active) {
            adContainer.innerHTML = this.adNetworks.propeller.code;
        }
    }

    generateShortCode() {
        return Math.random().toString(36).substring(2, 10);
    }

    shortenUrl() {
        const longUrl = document.getElementById('longUrl').value.trim();
        
        if (!this.isValidUrl(longUrl)) {
            this.showResult('Please enter a valid URL starting with http:// or https://', 'error');
            return;
        }

        const shortCode = this.generateShortCode();
        this.urlDatabase[shortCode] = {
            url: longUrl,
            clicks: 0,
            created: new Date().toISOString()
        };
        
        this.saveUrls();
        
        const shortUrl = `${window.location.origin}/s/${shortCode}`;
        this.showResult(`
            <strong>✅ URL Shortened Successfully!</strong><br><br>
            <strong>Short URL:</strong><br>
            <input type="text" id="shortUrlInput" value="${shortUrl}" readonly style="width:100%; padding:10px; margin:10px 0;">
            <button onclick="copyToClipboard()" style="background:#28a745;">Copy URL</button>
            <br><br>
            <small>You will earn money when people click this link!</small>
        `, 'success');
        
        document.getElementById('longUrl').value = '';
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    showResult(message, type) {
        const resultDiv = document.getElementById('result');
        resultDiv.innerHTML = message;
        resultDiv.className = `result-box show ${type}`;
    }

    redirectToUrl(shortCode) {
        if (this.urlDatabase[shortCode]) {
            this.urlDatabase[shortCode].clicks++;
            this.saveUrls();
            
            // Show ad page before redirect
            this.showAdPage(this.urlDatabase[shortCode].url);
        } else {
            window.location.href = '/404.html';
        }
    }

    showAdPage(destinationUrl) {
        document.body.innerHTML = `
            <div class="ad-redirect-page">
                <div class="ad-container">
                    <h2>🔄 Redirecting...</h2>
                    <p>Please wait while we prepare your destination</p>
                    <div class="countdown">5</div>
                    <div id="adSpace">
                        <!-- Ads will show here -->
                        ${this.adNetworks.propeller.code}
                    </div>
                    <p><small>Support our service by viewing this ad</small></p>
                </div>
            </div>
        `;

        let seconds = 5;
        const countdownElement = document.querySelector('.countdown');
        const countdown = setInterval(() => {
            seconds--;
            countdownElement.textContent = seconds;
            if (seconds <= 0) {
                clearInterval(countdown);
                window.location.href = destinationUrl;
            }
        }, 1000);
    }
}

// Utility functions
function copyToClipboard() {
    const copyText = document.getElementById('shortUrlInput');
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    document.execCommand('copy');
    alert('URL copied to clipboard!');
}

function shortenUrl() {
    window.shortener.shortenUrl();
}

// Handle short URL redirects
function handleShortUrl() {
    const path = window.location.pathname;
    if (path.startsWith('/s/')) {
        const shortCode = path.split('/s/')[1];
        window.shortener.redirectToUrl(shortCode);
    }
}

// Initialize when page loads
window.addEventListener('load', () => {
    window.shortener = new URLShortener();
    handleShortUrl();
});
