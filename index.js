class Opt {
    constructor(val, is_some) {
        this.val = val;
        this._is_some = is_some;
    }
    static none() {
        return new Opt(null, false);
    }
    static some(val) {
        return new Opt(val, true);
    }
    static of_value_or_null(val) {
        if (val !== null) {
            return Opt.some(val);
        }
        else {
            return Opt.none();
        }
    }
    eq(other, cmp) {
        if (this.is_none()) {
            return other.is_none();
        }
        else {
            if (other.is_none()) {
                return false;
            }
            else {
                return cmp(this.value_unchecked(), other.value_unchecked());
            }
        }
    }
    unwrap() {
        return this.val;
    }
    value_or_throw() {
        if (this.is_none()) {
            throw new Error();
        }
        return this.val;
    }
    value_unchecked() {
        return this.val;
    }
    is_some() {
        return this._is_some;
    }
    is_none() {
        return !this._is_some;
    }
    if_some(fn) {
        if (this.is_some()) {
            return Opt.some(fn(this.value_unchecked()));
        }
        return Opt.none();
    }
    async if_some_async(fn) {
        if (this.is_some()) {
            await fn(this.value_unchecked());
        }
    }
    if_none(fn) {
        if (this.is_none()) {
            fn();
        }
    }
    value_or(t_or) {
        if (this.is_some()) {
            return this.value_unchecked();
        }
        else {
            return t_or;
        }
    }
    map(fn) {
        if (this._is_some) {
            let g = fn(this.val);
            return Opt.some(g);
        }
        else {
            return Opt.none();
        }
    }
    do_switch(some_fn, none_fn) {
        if (this.is_some()) {
            return some_fn(this.value_unchecked());
        }
        else {
            return none_fn();
        }
    }
}

class StrDict {
    constructor() {
        this.inner = {};
    }
    clear(clear_fn) {
        this.for_each((_, val) => clear_fn(val));
        this.inner = {};
    }
    list_keys() {
        return List.of_array(Object.keys(this.inner));
    }
    *iter() {
        for (let key in this.inner) {
            yield { key, val: this.inner[key] };
        }
    }
    list_values() {
        return List.of_array(Object.values(this.inner));
    }
    set(key, t) {
        this.inner[key] = t;
    }
    remove(key) {
        delete this.inner[key];
    }
    get(key) {
        if (key in this.inner) {
            return Opt.some(this.inner[key]);
        }
        else {
            return Opt.none();
        }
    }
    get_unchecked(key) {
        return this.inner[key];
    }
    contains_key(key) {
        return key in this.inner;
    }
    for_each(action) {
        for (let key in this.inner) {
            action(key, this.inner[key]);
        }
    }
}

class HashSet {
    constructor(hash_fn) {
        this.inner = new StrDict();
        this.hash_fn = hash_fn;
    }
    clear(clear_fn) {
        this.inner.clear(clear_fn);
    }
    to_list() {
        return this.inner.list_values();
    }
    *iter() {
        for (let entry of this.inner.iter()) {
            yield entry.val;
        }
    }
    add(t) {
        let hash = this.hash_fn(t);
        this.inner.set(hash, t);
    }
    remove(t) {
        let hash = this.hash_fn(t);
        this.inner.remove(hash);
    }
    has(t) {
        let hash = this.hash_fn(t);
        return this.inner.contains_key(hash);
    }
}

class StrSet {
    constructor() {
        this._inner = {};
    }
    clear() {
        this._inner = {};
    }
    insert(value) {
        this._inner[value] = null;
    }
    remove(value) {
        delete this._inner[value];
    }
    to_list() {
        return List.of_array(Object.keys(this._inner));
    }
    contains(value) {
        return value in this._inner;
    }
}

class List {
    constructor(...values) {
        this.array = values;
    }
    static of_array(array) {
        let out = new List();
        out.array = array;
        return out;
    }
    set(idx, val) {
        this.array[idx] = val;
    }
    push(val) {
        this.array.push(val);
    }
    pop() {
        let val = this.array.pop();
        if (val !== undefined) {
            return Opt.some(val);
        }
        else {
            return Opt.none();
        }
    }
    length() {
        return this.array.length;
    }
    get(idx) {
        if (0 <= idx && idx < this.array.length) {
            return Opt.some(this.array[idx]);
        }
        return Opt.none();
    }
    get_unchecked(idx) {
        return this.array[idx];
    }
    for_each(action) {
        for (let i = 0; i < this.array.length; i++) {
            let val = this.get_unchecked(i);
            action(val, i);
        }
    }
    async for_each_async(action) {
        for (let i = 0; i < this.array.length; i++) {
            let val = this.get_unchecked(i);
            await action(val, i);
        }
    }
    for_each_until(action_break_fn) {
        for (let i = 0; i < this.array.length; i++) {
            let val = this.get_unchecked(i);
            let should_break = action_break_fn(val, i);
            if (should_break) {
                return;
            }
        }
    }
    find_first(find_fn) {
        for (let i = 0; i < this.array.length; i++) {
            let val = this.get_unchecked(i);
            let found = find_fn(val, i);
            if (found) {
                return Opt.some({ val, idx: i });
            }
        }
        return Opt.none();
    }
    map(map_fn) {
        let out = new List();
        for (let i = 0; i < this.array.length; i++) {
            let val = this.get_unchecked(i);
            let g = map_fn(val, i);
            out.push(g);
        }
        return out;
    }
    filter(filter_fn) {
        let out = new List();
        for (let i = 0; i < this.array.length; i++) {
            let val = this.get_unchecked(i);
            if (filter_fn(val, i))
                out.push(val);
        }
        return out;
    }
    retain(filter_fn) {
        this.array = this.filter(filter_fn).array;
    }
    filter_map(filter_mp_fn) {
        let out = new List();
        for (let i = 0; i < this.array.length; i++) {
            let val = this.get_unchecked(i);
            let g_opt = filter_mp_fn(val, i);
            if (g_opt.is_some()) {
                out.push(g_opt.value_unchecked());
            }
        }
        return out;
    }
    collect(c, map_collect_fn) {
        for (let i = 0; i < this.array.length; i++) {
            let val = this.get_unchecked(i);
            map_collect_fn(c, val, i);
        }
        return c;
    }
    to_hash_set(hash_fn) {
        let out = new HashSet(hash_fn);
        this.for_each(t => out.add(t));
        return out;
    }
    to_str_set(hash_fn) {
        let out = new StrSet();
        this.for_each(t => out.insert(hash_fn(t)));
        return out;
    }
    to_dict(key_fn, hash_fn) {
        let out = new Dict(hash_fn);
        this.for_each(t => out.set(key_fn(t), t));
        return out;
    }
    sort(sort_fn) {
        let new_list = new List();
        new_list.array = this.array.sort(sort_fn);
        return new_list;
    }
    sort_by_string(string_fn) {
        let aux_array = [];
        this.for_each(t => aux_array.push({ val: t, hash: string_fn(t) }));
        let sorted = aux_array.sort((a, b) => a.hash.localeCompare(b.hash));
        return List.of_array(sorted.map(it => it.val));
    }
    *iter() {
        for (let i = 0; i < this.array.length; i++) {
            yield this.get_unchecked(i);
        }
    }
}
(function (List) {
    async function await_all(prm_list) {
        let awaited_list = await Promise.all(prm_list.array);
        return List.of_array(awaited_list);
    }
    List.await_all = await_all;
})(List);

