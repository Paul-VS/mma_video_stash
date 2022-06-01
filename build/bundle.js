
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.47.0' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const defaultVideos = 
    [
      {
        "title": "Lomachenko's jab",
        "position": "Standing",
        "url": "https://www.youtube.com/embed/k6s62WOT7XA",
        "notes": "this is an example standing video"
      },
      {
        "title": "Dan Henderson clinch",
        "position": "Clinch",
        "url": "https://www.youtube.com/embed/dzkGSxvvvaI",
        "notes": "this is an example clinch video" 
      },
      {
        "title": "Demian Maia guard study",
        "position": "Guard",
        "url": "https://www.youtube.com/embed/qu_ulU7nE-0",
        "notes": "this is an example guard video"
      },
      {
        "title": "Cage pin and control",
        "position": "Fence",
        "url": "https://www.youtube.com/embed/C-q6NYWPAVk",
        "notes": "this is an example fence video"
      },
      {
        "title": "Turtle escapes and concepts",
        "position": "Turtle",
        "url": "https://www.youtube.com/embed/DbSWNZwEFqo",
        "notes": "this is an example turtle video"
      }
    ];

    const currentPosition = writable("Home");
    const previousPosition = writable("Home");

    const videos = writable(JSON.parse(localStorage.getItem("videos")) || defaultVideos);
    videos.subscribe(val => localStorage.setItem("videos", JSON.stringify(val)));

    /* src/Navbar.svelte generated by Svelte v3.47.0 */
    const file$5 = "src/Navbar.svelte";

    function create_fragment$5(ctx) {
    	let div;
    	let a;
    	let t1;
    	let svg;
    	let path0;
    	let path1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			a.textContent = "MMA VIDEO STASH";
    			t1 = space();
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr_dev(a, "href", "#home");
    			attr_dev(a, "class", "title svelte-y5zful");
    			add_location(a, file$5, 15, 4, 337);
    			attr_dev(path0, "d", "M0 0h48v48h-48z");
    			attr_dev(path0, "fill", "none");
    			add_location(path0, file$5, 17, 6, 541);
    			attr_dev(path1, "fill", "dimgrey");
    			attr_dev(path1, "d", "M38.86 25.95c.08-.64.14-1.29.14-1.95s-.06-1.31-.14-1.95l4.23-3.31c.38-.3.49-.84.24-1.28l-4-6.93c-.25-.43-.77-.61-1.22-.43l-4.98 2.01c-1.03-.79-2.16-1.46-3.38-1.97l-.75-5.3c-.09-.47-.5-.84-1-.84h-8c-.5 0-.91.37-.99.84l-.75 5.3c-1.22.51-2.35 1.17-3.38 1.97l-4.98-2.01c-.45-.17-.97 0-1.22.43l-4 6.93c-.25.43-.14.97.24 1.28l4.22 3.31c-.08.64-.14 1.29-.14 1.95s.06 1.31.14 1.95l-4.22 3.31c-.38.3-.49.84-.24 1.28l4 6.93c.25.43.77.61 1.22.43l4.98-2.01c1.03.79 2.16 1.46 3.38 1.97l.75 5.3c.08.47.49.84.99.84h8c.5 0 .91-.37.99-.84l.75-5.3c1.22-.51 2.35-1.17 3.38-1.97l4.98 2.01c.45.17.97 0 1.22-.43l4-6.93c.25-.43.14-.97-.24-1.28l-4.22-3.31zm-14.86 5.05c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z");
    			add_location(path1, file$5, 18, 6, 587);
    			attr_dev(svg, "width", "51");
    			attr_dev(svg, "height", "51");
    			attr_dev(svg, "viewBox", "-10 0 70 51");
    			attr_dev(svg, "class", "icon svelte-y5zful");
    			add_location(svg, file$5, 16, 4, 433);
    			attr_dev(div, "class", "navbar svelte-y5zful");
    			add_location(div, file$5, 14, 2, 312);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    			append_dev(div, t1);
    			append_dev(div, svg);
    			append_dev(svg, path0);
    			append_dev(svg, path1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(a, "click", /*click_handler*/ ctx[1], false, false, false),
    					listen_dev(svg, "click", /*click_handler_1*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $currentPosition;
    	let $previousPosition;
    	validate_store(currentPosition, 'currentPosition');
    	component_subscribe($$self, currentPosition, $$value => $$invalidate(3, $currentPosition = $$value));
    	validate_store(previousPosition, 'previousPosition');
    	component_subscribe($$self, previousPosition, $$value => $$invalidate(4, $previousPosition = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Navbar', slots, []);

    	function handleClick(position) {
    		set_store_value(previousPosition, $previousPosition = $currentPosition, $previousPosition);
    		set_store_value(currentPosition, $currentPosition = position, $currentPosition);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => handleClick("Home");
    	const click_handler_1 = () => handleClick("Edit");

    	$$self.$capture_state = () => ({
    		currentPosition,
    		previousPosition,
    		handleClick,
    		$currentPosition,
    		$previousPosition
    	});

    	return [handleClick, click_handler, click_handler_1];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/Home.svelte generated by Svelte v3.47.0 */
    const file$4 = "src/Home.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let button0;
    	let t1;
    	let button1;
    	let t3;
    	let button2;
    	let t5;
    	let button3;
    	let t7;
    	let button4;
    	let t9;
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button0 = element("button");
    			button0.textContent = "STANDING";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "CLINCH";
    			t3 = space();
    			button2 = element("button");
    			button2.textContent = "FENCE";
    			t5 = space();
    			button3 = element("button");
    			button3.textContent = "GUARD";
    			t7 = space();
    			button4 = element("button");
    			button4.textContent = "TURTLE";
    			t9 = space();
    			img = element("img");
    			attr_dev(button0, "class", "position svelte-5bbzj0");
    			add_location(button0, file$4, 15, 2, 322);
    			attr_dev(button1, "class", "position svelte-5bbzj0");
    			add_location(button1, file$4, 16, 2, 408);
    			attr_dev(button2, "class", "position svelte-5bbzj0");
    			add_location(button2, file$4, 17, 2, 490);
    			attr_dev(button3, "class", "position svelte-5bbzj0");
    			add_location(button3, file$4, 18, 2, 570);
    			attr_dev(button4, "class", "position svelte-5bbzj0");
    			add_location(button4, file$4, 19, 2, 650);
    			if (!src_url_equal(img.src, img_src_value = "mma.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Connor vs Khabib");
    			attr_dev(img, "width", "100%");
    			attr_dev(img, "class", "svelte-5bbzj0");
    			add_location(img, file$4, 20, 2, 732);
    			attr_dev(div, "id", "home");
    			attr_dev(div, "class", "svelte-5bbzj0");
    			add_location(div, file$4, 14, 0, 304);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button0);
    			append_dev(div, t1);
    			append_dev(div, button1);
    			append_dev(div, t3);
    			append_dev(div, button2);
    			append_dev(div, t5);
    			append_dev(div, button3);
    			append_dev(div, t7);
    			append_dev(div, button4);
    			append_dev(div, t9);
    			append_dev(div, img);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[1], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[2], false, false, false),
    					listen_dev(button2, "click", /*click_handler_2*/ ctx[3], false, false, false),
    					listen_dev(button3, "click", /*click_handler_3*/ ctx[4], false, false, false),
    					listen_dev(button4, "click", /*click_handler_4*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $currentPosition;
    	let $previousPosition;
    	validate_store(currentPosition, 'currentPosition');
    	component_subscribe($$self, currentPosition, $$value => $$invalidate(6, $currentPosition = $$value));
    	validate_store(previousPosition, 'previousPosition');
    	component_subscribe($$self, previousPosition, $$value => $$invalidate(7, $previousPosition = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Home', slots, []);

    	function handleClick(position) {
    		set_store_value(previousPosition, $previousPosition = $currentPosition, $previousPosition);
    		set_store_value(currentPosition, $currentPosition = position, $currentPosition);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => handleClick("Standing");
    	const click_handler_1 = () => handleClick("Clinch");
    	const click_handler_2 = () => handleClick("Fence");
    	const click_handler_3 = () => handleClick("Guard");
    	const click_handler_4 = () => handleClick("Turtle");

    	$$self.$capture_state = () => ({
    		currentPosition,
    		previousPosition,
    		handleClick,
    		$currentPosition,
    		$previousPosition
    	});

    	return [
    		handleClick,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4
    	];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/Video.svelte generated by Svelte v3.47.0 */
    const file$3 = "src/Video.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (22:6) {#if video.position == $currentPosition}
    function create_if_block_2(ctx) {
    	let option;
    	let t0_value = /*video*/ ctx[5].title + "";
    	let t0;
    	let t1;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = option_value_value = /*video*/ ctx[5];
    			option.value = option.__value;
    			add_location(option, file$3, 22, 8, 593);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$videos*/ 1 && t0_value !== (t0_value = /*video*/ ctx[5].title + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*$videos*/ 1 && option_value_value !== (option_value_value = /*video*/ ctx[5])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(22:6) {#if video.position == $currentPosition}",
    		ctx
    	});

    	return block;
    }

    // (21:4) {#each $videos as video}
    function create_each_block$1(ctx) {
    	let if_block_anchor;
    	let if_block = /*video*/ ctx[5].position == /*$currentPosition*/ ctx[2] && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*video*/ ctx[5].position == /*$currentPosition*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(21:4) {#each $videos as video}",
    		ctx
    	});

    	return block;
    }

    // (32:2) {#if selectedVideo != ""}
    function create_if_block_1$1(ctx) {
    	let iframe;
    	let iframe_src_value;

    	const block = {
    		c: function create() {
    			iframe = element("iframe");
    			attr_dev(iframe, "title", "video");
    			if (!src_url_equal(iframe.src, iframe_src_value = /*selectedVideo*/ ctx[1].url)) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "loading", "eager");
    			attr_dev(iframe, "frameborder", "0");
    			attr_dev(iframe, "class", "svelte-3q7iyz");
    			add_location(iframe, file$3, 32, 4, 779);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, iframe, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selectedVideo, $videos*/ 3 && !src_url_equal(iframe.src, iframe_src_value = /*selectedVideo*/ ctx[1].url)) {
    				attr_dev(iframe, "src", iframe_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(iframe);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(32:2) {#if selectedVideo != \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    // (37:2) {#if selectedVideo != ""}
    function create_if_block$1(ctx) {
    	let textarea;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			textarea = element("textarea");
    			attr_dev(textarea, "class", "svelte-3q7iyz");
    			add_location(textarea, file$3, 37, 4, 933);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, textarea, anchor);
    			set_input_value(textarea, /*selectedVideo*/ ctx[1].notes);

    			if (!mounted) {
    				dispose = listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[4]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selectedVideo, $videos*/ 3) {
    				set_input_value(textarea, /*selectedVideo*/ ctx[1].notes);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(textarea);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(37:2) {#if selectedVideo != \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div3;
    	let div0;
    	let select;
    	let option;
    	let t1;
    	let div1;
    	let t2;
    	let div2;
    	let mounted;
    	let dispose;
    	let each_value = /*$videos*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	let if_block0 = /*selectedVideo*/ ctx[1] != "" && create_if_block_1$1(ctx);
    	let if_block1 = /*selectedVideo*/ ctx[1] != "" && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			select = element("select");
    			option = element("option");
    			option.textContent = "Choose a video >>> ";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t2 = space();
    			div2 = element("div");
    			if (if_block1) if_block1.c();
    			option.__value = "";
    			option.value = option.__value;
    			option.selected = true;
    			add_location(option, file$3, 19, 4, 453);
    			if (/*selectedVideo*/ ctx[1] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[3].call(select));
    			add_location(select, file$3, 18, 2, 413);
    			attr_dev(div0, "id", "select_container");
    			attr_dev(div0, "class", "svelte-3q7iyz");
    			add_location(div0, file$3, 17, 2, 383);
    			attr_dev(div1, "id", "iframe_container");
    			attr_dev(div1, "class", "svelte-3q7iyz");
    			add_location(div1, file$3, 30, 2, 719);
    			attr_dev(div2, "id", "notes_container");
    			attr_dev(div2, "class", "svelte-3q7iyz");
    			add_location(div2, file$3, 35, 0, 874);
    			attr_dev(div3, "id", "video");
    			attr_dev(div3, "class", "svelte-3q7iyz");
    			add_location(div3, file$3, 16, 0, 364);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, select);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*selectedVideo*/ ctx[1]);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			if (if_block1) if_block1.m(div2, null);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[3]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$videos, $currentPosition*/ 5) {
    				each_value = /*$videos*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*selectedVideo, $videos*/ 3) {
    				select_option(select, /*selectedVideo*/ ctx[1]);
    			}

    			if (/*selectedVideo*/ ctx[1] != "") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					if_block0.m(div1, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*selectedVideo*/ ctx[1] != "") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					if_block1.m(div2, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks, detaching);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $videos;
    	let $currentPosition;
    	validate_store(videos, 'videos');
    	component_subscribe($$self, videos, $$value => $$invalidate(0, $videos = $$value));
    	validate_store(currentPosition, 'currentPosition');
    	component_subscribe($$self, currentPosition, $$value => $$invalidate(2, $currentPosition = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Video', slots, []);

    	let selectedVideo = $videos.filter(function (video) {
    		return video.position === $currentPosition;
    	})[0];

    	if (!selectedVideo) {
    		selectedVideo = "";
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Video> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		selectedVideo = select_value(this);
    		$$invalidate(1, selectedVideo);
    	}

    	function textarea_input_handler() {
    		selectedVideo.notes = this.value;
    		$$invalidate(1, selectedVideo);
    	}

    	$$self.$capture_state = () => ({
    		videos,
    		currentPosition,
    		selectedVideo,
    		$videos,
    		$currentPosition
    	});

    	$$self.$inject_state = $$props => {
    		if ('selectedVideo' in $$props) $$invalidate(1, selectedVideo = $$props.selectedVideo);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$videos*/ 1) {
    			videos.set($videos);
    		}
    	};

    	return [
    		$videos,
    		selectedVideo,
    		$currentPosition,
    		select_change_handler,
    		textarea_input_handler
    	];
    }

    class Video extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Video",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    var FileSaver_min = createCommonjsModule(function (module, exports) {
    (function(a,b){b();})(commonjsGlobal,function(){function b(a,b){return "undefined"==typeof b?b={autoBom:!1}:"object"!=typeof b&&(console.warn("Deprecated: Expected third argument to be a object"),b={autoBom:!b}),b.autoBom&&/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(a.type)?new Blob(["\uFEFF",a],{type:a.type}):a}function c(a,b,c){var d=new XMLHttpRequest;d.open("GET",a),d.responseType="blob",d.onload=function(){g(d.response,b,c);},d.onerror=function(){console.error("could not download file");},d.send();}function d(a){var b=new XMLHttpRequest;b.open("HEAD",a,!1);try{b.send();}catch(a){}return 200<=b.status&&299>=b.status}function e(a){try{a.dispatchEvent(new MouseEvent("click"));}catch(c){var b=document.createEvent("MouseEvents");b.initMouseEvent("click",!0,!0,window,0,0,0,80,20,!1,!1,!1,!1,0,null),a.dispatchEvent(b);}}var f="object"==typeof window&&window.window===window?window:"object"==typeof self&&self.self===self?self:"object"==typeof commonjsGlobal&&commonjsGlobal.global===commonjsGlobal?commonjsGlobal:void 0,a=f.navigator&&/Macintosh/.test(navigator.userAgent)&&/AppleWebKit/.test(navigator.userAgent)&&!/Safari/.test(navigator.userAgent),g=f.saveAs||("object"!=typeof window||window!==f?function(){}:"download"in HTMLAnchorElement.prototype&&!a?function(b,g,h){var i=f.URL||f.webkitURL,j=document.createElement("a");g=g||b.name||"download",j.download=g,j.rel="noopener","string"==typeof b?(j.href=b,j.origin===location.origin?e(j):d(j.href)?c(b,g,h):e(j,j.target="_blank")):(j.href=i.createObjectURL(b),setTimeout(function(){i.revokeObjectURL(j.href);},4E4),setTimeout(function(){e(j);},0));}:"msSaveOrOpenBlob"in navigator?function(f,g,h){if(g=g||f.name||"download","string"!=typeof f)navigator.msSaveOrOpenBlob(b(f,h),g);else if(d(f))c(f,g,h);else {var i=document.createElement("a");i.href=f,i.target="_blank",setTimeout(function(){e(i);});}}:function(b,d,e,g){if(g=g||open("","_blank"),g&&(g.document.title=g.document.body.innerText="downloading..."),"string"==typeof b)return c(b,d,e);var h="application/octet-stream"===b.type,i=/constructor/i.test(f.HTMLElement)||f.safari,j=/CriOS\/[\d]+/.test(navigator.userAgent);if((j||h&&i||a)&&"undefined"!=typeof FileReader){var k=new FileReader;k.onloadend=function(){var a=k.result;a=j?a:a.replace(/^data:[^;]*;/,"data:attachment/file;"),g?g.location.href=a:location=a,g=null;},k.readAsDataURL(b);}else {var l=f.URL||f.webkitURL,m=l.createObjectURL(b);g?g.location=m:location.href=m,g=null,setTimeout(function(){l.revokeObjectURL(m);},4E4);}});f.saveAs=g.saveAs=g,(module.exports=g);});


    });

    /* src/Import.svelte generated by Svelte v3.47.0 */
    const file$2 = "src/Import.svelte";

    function create_fragment$2(ctx) {
    	let main;
    	let input0;
    	let t0;
    	let button;
    	let t2;
    	let br;
    	let t3;
    	let input1;
    	let t4;
    	let script;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			input0 = element("input");
    			t0 = space();
    			button = element("button");
    			button.textContent = "Load File";
    			t2 = space();
    			br = element("br");
    			t3 = space();
    			input1 = element("input");
    			t4 = space();
    			script = element("script");
    			script.textContent = "function readFile(input) {\n    let file = input.files[0];\n  \n    let reader = new FileReader();\n  \n    reader.readAsText(file);\n\n    reader.onload = function() {\n      document.getElementById('holder').value = reader.result;\n    };\n  \n    reader.onerror = function() {\n      console.log(reader.error);\n    };\n    \n  }";
    			attr_dev(input0, "type", "file");
    			attr_dev(input0, "onchange", "readFile(this)");
    			add_location(input0, file$2, 16, 2, 283);
    			add_location(button, file$2, 17, 2, 331);
    			add_location(br, file$2, 17, 58, 387);
    			attr_dev(input1, "id", "holder");
    			attr_dev(input1, "type", "text");
    			input1.hidden = true;
    			add_location(input1, file$2, 18, 2, 394);
    			add_location(script, file$2, 20, 0, 452);
    			set_style(main, "display", "inline-block");
    			add_location(main, file$2, 14, 0, 243);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, input0);
    			append_dev(main, t0);
    			append_dev(main, button);
    			append_dev(main, t2);
    			append_dev(main, br);
    			append_dev(main, t3);
    			append_dev(main, input1);
    			set_input_value(input1, /*data*/ ctx[0]);
    			append_dev(main, t4);
    			append_dev(main, script);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*click_handler*/ ctx[2], false, false, false),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[3])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*data*/ 1 && input1.value !== /*data*/ ctx[0]) {
    				set_input_value(input1, /*data*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $videos;
    	validate_store(videos, 'videos');
    	component_subscribe($$self, videos, $$value => $$invalidate(4, $videos = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Import', slots, []);
    	let data;

    	function loadData() {
    		set_store_value(videos, $videos = JSON.parse(document.getElementById('holder').value), $videos);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Import> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => loadData();

    	function input1_input_handler() {
    		data = this.value;
    		$$invalidate(0, data);
    	}

    	$$self.$capture_state = () => ({ videos, data, loadData, $videos });

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data, loadData, click_handler, input1_input_handler];
    }

    class Import extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Import",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/Edit.svelte generated by Svelte v3.47.0 */
    const file$1 = "src/Edit.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	child_ctx[9] = list;
    	child_ctx[10] = i;
    	return child_ctx;
    }

    // (31:4) {#each $videos as video}
    function create_each_block(ctx) {
    	let div;
    	let input0;
    	let t0;
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let option3;
    	let option4;
    	let t6;
    	let input1;
    	let t7;
    	let button;
    	let mounted;
    	let dispose;

    	function input0_input_handler() {
    		/*input0_input_handler*/ ctx[4].call(input0, /*each_value*/ ctx[9], /*video_index*/ ctx[10]);
    	}

    	function select_change_handler() {
    		/*select_change_handler*/ ctx[5].call(select, /*each_value*/ ctx[9], /*video_index*/ ctx[10]);
    	}

    	function input1_input_handler() {
    		/*input1_input_handler*/ ctx[6].call(input1, /*each_value*/ ctx[9], /*video_index*/ ctx[10]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			input0 = element("input");
    			t0 = space();
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "Standing";
    			option1 = element("option");
    			option1.textContent = "Clinch";
    			option2 = element("option");
    			option2.textContent = "Fence";
    			option3 = element("option");
    			option3.textContent = "Guard";
    			option4 = element("option");
    			option4.textContent = "Turtle";
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			button = element("button");
    			button.textContent = "🗑️";
    			attr_dev(input0, "type", "text");
    			add_location(input0, file$1, 32, 10, 936);
    			option0.__value = "Standing";
    			option0.value = option0.__value;
    			option0.selected = true;
    			add_location(option0, file$1, 34, 12, 1040);
    			option1.__value = "Clinch";
    			option1.value = option1.__value;
    			option1.selected = true;
    			add_location(option1, file$1, 35, 12, 1104);
    			option2.__value = "Fence";
    			option2.value = option2.__value;
    			option2.selected = true;
    			add_location(option2, file$1, 36, 12, 1164);
    			option3.__value = "Guard";
    			option3.value = option3.__value;
    			option3.selected = true;
    			add_location(option3, file$1, 37, 12, 1222);
    			option4.__value = "Turtle";
    			option4.value = option4.__value;
    			option4.selected = true;
    			add_location(option4, file$1, 38, 12, 1280);
    			if (/*video*/ ctx[8].position === void 0) add_render_callback(select_change_handler);
    			add_location(select, file$1, 33, 10, 991);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "size", "36");
    			add_location(input1, file$1, 41, 10, 1425);
    			add_location(button, file$1, 42, 10, 1488);
    			attr_dev(div, "id", "edit_item");
    			attr_dev(div, "class", "svelte-14jlm87");
    			add_location(div, file$1, 31, 8, 905);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input0);
    			set_input_value(input0, /*video*/ ctx[8].title);
    			append_dev(div, t0);
    			append_dev(div, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			append_dev(select, option3);
    			append_dev(select, option4);
    			select_option(select, /*video*/ ctx[8].position);
    			append_dev(div, t6);
    			append_dev(div, input1);
    			set_input_value(input1, /*video*/ ctx[8].url);
    			append_dev(div, t7);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", input0_input_handler),
    					listen_dev(select, "change", select_change_handler),
    					listen_dev(input1, "input", input1_input_handler),
    					listen_dev(
    						button,
    						"click",
    						function () {
    							if (is_function(/*deleteVideo*/ ctx[2](/*video*/ ctx[8]))) /*deleteVideo*/ ctx[2](/*video*/ ctx[8]).apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*$videos*/ 1 && input0.value !== /*video*/ ctx[8].title) {
    				set_input_value(input0, /*video*/ ctx[8].title);
    			}

    			if (dirty & /*$videos*/ 1) {
    				select_option(select, /*video*/ ctx[8].position);
    			}

    			if (dirty & /*$videos*/ 1 && input1.value !== /*video*/ ctx[8].url) {
    				set_input_value(input1, /*video*/ ctx[8].url);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(31:4) {#each $videos as video}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div1;
    	let t0;
    	let div0;
    	let button0;
    	let t2;
    	let button1;
    	let t4;
    	let import_1;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*$videos*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	import_1 = new Import({ $$inline: true });

    	const block = {
    		c: function create() {
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			div0 = element("div");
    			button0 = element("button");
    			button0.textContent = "Add Video";
    			t2 = space();
    			button1 = element("button");
    			button1.textContent = "Export";
    			t4 = space();
    			create_component(import_1.$$.fragment);
    			attr_dev(button0, "class", "dark");
    			add_location(button0, file$1, 47, 6, 1633);
    			attr_dev(button1, "class", "dark");
    			add_location(button1, file$1, 48, 6, 1699);
    			set_style(div0, "padding", "10px 5px 20px 5px");
    			add_location(div0, file$1, 46, 4, 1587);
    			attr_dev(div1, "id", "edit");
    			add_location(div1, file$1, 29, 2, 844);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, button0);
    			append_dev(div0, t2);
    			append_dev(div0, button1);
    			append_dev(div0, t4);
    			mount_component(import_1, div0, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*addVideo*/ ctx[1], false, false, false),
    					listen_dev(button1, "click", /*saveLocalCopy*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*deleteVideo, $videos*/ 5) {
    				each_value = /*$videos*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, t0);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(import_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(import_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    			destroy_component(import_1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $videos;
    	let $previousPosition;
    	validate_store(videos, 'videos');
    	component_subscribe($$self, videos, $$value => $$invalidate(0, $videos = $$value));
    	validate_store(previousPosition, 'previousPosition');
    	component_subscribe($$self, previousPosition, $$value => $$invalidate(7, $previousPosition = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Edit', slots, []);

    	function addVideo() {
    		$videos.push({
    			title: "New video",
    			position: $previousPosition,
    			url: "https://www.example_url.com",
    			notes: "this is a good video"
    		});

    		videos.set($videos);
    	}

    	function deleteVideo(video) {
    		var index = $videos.findIndex(data => data.url === video.url);
    		$videos.splice(index, 1);
    		videos.set($videos);
    	}

    	function saveLocalCopy() {
    		var content = JSON.stringify($videos, null, 2);
    		var filename = "video_stash.json";
    		var blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    		FileSaver_min.saveAs(blob, filename);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Edit> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler(each_value, video_index) {
    		each_value[video_index].title = this.value;
    		videos.set($videos);
    	}

    	function select_change_handler(each_value, video_index) {
    		each_value[video_index].position = select_value(this);
    		videos.set($videos);
    	}

    	function input1_input_handler(each_value, video_index) {
    		each_value[video_index].url = this.value;
    		videos.set($videos);
    	}

    	$$self.$capture_state = () => ({
    		videos,
    		saveAs: FileSaver_min.saveAs,
    		previousPosition,
    		Import,
    		addVideo,
    		deleteVideo,
    		saveLocalCopy,
    		$videos,
    		$previousPosition
    	});

    	return [
    		$videos,
    		addVideo,
    		deleteVideo,
    		saveLocalCopy,
    		input0_input_handler,
    		select_change_handler,
    		input1_input_handler
    	];
    }

    class Edit extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Edit",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.47.0 */
    const file = "src/App.svelte";

    // (21:4) {:else}
    function create_else_block(ctx) {
    	let video;
    	let current;
    	video = new Video({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(video.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(video, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(video.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(video.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(video, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(21:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (19:41) 
    function create_if_block_1(ctx) {
    	let edit;
    	let current;
    	edit = new Edit({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(edit.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(edit, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(edit.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(edit.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(edit, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(19:41) ",
    		ctx
    	});

    	return block;
    }

    // (17:4) {#if $currentPosition == "Home"}
    function create_if_block(ctx) {
    	let home;
    	let current;
    	home = new Home({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(home.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(home, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(home.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(home.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(home, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(17:4) {#if $currentPosition == \\\"Home\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let navbar;
    	let t;
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	navbar = new Navbar({ $$inline: true });
    	const if_block_creators = [create_if_block, create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$currentPosition*/ ctx[0] == "Home") return 0;
    		if (/*$currentPosition*/ ctx[0] == "Edit") return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			create_component(navbar.$$.fragment);
    			t = space();
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "id", "content");
    			attr_dev(div, "class", "svelte-1bcaki");
    			add_location(div, file, 15, 2, 299);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(navbar, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navbar, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $currentPosition;
    	validate_store(currentPosition, 'currentPosition');
    	component_subscribe($$self, currentPosition, $$value => $$invalidate(0, $currentPosition = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Navbar,
    		Home,
    		Video,
    		Edit,
    		currentPosition,
    		$currentPosition
    	});

    	return [$currentPosition];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
