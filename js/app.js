import { auth, onAuthStateChanged, signOut } from './firebase-config.js';
import { addTransaction, getAllTransactions, deleteTransaction, getUserCategories, addCustomCategory } from './db-service.js';
import { calculateSummary, getCategoryBreakdown, filterData } from './analysis.js';
import { renderExpenseChart } from './charts.js';
import { updateSummaryCards, updatePivotTable, updateTransactionList } from './ui.js';

let rawData = [];

// 1. Initialize App
document.addEventListener('DOMContentLoaded', () => {
    console.log("App initializing...");
    
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("User Connected:", user.email);
            
            // --- NEW: ছবি এবং ইমেইল দেখানোর কোড ---
            const userPhotoEl = document.getElementById('user-photo');
            const userEmailEl = document.getElementById('user-email');

            // ১. ইমেইল সেট করা
            if (userEmailEl) {
                userEmailEl.innerText = user.email;
            }

            // ২. ছবি সেট করা
            if (userPhotoEl) {
                if (user.photoURL) {
                    userPhotoEl.src = user.photoURL;
                    userPhotoEl.style.display = 'block'; // ছবি থাকলে দেখাবে
                } else {
                    userPhotoEl.style.display = 'none'; // ছবি না থাকলে লুকাবে
                }
            }
            // ----------------------------------------

            loadData();
            loadCategories(); // সব ড্রপডাউনে কাস্টম ক্যাটাগরি লোড হবে
        } else {
            // ইউজার লগইন না থাকলে লগইন পেজে রিডাইরেক্ট
            window.location.replace("login.html");
        }
    });

    setupEventListeners();
    const dateInput = document.getElementById('inp-date');
    if(dateInput) dateInput.valueAsDate = new Date();
});

async function loadData() {
    rawData = await getAllTransactions();
    refreshUI(rawData);
}

/**
 * 🔄 Sync Categories: মডাল এবং সব ফিল্টার ড্রপডাউনে ক্যাটাগরি আপডেট করা
 */
async function loadCategories() {
    try {
        const cats = await getUserCategories();
        
        // ৩টি ড্রপডাউন টার্গেট করা হচ্ছে
        const dropdowns = [
            document.getElementById('inp-category'),    // মডাল
            document.getElementById('filter-category'), // মেইন ফিল্টার (উপরে)
            document.getElementById('tbl-category')     // টেবিল ফিল্টার (নতুন)
        ];

        if (cats && cats.length > 0) {
            cats.forEach(c => {
                dropdowns.forEach(select => {
                    if (select) { // এলিমেন্ট আছে কিনা চেক করা
                        // ডুপ্লিকেট চেক করা
                        let exists = false;
                        for (let i = 0; i < select.options.length; i++) {
                            if (select.options[i].value === c) { exists = true; break; }
                        }
                        // না থাকলে যোগ করা
                        if (!exists) {
                            const opt = document.createElement('option');
                            opt.value = c;
                            opt.innerText = c;
                            select.appendChild(opt);
                        }
                    }
                });
            });
        }
    } catch (e) {
        console.error("Error loading categories", e);
    }
}

function refreshUI(data) {
    const summary = calculateSummary(data);
    updateSummaryCards(summary);
    const categoryData = getCategoryBreakdown(data);
    renderExpenseChart(categoryData);
    updatePivotTable(categoryData);
    updateTransactionList(data);
}

