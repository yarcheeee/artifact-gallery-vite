/**
 * Практика 10. DOM, события и классы.
 * Проект: «Галерея артефактов».
 *
 * Что реализовано:
 * 1) Добавление карточек (артефактов) через форму.
 * 2) Автоматическое создание вкладок категорий.
 * 3) Фильтрация карточек по вкладке + по строке поиска.
 * 4) Режим «Избранное» для карточки (переключение класса favorite).
 * 5) Удаление карточки.
 * 6) Открытие карточки в модальном окне (детальный просмотр).
 * 7) Переключение темы (светлая/тёмная) через класс dark-theme на <body>.
 *
 * Примечание к заданию:
 * - Значок/счётчик с цифрой рядом с кнопкой «Тема» (в правом верхнем углу) УБРАН.
 *   Поэтому код счётчика здесь отсутствует.
 */

/* ----------------------------- DOM-ссылки (getElementById) ----------------------------- */

const titleInput = document.getElementById('artifact-title');
const categoryInput = document.getElementById('artifact-category');
const imageInput = document.getElementById('artifact-image');

const addBtn = document.getElementById('add-btn');
const gallery = document.getElementById('gallery');

const searchInput = document.getElementById('search-input');
const banner = document.getElementById('banner');

const themeToggle = document.getElementById('theme-toggle');
const tabsContainer = document.getElementById('category-tabs');

/* Модальное окно (детальный просмотр карточки) */
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modal-close');
const modalImage = document.getElementById('modal-image');
const modalTitle = document.getElementById('modal-title');
const modalCategory = document.getElementById('modal-category');

/* ----------------------------- Состояние приложения ----------------------------- */

/**
 * categories хранит список категорий, для которых уже есть вкладки.
 * '__all' — служебная категория «Все».
 */
let categories = ['__all'];

/**
 * activeCategory — текущая активная вкладка (категория).
 * По умолчанию показываем «Все».
 */
let activeCategory = '__all';

/* ----------------------------- Вспомогательные функции ----------------------------- */

/**
 * normalize — безопасно приводим ввод к строке и убираем пробелы по краям.
 * Это позволяет корректно проверять пустые поля и не создавать категории вида "   ".
 */
function normalize(str) {
  return String(str || '').trim();
}

/**
 * showBanner — показывает сообщение в блоке banner на короткое время.
 * Используется для уведомления об ошибке (например, если поля не заполнены).
 */
function showBanner(text) {
  banner.textContent = text || 'Заполните название, категорию и URL изображения.';
  banner.classList.remove('banner--hidden');

  // Сбрасываем предыдущий таймер, чтобы сообщения не накладывались друг на друга.
  clearTimeout(showBanner._t);
  showBanner._t = setTimeout(() => {
    banner.classList.add('banner--hidden');
  }, 1800);
}

/* ----------------------------- Категории (вкладки) ----------------------------- */

/**
 * addCategoryTab — добавляет вкладку для категории, если её ещё не было.
 * Вкладка — это <button class="tab">...</button> внутри контейнера #category-tabs.
 */
function addCategoryTab(category) {
  if (categories.includes(category)) return;

  categories.push(category);

  const tab = document.createElement('button');
  tab.type = 'button';
  tab.className = 'tab';
  tab.dataset.category = category;
  tab.textContent = category;

  tabsContainer.appendChild(tab);
}

/**
 * setActiveTab — делает вкладку активной и запускает фильтрацию карточек.
 * Визуально активная вкладка определяется CSS-классом tab--active.
 */
function setActiveTab(category) {
  activeCategory = category;

  const tabs = tabsContainer.querySelectorAll('.tab');
  tabs.forEach(t => {
    if (t.dataset.category === category) {
      t.classList.add('tab--active');
    } else {
      t.classList.remove('tab--active');
    }
  });

  applyFilters();
}


