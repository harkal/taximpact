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
    // Detect user's country
    detectUserCountry();
    
    // Initial calculation
    calculateTaxImpact();
    
    // Add input event listeners to all inputs
    document.getElementById('country').addEventListener('change', calculateTaxImpact);
    document.getElementById('incomeTax').addEventListener('input', calculateTaxImpact);
    document.getElementById('salesTax').addEventListener('input', calculateTaxImpact);
    document.getElementById('iterations').addEventListener('input', calculateTaxImpact);
});

function calculateTaxImpact() {
    const incomeTax = parseFloat(document.getElementById('incomeTax').value) / 100;
    const salesTax = parseFloat(document.getElementById('salesTax').value) / 100;
    const iterations = parseInt(document.getElementById('iterations').value);
    
    let resultsHTML = '<h2>Results</h2>';
    
    // Store all transaction results in an array
    let transactions = [];
    let remainingMoney = 100; // Start with 100 units of money
    
    for (let i = 0; i < iterations; i++) {
        // Calculate income tax impact
        const afterIncomeTax = remainingMoney * (1 - incomeTax);
        
        // Calculate sales tax impact
        const afterSalesTax = afterIncomeTax / (1 + salesTax);
        
        // Calculate percentages for visualization
        const economyPercentage = (afterSalesTax / 100) * 100;
        const taxPercentage = 100 - economyPercentage;
        
        // Store transaction HTML
        transactions.push(`
            <div class="transaction-bar">
                <div>Transaction ${i + 1}</div>
                <div class="bar">
                    <div class="economy-portion" style="width: ${economyPercentage}%"></div>
                    <div class="tax-portion" style="width: ${taxPercentage}%"></div>
                </div>
                <div>Economy: ${economyPercentage.toFixed(2)}% | Tax: ${taxPercentage.toFixed(2)}%</div>
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
} 