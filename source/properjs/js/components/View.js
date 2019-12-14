import * as core from "../core";
// import $ from "properjs-hobo";
// import ImageController from "../controllers/ImageController";
// import clutch from "../clutch";



class View {
    constructor ( elem, data ) {
        this.data = data;
        this.element = elem;
        this.id = this.data.uid;
        this.script = this.element.find( `script[type="application/json"]` ).detach();
        this.parsed = this.script.length ? JSON.parse( this.script[ 0 ].textContent ) : {};

        this.init();

        core.log( "View::Initialized", this );
    }


    init () {
        this.render();
        this.exec();
    }


    render () {
        // Webpack es6Module { __esModule: true, default: f }
        const view = require( `../views/${this.id}` );

        this.element[ 0 ].innerHTML = view.default( this );
    }


    exec () {}


    destroy () {}
}



/******************************************************************************
 * Export
*******************************************************************************/
export default View;
