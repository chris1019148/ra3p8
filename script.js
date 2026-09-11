const verses = [
  { book: 'Psalms', ref: 'Psalm 46:10', text: 'Be still, and know that I am God.' },
  { book: 'John', ref: 'John 3:16', text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.' },
  { book: 'Proverbs', ref: 'Proverbs 3:5–6', text: 'Trust in the Lord with all your heart and lean not on your own understanding.' },
  { book: 'Isaiah', ref: 'Isaiah 41:10', text: 'So do not fear, for I am with you; do not be dismayed, for I am your God.' },
  { book: 'Romans', ref: 'Romans 8:28', text: 'And we know that in all things God works for the good of those who love him.' },
  { book: 'Psalms', ref: 'Psalm 23:1', text: 'The Lord is my shepherd, I lack nothing.' },
];
const songs = [
  ['Goodness of God', 'CeCe Winans', 'comfort', '9sE5kEnitqE'],
  ['Gratitude', 'Brandon Lake', 'gratitude', 'dQdfs5S6jyA'],
  ['Way Maker', 'Sinach', 'courage', 'QM8jQHE5AAk'],
  ['10,000 Reasons', 'Matt Redman', 'gratitude', 'XtwIT8JjddM'],
  ['Firm Foundation', 'Cody Carnes', 'courage', '1sB4AWYSsKo'],
  ['Jireh', 'Maverick City Music', 'surrender', 'mC-zw0zCCtg'],
];
const verseList = document.querySelector('#verse-list');
const songList = document.querySelector('#song-list');
const bookList = document.querySelector('#book-list');
const bibleStatus = document.querySelector('#bible-status');
const bibleSearch = document.querySelector('#bible-search');
const songSearch = document.querySelector('#song-search');
let selectedBook = 'All books';
let bibleScope = 'all';
let bibleVerses = verses.map((verse) => ({ ...verse, translation: 'KJV' }));
const testamentBoundary = 39;
const dailyVerse = verses[new Date().getDate() % verses.length];
const todayLabel = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date());

document.querySelector('#today').textContent = `Daily bread · ${todayLabel}`;
document.querySelector('.verse-card blockquote').textContent = dailyVerse.text;
const dailyCitation = document.querySelector('.verse-card cite');
dailyCitation.replaceChildren(document.createTextNode(`${dailyVerse.ref} `), Object.assign(document.createElement('span'), { textContent: '— KJV' }));

function isInScope(book) {
  if (bibleScope === 'all') return true;
  const bookIndex = [...new Set(bibleVerses.map((verse) => verse.book))].indexOf(book);
  return bibleScope === 'old' ? bookIndex < testamentBoundary : bookIndex >= testamentBoundary;
}

function renderVerses() {
  const query = bibleSearch.value.trim().toLowerCase();
  const matching = bibleVerses.filter((verse) => (selectedBook === 'All books' || verse.book === selectedBook) && isInScope(verse.book) && `${verse.book} ${verse.ref} ${verse.text}`.toLowerCase().includes(query));
  const filtered = !query && selectedBook === 'All books' && bibleScope === 'all' ? matching.slice(0, 12) : matching.slice(0, 120);
  verseList.replaceChildren();
  filtered.forEach((verse, index) => {
    const article = document.createElement('article');
    article.className = 'verse-item';
    const ref = document.createElement('span');
    ref.className = 'ref';
    ref.textContent = `${verse.ref} · KJV`;
    const text = document.createElement('p');
    text.textContent = verse.text;
    const number = document.createElement('span');
    number.className = 'vnum';
    number.textContent = `${String(index + 1).padStart(2, '0')} / ${verse.book}`;
    article.append(ref, text, number);
    verseList.append(article);
  });
  if (!filtered.length) {
    const empty = document.createElement('p');
    empty.className = 'content-footnote';
    empty.textContent = 'No verses found. Try another word or book.';
    verseList.append(empty);
  }
  bibleStatus.textContent = query || selectedBook !== 'All books' || bibleScope !== 'all'
    ? `${matching.length.toLocaleString()} matching verses · KJV`
    : `Showing 12 of ${bibleVerses.length.toLocaleString()} verses · search to explore all 66 books`;
}

function renderBooks(books) {
  bookList.replaceChildren();
  const label = document.createElement('p');
  label.className = 'list-label';
  label.append(document.createTextNode('BOOKS '), Object.assign(document.createElement('span'), { textContent: books.length }));
  bookList.append(label);
  ['All books', ...books].forEach((book) => {
    const button = document.createElement('button');
    button.className = `book${book === selectedBook ? ' active' : ''}`;
    button.type = 'button';
    button.dataset.book = book;
    button.textContent = book;
    if (book === 'All books') button.append(Object.assign(document.createElement('span'), { textContent: '→' }));
    button.addEventListener('click', () => {
      selectedBook = book;
      renderBooks(books);
      renderVerses();
    });
    bookList.append(button);
  });
}

