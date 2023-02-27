//!json-server -w db.json -p 8000 для запуска db.json

//! это апи для запросов
const API = " http://localhost:8000/products";

//!блок куда мы добавляем карточки
const list = document.querySelector("#products-list");
//!
const addForm = document.querySelector("#add-form");
const titleInp = document.querySelector("#title");
const priceInp = document.querySelector("#price");
const descriptionInp = document.querySelector("#description");
const imageInp = document.querySelector("#image");

//!вытаскиваем инпуты и кнопки из мадалки
const editTitleInp = document.querySelector("#edit-title");
const editPriceInp = document.querySelector("#edit-price");
const editDescriptionInp = document.querySelector("#edit-descr");
const editImageInp = document.querySelector("#edit-image");
const editSaveInp = document.querySelector("#btn-save-edit");

//!инпут для  поиска
const searchInput = document.querySelector("#search");
//!переменная по которой делаем запрос на поиск
let searchVal = "";

//!то где отображаем кнопки для пагинации
const paginationList = document.querySelector(".pagination-list");
const prev = document.querySelector(".prev");
const next = document.querySelector(".next");
//!максимальное количество продуктов на одной странице
const limit = 3;
//!текущая страница
let currentPage = 1;

let pageTotalCount = 1;
//!первоначальное отображение данных
getProducts();

//!title_like для поиска по ключу title
//! q для поиска по всем ключам
//!_limit для чтобы указать максимальное количество элементов на одной страницу
//!_page получить данные на определенной странице

//!стягиваем данные с сервера
async function getProducts() {
  const res = await fetch(
    `${API}?title_like=${searchVal}&_limit=${limit}&_page=${currentPage}`
  );

  //!x-total-count общее количество продуктов
  const count = res.headers.get("x-total-count");
  //!формула чтобы высчитать максимальное количество страниц
  pageTotalCount = Math.ceil(count / limit);
  const data = await res.json(); //! расшифровка данных
  //! отображаем актуальные данные
  render(data);
}

//!это функция дляобавление в db json
async function addProducts(product) {
  //!await для того чтобы getproducts() подождала пока данные добавятся потому что fetch ассинхронный
  await fetch(API, {
    method: "POST",
    body: JSON.stringify(product),
    headers: {
      "Content-Type": "application/json",
    },
  });
  getProducts(); //!стянуть и отобразить актуальные данные
}

//!функция для удаления из db.json
async function deleteProduct(id) {
  //!await для того чтобы getproducts подождал пока данные удалятся
  await fetch(`${API}/${id}`, {
    method: "DELETE",
  });
  //!стянуть и отобразить актуальные данные
  getProducts();
}

//!функция для получение одного продукта
async function getOneProduct(id) {
  const res = await fetch();
  const data = await res.json(); //!расшифровка данных
  return data; //! возвращаем продукт с db.json
}

//!функция чтобы изменить данные
async function editProduct(id, editedProduct) {
  await fetch(`${API}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(editedProduct),
    headers: {
      "Content-Type": "application/json",
    },
  });
  getProducts();
}

//!отображаем на странице
function render(arr) {
  //!очищаем чтобы карточки не дублировались перед ней строка
  list.innerHTML = "";
  arr.forEach((item) => {
    list.innerHTML += `<div class="card" style="width: 18rem;">
    <img src=${item.image} class="card-img-top" alt="...">
    <div class="card-body">
      <h5 class="card-title">${item.title}</h5>
      <p class="card-text">${item.description.slice(0, 70)}...</p>
      <p class="card-text">${item.price}...</p>

      <button id='${item.id}'  class="btn btn-danger btn-delete">DELETE</button>
      <button data-bs-toggle='modal' data-bs-target="#exampleModal" id='${
        item.id
      }'  class="btn btn-danger btn-edit">EDIT</button>

    </div>
  </div>`;
  });
  renderPagination();
}

//! обработщик события для добавление (CRAETE)
addForm.addEventListener("submit", (e) => {
  //!чтобы страница не перезагружалась
  e.preventDefault();

  //!проверка чтобы все поля были заполнены
  if (
    !titleInp.value.trim() ||
    !priceInp.value.trim() ||
    !descriptionInp.value.trim() ||
    !imageInp.value.trim()
  ) {
    alert("Заполните все поля");
    return;
  }
  //!создаем обьект для добавления db.json
  const product = {
    title: titleInp.value,
    price: priceInp.value,
    description: descriptionInp.value,
    image: imageInp.value,
  };

  //!отправлякм обьект в db.json
  addProducts(product);

  //!очищаем инпуты
  titleInp.value = "";
  priceInp.value = "";
  descriptionInp.value = "";
  imageInp.value = "";
});

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-delete")) {
    deleteProduct(e.target.id);
  }
});

//! переменная чтобы сохранить id продукта на который мы нажали
let id = null;

//!обработчик события  на открытие и заполнение модалки
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-edit")) {
    //!сохраняем id продукта
    id = e.target.id;
    //!получаем обьект продукта на который мы нажали
    //!await потому что  getOneProduct ассинхронная функция
    const product = await getOneProduct(e.target.id);
    //! заполняем инпуты данными  продукта
    editTitleInp.value = product.title;
    editPriceInp.value = product.price;
    editDescriptionInp.value = product.description;
    editImageInp.value = product.image;
  }
});

//!обработчик события на сохранение данных
editSaveInp.addEventListener("click", (e) => {
  //!проверка на пустоту инпутов
  if (
    !editTitleInp.value.trim() ||
    !editPriceInp.value.trim() ||
    !editDescriptionInp.value.trim() ||
    !editImageInp.value.trim()
  ) {
    alert("Заполните все поля");
    //! если хотя бы один инпут будет пустой выводим предупреждение и останавливаем поиск
    return;
  }

  //!собираем измененный обьект для изменение продукта
  const editedProduct = {
    title: editTitleInp.value,
    price: editPriceInp.value,
    description: editDescriptionInp.value,
    image: editImageInp.value,
  };
  //!вызываем функцию для изменения
  editProduct(id, editedProduct);
});

//!обработщик события для поиска
searchInput.addEventListener("input", () => {
  searchVal = searchInput.value;
  currentPage = 1;
  getProducts();
});

//!функция для отображения кнопок для пагинации
function renderPagination() {
  paginationList.innerHTML = "";
  for (let i = 1; i <= pageTotalCount; i++) {
    paginationList.innerHTML += `
    <li class="page-item ${currentPage == i ? "active" : ""}">
            <a class="page-link page_number" href="#">${i}</a>
          </li>
    `;
  }
}
//!чтобы кнопка prev была неактивна на первой страницу
if (currentPage == 1) {
  prev.classList.add("disabled");
} else {
  prev.classList.remove("disabled");
}

//!чтобы кнопка next была неактивна на последней странице
if (currentPage == pageTotalCount) {
  next.classList.add("disabled");
} else {
  next.classList.remove("disabled");
}

//!обработчик события чтобы перейти на определеннную страницу
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("page_number")) {
    currentPage = e.target.innerText;
    getProducts();
  }
});
//!обработчик события чтобы перейти на следующую страницу
next.addEventListener("click", () => {
  if (currentPage == pageTotalCount) {
    return;
  }
  currentPage++;
  getProducts();
});
//!обработчик события чтобы перейти на предыдущую  страницу
prev.addEventListener("click", () => {
  if (currentPage == 1) {
    return;
  }
  currentPage--;
  getProducts();
});
