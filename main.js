import {createElement, Component, render} from './toy-react'

class My extends Component {
  constructor() {
    super();
    this.state = {
      a: 1,
      b: 2,
    }
  }

  render() {
    return <div>
      <div>div</div>
      <span>span</span>
      <div onclick={() => {this.setState(this.state.a++)}}>add a</div>
      <div onclick={() => {this.setState(this.state.b++)}}>add b</div>
      <div>{this.state.a.toString()}</div>
      <div>{this.state.b.toString()}</div>
      {this.children}
    </div>
  }
}


render(
<My id="a">
  <div>
    this.child
    <span>2223</span>
    <span>3333</span>
  </div>
</My>,
document.body);

