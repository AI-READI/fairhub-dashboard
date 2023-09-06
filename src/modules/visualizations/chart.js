/*
Imports
*/

import * as D3 from "d3";
import * as Easing from "d3-ease";

/*
Base Chart Class
*/

class Chart {
    id          = undefined;
    svg         = undefined;
    width       = undefined;
    height      = undefined;
    margin      = undefined;
    padding     = undefined;
    palette     = undefined;
    data        = undefined;
    mapping     = undefined;

    constructor (config) {

        // Configurable Parameters
        this.id          = config.id;
        this.width       = config.width;
        this.height      = config.height;
        this.position    = config.position;
        this.margin      = config.margin;
        this.padding     = config.padding;
        this.palette     = config.palette;
        this.data        = config.data;
        this.accessors   = config.accessors;

        // Computed References
        this.uid         = this.#uid();
        this.setID       = this.#setID();
        this.getID       = this.#getID();

        this.mapping     = {
            data           : [],
            values         : [],
            groups         : [],
            subgroups      : [],

        };

        this.viewframe       = {
            height         : this.height,
            width          : this.width,
            top            : this.position.top,
            left           : this.position.left,
            bottom         : this.height - this.position.bottom,
            right          : this.width - this.position.right,
        };
        this.axisframe   = {
            height         : this.viewframe.height - this.margin.top - this.margin.bottom,
            width          : this.viewframe.width - this.margin.left - this.margin.right,
            top            : this.viewframe.top + this.margin.top,
            left           : this.viewframe.left + this.margin.left,
            bottom         : this.viewframe.bottom - this.margin.bottom,
            right          : this.viewframe.right - this.margin.right,
        };
        this.dataframe   = {
            height         : this.axisframe.height - this.padding.top - this.padding.bottom,
            width          : this.axisframe.width - this.padding.left - this.padding.right,
            top            : this.axisframe.top + this.padding.top,
            left           : this.axisframe.left + this.padding.left,
            bottom         : this.axisframe.bottom - this.padding.bottom,
            right          : this.axisframe.right - this.padding.right,
        };

    }

    #uid () {
        return `O-${Math.random().toString(16).slice(2, 8)}`;
    }

    #setID () {
        return `${this.id.replace("#", "")}_${this.uid}`;
    }

    #getID () {
        return `${this.id}_${this.uid}`;
    }

    getUniqueKeys (data, accessor) {
        return data.map(d => d[accessor]).filter((e, i, a) => a.indexOf(e) == i);
    }

    asString (val) {
        return String(val);
    }

    asNumber (val) {
        return Number(val);
    }

    asDate (val) {
        return new Date(val);
    }

    asType (type, val) {
        return this[`as${type}`](val);
    }

    tokenize (token) {
        // console.log(token, typeof token);
        // return token.replace(/\s/g, "-").toLowerCase();
        return (typeof(token) === "string") ? token.replace(/\s/g, "-").toLowerCase() : `${Math.random().toString(16).slice(2, 6)}`.toLowerCase();
    }

    debug () {
        console.info(this);
        return this;
    }

}

export default Chart;
