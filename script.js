const verses = [
  { book: 'Psalms', ref: 'Psalm 46:10', text: 'Be still, and know that I am God.' },
  { book: 'John', ref: 'John 3:16', text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.' },
  { book: 'Proverbs', ref: 'Proverbs 3:5–6', text: 'Trust in the Lord with all your heart and lean not on your own understanding.' },
  { book: 'Isaiah', ref: 'Isaiah 41:10', text: 'So do not fear, for I am with you; do not be dismayed, for I am your God.' },
  { book: 'Romans', ref: 'Romans 8:28', text: 'And we know that in all things God works for the good of those who love him.' },
  { book: 'Psalms', ref: 'Psalm 23:1', text: 'The Lord is my shepherd, I lack nothing.' },
];
const songs = [
  ['Goodness of God', 'CeCe Winans', 'goodness of god cece winans lyrics', '9sE5kEnitqE'],
  ['Gratitude', 'Brandon Lake', 'gratitude brandon lake lyrics', 'dQdfs5S6jyA'],
  ['Way Maker', 'Sinach', 'way maker sinach lyrics', 'QM8jQHE5AAk'],
  ['10,000 Reasons', 'Matt Redman', '10000 reasons matt redman lyrics', 'XtwIT8JjddM'],
  ['Firm Foundation', 'Cody Carnes', 'firm foundation cody carnes lyrics', '1sB4AWYSsKo'],
  ['Jireh', 'Maverick City Music', 'jireh maverick city music lyrics', 'mC-zw0zCCtg'],
];
const verseList = document.querySelector('#verse-list');
const songList = document.querySelector('#song-list');
const bookList = document.querySelector('#book-list');
const bibleStatus = document.querySelector('#bible-status');
let selectedBook = 'All books';
let bibleVerses = verses.map((verse) => ({ ...verse, translation: 'KJV' }));
const dailyVerse = verses[new Date().getDate() % verses.length];
const todayLabel = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date());
document.querySelector('#today').textContent = `Daily bread · ${todayLabel}`;
document.querySelector('.verse-card blockquote').textContent = dailyVerse.text;
document.querySelector('.verse-card cite').innerHTML = `${dailyVerse.ref} <span>— KJV</span>`;