function setupEventListeners() {

    // 1. Main Top Filter Button
    document.getElementById('filter-btn').addEventListener('click', () => {
        const start = document.getElementById('start-date').value;
        const end = document.getElementById('end-date').value;
        const category = document.getElementById('filter-category').value;
        refreshUI(filterData(rawData, start, end, category));
    });

    // 🟢 2. NEW: Table Specific Filters (Live Update)
    const tblDate = document.getElementById('tbl-date');
    const tblType = document.getElementById('tbl-type');
    const tblCat = document.getElementById('tbl-category');

    function filterTable() {
        let filtered = rawData;

        // Date Logic
        if (tblDate.value) {
            filtered = filtered.filter(item => item.date === tblDate.value);
        }
        // Type Logic
        if (tblType.value !== 'all') {
            filtered = filtered.filter(item => item.type === tblType.value);
        }
        // Category Logic
        if (tblCat.value !== 'all') {
            filtered = filtered.filter(item => item.category === tblCat.value);
        }
        updateTransactionList(filtered);
    }

    if(tblDate) tblDate.addEventListener('change', filterTable);
    if(tblType) tblType.addEventListener('change', filterTable);
    if(tblCat) tblCat.addEventListener('change', filterTable);


    // 3. Modal Open/Close
    const modal = document.getElementById('expense-modal');
    document.getElementById('open-modal-btn').onclick = () => {
        modal.style.display = "flex";
        document.getElementById('expense-form').reset();
        document.getElementById('inp-date').valueAsDate = new Date();
        const expenseRadio = document.querySelector('input[name="trxType"][value="expense"]');
        if(expenseRadio) {
            expenseRadio.checked = true;
            expenseRadio.dispatchEvent(new Event('change'));
        }
    };
    
    const closeBtn = document.querySelector('.close-btn');
    if(closeBtn) closeBtn.onclick = () => modal.style.display = "none";
    
    window.onclick = (e) => { if (e.target == modal) modal.style.display = "none"; };

    // 4. Form Logic (Show/Hide Person)
    const radios = document.querySelectorAll('input[name="trxType"]');
    const grpPerson = document.getElementById('grp-person');
    const grpCategory = document.getElementById('grp-category');

    radios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const type = e.target.value;
            if (type === 'debt') {
                grpPerson.style.display = 'flex';
                grpCategory.style.display = 'none';
                document.getElementById('inp-person').required = true;
            } else if (type === 'income') {
                grpPerson.style.display = 'none';
                grpCategory.style.display = 'none';
                document.getElementById('inp-person').required = false;
            } else { 
                grpPerson.style.display = 'none';
                grpCategory.style.display = 'flex';
                document.getElementById('inp-person').required = false;
            }
        });
    });

    // 🟢 5. Add Custom Category Logic (Updated)
    const addCatBtn = document.getElementById('btn-add-cat');
    if (addCatBtn) {
        addCatBtn.addEventListener('click', async () => {
            const newCat = prompt("Enter new category name:");
            if (newCat && newCat.trim() !== "") {
                await addCustomCategory(newCat.trim());
                
                // ৩টি ড্রপডাউনেই নতুন ক্যাটাগরি যোগ করা হচ্ছে
                const dropdowns = [
                    document.getElementById('inp-category'),
                    document.getElementById('filter-category'),
                    document.getElementById('tbl-category')
                ];
                
                dropdowns.forEach(select => {
                    if (select) {
                        const opt = document.createElement('option');
                        opt.value = newCat.trim();
                        opt.innerText = newCat.trim();
                        select.appendChild(opt);
                        // যদি এটা মডালের ড্রপডাউন হয়, তবে অটোমেটিক সিলেক্ট করে দাও
                        if(select.id === 'inp-category') opt.selected = true;
                    }
                });
            }
        });
    }

    // 6. Save Transaction
    document.getElementById('expense-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('.btn-submit');
        const originalText = btn.innerText;
        btn.innerText = "Saving...";
        btn.disabled = true;

        try {
            const type = document.querySelector('input[name="trxType"]:checked').value;
            const newData = {
                type: type,
                date: document.getElementById('inp-date').value,
                category: type === 'expense' ? document.getElementById('inp-category').value : type,
                person: type === 'debt' ? document.getElementById('inp-person').value : "", 
                description: document.getElementById('inp-desc').value,
                amount: document.getElementById('inp-amount').value
            };
            await addTransaction(newData);
            modal.style.display = "none";
            await loadData();
            alert("Transaction saved successfully!");
        } catch (err) {
            console.error("Save Error:", err);
            alert("Error saving data!");
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });

    // 7. Delete & Logout
    document.addEventListener('request-delete', async (e) => {
        if(confirm('Are you sure you want to delete this?')) {
            await deleteTransaction(e.detail);
            await loadData();
        }
    });
    
    document.getElementById('logout-btn').addEventListener('click', () => {
        signOut(auth)
        .then(() => {
            console.log("User signed out.");
            window.location.href = "login.html";
        })
        .catch((error) => {
            console.error("Logout Error:", error);
        });
    });
}