class ImmDict {
    constructor(get_fn, iter_keys_fn) {
        this.get_fn = get_fn;
        this.iter_keys_fn = iter_keys_fn;
    }
    get(k) {
        return this.get_fn(k);
    }
    *iter_keys() {
        yield* this.iter_keys_fn();
    }
    get_unchecked(key) {
        return this.get(key).value_unchecked();
    }
    has_key(k) {
        return this.get(k).is_some();
    }
    list_keys() {
        let out = new List();
        for (let item of this.iter_keys()) {
            out.push(item);
        }
        return out;
    }
    *iter_entries() {
        for (let key of this.iter_keys()) {
            yield { key: key, val: this.get_unchecked(key) };
        }
    }
    to_list() {
        let out = new List();
        for (let entry of this.iter_entries()) {
            out.push(entry);
        }
        return out;
    }
    *iter_values() {
        for (let key of this.iter_keys()) {
            yield this.get_unchecked(key);
        }
    }
    for_each(action) {
        for (let item of this.iter_entries()) {
            action(item.key, item.val);
        }
    }
}

class Dict {
    constructor(id_fn) {
        this.inner = {};
        this.id_fn = id_fn;
    }
    as_imm_dict() {
        return new ImmDict(k => this.get(k), () => this.iter_keys());
    }
    set(key, t) {
        let hash = this.id_fn(key);
        this.inner[hash] = { key: key, val: t };
    }
    remove(key) {
        let hash = this.id_fn(key);
        delete this.inner[hash];
    }
    get(key) {
        let hash = this.id_fn(key);
        if (hash in this.inner) {
            return Opt.some(this.inner[hash].val);
        }
        else {
            return Opt.none();
        }
    }
    get_unchecked(key) {
        let hash = this.id_fn(key);
        return this.inner[hash].val;
    }
    contains_key(key) {
        let hash = this.id_fn(key);
        return hash in this.inner;
    }
    list_keys() {
        let out = new List();
        for (let item of this.iter()) {
            out.push(item.key);
        }
        return out;
    }
    list_entries() {
        let output = new List();
        this.for_each((k, v) => output.push({ key: k, val: v }));
        return output;
    }
    *iter() {
        for (let key in this.inner) {
            yield this.inner[key];
        }
    }
    *iter_keys() {
        for (let item of this.iter()) {
            yield item.key;
        }
    }
    *iter_values() {
        for (let val of Object.values(this.inner)) {
            yield val.val;
        }
    }
    for_each(action_fn) {
        for (let str_k in this.inner) {
            let entry = this.inner[str_k];
            action_fn(entry.key, entry.val);
        }
    }
    retain(filter) {
        let keys = Object.keys(this.inner);
        for (let key of keys) {
            let val = this.inner[key];
            if (filter(val.key, val.val) === false) {
                delete this.inner[key];
            }
        }
    }
}

class ImmTreeNode {
    constructor(value_fn, parent_opt_fn, children_fn) {
        this.value_fn = value_fn;
        this.parent_opt_fn = parent_opt_fn;
        this.children_fn = children_fn;
    }
    value() { return this.value_fn(); }
    parent_opt() { return this.parent_opt_fn(); }
    children() { return this.children_fn(); }
    *iter_depth_first() {
        yield this;
        for (let child of this.children_fn().iter()) {
            yield* child.iter_depth_first();
        }
    }
    list_depth_first() {
        let out = new List();
        for (let node of this.iter_depth_first()) {
            out.push(node);
        }
        return out;
    }
    *iter_depth_first_with_level(level = 0) {
        yield { node: this, level: level };
        for (let child of this.children_fn().iter()) {
            yield* child.iter_depth_first_with_level(level + 1);
        }
    }
    list_depth_first_with_level(level = 0) {
        let out = new List();
        for (let node of this.iter_depth_first_with_level(level)) {
            out.push(node);
        }
        return out;
    }
    first_predecessor_such_that(test) {
        if (test(this.value())) {
            return Opt.some(this);
        }
        else {
            if (this.parent_opt().is_some()) {
                return this.parent_opt().value_unchecked().first_predecessor_such_that(test);
            }
            else {
                return Opt.none();
            }
        }
    }
}

class DictTreeNode {
    constructor(key, val) {
        this.key = key;
        this.val = val;
        this.parent_opt = Opt.none();
        this.children = new List();
    }
    as_imm_tree_node() {
        return new ImmTreeNode(() => this.val, () => this.parent_opt.map(it => it.as_imm_tree_node()), () => this.children.map(it => it.as_imm_tree_node()));
    }
    *iter_depth_first() {
        yield this;
        for (let child of this.children.iter()) {
            yield* child.iter_depth_first();
        }
    }
    *iter_depth_first_with_level(level = 0) {
        yield { node: this, level: level };
        for (let child of this.children.iter()) {
            yield* child.iter_depth_first_with_level(level + 1);
        }
    }
    *iter_depth_first_ordered_with_level(order_fn, level = 0) {
        yield { node: this, level: level };
        let ordered_children = this
            .children
            .sort((node_a, node_b) => order_fn(node_a.val, node_b.val));
        for (let child of ordered_children.iter()) {
            yield* child.iter_depth_first_with_level(level + 1);
        }
    }
    *iter_predecessors() {
        yield this;
        if (this.parent_opt.is_some()) {
            yield* this.parent_opt.value_unchecked().iter_predecessors();
        }
    }
}

