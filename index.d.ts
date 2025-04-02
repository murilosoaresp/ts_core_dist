declare class Opt<T> {
    private readonly val;
    private readonly _is_some;
    private constructor();
    static none<T>(): Opt<T>;
    static some<T>(val: T): Opt<T>;
    static of_value_or_null<T>(val: T | null): Opt<T>;
    eq(other: Opt<T>, cmp: (a: T, b: T) => boolean): boolean;
    unwrap(): T | null;
    value_or_throw(): T;
    value_unchecked(): T;
    is_some(): boolean;
    is_none(): boolean;
    if_some<G>(fn: (t: T) => G): Opt<G>;
    if_some_async(fn: (t: T) => Promise<void>): Promise<void>;
    if_none(fn: () => void): void;
    value_or(t_or: T): T;
    map<G>(fn: (t: T) => G): Opt<G>;
    do_switch<G>(some_fn: (t: T) => G, none_fn: () => G): G;
}

type Prm<T> = Promise<T>;

declare class HashSet<T> {
    private inner;
    private hash_fn;
    constructor(hash_fn: (t: T) => string);
    clear(clear_fn: (t: T) => void): void;
    to_list(): List<T>;
    iter(): Generator<T>;
    add(t: T): void;
    remove(t: T): void;
    has(t: T): boolean;
}

declare class StrSet {
    private _inner;
    constructor();
    clear(): void;
    insert(value: string): void;
    remove(value: string): void;
    to_list(): List<string>;
    contains(value: string): boolean;
}

interface ImmList<T> {
    length(): number;
    get(idx: number): Opt<T>;
    get_unchecked(idx: number): T;
    for_each(action: (t: T, idx: number) => void): void;
    for_each_until(break_fn: (t: T, idx: number) => Boolean): void;
    find_first(find_fn: (t: T, idx: number) => boolean): Opt<{
        val: T;
        idx: number;
    }>;
    map<G>(map_fn: (t: T, idx: number) => G): List<G>;
    filter(filter_fn: (t: T, idx: number) => boolean): List<T>;
    retain(filter_fn: (t: T, idx: number) => boolean): void;
    filter_map<G>(filter_mp_fn: (t: T, idx: number) => Opt<G>): List<G>;
    collect<C>(c: C, collect_fn: (c: C, t: T, idx: number) => void): C;
    sort(sort_fn: (a: T, b: T) => number): List<T>;
    sort_by_string(string_fn: (t: T) => string): List<T>;
    to_hash_set(hash_fn: (t: T) => string): HashSet<T>;
    to_str_set(hash_fn: (t: T) => string): StrSet;
    to_dict<K>(key_fn: (t: T) => K, hash_fn: (k: K) => string): Dict<K, T>;
    iter(): Generator<T>;
}
interface MutList<T> extends ImmList<T> {
    set(idx: number, val: T): void;
    push(val: T): void;
    pop(): Opt<T>;
}
declare class List<T> implements MutList<T> {
    array: T[];
    constructor(...values: T[]);
    static of_array<T>(array: T[]): List<T>;
    set(idx: number, val: T): void;
    push(val: T): void;
    pop(): Opt<T>;
    length(): number;
    get(idx: number): Opt<T>;
    get_unchecked(idx: number): T;
    for_each(action: (t: T, idx: number) => void): void;
    for_each_async(action: (t: T, idx: number) => Prm<void>): Prm<void>;
    for_each_until(action_break_fn: (t: T, idx: number) => boolean): void;
    find_first(find_fn: (t: T, idx: number) => boolean): Opt<{
        val: T;
        idx: number;
    }>;
    map<G>(map_fn: (t: T, idx: number) => G): List<G>;
    filter(filter_fn: (t: T, idx: number) => boolean): List<T>;
    retain(filter_fn: (t: T, idx: number) => boolean): void;
    filter_map<G>(filter_mp_fn: (t: T, idx: number) => Opt<G>): List<G>;
    collect<C>(c: C, map_collect_fn: (c: C, t: T, idx: number) => void): C;
    to_hash_set(hash_fn: (t: T) => string): HashSet<T>;
    to_str_set(hash_fn: (t: T) => string): StrSet;
    to_dict<K>(key_fn: (t: T) => K, hash_fn: (k: K) => string): Dict<K, T>;
    sort(sort_fn: (a: T, b: T) => number): List<T>;
    sort_by_string(string_fn: (t: T) => string): List<T>;
    iter(): Generator<T>;
}
declare namespace List {
    function await_all<T>(prm_list: List<Prm<T>>): Prm<List<T>>;
}

