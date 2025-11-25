import { db, auth } from "./firebase-config.js";
import { 
    collection, addDoc, getDocs, deleteDoc, doc, query, where, orderBy, Timestamp 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const EXPENSE_COL = "expenses";
const CATEGORY_COL = "categories"; // নতুন কালেকশন

// 1. নতুন ট্রানজেকশন যোগ করা (টাইপ এবং পার্সন সহ)
export async function addTransaction(data) {
    const user = auth.currentUser;
    if (!user) throw new Error("User not logged in!");

    const dataToSave = {
        uid: user.uid,
        type: data.type, // 'expense', 'income', 'debt'
        date: data.date,
        category: data.category,
        description: data.description,
        person: data.person || "", // ধারের ক্ষেত্রে ব্যক্তির নাম
        amount: parseFloat(data.amount),
        createdAt: Timestamp.now()
    };

    return await addDoc(collection(db, EXPENSE_COL), dataToSave);
}

// 2. সব ট্রানজেকশন আনা
export async function getAllTransactions() {
    const user = auth.currentUser;
    if (!user) return [];

    // ইনডেক্স এরর এড়াতে ক্লায়েন্ট সাইড সর্টিং ব্যবহার করছি
    const q = query(collection(db, EXPENSE_COL), where("uid", "==", user.uid));
    const snapshot = await getDocs(q);
    
    let transactions = [];
    snapshot.forEach(doc => transactions.push({ id: doc.id, ...doc.data() }));
    
    // তারিখ অনুযায়ী সাজানো (নতুন আগে)
    return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// 3. ডিলিট ফাংশন (আগের মতোই)
export async function deleteTransaction(id) {
    await deleteDoc(doc(db, EXPENSE_COL, id));
}

// 4. 🆕 কাস্টম ক্যাটাগরি আনা
export async function getUserCategories() {
    const user = auth.currentUser;
    if (!user) return [];
    
    const q = query(collection(db, CATEGORY_COL), where("uid", "==", user.uid));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data().name);
}

// 5. 🆕 কাস্টম ক্যাটাগরি সেভ করা
export async function addCustomCategory(name) {
    const user = auth.currentUser;
    if (!user) return;
    await addDoc(collection(db, CATEGORY_COL), {
        uid: user.uid,
        name: name
    });
}