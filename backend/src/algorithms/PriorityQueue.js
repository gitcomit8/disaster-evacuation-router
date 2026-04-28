class PriorityQueue {
  constructor() {
    this.items = [];
  }

  enqueue(element, priority) {
    const queueElement = { element, priority };
    let added = false;

    for (let i = 0; i < this.items.length; i++) {
      if (queueElement.priority < this.items[i].priority) {
        this.items.splice(i, 0, queueElement);
        added = true;
        break;
      }
    }

    if (!added) {
      this.items.push(queueElement);
    }
  }

  dequeue() {
    if (this.items.length === 0) return undefined;
    return this.items.shift().element;
  }

  isEmpty() {
    return this.items.length === 0;
  }

  peek() {
    if (this.items.length === 0) return undefined;
    return this.items[0].element;
  }

  size() {
    return this.items.length;
  }
}

export default PriorityQueue;
