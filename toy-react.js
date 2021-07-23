const RENDER_TO_DOM = Symbol.for('render_to_dom');


export class Component {
  constructor() {
    this.props = Object.create(null);
    this.children = [];
    this._root = null;
    this._range = null;
  }
  setAttribute(name, value) {
    this.props[name] = value;
  }
  appendChild(component) {
    this.children.push(component);
  }
  [RENDER_TO_DOM](range) {
    this._range = range;
    this._vdom = this.vdom;
    this._vdom[RENDER_TO_DOM](range);
  }
  get vdom() {
    return this.render().vdom;
  }
  update() {
    let isSameNode = (oldNode, newNode) => {

      if (oldNode.type !== newNode.type) {
        return false;
      }

      for (const name in newNode.props) {
        if (oldNode.props[name] !== newNode.props[name]) {
          return false;
        }
      }

      if (JSON.stringify(Object.keys(oldNode.props).sort()) !== JSON.stringify(Object.keys(newNode.props).sort())) {
        return false;
      }

      if (newNode.type === '#text') {
        if (newNode.content !== oldNode.content) {
          return false;
        }
      }

      return true;
    }
    let update = (oldNode, newNode) => {
      // console.log(333, oldNode, newNode);
      if (!isSameNode(oldNode, newNode)) {
        newNode[RENDER_TO_DOM](oldNode._range);
        return;
      }
      newNode._range = oldNode._range;

      let newChildren = newNode.vchildren;
      let oldChildren = oldNode.vchildren;

      let tailRange = oldChildren[oldChildren.length - 1]._range;

      for (let i = 0; i < newChildren.length; i++) {
        let newChild = newChildren[i];
        let oldChild = oldChildren[i];

        // 替换 删除 增加  简单只实现替换和增加
        if (newChild && oldChild) {
          update(oldChild, newChild);
        } else if(newChild && !oldChild) {
          let range = document.createRange();
          range.setStart(tailRange.endContainer, tailRange.endOffset);
          range.setEnd(tailRange.endContainer, tailRange.endOffset);
          newChild[RENDER_TO_DOM](range);
          tailRange = range;
        }
      }
    }
    let vdom = this.vdom;
    update(this._vdom, vdom);
    this._vdom = vdom;
  }
  setState(newState) {
    if (this.state === null || typeof this.state !== 'object') {
      this.state = newState;
      this.update();
      return;
    }
    let merge = (oldState, newState) => {
      for (const p in newState) {
        oldState[p] = newState[p]
        // if (oldState[p] === null || typeof oldState[p] !== 'object') {
        //   oldState[p] = newState[p]
        // } else {
        //   merge(oldState[p], oldState[p])
        // }
      }
    }
    merge(this.state, newState);
    this.update();
  }
}

class ElementWrapper extends Component {
  constructor(type) {
    super(type)
    this.type = type;
  }
  get vdom() {
    this.vchildren = this.children.map(c => c.vdom);
    return this;
    // {
    //   type: this.type,
    //   props: this.props,
    //   children: this.children.map(child => child.vdom),
    // }
  }
  [RENDER_TO_DOM](range) {
    this._range = range;

    let root = document.createElement(this.type);

    for (const name in this.props) {
      let value = this.props[name];
      if (name.match(/^on([\s\S]+)/)) {
        root.addEventListener(RegExp.$1.replace(/^[\s\S]/, c => c.toLocaleLowerCase()), value);
      } else {
        if (name === 'className') {
          root.setAttribute('class', value)
        } else {
          root.setAttribute(name, value)
        }
      }
    }

    if (!this.vchildren) {
      this.vchildren = this.children.map(c => c.vdom);
    }

    for (const child of this.vchildren) {
      let childRange = document.createRange();
      childRange.setStart(root, root.childNodes.length);
      childRange.setEnd(root, root.childNodes.length);
      child[RENDER_TO_DOM](childRange);
    }

    replaceContent(range, root);
  }
}

class TextWrapper extends Component {
  constructor(content) {
    super(content);
    this.type = '#text';
    this.content = content;
  }
  get vdom() {
    return this;
    // {
    //   type: '#text',
    //   content: this.content,
    // }
  }
  [RENDER_TO_DOM](range) {
    this._range = range;

    let root = document.createTextNode(this.content);
    replaceContent(range, root);
  }
}

function replaceContent(range, node) {
  range.insertNode(node);
  range.setStartAfter(node);
  range.deleteContents();

  range.setStartBefore(node);
  range.setEndAfter(node);
}


export function createElement(type, attributes, ...children) {
  // init root node
  let e;
  if (typeof type === 'string') {
    e = new ElementWrapper(type);
  } else {
    e = new type;
  }

  // set attribute
  for (const p in attributes) {
    e.setAttribute(p, attributes[p]);
  }

  // children node load
  let insertChildren = (children) => {
    for (const child of children) { 
      if (child === null) {
        continue;
      }
      if (typeof child === 'string') {
        child = new TextWrapper(child);
      } else if (typeof child === 'function') {
        child = new child;
      }
      if (Array.isArray(child)) {
        insertChildren(child);
      } else {
        e.appendChild(child);
      }
    }
  }
  insertChildren(children);
  return e;
}

export function render(component, parentElement) {
  let range = document.createRange();
  range.setStart(parentElement, 0);
  range.setEnd(parentElement, parentElement.childNodes.length);
  range.deleteContents();
  component[RENDER_TO_DOM](range);
}
