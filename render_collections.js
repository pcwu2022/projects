/* render_collections.js
   Renders `window.PROJECTS` into #collections as elegant Tailwind cards.
*/
(function () {
    function createCard(p) {
        var link = document.createElement('a');
        link.href = p.href || '#';
        link.className = 'block p-0 rounded-lg bg-stone-800 hover:bg-stone-700 transition-shadow shadow-sm overflow-hidden';
        link.setAttribute('aria-label', p.title || 'Project');

        var imgWrap = document.createElement('div');
        imgWrap.className = 'h-40 bg-stone-900 overflow-hidden';
        var img = document.createElement('img');
        img.src = p.image || 'https://images.unsplash.com/photo-1607706189992-eae578626c86';
        img.alt = p.title || 'Project image';
        img.className = 'w-full h-full object-cover transition-transform duration-300 ease-out transform hover:scale-105';
        imgWrap.appendChild(img);

        var body = document.createElement('div');
        body.className = 'p-4';

        var title = document.createElement('h3');
        title.className = 'text-lg font-semibold mb-1';
        title.textContent = p.title || 'Untitled';

        var desc = document.createElement('p');
        desc.className = 'text-sm text-stone-300 mb-3';
        desc.textContent = p.description || 'No description available.';

        var meta = document.createElement('div');
        meta.className = 'flex items-center justify-between text-xs text-stone-400';
        var date = document.createElement('div');
        date.textContent = p.date || 'Unknown date';
        meta.appendChild(date);

        body.appendChild(title);
        body.appendChild(desc);
        body.appendChild(meta);

        link.appendChild(imgWrap);
        link.appendChild(body);
        return link;
    }

    document.addEventListener('DOMContentLoaded', function () {
        var container = document.getElementById('collections');
        if (!container) return;
        var projects = window.PROJECTS || [];
        projects.forEach(function (p) {
            container.appendChild(createCard(p));
        });
    });
})();
