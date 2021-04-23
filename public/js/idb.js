// create variable to hold db connection

let db;
// establish a connection to IndexedDB database called budget_tracker
const request = indexedDB.open('budget_tracker',1) // arguments (DB to connect to and version number)

//  this event will emit if the database version changes
request.onupgradeneeded = function (e) {
    //  save a reference to the db
    const db = e.target.result;
    // create an object store (table) called 'new_budget' set auto increment primary key of sorts
    db.createObjectStore('new_budget', {autoIncrement: true});    
};

request.onsuccess = function(e) {
    // when db is successfully created with its object store (from onupgradedneeded event above), save reference to db in global variable
    db = e.target.result;  
    // check if app is online, if yes run checkDatabase() function to send all local db data to api
    if (navigator.onLine) {
       uploadTransaction();
    }
  };  
  request.onerror = function(e) {
    // log error here
    console.log(e.target.errorCode);
  };
  
  function saveRecord(record) {
    const transaction = db.transaction(['new_budget'], 'readwrite');
  
    const budgetObjectStore = transaction.objectStore('new_budget');
  
    // add record to your store with add method.
    budgetObjectStore.add(record);
  }
  
  function uploadTransaction() {
    // open a transaction on your pending db
    const transaction = db.transaction(['new_budget'], 'readwrite');
  
    // access your pending object store
    const budgetObjectStore = transaction.objectStore('new_budget');
  
    // get all records from store and set to a variable
    const getAll = budgetObjectStore.getAll();
  
    getAll.onsuccess = function() {
       
      //if there was data in indexedDb's store, let's send it to the api server
      if (getAll.result.length > 0) {
        fetch('/api/transaction', {
          method: 'POST',
          body: JSON.stringify(getAll.result),
          headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
          }
        })
          .then(response => response.json())
          .then(serverResponse => {
            if (serverResponse.message) {
              throw new Error(serverResponse);
            }
  
            const transaction = db.transaction(['new_budget'], 'readwrite');
            const budgetObjectStore = transaction.objectStore('new_budget');
            // clear all items in your store
            budgetObjectStore.clear();
            alert('all saved data has been submitted')
          })
          .catch(err => {
            // set reference to redirect back here
            console.log(err);
          });
      }
    };
  }
  
  // listen for app coming back online
  window.addEventListener('online', uploadTransaction);