declare class ImmDict<K, V> {
    private get_fn;
    private iter_keys_fn;
    constructor(get_fn: (k: K) => Opt<V>, iter_keys_fn: () => Generator<K>);
    get(k: K): Opt<V>;
    iter_keys(): Generator<K>;
    get_unchecked(key: K): V;
    has_key(k: K): boolean;
    list_keys(): List<K>;
    iter_entries(): Generator<{
        key: K;
        val: V;
    }>;
    to_list(): List<{
        key: K;
        val: V;
    }>;
    iter_values(): Generator<V>;
    for_each(action: (key: K, val: V) => void): void;
}

declare class Dict<K, V> {
    private inner;
    private id_fn;
    constructor(id_fn: (k: K) => string);
    as_imm_dict(): ImmDict<K, V>;
    set(key: K, t: V): void;
    remove(key: K): void;
    get(key: K): Opt<V>;
    get_unchecked(key: K): V;
    contains_key(key: K): boolean;
    list_keys(): List<K>;
    list_entries(): List<{
        key: K;
        val: V;
    }>;
    iter(): Generator<{
        key: K;
        val: V;
    }>;
    iter_keys(): Generator<K>;
    iter_values(): Generator<V>;
    for_each(action_fn: (key: K, val: V) => void): void;
    retain(filter: (k: K, v: V) => boolean): void;
}

declare class StrDict<T> {
    inner: Record<string, T | undefined>;
    constructor();
    clear(clear_fn: (t: T) => void): void;
    list_keys(): List<string>;
    iter(): Generator<{
        key: string;
        val: T;
    }>;
    list_values(): List<T>;
    set(key: string, t: T): void;
    remove(key: string): void;
    get(key: string): Opt<T>;
    get_unchecked(key: string): T;
    contains_key(key: string): boolean;
    for_each(action: (key: string, val: T) => void): void;
}

declare class ImmTreeNode<T> {
    private value_fn;
    private parent_opt_fn;
    private children_fn;
    constructor(value_fn: () => T, parent_opt_fn: () => Opt<ImmTreeNode<T>>, children_fn: () => ImmList<ImmTreeNode<T>>);
    value(): T;
    parent_opt(): Opt<ImmTreeNode<T>>;
    children(): ImmList<ImmTreeNode<T>>;
    iter_depth_first(): Generator<ImmTreeNode<T>>;
    list_depth_first(): List<ImmTreeNode<T>>;
    iter_depth_first_with_level(level?: number): Generator<{
        node: ImmTreeNode<T>;
        level: number;
    }>;
    list_depth_first_with_level(level?: number): List<{
        node: ImmTreeNode<T>;
        level: number;
    }>;
    first_predecessor_such_that(test: (t: T) => boolean): Opt<ImmTreeNode<T>>;
}

declare class DictTreeNode<Key, Val> {
    key: Key;
    val: Val;
    parent_opt: Opt<DictTreeNode<Key, Val>>;
    children: List<DictTreeNode<Key, Val>>;
    constructor(key: Key, val: Val);
    as_imm_tree_node(): ImmTreeNode<Val>;
    iter_depth_first(): Generator<DictTreeNode<Key, Val>>;
    iter_depth_first_with_level(level?: number): Generator<{
        node: DictTreeNode<Key, Val>;
        level: number;
    }>;
    iter_depth_first_ordered_with_level(order_fn: (a: Val, b: Val) => number, level?: number): Generator<{
        node: DictTreeNode<Key, Val>;
        level: number;
    }>;
    iter_predecessors(): Generator<DictTreeNode<Key, Val>>;
}

