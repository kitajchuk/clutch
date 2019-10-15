import * as core from "../../core";



class StackHandler {
    constructor ( elem, data, stacks ) {
        this.elem = elem;
        this.data = data;
        this.stacks = stacks;
    }


    // Override these in specifc handlers...
    init () {}
    exec () {}
    kill () {}
    destroy () {}
    isComputable () {
        return core.util.isElementVisible( this.elem[ 0 ] );
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default StackHandler;
