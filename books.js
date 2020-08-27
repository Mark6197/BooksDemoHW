//Book Model Item
class Book {
    constructor(title, author, isbn, isRemote) {
        this.title = title;
        this.author = author;
        this.isbn = isbn;
        this.isRemote = isRemote;
    }
}

//---------------------------------------------------------

//Accees books from storage
class BooksStorage {

    static localBooksKey = "books"
    static remoteBooksKey = "booksRemote"

    static getBooksLocalStorage() {
        let localBooks;
        if (localStorage.getItem(BooksStorage.localBooksKey) === null) {
            localBooks = [];
        }
        else {
            let localBooksArrTxt = localStorage.getItem(BooksStorage.localBooksKey);
            let localBooksArr = JSON.parse(localBooksArrTxt);
            localBooks = localBooksArr;
        }
        return localBooks;
    }

    static getBooksRemoteStorage() {
        let remoteBooks;
        if (localStorage.getItem(BooksStorage.remoteBooksKey) === null) {
            remoteBooks = [];
        }
        var now = new Date().getTime();

        if (localStorage.getItem("lastRequestTime") === null) {
            BooksStorage.getRemoteBooksFromFile();
        }
        else {
            let lastRequestTime = localStorage.getItem("lastRequestTime");
            if ((now - lastRequestTime) > 180000) {
                BooksStorage.getRemoteBooksFromFile();
            }
        }

        let remoteBooksArrTxt = localStorage.getItem(BooksStorage.remoteBooksKey);
        let remoteBooksArr = JSON.parse(remoteBooksArrTxt);
        remoteBooks = remoteBooksArr;
        return remoteBooks;
    }

    static getRemoteBooksFromFile() {

        var xhttp = new XMLHttpRequest();
        xhttp.overrideMimeType("application/json");
        xhttp.open("GET", "books.json", true);

        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {

                localStorage.setItem(BooksStorage.remoteBooksKey, this.responseText);
                localStorage.setItem("lastRequestTime", new Date().getTime());
            }
        };

        xhttp.send();
    }


    static getAllBooksData() {
        let localBooksData = BooksStorage.getBooksLocalStorage();
        let remoteBooksData = BooksStorage.getBooksRemoteStorage();

        var combinedData = localBooksData.concat(remoteBooksData);
        return combinedData;
    }

    static addBooks(book) {
        //01 Read all books as object (getBooks()) get array
        let books = BooksStorage.getBooksLocalStorage();

        //02 Push to array
        books.push(book);

        //03 Save the new array back to storage 
        localStorage.setItem(BooksStorage.localBooksKey, JSON.stringify(books));
    }

    //Remove item from storage by isbn code
    static removeBooks(isbn) {
        //01 Read all books as object (getBooks()) get array
        let books = BooksStorage.getBooksLocalStorage();
        books.forEach((elementBook, index) => {
            if (elementBook.isbn === isbn) {
                books.splice(index, 1);
            }
        });
        //03 Save the new array back to storage 
        localStorage.setItem(BooksStorage.localBooksKey, JSON.stringify(books));
    }
}

//-------------------------------------------------------------------------------------

//Display Data
//Read date from inputs for new book item
//Delete item
//UI Alerts
class UI {

    static addBookToList(book) {

        let listTableBody = document.querySelector("#book-list");
        //Create new tr
        let row = document.createElement("tr");
        row.innerHTML = `<td id="tdTitle">${book.title}</td>
                         <td id="tdAuthor">${book.author}</td>
                         <td id="tdIsbn">${book.isbn}</td>`;
        if (book.isRemote === false) {
            row.innerHTML += `<td><button onclick='UI.changeToEditBook(${book.isbn});' id="bx-${book.isbn}">Edit</button><a style=" padding-left: 5px;" id="be-${book.isbn}" onclick="deleteRow(this,'${book.isbn}')" href="#"><span class="badge badge-pill badge-danger">X</span></a></td>`;
            row.style.color = "blue";

        }
        else {
            row.innerHTML += `<td></td>`;
            row.style.color = "green";

        }
        listTableBody.appendChild(row);
    }

    static displayBooks(booksArray) {
        let booksArr;
        if (booksArray == undefined) {
            booksArr = BooksStorage.getAllBooksData();
            sortOn(booksArr, document.getElementById("orderby").value);
        }
        else {
            booksArr = booksArray;
        }
        booksArr.forEach(itemBook => {
            UI.addBookToList(itemBook);
        });
    }

    static clearList() {
        let listTableBody = document.querySelector("#book-list");
        listTableBody.innerHTML = "";
    }

    static clearFormInputs() {

        document.querySelector("#title").value = "";
        document.querySelector("#author").value = "";
        document.querySelector("#isbn").value = "";
    }

    static changeToEditBook(isbn) {
        localStorage.setItem("chosenBook", isbn)
        window.location.href = '/edit.html';
    }

}

//------------------------------------------------------------------------------------------------------

window.addEventListener("DOMContentLoaded", (event) => {
    UI.displayBooks();
});

//Register Add new book from inputs form- add to list

var bookForm = document.querySelector("#book-form")
bookForm.addEventListener("submit", e => {
    // let me handle the submit, don't post it to server
    e.preventDefault();

    var titleVal = document.querySelector("#title").value;
    var authorVal = document.querySelector("#author").value;
    var isbnVal = document.querySelector("#isbn").value;

    if (titleVal === "" || authorVal === "" || isbnVal === "") {
        alert("Please fill all inputs")
    }
    else {
        let book = new Book(titleVal, authorVal, isbnVal, false);

        BooksStorage.addBooks(book);
        UI.clearList();
        UI.displayBooks();
        UI.clearFormInputs();
    }
});


var orderBySelect = document.querySelector("#orderby")
//Register to orderby select change event
orderBySelect.addEventListener("change", e => {
    let booksArr = BooksStorage.getAllBooksData();
    if (e.target.value != "isbn") {
        sortOn(booksArr, e.target.value);
    }
    else {
        sortOnNumeric(booksArr)
    }
    UI.clearList();
    UI.displayBooks(booksArr);
});

function deleteRow(element, isbn) {

    BooksStorage.removeBooks(isbn);
    UI.clearList();
    UI.displayBooks();
}

function sortOn(arr, prop) {
    arr.sort(
        function (a, b) {
            if (a[prop] < b[prop]) {
                return -1;
            } else if (a[prop] > b[prop]) {
                return 1;
            } else {
                return 0;
            }
        }
    );

}

function sortOnNumeric(arr) {
    arr.sort(
        function (a, b) {
            if (a["isbn"] - b["isbn"] < 0) {
                return -1;
            } else if (a["isbn"] - b["isbn"] > 0) {
                return 1;
            } else {
                return 0;
            }
        }
    );
}

