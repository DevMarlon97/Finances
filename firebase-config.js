const firebaseConfig = {
  apiKey: "AIzaSyC4kbWll_8cpv7QUWNAXJgPaSThMRVYqFo",
  //AIzaSyC4kbWll_8cpv7QUWNAXJgPaSThMRVYqFo
  authDomain: "savings-control-a85b9.firebaseapp.com",
  projectId: "savings-control-a85b9",
  storageBucket: "savings-control-a85b9.firebasestorage.app",
  messagingSenderId: "1054481790356",
  appId: "1:1054481790356:web:61ae281b114e07a61d8b81"
};

// Inicializa o Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Cria as ferramentas de login e banco de dados
const auth = firebase.auth();
const db = firebase.firestore();