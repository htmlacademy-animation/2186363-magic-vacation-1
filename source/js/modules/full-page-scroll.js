import throttle from 'lodash/throttle';

export default class FullPageScroll {
  constructor() {
    this.THROTTLE_TIMEOUT = 1000;
    this.scrollFlag = true;
    this.timeout = null;

    this.screenElements = document.querySelectorAll(`.screen:not(.screen--result)`);
    this.menuElements = document.querySelectorAll(`.page-header__menu .js-menu-link`);
    this.bgElement = document.querySelector(`.animation-background`);

    this.activeScreen = 0;
    this.onScrollHandler = this.onScroll.bind(this);
    this.onUrlHashChengedHandler = this.onUrlHashChanged.bind(this);
  }

  init() {
    document.addEventListener(`wheel`, throttle(this.onScrollHandler, this.THROTTLE_TIMEOUT, {trailing: true}));
    window.addEventListener(`popstate`, this.onUrlHashChengedHandler);

    this.onUrlHashChanged();
  }

  onScroll(evt) {
    if (this.scrollFlag) {
      this.reCalculateActiveScreenPosition(evt.deltaY);
      const currentPosition = this.activeScreen;
      if (currentPosition !== this.activeScreen) {
        this.changePageDisplay();
      }
    }
    this.scrollFlag = false;
    if (this.timeout !== null) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(() => {
      this.timeout = null;
      this.scrollFlag = true;
    }, this.THROTTLE_TIMEOUT);
  }

  onUrlHashChanged() {
    const newIndex = Array.from(this.screenElements).findIndex((screen) => location.hash.slice(1) === screen.id);
    this.activeScreen = (newIndex < 0) ? 0 : newIndex;
    this.changePageDisplay();
  }

  changePageDisplay() {
    this.changeVisibilityDisplay();
    this.changeActiveMenuItem();
    this.emitChangeDisplayEvent();
  }

  changeVisibilityDisplay() {
    this.bgElement.classList.add(`active`);
    this.animateTextRandom(this.screenElements[this.activeScreen].id);

    setTimeout(() => {

      this.screenElements.forEach((screen) => {
        screen.classList.add(`screen--hidden`);
        screen.classList.remove(`active`);
      });
      this.bgElement.classList.remove(`active`);
      this.screenElements[this.activeScreen].classList.remove(`screen--hidden`);

      setTimeout(() => {
        this.screenElements[this.activeScreen].classList.add(`active`);
      }, 100);
    }, this.screenElements[this.activeScreen].id === `prizes` ? 800 : 0);
  }

  changeActiveMenuItem() {
    const activeItem = Array.from(this.menuElements).find((item) => item.dataset.href === this.screenElements[this.activeScreen].id);
    if (activeItem) {
      this.menuElements.forEach((item) => item.classList.remove(`active`));
      activeItem.classList.add(`active`);
    }
  }

  emitChangeDisplayEvent() {
    const event = new CustomEvent(`screenChanged`, {
      detail: {
        'screenId': this.activeScreen,
        'screenName': this.screenElements[this.activeScreen].id,
        'screenElement': this.screenElements[this.activeScreen]
      }
    });

    document.body.dispatchEvent(event);
  }

  reCalculateActiveScreenPosition(delta) {
    if (delta > 0) {
      this.activeScreen = Math.min(this.screenElements.length - 1, ++this.activeScreen);
    } else {
      this.activeScreen = Math.max(0, --this.activeScreen);
    }
  }

  animateTextRandom(elId) {
    const screensObjs = {
      top: {
        class: `intro__title`
      },
      story: {
        class: `slider__item-title`
      },
      prizes: {
        class: `prizes__title`
      },
      rules: {
        class: `rules__title`
      },
      game: {
        class: `game__title`
      },
      top2: {
        class: `intro__date`
      },
    };

    const nodeText = document.querySelector(`.${screensObjs[elId].class}`);

    if (nodeText.querySelector(`.animation-span-line`)) {
      return;
    }

    const nodeTextContent = nodeText.innerHTML;
    nodeText.innerHTML = ``;
    const arrWords = nodeTextContent.split(` `);

    for (let y = 0; y < arrWords.length; y++) {
      let spanLine = document.createElement(`span`);
      spanLine.classList.add(`animation-span-line`);
      nodeText.append(spanLine);


      for (let i = 0; i < arrWords[y].length; i++) {
        let span = document.createElement(`span`);
        span.classList.add(`animation-span-letter`);
        span.innerHTML = arrWords[y][i];
        const nthChilds = nodeText.querySelectorAll(`.animation-span-letter`);

        this.setRandomDelay(nthChilds, elId);


        spanLine.append(span);
      }
    }

    if (elId === `top`) {
      this.animateTextRandom(`top2`);
    }
  }

  getRandomNum(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  setRandomDelay(nthChilds, elId) {
    return nthChilds.forEach((i) => {
      if (elId === `top2`) {
        i.style.transitionDelay = `${Number(`0.${this.getRandomNum(0, 8)}`) + 0.8}s`;
        return;
      }
      i.style.transitionDelay = `0.${this.getRandomNum(0, 6)}s`;
    });
  }
}