declare class DictTree<Key, Val> {
    private id_fn;
    root: Opt<DictTreeNode<Key, Val>>;
    node_map: StrDict<DictTreeNode<Key, Val>>;
    constructor(hash_fn: (key: Key) => string);
    clear(clear_fn: (key: Key, val: Val) => void): void;
    iter_depth_first(key_opt?: Opt<Key>): Generator<DictTreeNode<Key, Val>, void, any>;
    iter_depth_first_with_level(key_opt?: Opt<Key>, level?: number): Generator<{
        node: DictTreeNode<Key, Val>;
        level: number;
    }>;
    iter_depth_first_ordered_with_level(order_fn: (a: Val, b: Val) => number, key_opt?: Opt<Key>, level?: number): Generator<{
        node: DictTreeNode<Key, Val>;
        level: number;
    }>;
    iter_predecessors(key: Key): Generator<DictTreeNode<Key, Val>, void, any>;
    list_keys(): List<Key>;
    contains_key(key: Key): boolean;
    get(key: Key): Opt<DictTreeNode<Key, Val>>;
    set(key: Key, val: Val, parent_key_opt: Opt<Key>): void;
    append(tree_node: DictTreeNode<Key, Val>, parent_key_opt: Opt<Key>): void;
    remove(key: Key): Opt<DictTreeNode<Key, Val>>;
}

type DictTreeItem<Key, Val> = {
    val: Val;
    parent_opt: Opt<Key>;
    children: List<Key>;
};

declare class ImmTree<T> {
    private root_fn;
    constructor(root_fn: () => Opt<ImmTreeNode<T>>);
    root(): Opt<ImmTreeNode<T>>;
    iter_depth_first(): Generator<ImmTreeNode<T>>;
    iter_depth_first_with_level(level?: number): Generator<{
        node: ImmTreeNode<T>;
        level: number;
    }>;
}

declare class OrderedDictTree<K, V> {
    private hash_fn;
    private order_fn;
    private root;
    private node_map;
    constructor(hash_fn: (k: K) => string, order_fn: (a: V, b: V) => number);
    get_root(): Opt<DictTreeNode<K, V>>;
    get(key: K): Opt<DictTreeNode<K, V>>;
    has_key(k: K): boolean;
    set(key: K, val: V, parent_key_opt: Opt<K>): void;
    append(tree_node: DictTreeNode<K, V>, parent_key_opt: Opt<K>): void;
    remove(key: K): Opt<DictTreeNode<K, V>>;
    as_imm_tree(): ImmTree<V>;
    as_imm_dict(): ImmDict<K, V>;
}

declare class DictForest<Key, Val> {
    private id_fn;
    private trees;
    constructor(id_fn: (key: Key) => string);
    clear(clear_fn: (key: Key, val: Val) => void): void;
    root_keys(): List<Key>;
    iter_depth_first(key_opt?: Opt<Key>): Generator<DictTreeNode<Key, Val>, void, any>;
    list_keys_depth_first(key_opt?: Opt<Key>): List<Key>;
    iter_depth_first_with_level(key_opt?: Opt<Key>, level?: number): Generator<{
        node: DictTreeNode<Key, Val>;
        level: number;
    }>;
    iter_depth_first_ordered_with_level(order_fn: (a: Val, b: Val) => number, key_opt?: Opt<Key>, level?: number): Generator<{
        node: DictTreeNode<Key, Val>;
        level: number;
    }, void, any>;
    list_keys_with_level_depth_first(key_opt?: Opt<Key>): List<{
        key: Key;
        level: number;
    }>;
    iter_predecessors(key: Key): Generator<DictTreeNode<Key, Val>, void, any>;
    first_predecessor_such_that(key: Key, test: (key: Key, val: Val) => boolean): Opt<DictTreeNode<Key, Val>>;
    contains_key(key: Key): boolean;
    get(key: Key): Opt<DictTreeNode<Key, Val>>;
    set(key: Key, val: Val, parent_key_opt: Opt<Key>): void;
    remove(key: Key): Opt<DictTreeNode<Key, Val>>;
    append(node_tree: DictTreeNode<Key, Val>, parent_key_opt: Opt<Key>): void;
    change_parent(key: Key, new_parent_opt: Opt<Key>): void;
}

