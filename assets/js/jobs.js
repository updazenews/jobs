import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCZSyty8XgrkBycReUHXzZZJgvajJMatJQ",
  authDomain: "updaze-jobs.firebaseapp.com",
  projectId: "updaze-jobs",
  messagingSenderId: "208744900105",
  appId: "1:208744900105:web:84456f914b2ae57ee7fad8",
  measurementId: "G-WM1KXZD6DL"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const jobsRef = collection(db, "jobs");
const q = query(jobsRef, where("active", "==", true));

const snapshot = await getDocs(q);

snapshot.forEach(doc => {
  console.log(doc.id, doc.data());
});
