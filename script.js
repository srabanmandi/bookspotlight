// global variables
let allBooksData = [];
let totalPages = 5;
let currentPage = 1;

//fetches book data from an API and stores it in a global variable
async function fetchBooksData(pageNo = 1) {
  const url = `https://api.freeapi.app/api/v1/public/books?page=${pageNo+1}&limit=10`;
  const options = { method: "GET", headers: { accept: "application/json" } };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    allBooksData = data.data.data;
  } 
  catch (error) {
    console.error(error);
  }

  renderBooks(allBooksData);
}

// Displays a sorted list of books in the chosen view on the webpage
function renderBooks(books) {
  if(books.length === 0){
      document.querySelector(".grid-container").textContent = `No books found`;
      return;
  }else document.querySelector(".grid-container").innerHTML = ``;

  setView();
  sortBooks(books);

  books.forEach((book) => {
    const element = createBookCard(book);
    document.querySelector(".grid-container").appendChild(element);
    });

  // scroll to the top of the page
  window.scrollTo({top: 0, behavior: "smooth"});
};

// Create a book card element and return it 
function createBookCard(book) {
    const bookInfo = book.volumeInfo;
    const bookTitle = bookInfo.title;
    const bookAuthors = bookInfo.authors;
    const bookPublisher = bookInfo.publisher;
    const bookPublishedDate = bookInfo.publishedDate;
    const thumbnailSrc = bookInfo.imageLinks?.thumbnail || " ";
    const bookLink = bookInfo.infoLink;

    const card = createElement("div", "book-card");

    const thumbnail = createElement("img", "book-cover");
    thumbnail.src = thumbnailSrc;

    const details = createElement("div", "book-info");

    const title = createElement("div", "title");
    title.textContent = bookTitle;
 
    const authors = createElement("div", "author");
    bookAuthors.forEach((author) => {
      authors.innerHTML += `<p>${author}</p> `;
    });

    const publisher = createElement("div", "publisher");
    publisher.textContent = bookPublisher;

    const publishedDate = createElement("div", "date"); 
    publishedDate.textContent = bookPublishedDate;

    appendChildren(details, [title, authors, publisher, publishedDate]);

    const link = createElement("a");
    const linkBtn = createElement("button", "more-info-btn");
    linkBtn.textContent = "More Info";
    link.href = bookLink;
    link.target = "_blank";
    link.appendChild(linkBtn);

    appendChildren(card, [thumbnail, details, link]);

    return card;
}
// create a new HTML element with a specified class name
function createElement(element, className) {
  const newElement = document.createElement(element);
  newElement.classList.add(className);
  return newElement;
}
// append an array of children to a parent element
function appendChildren(parent, children) {
  children.forEach(child => {
    parent.appendChild(child);  
  })
}

// Searching functionality 
document.querySelector(".search-btn").addEventListener("click", searchBook);
document.querySelector("#search-box").addEventListener("keyup", (e) => {
  if (e.key === "Enter") searchBook();
});
// Filter books based on title or author
function searchBook() {
  const searchCriteria = document.querySelector("#search-option").value;
  const searchQuery = document.querySelector("#search-box").value.toLowerCase();

  if(!searchQuery) return

  let matchingBooks = [];
  if (searchCriteria === "title") {
    matchingBooks = allBooksData.filter((book) => {
      const tags = book.volumeInfo[searchCriteria].toLowerCase().split(" ");
      return tags.includes(...searchQuery.split(" "));
    });
  }
  if (searchCriteria === "authors") {
    matchingBooks = allBooksData.filter((book) => {
      const tags = [];
      if (book.volumeInfo.authors) {
        book.volumeInfo.authors.forEach((author) => {
          tags.push(...author.toLowerCase().split(" "));
        });
      }
      return tags.includes(...searchQuery.split(" "));
    });
  }
  renderBooks(matchingBooks);
  document.querySelector("#search-box").value = ``;
}

// Sorting functionality
document.querySelectorAll("#sorting-option option").forEach((option) => {
  option.addEventListener("click", () => {
    renderBooks(allBooksData);
  });
});
// Sort books based on title or published date
function sortBooks(books) {
  
  const sortingCriteria = document
    .querySelector("#sorting-option")
    .value.split("-");
  const [base, order] = sortingCriteria;

  if (order === "ascending" && base === "title") {
    books.sort((a, b) => {
      return a.volumeInfo[base]
        .toLowerCase()
        .localeCompare(b.volumeInfo[base].toLowerCase());
    });
  } else if (order === "descending" && base === "title") {
    books.sort((a, b) => {
      return b.volumeInfo[base]
        .toLowerCase()
        .localeCompare(a.volumeInfo[base].toLowerCase());
    });
  }

  if(order === "ascending" && base === "publishedDate"){
    books.sort((a, b) => {
        return new Date(a.volumeInfo[base]) - new Date(b.volumeInfo[base]);
    })
  } else if(order === "descending" && base === "publishedDate"){
    books.sort((a, b) => {
        return new Date(b.volumeInfo[base]) - new Date(a.volumeInfo[base]);
    })
  }
  return books;
}

// View functionality
document.querySelectorAll("#view-option option").forEach((view) => {
  view.addEventListener("click", (e) => {
    setView(e.target.value);
  });
});
// Set how the books are displayed either as a grid or a list
function setView() {
  const view = document.querySelector("#view-option").value;  
  const booksContainer = document.querySelector(".grid-container");
  // const bookCard = document.querySelector(".book-card")
  if (view === "list") {
    booksContainer.classList.add("list-view");
    // bookCard.classList.replace('')
  }
  if (view === "grid") {
    booksContainer.classList.remove("list-view");
  }
}

// Pagination, with each page turn a new set of books are displayed
document.querySelector(".previous-btn").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    document.querySelector(".current-page").textContent = currentPage;
    fetchBooksData(currentPage);
  }
});
document.querySelector(".next-btn").addEventListener("click", () => {
  if (currentPage < totalPages) {
    currentPage++;
    document.querySelector(".current-page").textContent = currentPage;
    fetchBooksData(currentPage);
  }
});

// Fetch book data from the API
fetchBooksData();
