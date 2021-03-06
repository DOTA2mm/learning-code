class Component {
  constructor (id, opts = {data: []}) {
    this.container = document.getElementById(id);
    this.options = opts;
    this.container.innerHTML = this.render(opts.data);
  }
  registerPlugins (...plugins) {
    plugins.forEach(plugin => {
      let pluginContainer = document.createElement('div');
      pluginContainer.className = '.slider-list__plugin';
      pluginContainer.innerHTML = plugin.render(this.options.data);
      this.container.appendChild(pluginContainer);

      plugin.action(this);
    })
  }
}

class Slider extends Component {
  constructor (id, opts = {data: [], cycle: 3000}) {
    super(id, opts);
    this.items = this.container.querySelectorAll('.slider-list__item, slider-list__item--selected');
    this.cycle = opts.cycle || 3000;
    this.slideHanders = [];
    this.slideTo(0);
  }
  render (data) {
    let content = data.map(image => `
    <li class="slider-list__item">
      <img src="${image}" alt="" />
    </li>
    `.trim());

    return `<ul>${content.join('')}</ul>`;
  }
  getSelectedItem () {
    return this.container.querySelector('.slider-list__item--selected')
  }
  getSelectedItemIndex () {
    return Array.from(this.items).indexOf(this.getSelectedItem());
  }
  slideTo (idx) {
    let selected = this.getSelectedItem();
    if (selected) {
      selected.className = 'slider-list__item';
    }
    let item = this.items[idx];
    if (item) {
      item.className = 'slider-list__item--selected';
    }

    this.slideHanders.forEach(handler => {
      handler(idx);
    });
  }
  slideNext () {
    let currentIdx = this.getSelectedItemIndex();
    let nextIdx = (currentIdx + 1) % this.items.length;
    this.slideTo(nextIdx);
  }
  slidePrevious () {
    let currentIdx = this.getSelectedItemIndex();
    let previousIdx = (this.items.length + currentIdx - 1) % this.items.length;
    this.slideTo(previousIdx);
  }
  addSlideListener (handler) {
    this.slideHanders.push(handler);
  }
  start () {
    this.stop();
    this._timer = setInterval(() => this.slideNext(), this.cycle);
  }
  stop () {
    clearInterval(this._timer);
  }
}

// 定义一个插件
let pluginController = {
  render (images) {
    return `
      <div class="slide-list__control">
        ${images.map((image, i) => `
            <span class="slide-list__control-buttons${i === 0 ? '--selected' : ''}"></span>
        `).join('')}
      </div> 
    `.trim();
  },
  action (slider) {
    let controller = slider.container.querySelector('.slide-list__control');

    if (controller) {
      let buttons = controller.querySelectorAll('.slide-list__control-buttons, .slide-list__control-buttons--selected');
      controller.addEventListener('mouseover', evt => {
        let idx = Array.from(buttons).indexOf(evt.target);
        if (idx >= 0) {
          slider.slideTo(idx);
          slider.stop();
        }
      });

      controller.addEventListener('mouseout', evt => {
        slider.start();
      });

      slider.addSlideListener(function (idx) {
        let selected = controller.querySelector('.slide-list__control-buttons--selected');
        if (selected) selected.className = 'slide-list__control-buttons';
        buttons[idx].className = 'slide-list__control-buttons--selected';
      });
    }
  }
}

let pluginPrevious = {
  render () {
    return `<a class="slide-list__previous"></a>`;
  },
  action (slider) {
    let previous = slider.container.querySelector('.slide-list__previous');
    if (previous) {
      previous.addEventListener('click', evt => {
        slider.stop();
        slider.slidePrevious();
        slider.start();
        evt.preventDefault();
      });
    }
  }
};

let pluginNext = {
  render () {
    return `<a class="slide-list__next"></a>`;
  },
  action (slider) {
    let previous = slider.container.querySelector('.slide-list__next');
    if (previous) {
      previous.addEventListener('click', evt => {
        slider.stop();
        slider.slideNext();
        slider.start();
        evt.preventDefault();
      });
    }
  }
};

const slider = new Slider('my-slider', {
  data: [
    'https://p5.ssl.qhimg.com/t0119c74624763dd070.png',
    'https://p4.ssl.qhimg.com/t01adbe3351db853eb3.jpg',
    'https://p2.ssl.qhimg.com/t01645cd5ba0c3b60cb.jpg',
    'https://p4.ssl.qhimg.com/t01331ac159b58f5478.jpg'
  ],
  cycle: 3000
});

slider.registerPlugins(pluginController, pluginPrevious, pluginNext);
slider.start();