class DictTree {
    constructor(hash_fn) {
        this.id_fn = hash_fn;
        this.root = Opt.none();
        this.node_map = new StrDict();
    }
    clear(clear_fn) {
        for (let node of this.iter_depth_first()) {
            clear_fn(node.key, node.val);
        }
        this.root = Opt.none();
        this.node_map = new StrDict();
    }
    *iter_depth_first(key_opt = Opt.none()) {
        if (key_opt.is_some()) {
            let key = key_opt.value_unchecked();
            let key_id = this.id_fn(key);
            yield* this.node_map.get_unchecked(key_id).iter_depth_first();
        }
        else {
            if (this.root.is_some()) {
                yield* this.root.value_unchecked().iter_depth_first();
            }
            else {
                return;
            }
        }
    }
    *iter_depth_first_with_level(key_opt = Opt.none(), level = 0) {
        if (key_opt.is_some()) {
            let key = key_opt.value_unchecked();
            let key_id = this.id_fn(key);
            yield* this.node_map.get_unchecked(key_id).iter_depth_first_with_level(level);
        }
        else {
            if (this.root.is_some()) {
                yield* this.root.value_unchecked().iter_depth_first_with_level(level);
            }
            else {
                return;
            }
        }
    }
    *iter_depth_first_ordered_with_level(order_fn, key_opt = Opt.none(), level = 0) {
        if (key_opt.is_some()) {
            let key = key_opt.value_unchecked();
            let key_id = this.id_fn(key);
            yield* this.node_map.get_unchecked(key_id).iter_depth_first_ordered_with_level(order_fn, level);
        }
        else {
            if (this.root.is_some()) {
                yield* this.root.value_unchecked().iter_depth_first_ordered_with_level(order_fn, level);
            }
            else {
                return;
            }
        }
    }
    *iter_predecessors(key) {
        let node_opt = this.get(key);
        if (node_opt.is_some()) {
            yield* node_opt.value_unchecked().iter_predecessors();
        }
    }
    list_keys() {
        return this.node_map.list_values().map(x => x.key);
    }
    contains_key(key) {
        let hash = this.id_fn(key);
        return this.node_map.contains_key(hash);
    }
    get(key) {
        if (this.contains_key(key) === false) {
            return Opt.none();
        }
        let key_id = this.id_fn(key);
        let node = this.node_map.get_unchecked(key_id);
        return Opt.some(node);
    }
    set(key, val, parent_key_opt) {
        let id = this.id_fn(key);
        let new_node = new DictTreeNode(key, val);
        if (parent_key_opt.is_none()) {
            // we cant add as root if root already is some
            if (this.root.is_some()) {
                throw new Error();
            }
            // otherwise insert as rooot
            this.root = Opt.some(new_node);
            this.node_map.set(id, new_node);
        }
        else {
            // checks if parent exists in the tree
            let parent_key = parent_key_opt.value_unchecked();
            if (this.contains_key(parent_key) === false) {
                throw new Error();
            }
            // sinse it exists insert
            let parent_node = this.get(parent_key).value_unchecked();
            new_node.parent_opt = Opt.some(parent_node);
            parent_node.children.push(new_node);
            this.node_map.set(id, new_node);
        }
    }
    append(tree_node, parent_key_opt) {
        // first checks if no item in the list to append is already preset
        for (let node of tree_node.iter_depth_first()) {
            if (this.contains_key(node.key)) {
                throw new Error();
            }
        }
        // append to the tree
        if (parent_key_opt.is_none()) {
            // we cant add as root if root already is some
            if (this.root.is_some()) {
                throw new Error();
            }
            // append as root
            this.root = Opt.some(tree_node);
        }
        else {
            // checks if parent exists in the tree
            let parent_key = parent_key_opt.value_unchecked();
            if (this.contains_key(parent_key) === false) {
                throw new Error();
            }
            let parent_node = this.get(parent_key).value_unchecked();
            // if it exists adds as children
            parent_node.children.push(tree_node);
            // add as parent
            tree_node.parent_opt = Opt.some(parent_node);
        }
        // append to map
        for (let node of tree_node.iter_depth_first()) {
            let key_id = this.id_fn(node.key);
            this.node_map.set(key_id, node);
        }
    }
    remove(key) {
        let target_node_opt = this.get(key);
        if (target_node_opt.is_none()) {
            return Opt.none();
        }
        let target_node = target_node_opt.value_unchecked();
        let key_id = this.id_fn(key);
        // if there is a parent, remove target node from its children
        if (target_node.parent_opt.is_some()) {
            let parent_node = target_node.parent_opt.value_unchecked();
            parent_node.children.retain(v => this.id_fn(v.key) !== key_id);
        }
        // otherwise we are removing the root, so just set it to Opt.none
        else {
            this.root = Opt.none();
        }
        // remove its from internal map
        for (let node of target_node.iter_depth_first()) {
            let node_key_id = this.id_fn(node.key);
            this.node_map.remove(node_key_id);
        }
        return Opt.some(target_node);
    }
}

class ImmTree {
    constructor(root_fn) {
        this.root_fn = root_fn;
    }
    root() { return this.root_fn(); }
    *iter_depth_first() {
        let root = this.root();
        if (root.is_none()) {
            return;
        }
        yield* root.value_unchecked().iter_depth_first();
    }
    *iter_depth_first_with_level(level = 0) {
        let root = this.root();
        if (root.is_none()) {
            return;
        }
        yield* root.value_unchecked().iter_depth_first_with_level(level);
    }
}

class OrderedDictTree {
    constructor(hash_fn, order_fn) {
        this.hash_fn = hash_fn;
        this.order_fn = order_fn;
        this.root = Opt.none();
        this.node_map = new StrDict();
    }
    get_root() { return this.root; }
    get(key) {
        let hash = this.hash_fn(key);
        if (this.node_map.contains_key(hash) === false) {
            return Opt.none();
        }
        let node = this.node_map.get_unchecked(hash);
        return Opt.some(node);
    }
    has_key(k) {
        return this.get(k).is_some();
    }
    set(key, val, parent_key_opt) {
        let hash = this.hash_fn(key);
        let new_node = new DictTreeNode(key, val);
        if (parent_key_opt.is_none()) {
            // we cant add as root if root already is some
            if (this.root.is_some()) {
                throw new Error();
            }
            // otherwise insert as rooot
            this.root = Opt.some(new_node);
            this.node_map.set(hash, new_node);
        }
        else {
            // checks if parent exists in the tree
            let parent_key = parent_key_opt.value_unchecked();
            let parent_hash = this.hash_fn(parent_key);
            if (this.node_map.contains_key(parent_hash) === false) {
                throw new Error();
            }
            // sinse it exists insert
            let parent_node = this.get(parent_key).value_unchecked();
            parent_node.children.push(new_node);
            parent_node.children = parent_node.children.sort((a, b) => this.order_fn(a.val, b.val));
            new_node.parent_opt = Opt.some(parent_node);
            this.node_map.set(hash, new_node);
        }
    }
    append(tree_node, parent_key_opt) {
        // first checks if no item in the list to append is already preset
        for (let node of tree_node.iter_depth_first()) {
            if (this.has_key(node.key)) {
                throw new Error();
            }
        }
        // append to the tree
        if (parent_key_opt.is_none()) {
            // we cant add as root if root already is some
            if (this.root.is_some()) {
                throw new Error();
            }
            // append as root
            this.root = Opt.some(tree_node);
        }
        else {
            // checks if parent exists in the tree
            let parent_key = parent_key_opt.value_unchecked();
            if (this.has_key(parent_key) === false) {
                throw new Error();
            }
            let parent_node = this.get(parent_key).value_unchecked();
            // if it exists adds as children
            parent_node.children.push(tree_node);
            // add as parent
            tree_node.parent_opt = Opt.some(parent_node);
        }
        // append to map
        for (let node of tree_node.iter_depth_first()) {
            let key_id = this.hash_fn(node.key);
            this.node_map.set(key_id, node);
        }
    }
    remove(key) {
        let target_node_opt = this.get(key);
        if (target_node_opt.is_none()) {
            return Opt.none();
        }
        let target_node = target_node_opt.value_unchecked();
        let hash = this.hash_fn(key);
        // if there is a parent, remove target node from its children
        if (target_node.parent_opt.is_some()) {
            let parent_node = target_node.parent_opt.value_unchecked();
            parent_node.children.retain(v => this.hash_fn(v.key) !== hash);
        }
        // otherwise we are removing the root, so just set it to Opt.none
        else {
            this.root = Opt.none();
        }
        // remove its from internal map
        for (let node of target_node.iter_depth_first()) {
            let node_key_id = this.hash_fn(node.key);
            this.node_map.remove(node_key_id);
        }
        return Opt.some(target_node);
    }
    as_imm_tree() {
        return new ImmTree(() => this.root.map(it => it.as_imm_tree_node()));
    }
    as_imm_dict() {
        let self = this;
        return new ImmDict(k => {
            let k_hash = this.hash_fn(k);
            return this.node_map.get(k_hash).map(it => it.val);
        }, function* () {
            for (let entry of self.node_map.iter()) {
                yield entry.val.key;
            }
        });
    }
}

