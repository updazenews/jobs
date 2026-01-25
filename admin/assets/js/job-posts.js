import {
  collection,
  getDocs,
  setDoc,
  doc,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "../../../assets/js/jobs.js";
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

document.addEventListener("DOMContentLoaded", async () => {

    //Check if the user is authorised to access this page.
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userVer = collection(db, "users");
      const q = query(
        userVer,
        where("email", "==", user.email)
      );
      const snapshot = await getDocs(q);
      const users = snapshot.docs.map(doc => {
        return { role: data["role"] };
      });


      if (users[0].role === "administrator") {


      } else {
        window.location.href = "../../admin/logout";
        console.error("user not admin ");
      }
    } else {
      window.location.href = "../../admin/logout";
      console.error("user empty ");
    }
  });
  //end of auth check.

  const jobsContainer = document.getElementById("tbJobs");
  try {
    
    const jobsFer = collection(db, "jobPosts");
    const q = query(
      jobsFer,
      orderBy("Post", "asc")
    );
    const snapshot = await getDocs(q);

  } catch (error) {
    console.error("Error fetching job posts: ", error);
  }

});