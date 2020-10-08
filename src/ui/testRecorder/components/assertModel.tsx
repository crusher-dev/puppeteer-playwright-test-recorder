import {Component} from "preact";
import React from "preact/compat";
import {SEOModelContent} from "../containers/modal/seoModelContent";
import {STATE} from "../../../constants/actionTypes";
import {AssertModalContent} from "../containers/modal/assertModelContent";

export class AssertModel extends Component<any, any> {
    render() {
        const {state, seoMeta, attributes, updateState, saveAssertionCallback} = this.props;

        return (
            state && state === STATE.ASSERT && (
                <div id="modal-overlay" style={styles.modalOverlay}>
                    <AssertModalContent attributes={attributes} seoMeta={seoMeta} handleCloseCallback={(options : any) => {
                        if (!!options) {
                            saveAssertionCallback(options);
                        }
                        updateState(null)
                    }}/>
                </div>
            )
        );
    }
};

const styles = {
    modalOverlay: {
        position: "absolute",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        background: "rgba(14, 14, 14, 0.9)",
    },
};