async function loadFullBible() {
  try {
    const response = await fetch('https://raw.githubusercontent.com/thiagobodruk/bible/master/json/en_kjv.json');
    if (!response.ok) throw new Error(`Bible request failed: ${response.status}`);
    const data = await response.json();
    const books = Array.isArray(data) ? data : data.books;
    bibleVerses = books.flatMap((book) => (book.chapters || []).flatMap((chapter, chapterIndex) => (chapter.verses || chapter).map((verse, verseIndex) => ({ book: book.name || book.book, ref: `${book.name || book.book} ${chapter.chapter || chapterIndex + 1}:${verse.verse || verseIndex + 1}`, text: verse.text || verse, translation: 'KJV' }))));
    renderBooks([...new Set(bibleVerses.map((verse) => verse.book))]);
    renderVerses();
  } catch (error) {
    bibleStatus.textContent = 'Full KJV text could not load. Starter verses are still available.';
    console.warn('Unable to load the full Bible text.', error);
  }
}

function renderSongs() {
  const query = songSearch.value.trim().toLowerCase();
  const mood = document.querySelector('#song-mood').value;
  const filtered = songs.filter(([title, artist, songMood]) => `${title} ${artist} ${songMood}`.toLowerCase().includes(query) && (mood === 'all' || songMood === mood));
  songList.replaceChildren();
  filtered.forEach(([title, artist, songMood, videoId], index) => {
    const article = document.createElement('article');
    article.className = 'song';
    article.innerHTML = `<div class="song-player"><iframe src="https://www.youtube.com/embed/${videoId}" title="${title} by ${artist}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div><div class="song-info"><div class="song-art">${['♫', '✦', '♡'][index % 3]}</div><div><h3>${title}</h3><p>${artist} · ${songMood}</p></div></div><a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" rel="noreferrer">Open on YouTube ↗</a>`;
    songList.append(article);
  });
  if (!filtered.length) {
    const empty = document.createElement('p');
    empty.className = 'content-footnote';
    empty.textContent = 'No songs found. Try another mood, artist, or title.';
    songList.append(empty);
  }
}

function selectPanel(panelId) {
  document.querySelectorAll('.nav-button').forEach((button) => {
    const active = button.dataset.view === panelId;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
  });
  document.querySelectorAll('.content-section').forEach((panel) => {
    const active = panel.dataset.panel === panelId;
    panel.classList.toggle('active-view', active);
    panel.hidden = !active;
  });
}

function openPanel(panelId) {
  selectPanel(panelId.replace('-content', ''));
  document.querySelector(`#${panelId}`).scrollIntoView({ behavior: 'smooth', block: 'start' });
}

renderBooks([...new Set(bibleVerses.map((verse) => verse.book))]);
renderVerses();
renderSongs();
loadFullBible();
document.querySelectorAll('.nav-button').forEach((button) => button.addEventListener('click', () => selectPanel(button.dataset.view)));
document.querySelectorAll('.daily-step').forEach((step) => step.addEventListener('click', () => openPanel(step.dataset.target)));
bibleSearch.addEventListener('input', renderVerses);
document.querySelector('#bible-scope').addEventListener('change', (event) => {
  bibleScope = event.target.value;
  if (selectedBook !== 'All books' && !isInScope(selectedBook)) selectedBook = 'All books';
  renderBooks([...new Set(bibleVerses.map((verse) => verse.book))]);
  renderVerses();
});
songSearch.addEventListener('input', renderSongs);
document.querySelector('#song-mood').addEventListener('change', renderSongs);
document.querySelector('.jump-button').addEventListener('click', () => openPanel('bible-content'));
document.querySelectorAll('.mood').forEach((button) => button.addEventListener('click', () => {
  document.querySelectorAll('.mood').forEach((item) => item.classList.remove('active'));
  button.classList.add('active');
}));
document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    selectPanel('bible');
    bibleSearch.focus();
  }
});
document.querySelector('#pray-button').addEventListener('click', () => {
  const topic = document.querySelector('#prayer-topic').value.trim() || 'the things I cannot yet name';
  const mood = document.querySelector('.mood.active').dataset.mood;
  const lead = { peace: 'Be near to me in the quiet,', gratitude: 'Thank you for the gifts I can see,', courage: 'Give me courage for the next faithful step,', healing: 'Bring your gentle healing to what is hurting,' }[mood];
  const output = document.querySelector('#prayer-output');
  output.replaceChildren();
  const kicker = document.createElement('span');
  kicker.className = 'output-kicker';
  kicker.textContent = `A PRAYER FOR ${mood.toUpperCase()}`;
  const prayerText = document.createElement('p');
  prayerText.className = 'prayer-text';
  prayerText.append(document.createTextNode('God, you already know '), Object.assign(document.createElement('strong'), { textContent: topic }), document.createTextNode(`. ${lead} help me to release what I cannot control and receive your presence in this moment. Amen.`));
  const copyButton = document.createElement('button');
  copyButton.className = 'copy-prayer';
  copyButton.type = 'button';
  copyButton.textContent = 'Copy prayer';
  const prayer = `God, you already know ${topic}. ${lead} help me to release what I cannot control and receive your presence in this moment. Amen.`;
  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(prayer);
      copyButton.textContent = 'Copied to clipboard';
    } catch (error) {
      copyButton.textContent = 'Copy unavailable';
      console.warn('Unable to copy prayer.', error);
    }
  });
  output.append(kicker, prayerText, copyButton);
});
