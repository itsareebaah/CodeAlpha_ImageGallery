
    (function(){
      const gallery = document.getElementById('gallery');
      const cards = Array.from(gallery.querySelectorAll('.card'));
      const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));
      const select = document.getElementById('imageFilter');

      // Lightbox elements
      const lightbox = document.getElementById('lightbox');
      const lbImg = lightbox.querySelector('.lb-img');
      const lbClose = lightbox.querySelector('.lb-close');
      const lbPrev = lightbox.querySelector('.lb-prev');
      const lbNext = lightbox.querySelector('.lb-next');
      const lbCaption = lightbox.querySelector('.caption');

      let currentIndex = -1;

      // open lightbox for index
      function openLightbox(i){
        const card = cards[i];
        if(!card) return;
        const src = card.getAttribute('data-src') || card.querySelector('img').src;
        const title = card.getAttribute('data-title') || card.querySelector('img').alt || '';
        lbImg.src = src;
        lbImg.alt = title;
        lbCaption.textContent = title;
        currentIndex = i;
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden','false');
        // prefetch neighbours
        prefetchImage(i+1); prefetchImage(i-1);
      }

      function closeLightbox(){
        lightbox.classList.remove('open');
        lightbox.setAttribute('aria-hidden','true');
        lbImg.src = '';
        currentIndex = -1;
      }

      function showNext(){
        if(currentIndex < 0) return;
        const next = findVisibleIndex(currentIndex+1, 1);
        if(next !== null) openLightbox(next);
      }
      function showPrev(){
        if(currentIndex < 0) return;
        const prev = findVisibleIndex(currentIndex-1, -1);
        if(prev !== null) openLightbox(prev);
      }

      function prefetchImage(i){
        if(i<0||i>=cards.length) return;
        const src = cards[i].getAttribute('data-src');
        if(!src) return;
        const img = new Image(); img.src = src;
      }

      // when filtering we will hide elements but keep original order — need to find next visible
      function findVisibleIndex(start, step){
        let i = start;
        while(i>=0 && i<cards.length){
          if(!cards[i].classList.contains('hidden')) return i;
          i += step;
        }
        return null;
      }

      // click to open
      cards.forEach((card, idx)=>{
        card.addEventListener('click', (e)=>{
          e.preventDefault();
          // compute index among all cards
          openLightbox(idx);
        });
      });

      // lightbox controls
      lbClose.addEventListener('click', closeLightbox);
      lbNext.addEventListener('click', showNext);
      lbPrev.addEventListener('click', showPrev);

      lightbox.addEventListener('click', (e)=>{
        if(e.target === lightbox) closeLightbox();
      });

      // keyboard
      document.addEventListener('keydown',(e)=>{
        if(lightbox.classList.contains('open')){
          if(e.key === 'ArrowRight') showNext();
          if(e.key === 'ArrowLeft') showPrev();
          if(e.key === 'Escape') closeLightbox();
        }
      });

      // category filtering (buttons)
      filterButtons.forEach(btn=>{
        btn.addEventListener('click', ()=>{
          document.querySelectorAll('[data-filter]').forEach(b=>b.classList.remove('active'));
          btn.classList.add('active');

          const f = btn.getAttribute('data-filter');
          cards.forEach(c=>{
            const cat = c.getAttribute('data-category');
            if(f === 'all' || cat === f){
              c.classList.remove('hidden');
            } else {
              c.classList.add('hidden');
            }
          });
        });
      });

      // image filter select (applies a class on gallery container)
      select.addEventListener('change', ()=>{
        const v = select.value;
        // clear previous filter classes
        gallery.classList.remove('filter-none','filter-grayscale','filter-sepia','filter-contrast','filter-bright');
        gallery.classList.add(v);
      });

      // optional: touch swipe for mobile (basic)
      let startX = null;
      lightbox.addEventListener('touchstart', (e)=>{ startX = e.touches[0].clientX; });
      lightbox.addEventListener('touchend', (e)=>{
        if(startX === null) return;
        const endX = e.changedTouches[0].clientX;
        const diff = endX - startX;
        if(Math.abs(diff) > 40){ if(diff < 0) showNext(); else showPrev(); }
        startX = null;
      });

      // accessibility small improvements
      filterButtons[0].setAttribute('aria-pressed','true');

      // keep aria-pressed updated
      filterButtons.forEach(btn=>btn.addEventListener('click', ()=>{
        filterButtons.forEach(b=>b.setAttribute('aria-pressed', b.classList.contains('active')));
      }));

    })();