/**
 * cleanupCategoryIfEmpty — удаляет вкладку категории, если в галерее не осталось
 * ни одной карточки с этой категорией.
 *
 * Зачем нужно:
 * - Пользователь может удалить последний артефакт категории.
 * - Тогда вкладка категории должна исчезнуть, чтобы не было «пустых» вкладок.
 */
function cleanupCategoryIfEmpty(category) {
  if (!category || category === '__all') return;

  // Проверяем: остались ли карточки с этой категорией
  const hasCards = Array.from(gallery.querySelectorAll('.card'))
    .some(c => (c.dataset.category || '') === category);

  if (hasCards) return;

  // Удаляем категорию из списка (чтобы она не считалась существующей)
  categories = categories.filter(c => c !== category);

  // Удаляем вкладку из DOM
  const tabs = tabsContainer.querySelectorAll('.tab');
  tabs.forEach(t => {
    if (t.dataset.category === category) {
      t.remove();
    }
  });

  // Если пользователь сейчас стоит на удалённой категории — возвращаемся на «Все»
  if (activeCategory === category) {
    setActiveTab('__all');
  } else {
    applyFilters();
  }
}

/* ----------------------------- Фильтрация карточек ----------------------------- */

/**
 * applyFilters — фильтрует карточки по двум условиям:
 * 1) Активная вкладка категорий (если не '__all')
 * 2) Строка поиска (поиск выполняется по тексту категории)
 *
 * Реализация: перебираем все карточки в галерее и прячем/показываем через style.display.
 */
function applyFilters() {
  const searchValue = searchInput.value.toLowerCase().trim();

  const cards = gallery.querySelectorAll('.card');
  cards.forEach(card => {
    const cardCategory = (card.dataset.category || '').toLowerCase();

    // Фильтр по активной вкладке
    let okByTab = true;
    if (activeCategory !== '__all') {
      okByTab = cardCategory === activeCategory.toLowerCase();
    }

    // Фильтр по поиску (вводим часть категории — остаются совпадающие)
    let okBySearch = true;
    if (searchValue) {
      okBySearch = cardCategory.includes(searchValue);
    }

    card.style.display = (okByTab && okBySearch) ? '' : 'none';
  });
}

/* ----------------------------- Модальное окно ----------------------------- */

/**
 * openModal — заполняет модальное окно данными карточки и показывает его.
 */
function openModal(data) {
  modalImage.src = data.image;
  modalImage.alt = data.title;
  modalTitle.textContent = data.title;
  modalCategory.textContent = data.category;

  modal.classList.remove('modal--hidden');
}

/**
 * closeModal — закрывает модальное окно и очищает src картинки (чтобы не грузилась в фоне).
 */
function closeModal() {
  modal.classList.add('modal--hidden');
  modalImage.src = '';
}

/* ----------------------------- Карточка артефакта ----------------------------- */

/**
 * createCard — создаёт DOM-структуру карточки и навешивает события.
 *
 * Карточка содержит:
 * - изображение
 * - название
 * - категорию
 * - кнопки: «В избранное» и «Удалить»
 *
 * События:
 * - mouseover/mouseout: добавляем/убираем класс hovered (эффект наведения)
 * - click по «В избранное»: переключаем класс favorite
 * - click по «Удалить»: удаляем карточку из DOM
 * - click по карточке: открываем модальное окно (детальный просмотр)
 */
