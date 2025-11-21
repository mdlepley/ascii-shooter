export class Enemy {
  constructor() {
    this.health = 10;

    const el = document.createElement("p");
    el.className = "enemy";
    el.innerHTML = "&#123;&#91;&#58;&#58;&#93;&#125;";
    document.body.appendChild(el);
  }
}