class DictForest {
    constructor(id_fn) {
        this.id_fn = id_fn;
        this.trees = new List();
    }
    clear(clear_fn) {
        this.trees.for_each(tree => tree.clear(clear_fn));
    }
    root_keys() {
        let output = new List();
        for (let tree of this.trees.iter()) {
            output.push(tree.root.value_unchecked().key);
        }
        return output;
    }
    *iter_depth_first(key_opt = Opt.none()) {
        if (key_opt.is_some()) {
            for (let tree of this.trees.iter()) {
                if (tree.contains_key(key_opt.value_unchecked())) {
                    yield* tree.iter_depth_first(key_opt);
                }
            }
        }
        else {
            for (let tree of this.trees.iter()) {
                yield* tree.iter_depth_first(key_opt);
            }
        }
    }
    list_keys_depth_first(key_opt = Opt.none()) {
        let output = new List();
        for (let node of this.iter_depth_first(key_opt)) {
            output.push(node.key);
        }
        return output;
    }
    *iter_depth_first_with_level(key_opt = Opt.none(), level = 0) {
        if (key_opt.is_some()) {
            for (let tree of this.trees.iter()) {
                if (tree.contains_key(key_opt.value_unchecked())) {
                    yield* tree.iter_depth_first_with_level(key_opt, level);
                }
            }
        }
        else {
            for (let tree of this.trees.iter()) {
                yield* tree.iter_depth_first_with_level(key_opt, level);
            }
        }
    }
    *iter_depth_first_ordered_with_level(order_fn, key_opt = Opt.none(), level = 0) {
        if (key_opt.is_some()) {
            for (let tree of this.trees.iter()) {
                if (tree.contains_key(key_opt.value_unchecked())) {
                    yield* tree.iter_depth_first_ordered_with_level(order_fn, key_opt, level);
                }
            }
        }
        else {
            let ordered_roots = this
                .trees
                .sort((a, b) => order_fn(a.root.value_unchecked().val, b.root.value_unchecked().val));
            for (let tree of ordered_roots.iter()) {
                yield* tree.iter_depth_first_ordered_with_level(order_fn, key_opt, level);
            }
        }
    }
    list_keys_with_level_depth_first(key_opt = Opt.none()) {
        let output = new List();
        for (let { node, level } of this.iter_depth_first_with_level(key_opt)) {
            output.push({ key: node.key, level });
        }
        return output;
    }
    *iter_predecessors(key) {
        for (let tree of this.trees.iter()) {
            if (tree.contains_key(key)) {
                yield* tree.iter_predecessors(key);
            }
        }
    }
    first_predecessor_such_that(key, test) {
        for (let predecessor of this.iter_predecessors(key)) {
            if (test(predecessor.key, predecessor.val)) {
                return Opt.some(predecessor);
            }
        }
        return Opt.none();
    }
    contains_key(key) {
        return this
            .trees
            .find_first(tree => tree.contains_key(key))
            .is_some();
    }
    get(key) {
        for (let tree of this.trees.iter()) {
            if (tree.contains_key(key)) {
                return tree.get(key);
            }
        }
        return Opt.none();
    }
    set(key, val, parent_key_opt) {
        if (parent_key_opt.is_some()) {
            let parent_key = parent_key_opt.value_unchecked();
            for (let tree of this.trees.iter()) {
                if (tree.contains_key(parent_key)) {
                    tree.set(key, val, parent_key_opt);
                    return;
                }
            }
            throw new Error();
        }
        else {
            let tree = new DictTree(this.id_fn);
            tree.set(key, val, Opt.none());
            this.trees.push(tree);
        }
    }
    remove(key) {
        for (let tree of this.trees.iter()) {
            if (tree.contains_key(key)) {
                // if key is the root key of the tree. remove the tree from our trees array
                let root_key_id = this.id_fn(tree.root.value_unchecked().key);
                let key_id = this.id_fn(key);
                if (root_key_id === key_id) {
                    let root_node = tree.root;
                    this.trees.retain(tree => this.id_fn(tree.root.value_unchecked().key) !== key_id);
                    return root_node;
                }
                // otherwise remove the node from the tree
                return tree.remove(key);
            }
        }
        return Opt.none();
    }
    append(node_tree, parent_key_opt) {
        // if there is a parent, checks if we have it
        if (parent_key_opt.is_some()) {
            let parent_key = parent_key_opt.value_unchecked();
            if (this.contains_key(parent_key) === false) {
                throw new Error();
            }
        }
        // for each node in node_tree, check if its key is already present here
        for (let node of node_tree.iter_depth_first()) {
            if (this.contains_key(node.key)) {
                throw new Error();
            }
        }
        if (parent_key_opt.is_none()) {
            let new_tree = new DictTree(this.id_fn);
            new_tree.append(node_tree, Opt.none());
            this.trees.push(new_tree);
        }
        else {
            let parent_key = parent_key_opt.value_unchecked();
            for (let tree of this.trees.iter()) {
                if (tree.contains_key(parent_key)) {
                    tree.append(node_tree, parent_key_opt);
                }
            }
        }
    }
    change_parent(key, new_parent_opt) {
        if (this.contains_key(key) === false) {
            throw new Error();
        }
        if (new_parent_opt.is_some()) {
            if (this.contains_key(new_parent_opt.value_unchecked()) === false) {
                throw new Error();
            }
        }
        let removed_node = this.remove(key).value_unchecked();
        this.append(removed_node, new_parent_opt);
    }
}

