const ADMIN_STORAGE_KEY = 'revanth-blog-admin';
const POSTS_STORAGE_KEY = 'revanth-blog-posts';
const ADMIN_SECRET = 'revanth-2026';

const staticPosts = [
  {
    id: 'dummy-blog',
    title: 'How to Start a Coding Journal',
    date: 'May 15, 2026',
    tags: 'Beginner · Growth',
    summary: 'Start tracking your learning progress, stay motivated, and build a stronger developer habit with a simple coding journal.',
    path: 'blog/dummy-blog.html',
    isStatic: true,
  },
];

const adminToggle = document.getElementById('admin-toggle');
const createPostPanel = document.getElementById('create-post-panel');
const createPostForm = document.getElementById('create-post-form');
const createPostMessage = document.getElementById('create-post-message');
const postList = document.getElementById('post-list');
const articleView = document.getElementById('article-view');
const articleContent = document.getElementById('article-content');
const closeArticleButton = document.getElementById('close-article');

let posts = loadPosts();
let isAdmin = checkAdmin();

function loadPosts() {
  try {
    const value = window.localStorage.getItem(POSTS_STORAGE_KEY);
    return value ? JSON.parse(value) : [];
  } catch (error) {
    console.warn('Unable to load saved posts', error);
    return [];
  }
}

function savePosts(postsToSave) {
  window.localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(postsToSave));
}

function checkAdmin() {
  return window.localStorage.getItem(ADMIN_STORAGE_KEY) === 'true';
}

function setAdmin(value) {
  isAdmin = value;
  window.localStorage.setItem(ADMIN_STORAGE_KEY, value ? 'true' : 'false');
  renderAdminPanel();
}

function renderAdminPanel() {
  if (isAdmin) {
    createPostPanel.classList.remove('hidden');
    adminToggle.textContent = 'Owner editor active';
    adminToggle.classList.remove('secondary');
  } else {
    createPostPanel.classList.add('hidden');
    adminToggle.textContent = 'Owner access';
    adminToggle.classList.add('secondary');
  }
}

function renderPosts() {
  const dynamicPosts = posts.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
  postList.innerHTML = '';

  [...dynamicPosts, ...staticPosts].forEach((post) => {
    const article = document.createElement('article');
    article.className = 'blog-card';

    article.innerHTML = `
      <h2>${post.title}</h2>
      <div class="blog-meta">
        <span>${post.date}</span>
        <span>${post.tags || 'Uncategorized'}</span>
      </div>
      <p>${post.summary}</p>
    `;

    if (post.isStatic) {
      const link = document.createElement('a');
      link.className = 'button';
      link.href = post.path;
      link.textContent = 'Read full post';
      article.appendChild(link);
    } else {
      const openButton = document.createElement('button');
      openButton.className = 'button';
      openButton.type = 'button';
      openButton.textContent = 'Read full post';
      openButton.addEventListener('click', () => showArticle(post.id));
      article.appendChild(openButton);
    }

    postList.appendChild(article);
  });
}

function showArticle(postId) {
  const post = posts.find((item) => item.id === postId);
  if (!post) {
    return;
  }

  articleContent.innerHTML = `
    <h1>${post.title}</h1>
    <div class="blog-meta">
      <span>${post.date}</span>
      <span>${post.tags || 'Uncategorized'}</span>
    </div>
    <div>${formatContent(post.content)}</div>
  `;

  articleView.classList.remove('hidden');
  window.scrollTo({ top: articleView.offsetTop - 20, behavior: 'smooth' });
}

function formatContent(text) {
  return text
    .split('\n\n')
    .map((block) => `<p>${escapeHtml(block.trim())}</p>`)
    .join('');
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

adminToggle.addEventListener('click', () => {
  if (isAdmin) {
    setAdmin(false);
    return;
  }

  const passcode = window.prompt('Enter owner passcode to unlock the blog editor:');
  if (passcode === ADMIN_SECRET) {
    setAdmin(true);
  } else {
    alert('Incorrect passcode.');
  }
});

createPostForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const title = document.getElementById('post-title').value.trim();
  const date = document.getElementById('post-date').value;
  const tags = document.getElementById('post-tags').value.trim();
  const summary = document.getElementById('post-summary').value.trim();
  const content = document.getElementById('post-content').value.trim();

  if (!title || !date || !summary || !content) {
    createPostMessage.textContent = 'Please fill in every field.';
    return;
  }

  const newPost = {
    id: `post-${Date.now()}`,
    title,
    date: new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    tags: tags || 'Personal',
    summary,
    content,
  };

  posts.unshift(newPost);
  savePosts(posts);
  renderPosts();
  showArticle(newPost.id);

  createPostForm.reset();
  createPostMessage.textContent = 'Post created locally in your browser.';
  setTimeout(() => {
    createPostMessage.textContent = '';
  }, 3000);
});

closeArticleButton.addEventListener('click', () => {
  articleView.classList.add('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

renderAdminPanel();
renderPosts();

const urlSearch = new URLSearchParams(window.location.search);
const requestedPost = urlSearch.get('post');
if (requestedPost && posts.some((item) => item.id === requestedPost)) {
  showArticle(requestedPost);
}
