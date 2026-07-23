(function () {
  'use strict';

  const lang = document.documentElement.lang || 'en';
  const isZh = lang.toLowerCase().startsWith('zh');
  const isSimplified = lang.toLowerCase() === 'zh-cn';
  const text = isZh ? {
    noticeTitle: '閱讀提醒',
    noticeBody: '本頁討論童年創傷、解離與心理健康。請按照自己的步調閱讀；感到不適時，可以暫停背景動態或離開頁面。',
    dismiss: '我知道了',
    pause: '暫停動態',
    resume: '恢復動態',
    exit: '快速離開',
    muted: '背景音效已靜音',
    unmuted: '背景音效已開啟',
    search: '搜尋作者、標題、年份或 DOI',
    results: '筆參考文獻',
    disclaimer: '本網站提供一般教育資訊，不能取代專業診斷、治療或緊急支援。若你或他人正面臨立即危險，請聯絡所在地的緊急服務或可信任的支援者。'
  } : {
    noticeTitle: 'A note before reading',
    noticeBody: 'This page discusses childhood trauma, dissociation, and mental health. Read at your own pace; you can pause the background motion or leave at any time.',
    dismiss: 'I understand',
    pause: 'Pause motion',
    resume: 'Resume motion',
    exit: 'Quick exit',
    muted: 'Background audio is muted',
    unmuted: 'Background audio is on',
    search: 'Search author, title, year, or DOI',
    results: 'references',
    disclaimer: 'This website provides general educational information and is not a substitute for professional diagnosis, treatment, or emergency support. If you or someone else is in immediate danger, contact local emergency services or a trusted support person.'
  };

  const video = document.querySelector('.bg-video');
  const muteButton = document.querySelector('.mute-btn');

  function renderMuteState() {
    if (!video || !muteButton) return;
    const muted = video.muted;
    muteButton.innerHTML = muted ? '&#x1F507;' : '&#x1F50A;';
    muteButton.setAttribute('aria-pressed', String(!muted));
    muteButton.setAttribute('aria-label', muted ? text.muted : text.unmuted);
    muteButton.title = muted ? text.muted : text.unmuted;
  }

  window.toggleMute = function () {
    if (!video) return;
    video.muted = !video.muted;
    localStorage.setItem('bgMuted', String(video.muted));
    renderMuteState();
    if (video.paused) video.play().catch(function () {});
  };

  if (video) {
    const saved = localStorage.getItem('bgMuted');
    video.muted = saved === null ? true : saved === 'true';
    video.defaultMuted = true;
    renderMuteState();
    video.play().catch(function () {
      video.muted = true;
      renderMuteState();
      video.play().catch(function () {});
    });
  }

  const main = document.querySelector('.main');
  if (main) {
    main.setAttribute('role', 'main');
    if (!main.id) main.id = 'main-content';
    main.setAttribute('tabindex', '-1');
  }

  if (!sessionStorage.getItem('careNoticeDismissed') && main) {
    const notice = document.createElement('aside');
    notice.className = 'content-notice';
    notice.setAttribute('aria-label', text.noticeTitle);
    notice.innerHTML = '<strong>' + text.noticeTitle + '</strong><p>' + text.noticeBody +
      '</p><button type="button">' + text.dismiss + '</button>';
    main.insertAdjacentElement('afterbegin', notice);
    notice.querySelector('button').addEventListener('click', function () {
      sessionStorage.setItem('careNoticeDismissed', 'true');
      notice.remove();
    });
  }

  const controls = document.createElement('div');
  controls.className = 'care-controls';
  controls.setAttribute('aria-label', isZh ? '閱讀安全控制' : 'Reading safety controls');
  controls.innerHTML =
    '<button type="button" class="care-control motion-toggle">' + text.pause + '</button>' +
    '<button type="button" class="care-control quick-exit">' + text.exit + '</button>';
  document.body.appendChild(controls);

  const motionButton = controls.querySelector('.motion-toggle');
  motionButton.addEventListener('click', function () {
    const paused = document.body.classList.toggle('motion-paused');
    if (video) paused ? video.pause() : video.play().catch(function () {});
    motionButton.textContent = paused ? text.resume : text.pause;
    motionButton.setAttribute('aria-pressed', String(paused));
  });

  controls.querySelector('.quick-exit').addEventListener('click', function () {
    if (video) video.pause();
    location.replace('https://www.google.com/');
  });

  const footer = document.querySelector('footer') || main;
  if (footer) {
    const note = document.createElement('aside');
    note.className = 'medical-note';
    note.innerHTML = '<strong>' + (isZh ? '重要說明：' : 'Important: ') + '</strong>' + text.disclaimer;
    footer.insertAdjacentElement('beforebegin', note);
  }

  const entries = Array.from(document.querySelectorAll('.ref-entry'));
  entries.forEach(function (entry, index) {
    entry.id = entry.id || 'reference-' + (index + 1);
    const walker = document.createTreeWalker(entry, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      const match = node.nodeValue.match(/https:\/\/doi\.org\/[^\s<]+/i);
      if (!match) return;
      const url = match[0].replace(/[.,;)]+$/, '');
      const before = node.nodeValue.slice(0, match.index);
      const after = node.nodeValue.slice(match.index + url.length);
      const fragment = document.createDocumentFragment();
      fragment.append(before);
      const link = document.createElement('a');
      link.href = url;
      link.textContent = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      fragment.append(link, after);
      node.replaceWith(fragment);
    });
  });

  if (entries.length) {
    const panel = entries[0].closest('section') || main;
    const tools = document.createElement('div');
    tools.className = 'reference-tools';
    tools.innerHTML = '<label><span class="skip-to-content">' + text.search +
      '</span><input class="reference-search" type="search" placeholder="' + text.search +
      '" autocomplete="off"></label><span class="reference-count" aria-live="polite"></span>';
    panel.insertBefore(tools, entries[0]);
    const input = tools.querySelector('input');
    const count = tools.querySelector('.reference-count');

    function filterReferences() {
      const query = input.value.trim().toLocaleLowerCase(lang);
      let visible = 0;
      entries.forEach(function (entry) {
        const show = !query || entry.textContent.toLocaleLowerCase(lang).includes(query);
        entry.hidden = !show;
        if (show) visible += 1;
      });
      count.textContent = visible + ' ' + text.results;
      document.querySelectorAll('#references h3, #references h4').forEach(function (heading) {
        let next = heading.nextElementSibling;
        let hasVisible = false;
        while (next && !/^H[34]$/.test(next.tagName)) {
          if (next.classList.contains('ref-entry') && !next.hidden) hasVisible = true;
          next = next.nextElementSibling;
        }
        heading.classList.toggle('reference-heading-hidden', !hasVisible && !!query);
      });
    }
    input.addEventListener('input', filterReferences);
    filterReferences();
  }

  const sectionLinks = Array.from(document.querySelectorAll('.floating-nav a[href^="#"]'));
  const floatingNavs = Array.from(document.querySelectorAll('.floating-nav'));

  function updateNavScrollState(nav) {
    const maxScroll = Math.max(0, nav.scrollWidth - nav.clientWidth);
    nav.classList.toggle('can-scroll-left', nav.scrollLeft > 4);
    nav.classList.toggle('can-scroll-right', nav.scrollLeft < maxScroll - 4);
  }

  floatingNavs.forEach(function (nav) {
    nav.setAttribute('tabindex', '0');
    nav.addEventListener('scroll', function () {
      updateNavScrollState(nav);
    }, { passive: true });
    updateNavScrollState(nav);
  });

  window.addEventListener('resize', function () {
    floatingNavs.forEach(updateNavScrollState);
  }, { passive: true });

  if ('IntersectionObserver' in window && sectionLinks.length) {
    const byId = new Map(sectionLinks.map(function (link) {
      return [link.getAttribute('href').slice(1), link];
    }));
    const observer = new IntersectionObserver(function (observations) {
      observations.forEach(function (observation) {
        if (!observation.isIntersecting) return;
        sectionLinks.forEach(function (link) { link.removeAttribute('aria-current'); });
        const active = byId.get(observation.target.id);
        if (active) {
          active.setAttribute('aria-current', 'location');
          if (matchMedia('(max-width: 768px)').matches) {
            active.scrollIntoView({
              behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
              block: 'nearest',
              inline: 'center'
            });
          }
        }
      });
    }, { rootMargin: '-25% 0px -65% 0px' });
    byId.forEach(function (_, id) {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  requestAnimationFrame(function () {
    floatingNavs.forEach(updateNavScrollState);
  });

  document.querySelectorAll('.back-to-top').forEach(function (button) {
    button.onclick = function () {
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    };
  });

  if (isSimplified) {
    document.querySelectorAll('.content-notice, .medical-note, .care-controls').forEach(function (element) {
      element.setAttribute('lang', 'zh-CN');
    });
  }
})();