class ImmForest {
    constructor(root_list_fn) {
        this.root_list_fn = root_list_fn;
    }
    root_list() { return this.root_list_fn(); }
    *iter_depth_first() {
        for (let root of this.root_list().iter()) {
            yield* root.iter_depth_first();
        }
    }
    to_list_depth_first() {
        let out = new List();
        for (let node of this.iter_depth_first()) {
            out.push(node);
        }
        return out;
    }
    *iter_depth_first_with_level(level = 0) {
        for (let root of this.root_list().iter()) {
            yield* root.iter_depth_first_with_level(level);
        }
    }
    to_list_depth_first_with_level(level = 0) {
        let out = new List();
        for (let item of this.iter_depth_first_with_level(0)) {
            out.push(item);
        }
        return out;
    }
}

class OrderedDictForest {
    constructor(hash_fn, order_fn) {
        this.hash_fn = hash_fn;
        this.order_fn = order_fn;
        this.roots = new List();
    }
    get(key) {
        for (let tree of this.roots.iter()) {
            let val_opt = tree.get(key);
            if (val_opt.is_some()) {
                return val_opt;
            }
        }
        return Opt.none();
    }
    has_key(k) {
        return this.get(k).is_some();
    }
    set(key, val, parent_key_opt) {
        let current_val_opt = this.get(key);
        if (current_val_opt.is_some()) {
            throw new Error();
        }
        if (parent_key_opt.is_some()) {
            let parent_key = parent_key_opt.value_unchecked();
            for (let tree of this.roots.iter()) {
                if (tree.get(parent_key).is_some()) {
                    tree.set(key, val, parent_key_opt);
                    return;
                }
            }
            throw new Error();
        }
        else {
            let new_tree = new OrderedDictTree(this.hash_fn, this.order_fn);
            new_tree.set(key, val, Opt.none());
            this.roots.push(new_tree);
            this.roots = this.roots.sort((a, b) => this.order_fn(a.get_root().value_unchecked().val, b.get_root().value_unchecked().val));
        }
    }
    replace_value(key, val) {
        let target = this.get(key).value_or_throw();
        target.val = val;
        let parent_opt = target.parent_opt;
        if (parent_opt.is_some()) {
            let parent = parent_opt.value_unchecked();
            parent.children = parent.children.sort((a, b) => this.order_fn(a.val, b.val));
        }
    }
    remove(k) {
        for (let tree of this.roots.iter()) {
            let removed = tree.remove(k);
            if (removed.is_some()) {
                return removed;
            }
        }
        return Opt.none();
    }
    append(node_tree, parent_key_opt) {
        // if there is a parent, checks if we have it
        if (parent_key_opt.is_some()) {
            let parent_key = parent_key_opt.value_unchecked();
            if (this.has_key(parent_key) === false) {
                throw new Error();
            }
        }
        // for each node in node_tree, check if its key is already present here
        for (let node of node_tree.iter_depth_first()) {
            if (this.has_key(node.key)) {
                throw new Error();
            }
        }
        if (parent_key_opt.is_none()) {
            let new_tree = new OrderedDictTree(this.hash_fn, this.order_fn);
            new_tree.append(node_tree, Opt.none());
            this.roots.push(new_tree);
            this.roots = this.roots.sort((a, b) => this.order_fn(a.get_root().value_unchecked().val, b.get_root().value_unchecked().val));
        }
        else {
            let parent_key = parent_key_opt.value_unchecked();
            for (let tree of this.roots.iter()) {
                if (tree.has_key(parent_key)) {
                    tree.append(node_tree, parent_key_opt);
                }
            }
        }
    }
    change_parent(key, new_parent_opt) {
        if (new_parent_opt.is_some()) {
            let key_hash = this.hash_fn(key);
            let parent_hash = this.hash_fn(new_parent_opt.value_unchecked());
            // check if is change to itself
            if (key_hash === parent_hash) {
                return;
            }
            // check if is changing to a child
            let moving_node = this.get(key).value_or_throw();
            for (let child of moving_node.iter_depth_first()) {
                if (this.hash_fn(child.key) === parent_hash) {
                    return;
                }
            }
        }
        if (this.has_key(key) === false) {
            throw new Error();
        }
        if (new_parent_opt.is_some()
            && this.has_key(new_parent_opt.value_unchecked()) === false) {
            throw new Error();
        }
        let removed_node = this.remove(key).value_unchecked();
        this.append(removed_node, new_parent_opt);
    }
    as_imm_forest() {
        return new ImmForest(() => this.roots.map(it => it.as_imm_tree()));
    }
    as_imm_dict() {
        let self = this;
        return new ImmDict(k => this.get(k).map(it => it.val), function* () {
            for (let tree of self.roots.iter()) {
                yield* tree.as_imm_dict().iter_keys();
            }
        });
    }
}

class LikedListNode {
    constructor(value) {
        this.value = value;
        this.previous = Opt.none();
        this.next = Opt.none();
    }
    *iter() {
        yield this.value;
        if (this.next.is_some()) {
            yield* this.next.value_unchecked().iter();
        }
    }
}

class LikedList {
    constructor() {
        this.start = Opt.none();
        this.end = Opt.none();
        this._len = 0;
    }
    len() {
        return this._len;
    }
    clear() {
        this.start = Opt.none();
        this.end = Opt.none();
        this._len = 0;
    }
    push_start(value) {
        let node = new LikedListNode(value);
        if (this._len === 0) {
            this.start = Opt.some(node);
            this.end = Opt.some(node);
        }
        else {
            node.next = this.start;
            this.start.value_unchecked().previous = Opt.some(node);
            this.start = Opt.some(node);
        }
        this._len += 1;
    }
    push_end(value) {
        let node = new LikedListNode(value);
        if (this._len === 0) {
            this.start = Opt.some(node);
            this.end = Opt.some(node);
        }
        else {
            node.previous = this.end;
            this.end.value_unchecked().next = Opt.some(node);
            this.end = Opt.some(node);
        }
        this._len += 1;
    }
    pop_start() {
        if (this._len === 0) {
            return Opt.none();
        }
        else {
            let to_return;
            if (this._len === 1) {
                let value = this.start.value_unchecked().value;
                this.start = Opt.none();
                this.end = Opt.none();
                to_return = Opt.some(value);
            }
            else {
                let value = this.start.value_unchecked().value;
                this.start = this.start.value_unchecked().next;
                to_return = Opt.some(value);
            }
            this._len -= 1;
            return to_return;
        }
    }
    pop_end() {
        if (this._len === 0) {
            return Opt.none();
        }
        else {
            let to_return;
            if (this._len === 1) {
                let value = this.end.value_unchecked().value;
                this.start = Opt.none();
                this.end = Opt.none();
                to_return = Opt.some(value);
            }
            else {
                let value = this.end.value_unchecked().value;
                this.end = this.end.value_unchecked().previous;
                to_return = Opt.some(value);
            }
            this._len -= 1;
            return to_return;
        }
    }
    *iter() {
        if (this.start.is_some()) {
            yield* this.start.value_unchecked().iter();
        }
    }
}

