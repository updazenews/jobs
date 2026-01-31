import {
  collection,
  getDocs,
  setDoc,
  doc,
  query,
  updateDoc, 
  deleteField,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "../../../assets/js/jobs.js";
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

document.addEventListener("DOMContentLoaded", async () =>{
    const inputCompanyName = document.getElementById("inputCompanyName");
    
});