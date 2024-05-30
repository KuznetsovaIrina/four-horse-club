initAdaptiveItems();
initSlider();

function initAdaptiveItems() {
    const BREAKPOINT_MOBILE = 768;
    const listDefault = document.querySelector('.stages__list').cloneNode(true);

    document.addEventListener('DOMContentLoaded', setTemplate);
    window.addEventListener('resize', setTemplate);

    function setTemplate() {
        const parentElement = document.querySelector('.stages__list');
        
        if (document.body.clientWidth <= BREAKPOINT_MOBILE) {
            parentElement.innerHTML = getMobileTpl();
            fixNumb(parentElement);
        } else {
            parentElement.innerHTML = getDesktopTpl();
        }

        initSlider();
    }

    function getMobileTpl() {
        const items = document.querySelectorAll('.stages__item');
        return groupSlides(items);
    }
    
    function getDesktopTpl() {
        return listDefault.innerHTML;
    }

    function groupSlides(items) {
        let itemsByGroup = {};
    
        items.forEach(item => {
            const group = item.getAttribute('data-group');
            itemsByGroup[group] = itemsByGroup[group] || [];
            itemsByGroup[group].push(item.outerHTML);
        });
    
        return Object.values(itemsByGroup).map(groupItems => {
            const li = document.createElement('li');
            li.innerHTML = groupItems.join('');
            return li.outerHTML;
        }).join('');
    }

    function fixNumb(list) {
        const items = list.querySelectorAll('.stages__item');
        items.forEach((item, index) => {
            const numb = item.querySelector('.stages__numb');
            numb.innerHTML = index + 1;
        });
    }
}

function initSlider() {
    const BREAKPOINT_MOBILE = 768;
    const GAP = 20;
    const AUTOPLAY_MILISECONDS = 4000;
    const sliders = document.querySelectorAll('[data-slider]');

    sliders.forEach(slider => init(slider));

    function init(slider) {
        const id = slider.getAttribute('data-slider');
        const nav = document.querySelector(`[data-slider-id=${id}]`);
        const prevButton = nav.querySelector('.button-prev');
        const nextButton = nav.querySelector('.button-next');
        const total = slider.childElementCount;
        const widthSlide = slider.firstElementChild.clientWidth + GAP;
        const isCounter = nav.getAttribute('data-counter');
        const isDots = nav.getAttribute('data-dots');
        const isAutoplay = slider.getAttribute('data-autoplay');

        let intervalId = setAutoplay(getCountScroll());
        let currentSlide = 1;
        let shift = 0;

        setCounter(getCountScroll());
        setDots(getCountScroll());

        function getCountScroll() {
            const countDesktopScroll = +slider.getAttribute('data-count-scroll');
            const countMobileScroll = +slider.getAttribute('data-count-mobile-scroll');

            return document.body.clientWidth <= BREAKPOINT_MOBILE
                ? countMobileScroll
                : countDesktopScroll;
        }

        function setCounter(countScroll) {
            if (isCounter) {
                const totalElement = nav.querySelector('.slider-nav__total');
                const currentElement = nav.querySelector('.slider-nav__current');
                totalElement.innerHTML = total;
                currentElement.innerHTML = currentSlide < total ? currentSlide : total;
                currentElement.innerHTML = currentSlide * countScroll > total ? total : currentSlide * countScroll;
            }
        }

        function setDots(countScroll) {
            if (isDots) {
                const dotsElement = nav.querySelector('.slider-nav__dots');
                const items = Math.ceil(total / countScroll);
                let li = ``;

                for (let i = 1; i <= items; i++) {
                    li += i === currentSlide ? `<li class="active"></li>` : `<li></li>`;
                }

                dotsElement.innerHTML = li;
            }
        }

        function next(countScroll) {
            const widthScroll = widthSlide * countScroll;

            if (currentSlide < total / countScroll) {
                slider.style = `transform: translateX(-${shift + widthScroll}px)`;
                currentSlide += 1;
                shift += widthScroll;
            } else {
                slider.style = `transform: translateX(0)`;
                currentSlide = 1;
                shift = 0;
            }

            setCounter(countScroll);
            setDots(countScroll);
        }

        function prev(countScroll) {
            const widthScroll = widthSlide * countScroll;

            if (currentSlide > 1) {
                slider.style = `transform: translateX(-${shift - widthScroll}px)`;
                currentSlide -= 1;
                shift -= widthScroll;
            } else {
                currentSlide = Math.ceil(total / countScroll);
                shift = widthScroll * (currentSlide - 1);
                slider.style = `transform: translateX(-${shift}px)`;
            }
            
            setCounter(countScroll);
            setDots(countScroll);
        }

        function setAutoplay(countScroll) {
            const id = isAutoplay ? setInterval(() => next(countScroll), AUTOPLAY_MILISECONDS) : null;
            return id;
        }

        function prevHandler() {
            clearInterval(intervalId);
            prev(getCountScroll());
            intervalId = setAutoplay(getCountScroll());
        }

        function nextHandler() {
            clearInterval(intervalId);
            next(getCountScroll());
            intervalId = setAutoplay(getCountScroll());
        }

        prevButton.addEventListener('click', prevHandler);
        nextButton.addEventListener('click', nextHandler);
        initTouch(slider, prevHandler, nextHandler);
    }
}

function initTouch(slider, prevHandler, nextHandler) {
    slider.addEventListener('touchstart', handleTouchStart, false);
    slider.addEventListener('touchmove', handleTouchMove, false);

    let xDown = null;
    let yDown = null;

    function handleTouchStart(evt) {
        const touch = evt.touches || evt.originalEvent.touches;
        const firstTouch = touch[0];
        xDown = firstTouch.clientX;
        yDown = firstTouch.clientY;
    };

    function handleTouchMove(evt) {
        if ( ! xDown || ! yDown ) {
            return;
        }

        const xUp = evt.touches[0].clientX;
        const yUp = evt.touches[0].clientY;
        const xDiff = xDown - xUp;
        const yDiff = yDown - yUp;

        if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {
            xDiff > 0 ? nextHandler() : prevHandler();
        }

        xDown = null;
        yDown = null;
    };
}