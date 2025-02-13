// Tax data for different countries (2024 data)
const countryTaxData = {
    'US': { 
        incomeTax: 24, // Federal tax rate for median income
        salesTax: 7.5  // Average combined state and local sales tax
    },
    'UK': {
        incomeTax: 20, // Basic rate
        salesTax: 20   // VAT standard rate
    },
    'DE': {
        incomeTax: 42, // Average rate for median income
        salesTax: 19   // VAT standard rate
    },
    'FR': {
        incomeTax: 30, // Average rate for median income
        salesTax: 20   // VAT standard rate
    },
    'SE': {
        incomeTax: 52, // Average rate including municipal tax
        salesTax: 25   // VAT standard rate
    },
    'DK': {
        incomeTax: 45, // Average rate
        salesTax: 25   // VAT standard rate
    },
    'ES': {
        incomeTax: 37, // Average rate for median income
        salesTax: 21   // VAT standard rate
    },
    'GR': {
        incomeTax: 25, // Average rate for median income
        salesTax: 24   // VAT standard rate
    }
};

function updateTaxRates() {
    const country = document.getElementById('country').value;
    if (countryTaxData[country]) {
        document.getElementById('incomeTax').value = countryTaxData[country].incomeTax;
        document.getElementById('salesTax').value = countryTaxData[country].salesTax;
    }
    calculateTaxImpact();
}

// Function to detect user's country
async function detectUserCountry() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const countryCode = data.country;
        
        // Check if we have tax data for this country
        if (countryTaxData[countryCode]) {
            document.getElementById('country').value = countryCode;
            updateTaxRates();
        }
    } catch (error) {
        console.log('Could not detect country:', error);
    }
}

// Update event listeners when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    
    // Detect user's country
    detectUserCountry();
    
    // Initial calculation
    calculateTaxImpact();
    
    // Add input event listeners to all inputs
    document.getElementById('country').addEventListener('change', calculateTaxImpact);
    document.getElementById('incomeTax').addEventListener('input', calculateTaxImpact);
    document.getElementById('salesTax').addEventListener('input', calculateTaxImpact);
    document.getElementById('iterations').addEventListener('input', calculateTaxImpact);
    
    // Add explanation toggle functionality
    const toggleButton = document.getElementById('toggle-explanation');
    const toggleButtonCollapsed = document.getElementById('toggle-explanation-collapsed');
    const explanationSection = document.getElementById('explanation-section');
    const explanationCollapsed = document.getElementById('explanation-collapsed');
    
    function showFullExplanation() {
        explanationSection.classList.remove('hidden');
        explanationCollapsed.classList.add('hidden');
    }
    
    function showCollapsedExplanation() {
        explanationSection.classList.add('hidden');
        explanationCollapsed.classList.remove('hidden');
    }
    
    toggleButton.addEventListener('click', showCollapsedExplanation);
    toggleButtonCollapsed.addEventListener('click', showFullExplanation);
});

// Add loading state handling
function showLoading() {
    document.getElementById('loading-overlay').classList.add('active');
}

function hideLoading() {
    document.getElementById('loading-overlay').classList.remove('active');
}