declare class ImmForest<T> {
    private root_list_fn;
    constructor(root_list_fn: () => ImmList<ImmTree<T>>);
    root_list(): ImmList<ImmTree<T>>;
    iter_depth_first(): Generator<ImmTreeNode<T>>;
    to_list_depth_first(): List<ImmTreeNode<T>>;
    iter_depth_first_with_level(level?: number): Generator<{
        node: ImmTreeNode<T>;
        level: number;
    }>;
    to_list_depth_first_with_level(level?: number): List<{
        node: ImmTreeNode<T>;
        level: number;
    }>;
}

declare class OrderedDictForest<K, V> {
    private hash_fn;
    private order_fn;
    private roots;
    constructor(hash_fn: (k: K) => string, order_fn: (a: V, b: V) => number);
    get(key: K): Opt<DictTreeNode<K, V>>;
    has_key(k: K): boolean;
    set(key: K, val: V, parent_key_opt: Opt<K>): void;
    replace_value(key: K, val: V): void;
    remove(k: K): Opt<DictTreeNode<K, V>>;
    append(node_tree: DictTreeNode<K, V>, parent_key_opt: Opt<K>): void;
    change_parent(key: K, new_parent_opt: Opt<K>): void;
    as_imm_forest(): ImmForest<V>;
    as_imm_dict(): ImmDict<K, V>;
}

declare class LikedListNode<T> {
    value: T;
    previous: Opt<LikedListNode<T>>;
    next: Opt<LikedListNode<T>>;
    constructor(value: T);
    iter(): Generator<T>;
}

declare class LikedList<T> {
    start: Opt<LikedListNode<T>>;
    end: Opt<LikedListNode<T>>;
    private _len;
    constructor();
    len(): number;
    clear(): void;
    push_start(value: T): void;
    push_end(value: T): void;
    pop_start(): Opt<T>;
    pop_end(): Opt<T>;
    iter(): Generator<T>;
}

declare class NumDict<T> {
    inner: Record<string, {
        key: number;
        val: T;
    } | undefined>;
    constructor();
    clear(clear_fn: (t: T) => void): void;
    list_keys(): List<string>;
    iter(): Generator<{
        key: number;
        val: T;
    }>;
    list_values(): List<T>;
    set(key: number, t: T): void;
    remove(key: number): void;
    get(key: number): Opt<T>;
    get_unchecked(key: number): T;
    contains_key(key: number): boolean;
    for_each(action: (key: number, val: T) => void): void;
}

declare class NumSet {
    private _inner;
    constructor();
    insert(val: number): void;
    remove(val: number): void;
    has(val: number): boolean;
    iter(): Generator<number>;
}

declare class NumTreeNode {
    key: number;
    parent_opt: Opt<NumTreeNode>;
    children: List<NumTreeNode>;
    constructor(key: number);
    iter_depth_first(): Generator<NumTreeNode>;
    iter_depth_first_with_level(): Generator<{
        node: NumTreeNode;
        level: number;
    }>;
    iter_predecessors(): Generator<NumTreeNode>;
    private iter_depth_first_with_level_recursive;
}

