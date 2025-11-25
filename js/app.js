// ---------------------------------------------------------
// MAIN CONTROLLER (The Connector)
// ---------------------------------------------------------

// 1. Import all dependencies
import { auth, onAuthStateChanged, signOut } from './firebase-config.js';
import { addExpense, getAllExpenses, deleteExpense } from './db-service.js';
import { calculateSummary, getCategoryBreakdown, filterData } from './analysis.js';
import { renderExpenseChart } from './charts.js';
import { updateSummaryCards, updatePivotTable, updateTransactionList } from './ui.js';

// Global variable to store raw data
let rawData = [];

// 2. Initialize App when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log("App initializing...");
    
    // A. Check Authentication Status
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in
            console.log("User Connected:", user.email);
            // Load data immediately
            loadData();
        } else {
            // User is signed out -> Redirect to login page
            console.log("No user found. Redirecting...");
            window.location.replace("login.html");
        }
    });

    // B. Setup Event Listeners
    setupEventListeners();
});

/**
 * 📥 Load Data from Database & Update UI
 */
async function loadData() {
    // Show loading state (Optional UI hint could go here)
    
    // 1. Get data from DB
    rawData = await getAllExpenses();
    
    // 2. Process & Update UI (Initially show all data)
    refreshUI(rawData);
}

/**
 * 🔄 Refresh UI components with specific data
 * (Used for initial load AND filtering)
 */
function refreshUI(data) {
    // 1. Calculate Totals
    const summary = calculateSummary(data);
    updateSummaryCards(summary);

    // 2. Prepare Chart Data
    const categoryData = getCategoryBreakdown(data);
    renderExpenseChart(categoryData);
    updatePivotTable(categoryData);

    // 3. Show Transaction List
    updateTransactionList(data);
}

/**
 * 🎧 Setup All Button Clicks & Inputs
 */
function setupEventListeners() {

    // 1. Filter Button Click
    document.getElementById('filter-btn').addEventListener('click', () => {
        const start = document.getElementById('start-date').value;
        const end = document.getElementById('end-date').value;
        const category = document.getElementById('filter-category').value;

        const filteredData = filterData(rawData, start, end, category);
        refreshUI(filteredData);
    });

    // 2. Add Expense Modal Handling
    const modal = document.getElementById('expense-modal');
    const openBtn = document.getElementById('open-modal-btn');
    const closeBtn = document.querySelector('.close-btn');

    openBtn.onclick = () => modal.style.display = "flex";
    closeBtn.onclick = () => modal.style.display = "none";
    window.onclick = (e) => { if (e.target == modal) modal.style.display = "none"; }

    // 3. Handle Form Submit (Add New Expense)
    document.getElementById('expense-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = e.target.querySelector('.btn-submit');
        const originalText = btn.innerText;
        btn.innerText = "Saving...";
        btn.disabled = true;

        const newData = {
            date: document.getElementById('inp-date').value,
            category: document.getElementById('inp-category').value,
            description: document.getElementById('inp-desc').value,
            amount: document.getElementById('inp-amount').value
        };

        try {
            await addExpense(newData);
            
            // Reset form & Close modal
            e.target.reset();
            modal.style.display = "none";
            
            // Reload data to show changes
            await loadData(); 
            alert("Expense added successfully!");

        } catch (error) {
            console.error(error);
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });

    // 4. Handle Delete Logic (Listening to Custom Event from ui.js)
    document.addEventListener('request-delete', async (e) => {
        const idToDelete = e.detail;
        try {
            await deleteExpense(idToDelete);
            // Reload data
            await loadData();
        } catch (error) {
            alert("Could not delete item.");
        }
    });

    // 5. Logout Button
    document.getElementById('logout-btn').addEventListener('click', () => {
        signOut(auth).then(() => {
            alert("Logged out successfully");
            window.location.href = "login.html";
        }).catch((error) => {
            console.error("Logout Error:", error);
        });
    });
}