// Update calculation function
async function calculateTaxImpact() {
    showLoading();
    await new Promise(resolve => setTimeout(resolve, 600)); // Artificial delay for UX
    const incomeTax = parseFloat(document.getElementById('incomeTax').value) / 100;
    const salesTax = parseFloat(document.getElementById('salesTax').value) / 100;
    const iterations = parseInt(document.getElementById('iterations').value);
    
    let resultsHTML = '<h2>Detailed Transactions</h2>';
    let transactions = [];
    let remainingMoney = 100;
    
    // Calculate final values for summary
    let finalValue = remainingMoney;
    for (let i = 0; i < iterations; i++) {
        const afterIncomeTax = finalValue * (1 - incomeTax);
        const afterSalesTax = afterIncomeTax / (1 + salesTax);
        finalValue = afterSalesTax;
    }
    
    // Update summary section
    const totalTax = 100 - finalValue;
    document.getElementById('final-value').textContent = `${finalValue.toFixed(2)}€`;
    document.getElementById('total-tax').textContent = `${totalTax.toFixed(2)}€`;
    document.getElementById('transaction-count').textContent = iterations;
    document.getElementById('tax-percentage').textContent = totalTax.toFixed(1);
    
    // Add animation classes based on impact
    const impactMessage = document.getElementById('impact-message');
    if (totalTax > 75) {
        impactMessage.style.backgroundColor = 'rgba(244, 67, 54, 0.2)';
    } else if (totalTax > 50) {
        impactMessage.style.backgroundColor = 'rgba(255, 152, 0, 0.2)';
    } else {
        impactMessage.style.backgroundColor = 'rgba(76, 175, 80, 0.2)';
    }
    
    // Calculate and store all transaction results
    remainingMoney = 100; // Reset for detailed calculations
    for (let i = 0; i < iterations; i++) {
        const afterIncomeTax = remainingMoney * (1 - incomeTax);
        const afterSalesTax = afterIncomeTax / (1 + salesTax);
        
        const economyPercentage = (afterSalesTax / 100) * 100;
        const taxPercentage = 100 - economyPercentage;
        
        transactions.push(`
            <div class="transaction-bar">
                <div class="transaction-header">
                    <span>Transaction ${i + 1}</span>
                    <div class="transaction-values">
                        <span>Economy: ${economyPercentage.toFixed(2)}%</span>
                        <span>Tax: ${taxPercentage.toFixed(2)}%</span>
                    </div>
                </div>
                <div class="bar">
                    <div class="economy-portion" style="width: ${economyPercentage}%"></div>
                    <div class="tax-portion" style="width: ${taxPercentage}%"></div>
                </div>
            </div>
        `);
        
        remainingMoney = afterSalesTax;
    }
    
    // Add transactions in reverse order
    resultsHTML += transactions.reverse().join('');
    
    // Add legend
    resultsHTML += `
        <div class="legend">
            <div class="legend-item">
                <div class="legend-color" style="background-color: #4CAF50"></div>
                <span>Economy</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background-color: #f44336"></div>
                <span>Tax</span>
            </div>
        </div>
    `;
    
    document.getElementById('results').innerHTML = resultsHTML;
    hideLoading();
}

function initTheme() {
    // Check for saved theme preference, otherwise use system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', systemTheme);
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

function getShareText() {
    const country = document.getElementById('country').value;
    const incomeTax = document.getElementById('incomeTax').value;
    const salesTax = document.getElementById('salesTax').value;
    const iterations = document.getElementById('transaction-count').textContent;
    const taxPercentage = document.getElementById('tax-percentage').textContent;
    
    let text = '';
    const starters = [
        "🤯 Did you know",
        "😱 Shocking:",
        "🔍 Ever realized",
        "💸 Mind-blowing fact:",
        "⚠️ Warning:",
    ];
    
    // Randomly select a starter
    const starter = starters[Math.floor(Math.random() * starters.length)];
    
    if (country && country !== 'custom') {
        const countryName = document.querySelector('#country option:checked').text;
        if (starter.endsWith(':')) {
            text = `${starter} in ${countryName}, combining ${incomeTax}% income tax with ${salesTax}% VAT means `;
        } else {
            text = `${starter} that in ${countryName}, combining ${incomeTax}% income tax with ${salesTax}% VAT means `;
        }
    } else {
        if (starter.endsWith(':')) {
            text = `${starter} combining ${incomeTax}% income tax with ${salesTax}% VAT means `;
        } else {
            text = `${starter} that combining ${incomeTax}% income tax with ${salesTax}% VAT means `;
        }
    }
    
    text += `you lose ${taxPercentage}% of your money after just ${iterations} transactions! 🚨`;
    
    return text;
}

function shareOnTwitter() {
    const text = getShareText();
    const url = window.location.href;
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
}

function shareOnLinkedIn() {
    const text = getShareText();
    const url = window.location.href;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
}

function shareOnFacebook() {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
}

function copyLink() {
    const text = getShareText();
    const url = window.location.href;
    const fullText = `${text}\n\n${url}`;
    navigator.clipboard.writeText(fullText).then(() => {
        showToast('Link and message copied to clipboard!');
    });
}

function showToast(message, type = 'success') {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="material-icons-round">check_circle</span>
        ${message}
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Add smooth scrolling to results
function scrollToResults() {
    document.querySelector('.summary-section').scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
} 