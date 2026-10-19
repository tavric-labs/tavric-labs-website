const filters = document.querySelector('.filters');
const buttons = [...document.querySelectorAll('[data-filter]')];
const projects = [...document.querySelectorAll('[data-category]')];
const status = document.querySelector('#filter-status');

filters.hidden = false;
for (const button of buttons) {
  button.addEventListener('click', () => {
    const category = button.dataset.filter;
    for (const item of buttons) {
      const selected = item === button;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-pressed', String(selected));
    }
    let count = 0;
    for (const project of projects) {
      project.hidden = category !== 'all' && project.dataset.category !== category;
      if (!project.hidden) count++;
    }
    status.textContent = `${count} ${count === 1 ? 'project' : 'projects'} shown.`;
  });
}
document.querySelector('#year').textContent = new Date().getFullYear();
