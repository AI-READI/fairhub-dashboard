/*
Imports
*/

import * as D3 from "d3";

/*
Base Interface Class
*/

class Interface {
    id          = undefined;
    svg         = undefined;
    width       = undefined;
    height      = undefined;
    margin      = undefined;
    padding     = undefined;
    palette     = undefined;
    data        = undefined;
    mapping     = undefined;
    maxValue    = undefined;
    minValue    = undefined;
    groups      = undefined;
    inner       = undefined;
    uid         = undefined;

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
        this.title       = config.title;

    }

    #uid () {
        return `O-${Math.random().toString(16).slice(2, 8)}`;
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
        return (typeof(token) === "string") ? token.replace(/\s/g, "-").toLowerCase() : `${Math.random().toString(16).slice(2, 6)}`.toLowerCase();
    }

    debug () {
        console.info(this);
        return this;
    }

}

export default Interface;