function renderVerses() {
  const query = document.querySelector('#bible-search').value.toLowerCase();
  const matching = bibleVerses.filter((verse) => (selectedBook === 'All books' || verse.book === selectedBook) && `${verse.book} ${verse.ref} ${verse.text}`.toLowerCase().includes(query));
  const filtered = !query && selectedBook === 'All books' ? matching.slice(0, 12) : matching.slice(0, 120);
  verseList.innerHTML = filtered.length ? filtered.map((verse, index) => `<article class="verse-item"><span class="ref">${verse.ref} · KJV</span><p>${verse.text}</p><span class="vnum">${String(index + 1).padStart(2, '0')} / ${verse.book}</span></article>`).join('') : '<p class="content-footnote">No verses found. Try another word or book.</p>';
  bibleStatus.textContent = query || selectedBook !== 'All books' ? `${matching.length.toLocaleString()} matching verses · KJV` : `Showing 12 of ${bibleVerses.length.toLocaleString()} verses · search to explore all 66 books`;
}
function renderBooks(books) {
  bookList.innerHTML = `<p class="list-label">BOOKS <span>${books.length}</span></p>${['All books', ...books].map((book) => `<button class="book${book === selectedBook ? ' active' : ''}" data-book="${book}">${book} <span>${book === 'All books' ? '→' : ''}</span></button>`).join('')}`;
  bookList.querySelectorAll('.book').forEach((button) => button.addEventListener('click', () => { selectedBook = button.dataset.book; renderBooks(books); renderVerses(); }));
}
async function loadFullBible() {
  try {
    const response = await fetch('https://raw.githubusercontent.com/thiagobodruk/bible/master/json/en_kjv.json');
    const data = await response.json();
    const books = Array.isArray(data) ? data : data.books;
    bibleVerses = books.flatMap((book) => (book.chapters || []).flatMap((chapter, chapterIndex) => (chapter.verses || chapter).map((verse, verseIndex) => ({ book: book.name || book.book, ref: `${book.name || book.book} ${chapter.chapter || chapterIndex + 1}:${verse.verse || verseIndex + 1}`, text: verse.text || verse, translation: 'KJV' }))));
    renderBooks([...new Set(bibleVerses.map((verse) => verse.book))]);
    renderVerses();
  } catch (error) {
    bibleStatus.textContent = 'Full KJV text could not load offline. The starter verses are still available.';
  }
}
function renderSongs() {
  const query = document.querySelector('#song-search').value.toLowerCase();
  const filtered = songs.filter(([title, artist]) => `${title} ${artist}`.toLowerCase().includes(query));
  songList.innerHTML = filtered.map(([title, artist, search, videoId], index) => `<article class="song"><div class="song-player"><iframe src="https://www.youtube.com/embed/${videoId}" title="${title} by ${artist}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div><div class="song-info"><div class="song-art">${['♫', '✦', '♡'][index % 3]}</div><div><h3>${title}</h3><p>${artist}</p></div></div><a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" rel="noreferrer">Open on YouTube ↗</a></article>`).join('') || '<p class="content-footnote">No songs found. Try an artist or title.</p>';
}
renderBooks([...new Set(bibleVerses.map((verse) => verse.book))]); renderVerses(); renderSongs(); loadFullBible();
document.querySelectorAll('.nav-button').forEach((button) => button.addEventListener('click', () => {
  document.querySelectorAll('.nav-button').forEach((item) => item.classList.remove('active'));
  document.querySelectorAll('.content-section').forEach((panel) => panel.classList.remove('active-view'));
  button.classList.add('active'); document.querySelector(`[data-panel="${button.dataset.view}"]`).classList.add('active-view');
}));
function openPanel(panelId) {
  const button = document.querySelector(`[data-view="${panelId.replace('-content', '')}"]`);
  button.click();
  document.querySelector(`#${panelId}`).scrollIntoView({ behavior: 'smooth', block: 'start' });
}
document.querySelectorAll('.daily-step').forEach((step) => step.addEventListener('click', () => openPanel(step.dataset.target)));
document.querySelector('#bible-search').addEventListener('input', renderVerses);
document.querySelector('#song-search').addEventListener('input', renderSongs);
document.querySelector('.jump-button').addEventListener('click', () => document.querySelector('#bible-content').scrollIntoView({ behavior: 'smooth' }));
document.querySelectorAll('.mood').forEach((button) => button.addEventListener('click', () => { document.querySelectorAll('.mood').forEach((item) => item.classList.remove('active')); button.classList.add('active'); }));
document.querySelector('#pray-button').addEventListener('click', () => { const topic = document.querySelector('#prayer-topic').value.trim() || 'the things I cannot yet name'; const mood = document.querySelector('.mood.active').dataset.mood; const lead = { peace: 'Be near to me in the quiet,', gratitude: 'Thank you for the gifts I can see,', courage: 'Give me courage for the next faithful step,', healing: 'Bring your gentle healing to what is hurting,' }[mood]; const prayer = `God, you already know ${topic}. ${lead} help me to release what I cannot control and receive your presence in this moment. Amen.`; document.querySelector('#prayer-output').innerHTML = `<span class="output-kicker">A PRAYER FOR ${mood.toUpperCase()}</span><p class="prayer-text">God, you already know <strong>${topic}</strong>. ${lead} help me to release what I cannot control and receive your presence in this moment. Amen.</p><button class="copy-prayer" type="button">Copy prayer</button>`; document.querySelector('.copy-prayer').addEventListener('click', async (event) => { const copyButton = event.currentTarget; await navigator.clipboard.writeText(prayer); copyButton.textContent = 'Copied to clipboard'; }); });