function createCard(title, category, image) {
  const card = document.createElement('div');
  card.classList.add('card');
  card.dataset.category = category;

  const img = document.createElement('img');
  img.className = 'card__image';
  img.src = image;
  img.alt = title;

  const body = document.createElement('div');
  body.className = 'card__body';

  const h3 = document.createElement('h3');
  h3.className = 'card__title';
  h3.textContent = title;

  const p = document.createElement('p');
  p.className = 'card__category';
  p.textContent = category;

  const actions = document.createElement('div');
  actions.className = 'card__actions';

  const favBtn = document.createElement('button');
  favBtn.type = 'button';
  favBtn.className = 'btn btn--ghost btn--small';
  favBtn.textContent = 'В избранное';

  const delBtn = document.createElement('button');
  delBtn.type = 'button';
  delBtn.className = 'btn btn--danger btn--small';
  delBtn.textContent = 'Удалить';

  actions.appendChild(favBtn);
  actions.appendChild(delBtn);

  body.appendChild(h3);
  body.appendChild(p);
  body.appendChild(actions);

  card.appendChild(img);
  card.appendChild(body);

  /* Эффект наведения (через класс hovered) */
  card.addEventListener('mouseover', () => {
    card.classList.add('hovered');
  });

  card.addEventListener('mouseout', () => {
    card.classList.remove('hovered');
  });

  /* Избранное: переключение класса favorite и текста кнопки */
  favBtn.addEventListener('click', (e) => {
    // stopPropagation нужен, чтобы клик по кнопке не открывал модальное окно карточки.
    e.stopPropagation();

    if (card.classList.contains('favorite')) {
      card.classList.remove('favorite');
      favBtn.textContent = 'В избранное';
    } else {
      card.classList.add('favorite');
      favBtn.textContent = 'Убрать';
    }
  });

  /* Удаление карточки из DOM */
  delBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    card.remove();

    // Если это была последняя карточка в категории — убираем вкладку категории.
    cleanupCategoryIfEmpty(category);
    // Счётчик карточек намеренно не используется (по требованию задания).
  });

  /* Открытие модального окна по клику на карточку */
  card.addEventListener('click', () => {
    openModal({ title, category, image });
  });

  return card;
}

/* ----------------------------- События интерфейса ----------------------------- */

/**
 * Добавление карточки по кнопке «Добавить артефакт».
 * Валидация: все поля должны быть заполнены.
 */
addBtn.addEventListener('click', () => {
  const title = normalize(titleInput.value);
  const category = normalize(categoryInput.value);
  const image = normalize(imageInput.value);

  if (!title || !category || !image) {
    showBanner();
    return;
  }

  const card = createCard(title, category, image);
  gallery.appendChild(card);

  addCategoryTab(category);

  // Очистка формы после добавления
  titleInput.value = '';
  categoryInput.value = '';
  imageInput.value = '';

  applyFilters();
});

/* Фильтрация при вводе текста в поиске */
searchInput.addEventListener('input', applyFilters);

/* Делегирование события клика по вкладкам (удобно, т.к. вкладки создаются динамически) */
tabsContainer.addEventListener('click', (e) => {
  const btn = e.target.closest('.tab');
  if (!btn) return;
  setActiveTab(btn.dataset.category);
});

/* Переключение темы — через класс dark-theme на body */
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-theme');
});

/* ----------------------------- События модального окна ----------------------------- */

/* Закрытие по клику на затемнённый фон */
modal.addEventListener('click', (e) => {
  const target = e.target;
  if (target && target.dataset && target.dataset.close === 'true') {
    closeModal();
  }
});

/* Закрытие по клику на крестик */
modalClose.addEventListener('click', closeModal);

/* Закрытие по клавише Escape */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modal.classList.contains('modal--hidden')) {
    closeModal();
  }
});

/* ----------------------------- Стартовые карточки по теме ----------------------------- */
/**
 * По условию задания добавлены изображения по теме:
 * - карта
 * - космический модуль
 * - архитектурный макет
 *
 * Эти карточки создаются при загрузке страницы как демонстрационный контент.
 */
const demo = [
  {
    title: 'Карта',
    category: 'История',
    // Не используем "//images/...": это превращается в "http(s)://images/...".
    image: 'images/map.webp'
  },
  {
    title: 'Космический модуль',
    category: 'Космос',
    image: 'images/space.webp'
  },
  {
    title: 'Архитектурный макет',
    category: 'Архитектура',
    image: 'images/arch.webp'
  }
];

demo.forEach(item => {
  const card = createCard(item.title, item.category, item.image);
  gallery.appendChild(card);
  addCategoryTab(item.category);
});

applyFilters();