class NumDict {
    constructor() {
        this.inner = {};
    }
    clear(clear_fn) {
        this.for_each((_, val) => clear_fn(val));
        this.inner = {};
    }
    list_keys() {
        return List.of_array(Object.keys(this.inner));
    }
    *iter() {
        for (let key in this.inner) {
            yield this.inner[key];
        }
    }
    list_values() {
        return List.of_array(Object.values(this.inner));
    }
    set(key, t) {
        this.inner[key] = { key: key, val: t };
    }
    remove(key) {
        delete this.inner[key];
    }
    get(key) {
        if (key in this.inner) {
            return Opt.some(this.inner[key].val);
        }
        else {
            return Opt.none();
        }
    }
    get_unchecked(key) {
        return this.inner[key].val;
    }
    contains_key(key) {
        return key in this.inner;
    }
    for_each(action) {
        for (let key in this.inner) {
            let item = this.inner[key];
            action(item.key, item.val);
        }
    }
}

class NumSet {
    constructor() {
        this._inner = new Dict(n => n.toString());
    }
    insert(val) { this._inner.set(val, null); }
    remove(val) { this._inner.remove(val); }
    has(val) { return this._inner.contains_key(val); }
    *iter() {
        for (let item of this._inner.iter()) {
            yield item.key;
        }
    }
}

class NumTreeNode {
    constructor(key) {
        this.key = key;
        this.parent_opt = Opt.none();
        this.children = new List();
    }
    *iter_depth_first() {
        yield this;
        for (let child of this.children.iter()) {
            yield* child.iter_depth_first();
        }
    }
    *iter_depth_first_with_level() {
        yield* this.iter_depth_first_with_level_recursive(0);
    }
    *iter_predecessors() {
        yield this;
        if (this.parent_opt.is_some()) {
            yield* this.parent_opt.value_unchecked().iter_predecessors();
        }
    }
    *iter_depth_first_with_level_recursive(start_level = 0) {
        yield { node: this, level: start_level };
        for (let child of this.children.iter()) {
            yield* child.iter_depth_first_with_level_recursive(start_level + 1);
        }
    }
}

class NumTree {
    constructor() {
        this.root = Opt.none();
        this.node_dict = new NumDict();
    }
    clear() {
        this.root = Opt.none();
        this.node_dict = new NumDict();
    }
    get(key) {
        return this.node_dict.get(key);
    }
    set(key, parent_key_opt) {
        let new_node = new NumTreeNode(key);
        if (parent_key_opt.is_none()) {
            if (this.root.is_some()) {
                throw new Error();
            }
            this.root = Opt.some(new_node);
            this.node_dict.set(key, new_node);
        }
        else {
            // checks if parent exists in the tree
            let parent_key = parent_key_opt.value_unchecked();
            if (this.contains_key(parent_key) === false) {
                throw new Error();
            }
            // sinse it exists insert
            let parent_node = this.get(parent_key).value_unchecked();
            new_node.parent_opt = Opt.some(parent_node);
            parent_node.children.push(new_node);
            this.node_dict.set(key, new_node);
        }
    }
    remove(key) {
        let target_node_opt = this.get(key);
        if (target_node_opt.is_none()) {
            return Opt.none();
        }
        let target_node = target_node_opt.value_unchecked();
        // if there is a parent, remove target node from its children
        if (target_node.parent_opt.is_some()) {
            let parent_node = target_node.parent_opt.value_unchecked();
            parent_node.children.retain(child => child.key !== key);
        }
        // otherwise we are removing the root, so just set it to Opt.none
        else {
            this.root = Opt.none();
        }
        // remove its from internal map
        for (let node of target_node.iter_depth_first()) {
            this.node_dict.remove(node.key);
        }
        return Opt.some(target_node);
    }
    *iter_depth_first(start_key_opt = Opt.none()) {
        if (start_key_opt.is_some()) {
            let key = start_key_opt.value_unchecked();
            yield* this.node_dict.get_unchecked(key).iter_depth_first();
        }
        else {
            if (this.root.is_some()) {
                yield* this.root.value_unchecked().iter_depth_first();
            }
            else {
                return;
            }
        }
    }
    *iter_depth_first_with_level() {
        if (this.root.is_some()) {
            yield* this.root.value_unchecked().iter_depth_first_with_level();
        }
        else {
            return;
        }
    }
    list_keys() {
        return this.node_dict.list_values().map(x => x.key);
    }
    contains_key(key) {
        return this.node_dict.contains_key(key);
    }
}

class NumForest {
    constructor() {
        this.trees = new List();
    }
    clear() {
        for (let tree of this.trees.iter()) {
            tree.clear();
        }
    }
    root_keys() {
        let output = new List();
        for (let tree of this.trees.iter()) {
            output.push(tree.root.value_unchecked().key);
        }
        return output;
    }
    *iter_depth_first() {
        for (let tree of this.trees.iter()) {
            yield* tree.iter_depth_first();
        }
    }
    list_keys_depth_first() {
        let output = new List();
        for (let node of this.iter_depth_first()) {
            output.push(node.key);
        }
        return output;
    }
    *iter_depth_first_with_level() {
        for (let tree of this.trees.iter()) {
            yield* tree.iter_depth_first_with_level();
        }
    }
    list_keys_with_level_depth_first() {
        let output = new List();
        for (let { node, level } of this.iter_depth_first_with_level()) {
            output.push({ key: node.key, level });
        }
        return output;
    }
    contains_key(key) {
        return this
            .trees
            .find_first(tree => tree.contains_key(key))
            .is_some();
    }
    get(key) {
        for (let tree of this.trees.iter()) {
            if (tree.contains_key(key)) {
                return tree.get(key);
            }
        }
        return Opt.none();
    }
    set(key, parent_key_opt) {
        if (parent_key_opt.is_some()) {
            let parent_key = parent_key_opt.value_unchecked();
            for (let tree of this.trees.iter()) {
                if (tree.contains_key(parent_key)) {
                    tree.set(key, parent_key_opt);
                    return;
                }
            }
            throw new Error();
        }
        else {
            let tree = new NumTree();
            tree.set(key, Opt.none());
            this.trees.push(tree);
        }
    }
    remove(key) {
        for (let tree of this.trees.iter()) {
            if (tree.contains_key(key)) {
                return tree.remove(key);
            }
        }
        return Opt.none();
    }
}

class EventPool {
    constructor() {
        this.pool = new LikedList();
    }
    push(event) {
        this.pool.push_end(event);
    }
    consume() {
        return this.pool.pop_start();
    }
    *consume_iter() {
        let ev = this.consume();
        if (ev.is_some()) {
            yield ev.value_unchecked();
            yield* this.consume_iter();
        }
    }
}