declare class NumForest {
    private trees;
    constructor();
    clear(): void;
    root_keys(): List<number>;
    iter_depth_first(): Generator<NumTreeNode, void, any>;
    list_keys_depth_first(): List<number>;
    iter_depth_first_with_level(): Generator<{
        node: NumTreeNode;
        level: number;
    }>;
    list_keys_with_level_depth_first(): List<{
        key: number;
        level: number;
    }>;
    contains_key(key: number): boolean;
    get(key: number): Opt<NumTreeNode>;
    set(key: number, parent_key_opt: Opt<number>): void;
    remove(key: number): Opt<NumTreeNode>;
}

declare class NumTree {
    root: Opt<NumTreeNode>;
    node_dict: NumDict<NumTreeNode>;
    constructor();
    clear(): void;
    get(key: number): Opt<NumTreeNode>;
    set(key: number, parent_key_opt: Opt<number>): void;
    remove(key: number): Opt<NumTreeNode>;
    iter_depth_first(start_key_opt?: Opt<number>): Generator<NumTreeNode, void, any>;
    iter_depth_first_with_level(): Generator<{
        node: NumTreeNode;
        level: number;
    }>;
    list_keys(): List<number>;
    contains_key(key: number): boolean;
}

declare class EventPool<E> {
    private pool;
    constructor();
    push(event: E): void;
    consume(): Opt<E>;
    consume_iter(): Generator<E>;
}

declare class Vec4 {
    protected _x: number;
    protected _y: number;
    protected _z: number;
    protected _w: number;
    constructor(_x: number, _y: number, _z: number, _w: number);
    x(): number;
    y(): number;
    z(): number;
    w(): number;
    static zero(): Vec4;
    copy(): MutVec4;
}
declare class MutVec4 extends Vec4 {
    set_x(val: number): void;
    set_y(val: number): void;
    set_z(val: number): void;
    set_w(val: number): void;
}

declare class Color {
    inner: Float32Array;
    constructor(r: number, g: number, b: number, a: number);
    static black(): Color;
    static white(): Color;
    r(): number;
    g(): number;
    b(): number;
    a(): number;
    to_vec4(): Vec4;
}

declare class Vec2 {
    readonly x: number;
    readonly y: number;
    constructor(x: number, y: number);
    static zero(): Vec2;
    static parse_obj(obj: any): Vec2;
    to_json(): string;
    min(other: Vec2): Vec2;
    max(other: Vec2): Vec2;
    add_scalar(x: number, y: number): Vec2;
    add(other: Vec2): Vec2;
    sub(other: Vec2): Vec2;
    mul(other: Vec2): Vec2;
    mul_scalar(scalar: number): Vec2;
    div(other: Vec2): Vec2;
    delta_to(other: Vec2): Vec2;
    flip_y(): Vec2;
    dot(other: Vec2): number;
    norm(): number;
    distance_to(other: Vec2): number;
    radians(): number;
}

declare class Tri4 {
    readonly a: Vec4;
    readonly b: Vec4;
    readonly c: Vec4;
    constructor(a: Vec4, b: Vec4, c: Vec4);
    vertices(): [Vec4, Vec4, Vec4];
}

declare class Quad4 {
    readonly a: Vec4;
    readonly b: Vec4;
    readonly c: Vec4;
    readonly d: Vec4;
    constructor(a: Vec4, b: Vec4, c: Vec4, d: Vec4);
    static repeate(val: Vec4): Quad4;
    triangles(): [Tri4, Tri4];
}

declare enum TriOrientationEnum {
    CounterClockwise = 0,
    Clockwise = 1,
    Colinear = 2
}

declare class Tri2 {
    readonly a: Vec2;
    readonly b: Vec2;
    readonly c: Vec2;
    constructor(a: Vec2, b: Vec2, c: Vec2);
    vertices(): [Vec2, Vec2, Vec2];
    contains(vec: Vec2): boolean;
    orientation(): TriOrientationEnum;
}

declare class Quad2 {
    readonly a: Vec2;
    readonly b: Vec2;
    readonly c: Vec2;
    readonly d: Vec2;
    constructor(a: Vec2, b: Vec2, c: Vec2, d: Vec2);
    to_quad_4(vertex_fn: (v: Vec2) => Vec4): Quad4;
    to_quad_4_zw(z: number, w: number): Quad4;
    triangles(): [Tri2, Tri2];
}

