/* globals Chart:false */
import {
  collection,
  getDocs,
  setDoc,
  doc,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db, auth } from "../../../assets/js/jobs.js";
import { createUserWithEmailAndPassword, getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
//import {  } from "../../../assets/js/jobs.js";

(async () => {
  'use strict'

  // Graphs
  const ctx = document.getElementById('myChart')
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
      ],
      datasets: [{
        data: [
          15339,
          21345,
          18483,
          24003,
          23489,
          24092,
          12034
        ],
        lineTension: 0,
        backgroundColor: 'transparent',
        borderColor: '#007bff',
        borderWidth: 4,
        pointBackgroundColor: '#007bff'
      }]
    },
    options: {
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          boxPadding: 3
        }
      }
    }
  })

    const auth = getAuth();
    const user = auth.currentUser;
  
    if (user) {
      const userVer = collection(db, "users");
      const q = query(
        userVer,
        where("email", "==", user.email)
      );
      const snapshot = await getDocs(q);
      const users = snapshot.docs.map(doc => {
          return {role: data["role"]};
      });
      
  
      if (users[0].role === "administrator"){
      
     
      }else{
        window.location.href = "../../admin/logout";
      }
    } else {
      window.location.href = "../../admin/logout";
    }
})()

