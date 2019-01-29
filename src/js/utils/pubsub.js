class PubSub {
    constructor() {
        this.cache = {};
    }

    pub(id, ...args) {
        console.log('Pub:' + id);

        if (!this.cache[id]) {
            this.cache[id] = [];
        }

        for (let i = 0; i < this.cache[id].length; i++) {

            this.cache[id][i].apply(null, args);

        }
    }

    sub(id, fn) {
        console.log('Sub: '+ id);

        if (!this.cache[id]) {
            this.cache[id] = [fn];
        } else {
            this.cache[id].push(fn);
        }
    }

    unsub(id, fn) {
        let index;

        if (!this.cache[id]) {
            return;
        }

        if (!fn) {
            this.cache[id] = [];
        } else {
            index = this.cache[id].indexOf(fn);
            if (index > -1) {
                this.cache[id].splice(index, 1);
            }
        }
    }
}

export default new PubSub();