declare class Dim2 {
    readonly width: number;
    readonly height: number;
    constructor(width: number, height: number);
    static unit(): Dim2;
    static zero(): Dim2;
    to_vec2(): Vec2;
    mul_scalar(factor: number): Dim2;
    scale_to_contain(other: Dim2): Dim2;
    scale_to_fit(other: Dim2): Dim2;
}

declare class RectCorner {
    readonly tag: RectCorner.Tag;
    constructor(tag: RectCorner.Tag);
    shift_from_center(width: number, height: number): Vec2;
}
declare namespace RectCorner {
    const Tags: {
        readonly Bl: null;
        readonly Br: null;
        readonly Tr: null;
        readonly Tl: null;
    };
    export type Tag = keyof typeof Tags;
    export function list_all(): List<RectCorner>;
    export {  };
}

declare class AlRect2 {
    readonly center: Vec2;
    readonly width: number;
    readonly height: number;
    constructor(center: Vec2, width: number, height: number);
    static zero(): AlRect2;
    static unit(): AlRect2;
    static parse_obj(obj: any): AlRect2;
    static corner_at(corner: RectCorner, pos: Vec2, width: number, height: number): AlRect2;
    static bl_at(pos: Vec2, width: number, height: number): AlRect2;
    static from_opposing_points(a: Vec2, b: Vec2): AlRect2;
    to_json(): string;
    to_quad_2(): Quad2;
    contains(vec: Vec2): boolean;
    dim(): Dim2;
    vertex(corner: RectCorner): Vec2;
    vertices(): [Vec2, Vec2, Vec2, Vec2];
}

declare class Rect2 {
    readonly center: Vec2;
    readonly width: number;
    readonly height: number;
    readonly rotation_rad: number;
    constructor(center: Vec2, width: number, height: number, rotation_rad: number);
    static dft(): Rect2;
}

declare class LineSeg2 {
    a: Vec2;
    b: Vec2;
    constructor(a: Vec2, b: Vec2);
    direction(): Vec2;
    center(): Vec2;
    to_rect(thickness: number): Rect2;
}

declare namespace JsMath {
    function tol_eq(a: number, b: number): boolean;
    function tol_eq_zero(a: number): boolean;
}

declare class Mat22 {
    readonly a: number;
    readonly b: number;
    readonly c: number;
    readonly d: number;
    constructor(a: number, b: number, c: number, d: number);
    static zero(): Mat22;
}

declare namespace Radians {
    function normalize(rad: number): number;
    function rotation_mat22(rad: number): Mat22;
}

declare function exaustive(_: never): never;

declare namespace HashGen {
    function gen(size: number): string;
}

declare class IdGen {
    counter: number;
    constructor();
    next(): number;
}

declare function console_log_json(val: any): void;

declare class Res<S, E> {
    private _success;
    private _error;
    private _is_error;
    private constructor();
    static ok<S, E>(s: S): Res<S, E>;
    static error<S, E>(e: E): Res<S, E>;
    is_ok(): boolean;
    is_error(): boolean;
    unwrap_ok(): S;
    unwrap_error(): E;
}

export { AlRect2, Color, Dict, DictForest, DictTree, type DictTreeItem, DictTreeNode, Dim2, EventPool, HashGen, HashSet, IdGen, ImmDict, ImmForest, type ImmList, ImmTree, ImmTreeNode, JsMath, LikedList, LikedListNode, LineSeg2, List, Mat22, type MutList, MutVec4, NumDict, NumForest, NumSet, NumTree, NumTreeNode, Opt, OrderedDictForest, OrderedDictTree, type Prm, Quad2, Quad4, Radians, Rect2, RectCorner, Res, StrDict, StrSet, Tri2, Tri4, TriOrientationEnum, Vec2, Vec4, console_log_json, exaustive };
