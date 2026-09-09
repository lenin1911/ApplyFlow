// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCkgmGa8VgWFtCrVoI400KQe28_dOMYg2o",
    authDomain: "applyflow-858e0.firebaseapp.com",
    projectId: "applyflow-858e0",
    storageBucket: "applyflow-858e0.firebasestorage.app",
    messagingSenderId: "657194866350",
    appId: "1:657194866350:web:ea7d26feccb03ac51c7f3f",
    measurementId: "G-VFHRQ8ZEPR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);