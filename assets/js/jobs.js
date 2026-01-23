<script type="module">
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const jobsRef = collection(db, "jobs");
const q = query(jobsRef, where("active", "==", true));

const snapshot = await getDocs(q);

snapshot.forEach(doc => {
  console.log(doc.id, doc.data());
});
</script>