class Vec4 {
    constructor(_x, _y, _z, _w) {
        this._x = _x;
        this._y = _y;
        this._z = _z;
        this._w = _w;
    }
    x() { return this._x; }
    y() { return this._y; }
    z() { return this._z; }
    w() { return this._w; }
    static zero() {
        return new Vec4(0.0, 0.0, 0.0, 0.0);
    }
    copy() {
        return new MutVec4(this._x, this._y, this._z, this._w);
    }
}
class MutVec4 extends Vec4 {
    set_x(val) { this._x = val; }
    set_y(val) { this._y = val; }
    set_z(val) { this._z = val; }
    set_w(val) { this._w = val; }
}

class Color {
    constructor(r, g, b, a) {
        this.inner = new Float32Array(4);
        this.inner[0] = r;
        this.inner[1] = g;
        this.inner[2] = b;
        this.inner[3] = a;
    }
    static black() {
        return new Color(0.0, 0.0, 0.0, 1.0);
    }
    static white() {
        return new Color(1.0, 1.0, 1.0, 1.0);
    }
    r() { return this.inner[0]; }
    g() { return this.inner[1]; }
    b() { return this.inner[2]; }
    a() { return this.inner[3]; }
    to_vec4() {
        return new Vec4(this.inner[0], this.inner[1], this.inner[2], this.inner[3]);
    }
}

function exaustive(_) {
    throw new Error();
}

class Tri4 {
    constructor(a, b, c) {
        this.a = a;
        this.b = b;
        this.c = c;
    }
    vertices() {
        return [this.a, this.b, this.c];
    }
}

class Quad4 {
    constructor(a, b, c, d) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
    }
    static repeate(val) {
        return new Quad4(val.copy(), val.copy(), val.copy(), val.copy());
    }
    triangles() {
        return [
            new Tri4(this.a, this.b, this.c),
            new Tri4(this.a, this.c, this.d),
        ];
    }
}

var JsMath;
(function (JsMath) {
    function tol_eq(a, b) {
        return Math.abs(a - b) <= 0.000001;
    }
    JsMath.tol_eq = tol_eq;
    function tol_eq_zero(a) {
        return Math.abs(a) <= 0.000001;
    }
    JsMath.tol_eq_zero = tol_eq_zero;
})(JsMath || (JsMath = {}));

var TriOrientationEnum;
(function (TriOrientationEnum) {
    TriOrientationEnum[TriOrientationEnum["CounterClockwise"] = 0] = "CounterClockwise";
    TriOrientationEnum[TriOrientationEnum["Clockwise"] = 1] = "Clockwise";
    TriOrientationEnum[TriOrientationEnum["Colinear"] = 2] = "Colinear";
})(TriOrientationEnum || (TriOrientationEnum = {}));

class Tri2 {
    constructor(a, b, c) {
        this.a = a;
        this.b = b;
        this.c = c;
    }
    vertices() {
        return [this.a, this.b, this.c];
    }
    contains(vec) {
        let v0 = this.c.sub(this.a);
        let v1 = this.b.sub(this.a);
        let v2 = vec.sub(this.a);
        let dot00 = v0.x * v0.x + v0.y * v0.y;
        let dot01 = v0.x * v1.x + v0.y * v1.y;
        let dot02 = v0.x * v2.x + v0.y * v2.y;
        let dot11 = v1.x * v1.x + v1.y * v1.y;
        let dot12 = v1.x * v2.x + v1.y * v2.y;
        let denom = dot00 * dot11 - dot01 * dot01;
        if (JsMath.tol_eq_zero(denom)) {
            return false; // Triangle is degenerate
        }
        else {
            let u = (dot11 * dot02 - dot01 * dot12) / denom;
            let v = (dot00 * dot12 - dot01 * dot02) / denom;
            return (u >= 0.0) && (v >= 0.0) && (u + v <= 1.0);
        }
    }
    orientation() {
        let x1 = this.a.x;
        let y1 = this.a.y;
        let x2 = this.b.x;
        let y2 = this.b.y;
        let x3 = this.c.x;
        let y3 = this.c.y;
        let det = (x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1);
        if (JsMath.tol_eq_zero(det)) {
            return TriOrientationEnum.Colinear;
        }
        else if (det > 0.0) {
            return TriOrientationEnum.CounterClockwise;
        }
        else {
            return TriOrientationEnum.Clockwise;
        }
    }
}

class Quad2 {
    constructor(a, b, c, d) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
    }
    to_quad_4(vertex_fn) {
        return new Quad4(vertex_fn(this.a), vertex_fn(this.b), vertex_fn(this.c), vertex_fn(this.d));
    }
    to_quad_4_zw(z, w) {
        return new Quad4(new Vec4(this.a.x, this.a.y, z, w), new Vec4(this.b.x, this.b.y, z, w), new Vec4(this.c.x, this.c.y, z, w), new Vec4(this.d.x, this.d.y, z, w));
    }
    triangles() {
        return [
            new Tri2(this.a, this.b, this.c),
            new Tri2(this.a, this.c, this.d),
        ];
    }
}

class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    static zero() {
        return new Vec2(0.0, 0.0);
    }
    static parse_obj(obj) {
        return new Vec2(obj.x, obj.y);
    }
    to_json() {
        return JSON.stringify(this);
    }
    min(other) {
        let x = Math.min(this.x, other.x);
        let y = Math.min(this.y, other.y);
        return new Vec2(x, y);
    }
    max(other) {
        let x = Math.max(this.x, other.x);
        let y = Math.max(this.y, other.y);
        return new Vec2(x, y);
    }
    add_scalar(x, y) {
        return new Vec2(this.x + x, this.y + y);
    }
    add(other) {
        return this.add_scalar(other.x, other.y);
    }
    sub(other) {
        return new Vec2(this.x - other.x, this.y - other.y);
    }
    mul(other) {
        return new Vec2(this.x * other.x, this.y * other.y);
    }
    mul_scalar(scalar) {
        return new Vec2(scalar * this.x, scalar * this.y);
    }
    div(other) {
        return new Vec2(this.x / other.x, this.y / other.y);
    }
    delta_to(other) {
        return other.sub(this);
    }
    flip_y() {
        return new Vec2(this.x, -this.y);
    }
    dot(other) {
        return (this.x * other.x) + (this.y * other.y);
    }
    norm() {
        return Math.sqrt(this.dot(this));
    }
    distance_to(other) {
        return this.delta_to(other).norm();
    }
    radians() {
        return Math.atan2(this.x, this.y);
    }
}

class Dim2 {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
    static unit() {
        return new Dim2(1.0, 1.0);
    }
    static zero() {
        return new Dim2(0.0, 0.0);
    }
    to_vec2() {
        return new Vec2(this.width, this.height);
    }
    mul_scalar(factor) {
        return new Dim2(factor * this.width, factor * this.height);
    }
    scale_to_contain(other) {
        let width_factor = other.width / this.width;
        let height_factor = other.height / this.height;
        let factor = Math.max(width_factor, height_factor);
        return this.mul_scalar(factor);
    }
    scale_to_fit(other) {
        let width_factor = other.width / this.width;
        let height_factor = other.height / this.height;
        let factor = Math.min(width_factor, height_factor);
        return this.mul_scalar(factor);
    }
}

