toy-react 是利用了 webpack 的替换功能，将 react 的 CreateElement 进行了重写，并且利用 range 的特性实现了 dom 的 rerender，最后通过一个简单的 diff 算法来实现虚拟 dom -> 实际 dom 的更新


npm run build

  dist > main.html 使用toy-react 实现react 官网给的tic-tac-toe 小游戏