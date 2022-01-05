/* eslint-disable max-len */
/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */


/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(w, h) {
  return {
    width: w,
    height: h,
    getArea() {
      return this.width * this.height;
    },
  };
}


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  return new proto.constructor(...Object.values(JSON.parse(json)));
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

const cssSelectorBuilder = {
  selectObj: {
    tag: '',
    id: '',
    class: '',
    attr: '',
    pseudoClass: '',
    pseudoElement: '',
    seq: '',
    prevElem: '',
  },
  combo: [],
  comboSeparators: [],
  firstMode: true,
  firstId: false,
  errors: {
    order: 'Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element',
    moreThanOne: 'Element, id and pseudo-element should not occur more then one time inside the selector',
  },

  element(tag) {
    if (this.selectObj.seq && !this.firstMode) {
      this.genSelector();
      this.writeCombo();
      this.firstMode = true;
    }

    if (this.firstId) this.genError(this.errors.order);
    if (this.selectObj.tag && this.firstMode) this.genError(this.errors.moreThanOne);

    this.selectObj.tag = tag;
    this.selectObj.seq = tag;

    return this;
  },

  id(_id) {
    if (this.prevElem) {
      this.writeCombo();
    }

    if (this.selectObj.id) this.genError(this.errors.moreThanOne);
    if (this.selectObj.class || this.selectObj.pseudoElement) this.genError(this.errors.order);
    if (this.selectObj.tag && this.selectObj.seq.length > this.selectObj.tag.length) this.genError(this.errors.order);

    this.selectObj.id = `#${_id}`;
    if (this.selectObj.seq === '') this.firstId = true;
    this.selectObj.seq += `#${_id}`;

    this.firstMode = false;

    return this;
  },

  class(_class) {
    if (this.selectObj.attr) throw new Error(this.errors.order);
    this.selectObj.class = `.${_class}`;
    this.selectObj.seq += `.${_class}`;

    this.firstMode = false;
    this.firstId = false;

    return this;
  },

  attr(_attr) {
    if (this.selectObj.pseudoClass) this.genError(this.errors.order);

    this.selectObj.attr = `[${_attr}]`;
    this.selectObj.seq += `[${_attr}]`;

    this.firstMode = false;
    this.firstId = false;

    return this;
  },

  pseudoClass(_pseudoClass) {
    if (this.selectObj.pseudoElement) this.genError(this.errors.order);
    this.selectObj.pseudoClass = `:${_pseudoClass}`;
    this.selectObj.seq += `:${_pseudoClass}`;

    this.firstMode = false;
    this.firstId = false;

    return this;
  },

  pseudoElement(_pseudoElement) {
    if (this.selectObj.pseudoElement) this.genError(this.errors.moreThanOne);
    this.selectObj.pseudoElement = `::${_pseudoElement}`;
    this.selectObj.seq += `::${_pseudoElement}`;

    this.firstMode = false;
    this.firstId = false;

    return this;
  },

  cleanSelector() {
    Object.keys(this.selectObj).forEach((key) => {
      this.selectObj[key] = '';
    });
  },

  genSelector() {
    const result = this.selectObj.seq;
    this.cleanSelector();
    this.selectObj.prevElem = result;
    return result;
  },

  writeCombo() {
    if (this.selectObj.prevElem) {
      this.combo.push(this.selectObj.prevElem);
      this.selectObj.prevElem = '';
    } else {
      this.combo.push(this.selectObj.seq);
    }
  },

  combine(...args) {
    if (this.selectObj.seq) {
      this.genSelector();
      this.writeCombo();
    }
    this.comboSeparators.push(args[1]);
    return this;
  },

  stringify() {
    if (this.combo.length > 0) {
      this.comboSeparators.reverse();
      const result = this.combo.flatMap((item, index) => {
        if (index < this.combo.length - 1) {
          return [item, this.comboSeparators[index]];
        }
        return item;
      }).join(' ');
      this.comboSeparators = [];
      this.combo = [];
      this.firstMode = true;
      this.firstId = false;
      return result;
    }
    const result = this.genSelector();
    this.selectObj.prevElem = '';
    this.firstMode = true;
    this.firstId = false;
    return result;
  },

  genError(message) {
    this.cleanSelector();
    this.selectObj.prevElem = '';
    this.firstMode = true;
    this.firstId = false;
    throw new Error(message);
  },
};


module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
