(function () {
  'use strict';

  const lang = document.documentElement.lang || 'en';
  const isZh = lang.toLowerCase().startsWith('zh');
  const isSimplified = lang.toLowerCase() === 'zh-cn';
  const text = isZh ? (isSimplified ? {
    noticeTitle: '阅读提醒',
    noticeBody: '本页讨论童年创伤、解离与心理健康。请按照自己的步调阅读；感到不适时，可以暂停背景动态或离开页面。',
    dismiss: '我知道了',
    pause: '暂停动态',
    resume: '恢复动态',
    exit: '快速离开',
    backToTop: '返回顶部',
    muted: '背景音效已静音',
    unmuted: '背景音效已开启',
    search: '搜索作者、标题、年份或 DOI',
    results: '条参考文献',
    disclaimer: '本网站提供一般教育信息，不能取代专业诊断、治疗或紧急支持。若你或他人正面临立即危险，请联系所在地的紧急服务或可信任的支持者。'
  } : {
    noticeTitle: '閱讀提醒',
    noticeBody: '本頁討論童年創傷、解離與心理健康。請按照自己的步調閱讀；感到不適時，可以暫停背景動態或離開頁面。',
    dismiss: '我知道了',
    pause: '暫停動態',
    resume: '恢復動態',
    exit: '快速離開',
    backToTop: '返回頂部',
    muted: '背景音效已靜音',
    unmuted: '背景音效已開啟',
    search: '搜尋作者、標題、年份或 DOI',
    results: '筆參考文獻',
    disclaimer: '本網站提供一般教育資訊，不能取代專業診斷、治療或緊急支援。若你或他人正面臨立即危險，請聯絡所在地的緊急服務或可信任的支援者。'
  }) : {
    noticeTitle: 'A note before reading',
    noticeBody: 'This page discusses childhood trauma, dissociation, and mental health. Read at your own pace; you can pause the background motion or leave at any time.',
    dismiss: 'I understand',
    pause: 'Pause motion',
    resume: 'Resume motion',
    exit: 'Quick exit',
    backToTop: 'Back to top',
    muted: 'Background audio is muted',
    unmuted: 'Background audio is on',
    search: 'Search author, title, year, or DOI',
    results: 'references',
    disclaimer: 'This website provides general educational information and is not a substitute for professional diagnosis, treatment, or emergency support. If you or someone else is in immediate danger, contact local emergency services or a trusted support person.'
  };

  const video = document.querySelector('.bg-video');
  const audio = document.querySelector('.bg-audio');
  const muteButton = document.querySelector('.mute-btn');
  let videoPlaybackPromise = null;
  let userSelectedAudio = false;
  let audioUnlockBound = false;

  /* The ambience plays by default, exactly like the site's original
     background sound did. It stays silent only after the visitor has
     explicitly muted it - that choice is remembered across pages in
     localStorage under the same 'bgMuted' key as before. */
  function wantsSound() {
    return userSelectedAudio || localStorage.getItem('bgMuted') !== 'true';
  }

  /* The video is a purely visual layer: permanently muted, never able to
     make noise. Muted autoplay is permitted everywhere, so the motion can
     start without a gesture. */
  function startBackgroundVideo() {
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    if (document.body.classList.contains('motion-paused')) return;

    videoPlaybackPromise = video.play();
    if (videoPlaybackPromise && typeof videoPlaybackPromise.catch === 'function') {
      videoPlaybackPromise.catch(function () {
        document.body.classList.add('video-fallback-active');
      });
    }
  }

  /* Seamless forest ambience (wind, leaves, brook, birdsong). The muted
     autoplay starts the loop on every browser; audible playback needs a
     user gesture, so the first interaction restores the stored choice. */
  function startBackgroundAudio() {
    if (!audio) return;
    audio.loop = true;
    audio.muted = true;
    const playAttempt = audio.play();
    if (playAttempt && typeof playAttempt.catch === 'function') {
      playAttempt.catch(function () {
        bindAudioUnlock();
      });
    }
    if (wantsSound()) {
      audio.muted = false;
      bindAudioUnlock();
    }
    renderMuteState();
  }

  /* One-shot listeners: browsers only allow audible playback after a real
     user gesture, so the remembered "sound on" choice is applied to the
     first tap, key press or click on the page. */
  function bindAudioUnlock() {
    if (audioUnlockBound || !audio) return;
    audioUnlockBound = true;
    const events = ['pointerdown', 'touchstart', 'touchend', 'keydown', 'click'];
    const unlock = function () {
      audioUnlockBound = false;
      events.forEach(function (type) {
        window.removeEventListener(type, unlock);
      });
      audio.muted = !wantsSound();
      const retry = audio.play();
      if (retry && typeof retry.catch === 'function') retry.catch(function () {});
      renderMuteState();
    };
    events.forEach(function (type) {
      window.addEventListener(type, unlock, { passive: true, once: true });
    });
  }

  /* The mute button reflects the ambience track, not the silent video. */
  function renderMuteState() {
    if (!muteButton) return;
    const source = audio || video;
    if (!source) return;
    const muted = source.muted;
    muteButton.innerHTML = muted ? '&#x1F507;' : '&#x1F50A;';
    muteButton.setAttribute('aria-pressed', String(!muted));
    muteButton.setAttribute('aria-label', muted ? text.muted : text.unmuted);
    muteButton.title = muted ? text.muted : text.unmuted;
  }

  window.toggleMute = function () {
    if (!audio) return;
    audio.muted = !audio.muted;
    userSelectedAudio = !audio.muted;
    localStorage.setItem('bgMuted', String(audio.muted));
    if (audio.paused) {
      const playAttempt = audio.play();
      if (playAttempt && typeof playAttempt.catch === 'function') {
        playAttempt.catch(function () {
          audio.muted = true;
          renderMuteState();
          bindAudioUnlock();
        });
      }
    }
    renderMuteState();
  };

  /* Only an explicit "muted" choice is carried over between pages. */
  const storedPreference = localStorage.getItem('bgMuted');
  userSelectedAudio = storedPreference === 'false';

  if (audio) {
    audio.loop = true;
    audio.muted = !wantsSound();
    audio.addEventListener('playing', function () {
      renderMuteState();
    });
    window.addEventListener('pageshow', startBackgroundAudio);
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && audio.paused) startBackgroundAudio();
    });
    startBackgroundAudio();
  }

  if (video) {
    renderMuteState();
    video.addEventListener('playing', function () {
      document.body.classList.remove('video-fallback-active');
    });
    video.addEventListener('canplay', startBackgroundVideo, { once: true });
    window.addEventListener('pageshow', startBackgroundVideo);
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && video.paused &&
          !document.body.classList.contains('motion-paused')) startBackgroundVideo();
    });
    startBackgroundVideo();
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
  controls.setAttribute('aria-label', isZh ? '媒體與閱讀安全控制' : 'Media and reading safety controls');
  controls.innerHTML =
    '<button type="button" class="care-control motion-toggle">' + text.pause + '</button>' +
    '<button type="button" class="care-control quick-exit">' + text.exit + '</button>' +
    '<button type="button" class="care-control bottom-back-to-top" aria-label="' +
      text.backToTop + '" title="' + text.backToTop + '">&uarr;</button>';
  if (muteButton) {
    muteButton.classList.remove('nav-pill');
    muteButton.classList.add('care-control', 'bottom-audio-control');
    controls.insertBefore(muteButton, controls.firstChild);
  }
  document.body.appendChild(controls);

  controls.addEventListener('animationend', function () {
    controls.style.animation = 'none';
  });

  const motionButton = controls.querySelector('.motion-toggle');
  motionButton.addEventListener('click', function () {
    const paused = document.body.classList.toggle('motion-paused');
    if (video) paused ? video.pause() : video.play().catch(function () {});
    if (audio) {
      if (paused) {
        audio.pause();
      } else {
        audio.muted = !wantsSound();
        const audioRetry = audio.play();
        if (audioRetry && typeof audioRetry.catch === 'function') audioRetry.catch(function () {});
      }
    }
    motionButton.textContent = paused ? text.resume : text.pause;
    motionButton.setAttribute('aria-pressed', String(paused));
  });

  controls.querySelector('.quick-exit').addEventListener('click', function () {
    if (video) video.pause();
    if (audio) audio.pause();
    location.replace('https://www.google.com/');
  });

  const footer = document.querySelector('footer') || main;
  if (footer) {
    const note = document.createElement('aside');
    note.className = 'medical-note';
    note.innerHTML = '<strong>' + (isSimplified ? '重要说明：' : (isZh ? '重要說明：' : 'Important: ')) + '</strong>' + text.disclaimer;
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
  floatingNavs.forEach(function (nav) {
    const finishEntranceAnimation = function () {
      nav.classList.add('floating-direction-managed');
    };
    nav.addEventListener('animationend', finishEntranceAnimation, { once: true });
    setTimeout(finishEntranceAnimation, 1400);
  });

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

  let lastPageScrollY = Math.max(0, window.scrollY);
  let directionDistance = 0;
  let previousDirection = 0;
  let scrollFramePending = false;
  const directionThreshold = 18;
  const alwaysVisibleZone = 72;

  function setFloatingUiHidden(hidden) {
    if (document.activeElement && document.activeElement.closest &&
        document.activeElement.closest('.floating-nav, .care-controls, .back-to-top, .reference-tools')) {
      hidden = false;
    }
    if (hidden) {
      floatingNavs.forEach(function (nav) {
        nav.classList.add('floating-direction-managed');
      });
    }
    document.body.classList.toggle('floating-ui-hidden', hidden);
  }

  function updateFloatingUiForScroll() {
    const currentY = Math.max(0, window.scrollY);
    const delta = currentY - lastPageScrollY;
    const direction = delta > 0 ? 1 : delta < 0 ? -1 : 0;

    if (currentY <= alwaysVisibleZone) {
      directionDistance = 0;
      previousDirection = 0;
      setFloatingUiHidden(false);
    } else if (direction !== 0) {
      if (direction !== previousDirection) directionDistance = 0;
      directionDistance += Math.abs(delta);
      previousDirection = direction;

      if (directionDistance >= directionThreshold) {
        setFloatingUiHidden(direction > 0);
        directionDistance = 0;
      }
    }

    lastPageScrollY = currentY;
    scrollFramePending = false;
  }

  window.addEventListener('scroll', function () {
    if (scrollFramePending) return;
    scrollFramePending = true;
    requestAnimationFrame(updateFloatingUiForScroll);
  }, { passive: true });

  document.addEventListener('focusin', function (event) {
    if (event.target.closest &&
        event.target.closest('.floating-nav, .care-controls, .back-to-top, .reference-tools')) {
      setFloatingUiHidden(false);
    }
  });

  document.querySelectorAll('.back-to-top, .bottom-back-to-top').forEach(function (button) {
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

  /* ===== Service Worker Registration ===== */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }

  /* ===== Reading Progress Bar ===== */
  (function () {
    const progress = document.createElement('div');
    progress.className = 'reading-progress';
    progress.setAttribute('aria-hidden', 'true');
    const bar = document.createElement('div');
    bar.className = 'reading-progress-bar';
    progress.appendChild(bar);
    document.body.insertBefore(progress, document.body.firstChild);

    function updateProgress() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = pct + '%';
    }
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  })();

  /* ===== Header Anchor Links ===== */
  (function () {
    const contentRoot = document.querySelector('.main') || document.querySelector('main') || document.body;
    const headers = contentRoot.querySelectorAll('h2[id], h3[id], h4[id]');
    headers.forEach(function (header) {
      const anchor = document.createElement('a');
      anchor.href = '#' + header.id;
      anchor.className = 'header-anchor';
      anchor.setAttribute('aria-label', (isZh ? '複製連結：' : 'Copy link to ') + header.textContent);
      anchor.textContent = '#';
      anchor.addEventListener('click', function (event) {
        event.preventDefault();
        const url = location.origin + location.pathname + '#' + header.id;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url).then(showToast);
        } else {
          const ta = document.createElement('textarea');
          ta.value = url;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          showToast();
        }
      });
      header.appendChild(anchor);
    });
  })();

  /* ===== Toast Notification ===== */
  let toastEl = null;
  let toastTimer = null;
  function showToast() {
    const msg = isZh ? '連結已複製' : 'Link copied';
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('show');
    }, 2000);
  }
})();