class AlRect2 {
    constructor(center, width, height) {
        this.center = center;
        this.width = width;
        this.height = height;
    }
    static zero() {
        return new AlRect2(Vec2.zero(), 0.0, 0.0);
    }
    static unit() {
        return new AlRect2(Vec2.zero(), 1.0, 1.0);
    }
    static parse_obj(obj) {
        return new AlRect2(Vec2.parse_obj(obj.center), obj.width, obj.height);
    }
    static corner_at(corner, pos, width, height) {
        let shift_from_center = corner.shift_from_center(width, height);
        let center = pos.sub(shift_from_center);
        return new AlRect2(center, width, height);
    }
    static bl_at(pos, width, height) {
        let center = pos.add_scalar(0.5 * width, 0.5 * height);
        return new AlRect2(center, width, height);
    }
    static from_opposing_points(a, b) {
        let min_point = a.min(b);
        let max_point = a.max(b);
        let center = min_point.add(max_point).mul_scalar(0.5);
        return new AlRect2(center, max_point.x - min_point.x, max_point.y - min_point.y);
    }
    to_json() {
        return JSON.stringify(this);
    }
    to_quad_2() {
        let vertices = this.vertices();
        return new Quad2(vertices[0], vertices[1], vertices[2], vertices[3]);
    }
    contains(vec) {
        let delta = this.center.delta_to(vec);
        return -0.5 * this.width <= delta.x && delta.x <= 0.5 * this.width
            && -0.5 * this.height <= delta.y && delta.y <= 0.5 * this.height;
    }
    dim() {
        return new Dim2(this.width, this.height);
    }
    vertex(corner) {
        let shift = Vec2.zero();
        switch (corner.tag) {
            case "Bl": {
                shift = new Vec2(-0.5 * this.width, -0.5 * this.height);
                break;
            }
            case "Br": {
                shift = new Vec2(0.5 * this.width, -0.5 * this.height);
                break;
            }
            case "Tr": {
                shift = new Vec2(0.5 * this.width, 0.5 * this.height);
                break;
            }
            case "Tl": {
                shift = new Vec2(-0.5 * this.width, 0.5 * this.height);
                break;
            }
            default:
                exaustive(corner.tag);
        }
        return this.center.add(shift);
    }
    vertices() {
        return [
            this.center.add(new Vec2(-0.5 * this.width, -0.5 * this.height)),
            this.center.add(new Vec2(0.5 * this.width, -0.5 * this.height)),
            this.center.add(new Vec2(0.5 * this.width, 0.5 * this.height)),
            this.center.add(new Vec2(-0.5 * this.width, 0.5 * this.height)),
        ];
    }
}

class Rect2 {
    constructor(center, width, height, rotation_rad) {
        this.center = center;
        this.width = width;
        this.height = height;
        this.rotation_rad = rotation_rad;
    }
    static dft() {
        return new Rect2(Vec2.zero(), 1.0, 1.0, 0.0);
    }
}

class LineSeg2 {
    constructor(a, b) {
        this.a = a;
        this.b = b;
    }
    direction() {
        return this.a.delta_to(this.b);
    }
    center() {
        return this.a
            .add(this.b)
            .mul_scalar(0.5);
    }
    to_rect(thickness) {
        let center = this.a.add(this.b).mul_scalar(0.5);
        let direction = this.direction();
        return new Rect2(center, direction.norm(), thickness, direction.radians());
    }
}

class RectCorner {
    constructor(tag) {
        this.tag = tag;
    }
    shift_from_center(width, height) {
        switch (this.tag) {
            case "Bl": return new Vec2(-0.5 * width, -0.5 * height);
            case "Br": return new Vec2(0.5 * width, -0.5 * height);
            case "Tr": return new Vec2(0.5 * width, 0.5 * height);
            case "Tl": return new Vec2(-0.5 * width, 0.5 * height);
            default: exaustive(this.tag);
        }
    }
}
(function (RectCorner) {
    const Tags = {
        'Bl': null,
        'Br': null,
        'Tr': null,
        'Tl': null,
    };
    function list_all() {
        let output = new List();
        for (let key in Tags) {
            let enum_val = new RectCorner(key);
            output.push(enum_val);
        }
        return output;
    }
    RectCorner.list_all = list_all;
})(RectCorner);

class Mat22 {
    constructor(a, b, c, d) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
    }
    static zero() {
        return new Mat22(0.0, 0.0, 0.0, 0.0);
    }
}

var Radians;
(function (Radians) {
    function normalize(rad) {
        const TWO_PI = Math.PI * 2;
        return ((rad % TWO_PI) + TWO_PI) % TWO_PI;
    }
    Radians.normalize = normalize;
    function rotation_mat22(rad) {
        let cos = Math.cos(rad);
        let sin = Math.sin(rad);
        return new Mat22(cos, -sin, sin, cos);
    }
    Radians.rotation_mat22 = rotation_mat22;
})(Radians || (Radians = {}));

var HashGen;
(function (HashGen) {
    function gen(size) {
        const chars = "abcdefghijklmnopqrstuvwxyz";
        let result = "";
        for (let i = 0; i < size; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    HashGen.gen = gen;
})(HashGen || (HashGen = {}));

class IdGen {
    constructor() {
        this.counter = 999; // THIS START AT 999 SO THAT VALUES FROM 0 TO 999 ARE AVAILABLE FOR USE
    }
    next() {
        this.counter += 1;
        return this.counter;
    }
}

function console_log_json(val) {
    console.log(JSON.stringify(val, null, 2));
}

class Res {
    constructor(_success, _error, _is_error) {
        this._success = _success;
        this._error = _error;
        this._is_error = _is_error;
    }
    static ok(s) {
        return new Res(s, null, false);
    }
    static error(e) {
        return new Res(null, e, true);
    }
    is_ok() {
        return this._is_error === false;
    }
    is_error() {
        return this._is_error;
    }
    unwrap_ok() {
        if (this.is_error()) {
            throw new Error();
        }
        return this._success;
    }
    unwrap_error() {
        if (this.is_ok()) {
            throw new Error();
        }
        return this._error;
    }
}

export { AlRect2, Color, Dict, DictForest, DictTree, DictTreeNode, Dim2, EventPool, HashGen, HashSet, IdGen, ImmDict, ImmForest, ImmTree, ImmTreeNode, JsMath, LikedList, LikedListNode, LineSeg2, List, Mat22, MutVec4, NumDict, NumForest, NumSet, NumTree, NumTreeNode, Opt, OrderedDictForest, OrderedDictTree, Quad2, Quad4, Radians, Rect2, RectCorner, Res, StrDict, StrSet, Tri2, Tri4, TriOrientationEnum, Vec2, Vec4, console_log_json, exaustive };
