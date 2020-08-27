class Book {
    constructor(title, author, isbn, isRemote) {
        this.title = title;
        this.author = author;
        this.isbn = isbn;
        this.isRemote = isRemote;
    }
}


class BooksStorage {

    static localBooksKey = "books"
    static localBooksArr;

    static getBookFromLocalStorageByIsbn() {

        let bookisbn = localStorage.getItem("chosenBook");
        let localBooksArrTxt = localStorage.getItem(BooksStorage.localBooksKey);
        BooksStorage.localBooksArr = JSON.parse(localBooksArrTxt);

        let book = BooksStorage.localBooksArr.filter(function (book) { return (book.isbn == bookisbn); });
        return book;
    }

    static saveEditedBookToLocalStorage() {
        BooksStorage.localBooksArr.forEach(book => {
            if (book.isbn == localStorage.getItem("chosenBook")) {
                book.title = document.getElementById("title").value;
                book.author = document.getElementById("author").value;
                book.isbn = document.getElementById("isbn").value;

                localStorage.setItem(BooksStorage.localBooksKey, JSON.stringify(BooksStorage.localBooksArr));
            }
        });
        //window.location.href = '/books.html';
    }
}

class UI {

    static loadEditBookInputs() {
        let book = BooksStorage.getBookFromLocalStorageByIsbn();
        document.getElementById("title").value = book[0].title;
        document.getElementById("author").value = book[0].author;
        document.getElementById("isbn").value = book[0].isbn;
    }

}


window.addEventListener("DOMContentLoaded", (event) => {
    UI.loadEditBookInputs();
});

var bookForm = document.querySelector("#book-form")

bookForm.addEventListener("submit", e => {
    BooksStorage.saveEditedBookToLocalStorage();
    e.preventDefault();
    window.location.href = '/books.html';
});